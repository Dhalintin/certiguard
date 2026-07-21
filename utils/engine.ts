// utils/engine.ts
// import Tesseract from "tesseract.js";
import sharp from "sharp";
import type {
  DetectionResult,
  ELAResult,
  OCRResult,
  MetadataResult,
  PixelAnalysisResult,
  FontConsistencyResult,
  ScoreBreakdown,
  DetectedFields,
} from "@/types/detection";

// ─── ELA — pure Buffer math, no canvas ───────────────────────────────────────

async function runELA(imageBuffer: Buffer): Promise<ELAResult> {
  const QUALITY = 75;
  const ELA_SCALE = 10;

  const recompressed = await sharp(imageBuffer)
    .jpeg({ quality: QUALITY })
    .toBuffer();

  const [orig, recomp] = await Promise.all([
    sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
    sharp(recompressed)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);

  const { width, height, channels } = orig.info;
  const origData = orig.data;
  const recompData = recomp.data;

  const elaPixels = Buffer.alloc(width * height * 4);
  let totalDiff = 0;
  let highDiff = 0;
  const HIGH_THRESHOLD = 25;

  for (let i = 0; i < width * height; i++) {
    const b = i * channels;
    const r = Math.min(255, Math.abs(origData[b] - recompData[b]) * ELA_SCALE);
    const g = Math.min(
      255,
      Math.abs(origData[b + 1] - recompData[b + 1]) * ELA_SCALE
    );
    const bl = Math.min(
      255,
      Math.abs(origData[b + 2] - recompData[b + 2]) * ELA_SCALE
    );
    const diff = (r + g + bl) / 3;

    elaPixels[i * 4] = r;
    elaPixels[i * 4 + 1] = g;
    elaPixels[i * 4 + 2] = bl;
    elaPixels[i * 4 + 3] = 255;

    totalDiff += diff;
    if (diff > HIGH_THRESHOLD) highDiff++;
  }

  const avgDiff = totalDiff / (width * height);

  // Convert raw RGBA → JPEG using sharp (no canvas needed)
  const elaBuffer = await sharp(elaPixels, {
    raw: { width, height, channels: 4 },
  })
    .jpeg({ quality: 85 })
    .toBuffer();

  const tamperRatio = highDiff / (width * height);
  const score = Math.min(100, Math.round(tamperRatio * 1000 + avgDiff * 2));

  return {
    score,
    amplifiedImageBase64: `data:image/jpeg;base64,${elaBuffer.toString(
      "base64"
    )}`,
    suspiciousRegions: highDiff,
    averageDifference: Math.round(avgDiff * 100) / 100,
  };
}

// Helper to detect MIME type from buffer
function getMimeType(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  const signature = buffer.toString("hex", 0, 4).toUpperCase();

  if (signature.startsWith("FFD8")) return "image/jpeg";
  if (signature.startsWith("89504E47")) return "image/png";
  if (signature.startsWith("47494638")) return "image/gif";
  if (signature.startsWith("52494646")) return "image/webp";
  if (signature.startsWith("49492A00") || signature.startsWith("4D4D002A"))
    return "image/tiff";

  return "image/jpeg"; // fallback
}

// ─── OCR ─────────────────────────────────────────────────────────────────────

// async function runOCR(imageBuffer: Buffer): Promise<OCRResult> {
//   const processed = await sharp(imageBuffer)
//     .greyscale()
//     .normalise()
//     .sharpen({ sigma: 1.5 })
//     .toBuffer();

//   const { data } = await Tesseract.recognize(processed, "eng", {
//     logger: () => {},
//   });

//   const words = data.words.map((w: any) => ({
//     text: w.text,
//     confidence: w.confidence,
//     bbox: w.bbox,
//   }));

//   const avgConf =
//     words.length > 0
//       ? words.reduce((s: number, w: any) => s + w.confidence, 0) / words.length
//       : 0;

//   return {
//     text: data.text,
//     confidence: Math.round(avgConf),
//     words,
//     detectedFields: extractFields(data.text),
//   };
// }

// utils/engine.ts
async function runOCR(imageBuffer: Buffer): Promise<OCRResult> {
  const start = Date.now();

  try {
    const mimeType = getMimeType(imageBuffer) || "image/jpeg";
    const fileExtension = mimeType.split("/")[1] || "jpg";

    const formData = new FormData();

    formData.append(
      "file",
      new Blob([imageBuffer as any], { type: mimeType }),
      "certificate.jpg"
    );
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("OCREngine", "2");
    formData.append("scale", "true");
    formData.append("detectOrientation", "true");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCR_SPACE_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage || "OCR processing failed");
    }

    const parsedText = data.ParsedResults?.[0]?.ParsedText || "";
    const confidence = data.ParsedResults?.[0]?.TextOverlay?.Lines?.length
      ? 75
      : 60; // Rough confidence

    const words = parsedText
      .split(/\s+/)
      .filter(Boolean)
      .map((text: any) => ({
        text,
        confidence: 70,
        bbox: { x0: 0, y0: 0, x1: 0, y1: 0 },
      }));

    console.log(`OCR completed in ${Date.now() - start}ms`);

    return {
      text: parsedText,
      confidence: Math.round(confidence),
      words,
      detectedFields: extractFields(parsedText),
    };
  } catch (error) {
    console.error("OCR API Error:", error);
    // Fallback: return empty result instead of crashing
    return {
      text: "",
      confidence: 0,
      words: [],
      detectedFields: {},
    };
  }
}

function extractFields(text: string): DetectedFields {
  const fields: DetectedFields = {};

  const certNum = text.match(
    /(?:cert(?:ificate)?(?:\s+no?\.?|#|number)[:\s]+)([A-Z0-9\-\/]+)/i
  );
  if (certNum) fields.certificateNumber = certNum[1].trim();

  const date = text.match(
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/i
  );
  if (date) fields.date = date[0];

  const grade = text.match(
    /\b(first\s+class|second\s+class(?:\s+(?:upper|lower))?|third\s+class|pass|distinction|merit|credit|grade[:\s]+[A-F][+-]?)/i
  );
  if (grade) fields.grade = grade[0].trim();

  const institution = text.match(
    /(?:university|college|institute|polytechnic|school)\s+of\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/i
  );
  if (institution) fields.institution = institution[0].trim();

  const course = text.match(
    /(?:bachelor|master|diploma|doctor|phd|b\.sc|m\.sc|b\.eng|b\.a|m\.a)[.\s]+(?:of\s+|in\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})/i
  );
  if (course) fields.course = course[0].trim();

  return fields;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

async function analyzeMetadata(imageBuffer: Buffer): Promise<MetadataResult> {
  const metadata = await sharp(imageBuffer).metadata();
  const inconsistencies: string[] = [];
  let score = 0;

  const hasExifData = !!metadata.exif;
  let softwareEdited: string | null = null;

  if (metadata.exif) {
    const exifStr = metadata.exif.toString("latin1");
    const softwareMatch = exifStr.match(
      /(?:Adobe Photoshop|GIMP|Paint\.NET|Affinity|Pixlr|Canva)[^\x00]*/i
    );
    if (softwareMatch) {
      softwareEdited = softwareMatch[0].trim().replace(/[^\x20-\x7E]/g, "");
      inconsistencies.push(`Edited with: ${softwareEdited}`);
      score += 40;
    }
  }

  if (metadata.width && metadata.height) {
    const ratio = metadata.width / metadata.height;
    const standardRatios = [1.414, 1.294, 1.333, 0.707];
    const nearStandard = standardRatios.some(
      (r) => Math.abs(ratio - r) < 0.1 || Math.abs(1 / ratio - r) < 0.1
    );
    if (!nearStandard) {
      inconsistencies.push("Non-standard certificate dimensions detected");
      score += 15;
    }

    const bytesPerPixel =
      imageBuffer.length / (metadata.width * metadata.height);
    if (bytesPerPixel < 0.05) {
      inconsistencies.push("Unusually high compression ratio detected");
      score += 20;
    }
  }

  if (metadata.format === "png" && metadata.channels === 3) {
    inconsistencies.push("Format conversion detected (photo saved as PNG)");
    score += 10;
  }

  return {
    hasExifData,
    softwareEdited,
    inconsistencies,
    score: Math.min(100, score),
  };
}

// ─── Pixel analysis — pure Buffer, no canvas ─────────────────────────────────

async function analyzePixels(
  imageBuffer: Buffer
): Promise<PixelAnalysisResult> {
  const { data, info } = await sharp(imageBuffer)
    .resize({ width: 800, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const suspiciousPatterns: string[] = [];
  let score = 0;

  // Block variance (noise analysis)
  const blockSize = 16;
  const blockVariances: number[] = [];

  for (let y = 0; y < height - blockSize; y += blockSize) {
    for (let x = 0; x < width - blockSize; x += blockSize) {
      const pixels: number[] = [];
      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          const idx = ((y + by) * width + (x + bx)) * channels;
          const luma =
            0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          pixels.push(luma);
        }
      }
      const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
      const variance =
        pixels.reduce((a, b) => a + (b - mean) ** 2, 0) / pixels.length;
      blockVariances.push(variance);
    }
  }

  const avgVar =
    blockVariances.reduce((a, b) => a + b, 0) / blockVariances.length;
  const varVar =
    blockVariances.reduce((a, b) => a + (b - avgVar) ** 2, 0) /
    blockVariances.length;
  const noiseLevel = Math.sqrt(varVar);

  if (noiseLevel > 800) {
    suspiciousPatterns.push(
      "Inconsistent noise distribution across image regions"
    );
    score += 30;
  }

  // White pixel ratio
  let whitePixels = 0;
  for (let i = 0; i < data.length; i += channels) {
    if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) whitePixels++;
  }
  const bgRatio = whitePixels / (width * height);
  const colorUniformity = bgRatio < 0.3 || bgRatio > 0.95 ? 60 : 10;
  if (colorUniformity > 30) {
    suspiciousPatterns.push("Unusual background color distribution");
    score += 15;
  }

  // JPEG blocking
  let blockingScore = 0;
  for (let y = 7; y < height - 8; y += 8) {
    for (let x = 7; x < width - 8; x += 8) {
      const idx = (y * width + x) * channels;
      const idxR = (y * width + (x + 1)) * channels;
      const idxD = ((y + 1) * width + x) * channels;
      if (
        Math.abs(data[idx] - data[idxR]) > 20 ||
        Math.abs(data[idx] - data[idxD]) > 20
      )
        blockingScore++;
    }
  }
  const blockRatio = blockingScore / ((width / 8) * (height / 8));
  const compressionArtifacts = Math.min(100, Math.round(blockRatio * 200));
  if (compressionArtifacts > 50) {
    suspiciousPatterns.push("Heavy re-compression artifacts detected");
    score += 20;
  }

  return {
    score: Math.min(100, score),
    noiseLevel: Math.round(noiseLevel),
    compressionArtifacts,
    colorUniformity,
    suspiciousPatterns,
  };
}

// ─── Font consistency ─────────────────────────────────────────────────────────

function analyzeFontConsistency(ocr: OCRResult): FontConsistencyResult {
  const inconsistencies: string[] = [];
  let score = 0;
  const { words, confidence } = ocr;

  if (words.length < 5)
    return { score: 0, inconsistencies: ["Insufficient text to analyse"] };

  const lowConf = words.filter((w) => w.confidence < 40 && w.text.length > 2);
  const highConf = words.filter((w) => w.confidence > 70);

  if (lowConf.length > 0 && highConf.length > 5) {
    const ratio = lowConf.length / words.length;
    if (ratio > 0.15) {
      inconsistencies.push(
        `${lowConf.length} text regions have anomalous recognition confidence`
      );
      score += Math.min(40, Math.round(ratio * 100));
    }
  }

  if (confidence < 50) {
    inconsistencies.push(
      "Overall text quality is unusually low for a printed certificate"
    );
    score += 30;
  }

  const vals = words.map((w) => w.confidence);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const stdDev = Math.sqrt(
    vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length
  );

  if (stdDev > 30) {
    inconsistencies.push(
      "High variance in text rendering quality across document"
    );
    score += 20;
  }

  return { score: Math.min(100, score), inconsistencies };
}

// ─── Master function ──────────────────────────────────────────────────────────

export async function detectFakeCertificate(
  imageBuffer: Buffer
): Promise<DetectionResult> {
  const start = Date.now();

  const [ela, ocr, metadata, pixelAnalysis] = await Promise.all([
    runELA(imageBuffer),
    runOCR(imageBuffer),
    analyzeMetadata(imageBuffer),
    analyzePixels(imageBuffer),
  ]);

  const fontConsistency = analyzeFontConsistency(ocr);

  const breakdown: ScoreBreakdown = {
    ela: { weight: 0.35, score: ela.score, label: "Error Level Analysis" },
    metadata: {
      weight: 0.2,
      score: metadata.score,
      label: "Metadata Integrity",
    },
    ocr: { weight: 0.15, score: 100 - ocr.confidence, label: "Text Quality" },
    font: {
      weight: 0.15,
      score: fontConsistency.score,
      label: "Font Consistency",
    },
    pixel: {
      weight: 0.15,
      score: pixelAnalysis.score,
      label: "Pixel Analysis",
    },
  };

  const riskScore = Math.round(
    Object.values(breakdown).reduce((s, b) => s + b.weight * b.score, 0)
  );
  const confidenceScore = Math.max(0, 100 - riskScore);
  const verdict =
    riskScore < 30
      ? "AUTHENTIC"
      : riskScore < 60
      ? "SUSPICIOUS"
      : "LIKELY_FAKE";

  return {
    verdict: verdict as DetectionResult["verdict"],
    confidenceScore,
    riskScore,
    ela,
    ocr,
    metadata,
    fontConsistency,
    pixelAnalysis,
    breakdown,
    processingTimeMs: Date.now() - start,
  };
}
