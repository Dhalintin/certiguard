# Fake Certificate Detection System

A web-based AI-powered system for detecting forged certificates using Image Processing and Optical Character Recognition (OCR). Developed as a Final Year Project.

**Project Title:** Design and Implementation of a Fake Certificate Detection System Using Image Processing and Machine Learning

---

## ✨ Features

- Drag & drop certificate upload (JPEG, PNG, WebP)
- Automatic image enhancement (contrast, sharpness, greyscale)
- High-accuracy OCR using Tesseract.js v5
- Intelligent field extraction (Name, Certificate ID, Date, Institution, etc.)
- Forgery risk assessment with confidence scoring
- Color-coded results (Authentic / Suspicious / Likely Forged)
- Detailed report generation
- Responsive and modern UI built with Next.js

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + Vanilla CSS
- **Image Processing**: Sharp.js
- **OCR Engine**: Tesseract.js v5
- **Deployment**: Vercel (recommended) / Node.js

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/fake-certificate-detection.git
   cd fake-certificate-detection
   ```

2. Install dependencies

   ```bash
       npm install
   ```

3. Configure Next.js for Tesseract.js (Important):
   Update next.config.mjs (or next.config.js):

   ```bash
       /** @type {import('next').NextConfig} */
       const nextConfig = {
           experimental: {
               serverComponentsExternalPackages: ['tesseract.js'],
           },
           outputFileTracingIncludes: {
               '/**/*': ['./node_modules/tesseract.js/**/*'],
           },
       };

       export default nextConfig;
   ```

4. Run the development server

   ```bash
       npm run dev
   ```

5. Open http://localhost:3000

   ```bash
       /app
       /api/ocr          → OCR processing endpoint
       /page.tsx         → Main upload page
       /components
       /UploadZone
       /ResultDisplay
       /ConfidenceMeter
       /public
       /src
       /lib              → Utility functions (field extraction, etc.)
   ```

6. ### How It Works
   #### User uploads a certificate image.
   #### Image is preprocessed using Sharp.js (greyscale + normalization + sharpening).
   #### Text is extracted using Tesseract.js.
   #### Key fields are extracted using regex and keyword matching.
   #### System calculates average confidence and checks for inconsistencies.
   #### Detailed report with forgery risk level is generated.

---

### **Documentation Page** (Create as `app/documentation/page.tsx` or a Markdown file)

```markdown
# Fake Certificate Detection System - User & Technical Documentation

## 1. Introduction

This system helps institutions, employers, and verification agencies detect forged certificates using advanced image processing and OCR technology.

## 2. How to Use the System

### Step-by-step Guide

1. **Visit the Homepage**
2. **Upload Certificate**

   - Drag and drop your certificate image, or click to browse.
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Maximum file size: 10 MB

3. **Wait for Processing**

   - Image enhancement → OCR → Field Analysis

4. **View Results**

   - Check the confidence score
   - Review extracted fields
   - Read the forgery risk assessment

5. **Download Report** (PDF - coming soon)

---

## 3. Understanding the Results

| Color | Meaning                    | Recommended Action             |
| ----- | -------------------------- | ------------------------------ |
| Green | High confidence            | Likely authentic               |
| Amber | Moderate suspicion         | Manual verification advised    |
| Red   | High likelihood of forgery | Reject and investigate further |

**Confidence Score**: Based on average word confidence from OCR. Scores below 65% are considered suspicious.

---

## 4. Technical Details

### Image Preprocessing

- Converted to greyscale
- Contrast normalization
- Sharpening filter (sigma = 1.5)

### OCR Engine

- **Tesseract.js v5**
- English language model
- Runs on server-side for security

### Field Extraction Logic

- Regular expressions for dates, IDs, numbers
- Keyword matching for institutions, degree titles
- Pattern analysis for common certificate layouts

---

## 5. Troubleshooting

**Common Issues & Solutions:**

- **"Cannot find module" Tesseract error** → Ensure `next.config.js` has the correct `serverComponentsExternalPackages` setting.
- **Low OCR Accuracy** → Use well-lit, high-resolution scans. Avoid glare and heavy shadows.
- **Slow Processing** → Expected on lower-end devices. Processing usually takes 4–8 seconds.

---

## 6. Developer Notes

- All heavy computation runs on the server (API routes).
- Temporary files are automatically cleaned up.
- The system does not store uploaded certificates permanently.

---

## 7. API Endpoints (For Developers)

- `POST /api/ocr` – Main endpoint that accepts image buffer and returns analysis result.

---

**For questions or contributions, contact the developer.**

---

**Project Completed as Part of Final Year Requirements**  
**2026**
```
