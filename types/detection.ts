export interface ELAResult {
  score: number; // 0–100: higher = more likely tampered
  amplifiedImageBase64: string;
  suspiciousRegions: number;
  averageDifference: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: { text: string; confidence: number; bbox: any }[];
  detectedFields: DetectedFields;
}

export interface DetectedFields {
  name?: string;
  institution?: string;
  date?: string;
  grade?: string;
  certificateNumber?: string;
  course?: string;
}

export interface MetadataResult {
  hasExifData: boolean;
  softwareEdited: string | null;
  inconsistencies: string[];
  score: number; // 0–100: higher = more suspicious
}

export interface FontConsistencyResult {
  score: number; // 0–100: higher = more inconsistent
  inconsistencies: string[];
}

export interface DetectionResult {
  verdict: "AUTHENTIC" | "SUSPICIOUS" | "LIKELY_FAKE";
  confidenceScore: number; // 0–100: confidence the cert is REAL
  riskScore: number; // 0–100: how risky/fake it looks
  ela: ELAResult;
  ocr: OCRResult;
  metadata: MetadataResult;
  fontConsistency: FontConsistencyResult;
  pixelAnalysis: PixelAnalysisResult;
  breakdown: ScoreBreakdown;
  processingTimeMs: number;
}

export interface PixelAnalysisResult {
  score: number;
  noiseLevel: number;
  compressionArtifacts: number;
  colorUniformity: number;
  suspiciousPatterns: string[];
}

export interface ScoreBreakdown {
  ela: { weight: number; score: number; label: string };
  metadata: { weight: number; score: number; label: string };
  ocr: { weight: number; score: number; label: string };
  font: { weight: number; score: number; label: string };
  pixel: { weight: number; score: number; label: string };
}
