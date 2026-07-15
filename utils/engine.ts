// utils/engine.ts
import Tesseract from "tesseract.js";
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

// ─── OCR ─────────────────────────────────────────────────────────────────────

async function runOCR(imageBuffer: Buffer): Promise<OCRResult> {
  const processed = await sharp(imageBuffer)
    .greyscale()
    .normalise()
    .sharpen({ sigma: 1.5 })
    .toBuffer();

  const { data } = await Tesseract.recognize(processed, "eng", {
    logger: () => {},
  });

  const words = data.words.map((w: any) => ({
    text: w.text,
    confidence: w.confidence,
    bbox: w.bbox,
  }));

  const avgConf =
    words.length > 0
      ? words.reduce((s: number, w: any) => s + w.confidence, 0) / words.length
      : 0;

  return {
    text: data.text,
    confidence: Math.round(avgConf),
    words,
    detectedFields: extractFields(data.text),
  };
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

// // lib/detection/engine.ts
// // ─────────────────────────────────────────────────────────────────────────────
// // Core certificate detection engine
// // Runs entirely server-side — no external APIs required
// // ─────────────────────────────────────────────────────────────────────────────

// import sharp from "sharp";

// import { createWorker } from "tesseract.js";

// // ─── Result types ─────────────────────────────────────────────────────────────

// export interface ELAResult {
//   score: number; // 0–100: higher = more likely tampered
//   amplifiedImageBase64: string;
//   suspiciousRegions: number;
//   averageDifference: number;
// }

// export interface OCRResult {
//   text: string;
//   confidence: number;
//   words: { text: string; confidence: number; bbox: any }[];
//   detectedFields: DetectedFields;
// }

// export interface DetectedFields {
//   name?: string;
//   institution?: string;
//   date?: string;
//   grade?: string;
//   certificateNumber?: string;
//   course?: string;
// }

// export interface MetadataResult {
//   hasExifData: boolean;
//   softwareEdited: string | null;
//   inconsistencies: string[];
//   score: number; // 0–100: higher = more suspicious
// }

// export interface FontConsistencyResult {
//   score: number; // 0–100: higher = more inconsistent
//   inconsistencies: string[];
// }

// export interface DetectionResult {
//   verdict: "AUTHENTIC" | "SUSPICIOUS" | "LIKELY_FAKE";
//   confidenceScore: number; // 0–100: confidence the cert is REAL
//   riskScore: number; // 0–100: how risky/fake it looks
//   ela: ELAResult;
//   ocr: OCRResult;
//   metadata: MetadataResult;
//   fontConsistency: FontConsistencyResult;
//   pixelAnalysis: PixelAnalysisResult;
//   breakdown: ScoreBreakdown;
//   processingTimeMs: number;
// }

// export interface PixelAnalysisResult {
//   score: number;
//   noiseLevel: number;
//   compressionArtifacts: number;
//   colorUniformity: number;
//   suspiciousPatterns: string[];
// }

// export interface ScoreBreakdown {
//   ela: { weight: number; score: number; label: string };
//   metadata: { weight: number; score: number; label: string };
//   ocr: { weight: number; score: number; label: string };
//   font: { weight: number; score: number; label: string };
//   pixel: { weight: number; score: number; label: string };
// }

// // ─── ELA (Error Level Analysis) ──────────────────────────────────────────────
// // ELA re-saves the image at a known compression level and computes the
// // difference. Authentic images show uniform error distribution.
// // Tampered regions (pasted content) show abnormally HIGH error levels
// // because they were compressed fewer times than the original.

// export async function runELA(imageBuffer: Buffer): Promise<ELAResult> {
//   const QUALITY = 75;
//   const ELA_SCALE = 10; // amplify differences for visibility

//   // Re-save at controlled quality
//   const recompressed = await sharp(imageBuffer)
//     .jpeg({ quality: QUALITY })
//     .toBuffer();

//   // Load both images as raw pixel data
//   const [original, recomp] = await Promise.all([
//     sharp(imageBuffer)
//       .ensureAlpha()
//       .raw()
//       .toBuffer({ resolveWithObject: true }),
//     sharp(recompressed)
//       .ensureAlpha()
//       .raw()
//       .toBuffer({ resolveWithObject: true }),
//   ]);

//   const { width, height, channels } = original.info;
//   const origData = original.data;
//   const recompData = recomp.data;

//   const elaData = Buffer.alloc(width * height * 4);
//   let totalDiff = 0;
//   let highDiffPixels = 0;
//   const HIGH_DIFF_THRESHOLD = 25;

//   for (let i = 0; i < width * height; i++) {
//     const base = i * channels;
//     const r = Math.abs(origData[base] - recompData[base]) * ELA_SCALE;
//     const g = Math.abs(origData[base + 1] - recompData[base + 1]) * ELA_SCALE;
//     const b = Math.abs(origData[base + 2] - recompData[base + 2]) * ELA_SCALE;
//     const diff = (r + g + b) / 3;

//     elaData[i * 4] = Math.min(255, r);
//     elaData[i * 4 + 1] = Math.min(255, g);
//     elaData[i * 4 + 2] = Math.min(255, b);
//     elaData[i * 4 + 3] = 255;

//     totalDiff += diff;
//     if (diff > HIGH_DIFF_THRESHOLD) highDiffPixels++;
//   }

//   const avgDiff = totalDiff / (width * height);

//   // Convert ELA image to base64 for frontend display
//   const elaImageBuffer = await sharp(elaData, {
//     raw: { width, height, channels: 4 },
//   })
//     .jpeg()
//     .toBuffer();

//   const amplifiedBase64 = `data:image/jpeg;base64,${elaImageBuffer.toString(
//     "base64"
//   )}`;

//   // Score: if many pixels have high error levels, region was likely tampered
//   const tamperRatio = highDiffPixels / (width * height);
//   const elaScore = Math.min(100, Math.round(tamperRatio * 1000 + avgDiff * 2));

//   return {
//     score: elaScore,
//     amplifiedImageBase64: amplifiedBase64,
//     suspiciousRegions: highDiffPixels,
//     averageDifference: Math.round(avgDiff * 100) / 100,
//   };
// }

// export async function runOCR(imageBuffer: Buffer) {
//   const worker = await createWorker("eng", 1, {
//     logger: () => {},
//   });

//   try {
//     const processed = await sharp(imageBuffer)
//       .greyscale()
//       .normalise()
//       .sharpen({ sigma: 1.5 })
//       .toBuffer();

//     const { data } = await worker.recognize(processed);

//     const words = data.words.map((w: any) => ({
//       text: w.text,
//       confidence: w.confidence,
//       bbox: w.bbox,
//     }));

//     return {
//       text: data.text,
//       confidence: Math.round(
//         words.length > 0
//           ? words.reduce((s: number, w: any) => s + w.confidence, 0) /
//               words.length
//           : 0
//       ),
//       words,
//       detectedFields: extractFields(data.text),
//     };
//   } finally {
//     await worker.terminate();
//   }
// }

// function extractFields(text: string): DetectedFields {
//   const fields: DetectedFields = {};

//   // Certificate / serial number patterns
//   const certNumMatch = text.match(
//     /(?:cert(?:ificate)?(?:\s+no?\.?|#|number)[:\s]+)([A-Z0-9\-\/]+)/i
//   );
//   if (certNumMatch) fields.certificateNumber = certNumMatch[1].trim();

//   // Date patterns
//   const dateMatch = text.match(
//     /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/i
//   );
//   if (dateMatch) fields.date = dateMatch[0];

//   // Grade / classification
//   const gradeMatch = text.match(
//     /\b(first\s+class|second\s+class(?:\s+(?:upper|lower))?|third\s+class|pass|distinction|merit|credit|grade[:\s]+[A-F][+-]?)/i
//   );
//   if (gradeMatch) fields.grade = gradeMatch[0].trim();

//   // Common institution keywords
//   const institutionMatch = text.match(
//     /(?:university|college|institute|polytechnic|school)\s+of\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/i
//   );
//   if (institutionMatch) fields.institution = institutionMatch[0].trim();

//   // Course / programme
//   const courseMatch = text.match(
//     /(?:bachelor|master|diploma|doctor|phd|b\.sc|m\.sc|b\.eng|b\.a|m\.a)[.\s]+(?:of\s+|in\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})/i
//   );
//   if (courseMatch) fields.course = courseMatch[0].trim();

//   return fields;
// }

// // ─── Image Metadata Analysis ──────────────────────────────────────────────────

// export async function analyzeMetadata(
//   imageBuffer: Buffer
// ): Promise<MetadataResult> {
//   const metadata = await sharp(imageBuffer).metadata();
//   const inconsistencies: string[] = [];
//   let suspicionScore = 0;

//   // Check EXIF data presence
//   const hasExif = !!metadata.exif;

//   // Extract software tag from EXIF if available
//   let softwareEdited: string | null = null;
//   if (metadata.exif) {
//     const exifStr = metadata.exif.toString("latin1");
//     const softwareMatch = exifStr.match(
//       /(?:Adobe Photoshop|GIMP|Paint\.NET|Affinity|Pixlr|Canva)[^\x00]*/i
//     );
//     if (softwareMatch) {
//       softwareEdited = softwareMatch[0].trim().replace(/[^\x20-\x7E]/g, "");
//       inconsistencies.push(`Edited with: ${softwareEdited}`);
//       suspicionScore += 40;
//     }
//   }

//   // Check for suspicious dimensions (certificates usually have standard ratios)
//   if (metadata.width && metadata.height) {
//     const ratio = metadata.width / metadata.height;
//     const standardRatios = [1.414, 1.294, 1.333, 0.707]; // A4, Letter, etc.
//     const nearStandard = standardRatios.some(
//       (r) => Math.abs(ratio - r) < 0.1 || Math.abs(1 / ratio - r) < 0.1
//     );
//     if (!nearStandard) {
//       inconsistencies.push("Non-standard certificate dimensions detected");
//       suspicionScore += 15;
//     }
//   }

//   // Very high resolution with small file size = possible compression artifact
//   if (metadata.width && metadata.height) {
//     const pixels = metadata.width * metadata.height;
//     const bytesPerPixel = imageBuffer.length / pixels;
//     if (bytesPerPixel < 0.05) {
//       inconsistencies.push("Unusually high compression ratio detected");
//       suspicionScore += 20;
//     }
//   }

//   // PNG used for certificates with JPEG-like content is suspicious
//   if (metadata.format === "png" && metadata.channels === 3) {
//     // PNGs without alpha from photo content suggest conversion
//     inconsistencies.push("Format conversion detected (photo saved as PNG)");
//     suspicionScore += 10;
//   }

//   return {
//     hasExifData: hasExif,
//     softwareEdited,
//     inconsistencies,
//     score: Math.min(100, suspicionScore),
//   };
// }

// // ─── Pixel-level Analysis ─────────────────────────────────────────────────────

// export async function analyzePixels(
//   imageBuffer: Buffer
// ): Promise<PixelAnalysisResult> {
//   const { data, info } = await sharp(imageBuffer)
//     .resize({ width: 800, withoutEnlargement: true })
//     .raw()
//     .toBuffer({ resolveWithObject: true });

//   const { width, height, channels } = info;
//   const suspiciousPatterns: string[] = [];
//   let score = 0;

//   // ── Noise analysis: compute local variance ────────────────────────────────
//   // Authentic photos have consistent noise. Pasted regions have different noise.
//   const blockSize = 16;
//   const blockVariances: number[] = [];

//   for (let y = 0; y < height - blockSize; y += blockSize) {
//     for (let x = 0; x < width - blockSize; x += blockSize) {
//       const pixels: number[] = [];
//       for (let by = 0; by < blockSize; by++) {
//         for (let bx = 0; bx < blockSize; bx++) {
//           const idx = ((y + by) * width + (x + bx)) * channels;
//           const luma =
//             0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
//           pixels.push(luma);
//         }
//       }
//       const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
//       const variance =
//         pixels.reduce((a, b) => a + (b - mean) ** 2, 0) / pixels.length;
//       blockVariances.push(variance);
//     }
//   }

//   const avgVariance =
//     blockVariances.reduce((a, b) => a + b, 0) / blockVariances.length;
//   const varVariance =
//     blockVariances.reduce((a, b) => a + (b - avgVariance) ** 2, 0) /
//     blockVariances.length;
//   const noiseLevel = Math.sqrt(varVariance);

//   // High variance in block variances = pasted regions
//   if (noiseLevel > 800) {
//     suspiciousPatterns.push(
//       "Inconsistent noise distribution across image regions"
//     );
//     score += 30;
//   }

//   // ── Color uniformity check ────────────────────────────────────────────────
//   // Background of real certificates is very uniform (white/cream)
//   let whitePixels = 0;
//   const totalPixels = width * height;

//   for (let i = 0; i < data.length; i += channels) {
//     const r = data[i],
//       g = data[i + 1],
//       b = data[i + 2];
//     if (r > 220 && g > 220 && b > 220) whitePixels++;
//   }

//   const bgRatio = whitePixels / totalPixels;
//   // Certificates should have ~40–80% white/light background
//   const colorUniformity = bgRatio < 0.3 || bgRatio > 0.95 ? 60 : 10;
//   if (colorUniformity > 30) {
//     suspiciousPatterns.push("Unusual background color distribution");
//     score += 15;
//   }

//   // ── JPEG blocking artifacts ───────────────────────────────────────────────
//   // Heavily re-compressed images show 8×8 block artifacts
//   let blockingScore = 0;
//   for (let y = 7; y < height - 8; y += 8) {
//     for (let x = 7; x < width - 8; x += 8) {
//       const idx = (y * width + x) * channels;
//       const idxR = (y * width + (x + 1)) * channels;
//       const idxD = ((y + 1) * width + x) * channels;
//       const hDiff = Math.abs(data[idx] - data[idxR]);
//       const vDiff = Math.abs(data[idx] - data[idxD]);
//       if (hDiff > 20 || vDiff > 20) blockingScore++;
//     }
//   }

//   const blockRatio = blockingScore / ((width / 8) * (height / 8));
//   const compressionArtifacts = Math.min(100, Math.round(blockRatio * 200));
//   if (compressionArtifacts > 50) {
//     suspiciousPatterns.push("Heavy re-compression artifacts detected");
//     score += 20;
//   }

//   return {
//     score: Math.min(100, score),
//     noiseLevel: Math.round(noiseLevel),
//     compressionArtifacts,
//     colorUniformity,
//     suspiciousPatterns,
//   };
// }

// // ─── Font consistency analysis ────────────────────────────────────────────────
// // Analyses word-level confidence variance from OCR as a font consistency proxy.
// // Real certificates use consistent fonts. Tampered text has lower, uneven OCR confidence.

// export function analyzeFontConsistency(
//   ocrResult: OCRResult
// ): FontConsistencyResult {
//   const inconsistencies: string[] = [];
//   let score = 0;

//   const { words, confidence } = ocrResult;

//   if (words.length < 5) {
//     return { score: 0, inconsistencies: ["Insufficient text to analyze"] };
//   }

//   // Find words with very low confidence amid otherwise high-confidence text
//   const highConfWords = words.filter((w) => w.confidence > 70);
//   const lowConfWords = words.filter(
//     (w) => w.confidence < 40 && w.text.length > 2
//   );

//   if (lowConfWords.length > 0 && highConfWords.length > 5) {
//     const suspRatio = lowConfWords.length / words.length;
//     if (suspRatio > 0.15) {
//       inconsistencies.push(
//         `${lowConfWords.length} text regions have anomalous character recognition confidence`
//       );
//       score += Math.min(40, Math.round(suspRatio * 100));
//     }
//   }

//   // Very low overall OCR confidence = unclear/manipulated text
//   if (confidence < 50) {
//     inconsistencies.push(
//       "Overall text quality is unusually low for a printed certificate"
//     );
//     score += 30;
//   }

//   // Check for inconsistency in confidence across the document
//   const confValues = words.map((w) => w.confidence);
//   const mean = confValues.reduce((a, b) => a + b, 0) / confValues.length;
//   const stdDev = Math.sqrt(
//     confValues.reduce((a, b) => a + (b - mean) ** 2, 0) / confValues.length
//   );

//   if (stdDev > 30) {
//     inconsistencies.push(
//       "High variance in text rendering quality across document"
//     );
//     score += 20;
//   }

//   return {
//     score: Math.min(100, score),
//     inconsistencies,
//   };
// }

// // ─── Master detection function ────────────────────────────────────────────────

// export async function detectFakeCertificate(
//   imageBuffer: Buffer
// ): Promise<DetectionResult> {
//   const startTime = Date.now();

//   // Run all analyses in parallel where possible
//   const [ela, ocr, metadata, pixelAnalysis] = await Promise.all([
//     runELA(imageBuffer),
//     runOCR(imageBuffer),
//     analyzeMetadata(imageBuffer),
//     analyzePixels(imageBuffer),
//   ]);

//   const fontConsistency = analyzeFontConsistency(ocr);

//   // ── Weighted scoring ──────────────────────────────────────────────────────
//   // Each component contributes a "suspicion score" (0–100)
//   // Final risk score = weighted average

//   const breakdown: ScoreBreakdown = {
//     ela: { weight: 0.35, score: ela.score, label: "Error Level Analysis" },
//     metadata: {
//       weight: 0.2,
//       score: metadata.score,
//       label: "Metadata Integrity",
//     },
//     ocr: { weight: 0.15, score: 100 - ocr.confidence, label: "Text Quality" },
//     font: {
//       weight: 0.15,
//       score: fontConsistency.score,
//       label: "Font Consistency",
//     },
//     pixel: {
//       weight: 0.15,
//       score: pixelAnalysis.score,
//       label: "Pixel Analysis",
//     },
//   };

//   const riskScore = Math.round(
//     Object.values(breakdown).reduce((sum, b) => sum + b.weight * b.score, 0)
//   );

//   const confidenceScore = Math.max(0, 100 - riskScore);

//   const verdict: DetectionResult["verdict"] =
//     riskScore < 30
//       ? "AUTHENTIC"
//       : riskScore < 60
//       ? "SUSPICIOUS"
//       : "LIKELY_FAKE";

//   return {
//     verdict,
//     confidenceScore,
//     riskScore,
//     ela,
//     ocr,
//     metadata,
//     fontConsistency,
//     pixelAnalysis,
//     breakdown,
//     processingTimeMs: Date.now() - startTime,
//   };
// }
