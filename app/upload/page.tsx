// app/upload/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DetectionResult } from "@/types/detection";

export default function UploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("Uploading…");

  // ── File handling ───────────────────────────────────────────────────────────

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
  const MAX_MB = 10;

  const validateAndSet = useCallback((file: File) => {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError(
        `Unsupported format: ${file.type}. Please upload a JPEG, PNG, WebP or TIFF.`
      );
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB}MB.`);
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  // ── Analysis ────────────────────────────────────────────────────────────────
  // Sends the image to /api/detect, receives a DetectionResult, then stores
  // it in sessionStorage and navigates to the results page.

  const PROGRESS_STEPS = [
    "Uploading certificate…",
    "Running error level analysis…",
    "Extracting text with OCR…",
    "Checking metadata integrity…",
    "Analysing pixel patterns…",
    "Computing final verdict…",
  ];

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    // Cycle through progress messages while the server works
    let stepIdx = 0;
    setProgress(PROGRESS_STEPS[0]);
    const ticker = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, PROGRESS_STEPS.length - 1);
      setProgress(PROGRESS_STEPS[stepIdx]);
    }, 1800);

    try {
      const form = new FormData();
      form.append("certificate", selectedFile);

      const res = await fetch("/api/detect", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Analysis failed. Please try again.");
      }

      const result: DetectionResult = json.result;

      // Pass result to the results page via sessionStorage
      // (avoids URL-length limits with large base64 ELA images)
      sessionStorage.setItem("certiguard_result", JSON.stringify(result));
      sessionStorage.setItem("certiguard_filename", selectedFile.name);
      sessionStorage.setItem("certiguard_preview", preview!);

      router.push("/result");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      clearInterval(ticker);
      setIsAnalyzing(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955
                     11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824
                     10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
                     0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight">
              CertiGuard
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Home
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-2">
            Verification
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            Verify a certificate
          </h1>
          <p className="text-gray-500 text-base">
            Upload a clear photo or scan. Our system analyses it across five
            layers in seconds.
          </p>
        </div>

        {/* ── Drop zone ──────────────────────────────────────────────────────── */}
        {!selectedFile ? (
          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center gap-4 w-full min-h-64
              rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
              ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40"
              }
            `}
          >
            <input
              type="file"
              accept={ALLOWED.join(",")}
              className="sr-only"
              onChange={(e) =>
                e.target.files && validateAndSet(e.target.files[0])
              }
            />

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${dragActive ? "bg-indigo-100" : "bg-gray-100"}`}
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  dragActive ? "text-indigo-600" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011
                     9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div className="text-center px-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {dragActive
                  ? "Drop to analyse"
                  : "Drag & drop certificate here"}
              </p>
              <p className="text-xs text-gray-400">
                or{" "}
                <span className="text-indigo-600 font-medium underline underline-offset-2">
                  browse file
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPEG · PNG · WebP · TIFF · Max {MAX_MB}MB
              </p>
            </div>
          </label>
        ) : (
          /* ── Preview + analyse ──────────────────────────────────────────── */
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Image preview */}
            <div className="relative bg-gray-100">
              <img
                src={preview!}
                alt="Certificate preview"
                className="w-full max-h-96 object-contain"
              />
              {!isAnalyzing && (
                <button
                  onClick={clearFile}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full border border-gray-200
                    flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-300 transition"
                  title="Remove"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* File name row */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
              <svg
                className="w-4 h-4 text-indigo-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0
                     01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-gray-600 truncate">
                {selectedFile.name}
              </span>
              <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>

            {/* Progress indicator — visible during analysis */}
            {isAnalyzing && (
              <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-indigo-700">
                    {progress}
                  </span>
                </div>
                {/* Animated progress bar */}
                <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full animate-[progress_9s_ease-in-out_forwards]"
                    style={{ animation: "progress 9s ease-in-out forwards" }}
                  />
                </div>
                <style>{`
                  @keyframes progress {
                    0%   { width: 0% }
                    15%  { width: 20% }
                    35%  { width: 45% }
                    55%  { width: 62% }
                    75%  { width: 78% }
                    90%  { width: 88% }
                    100% { width: 95% }
                  }
                `}</style>
              </div>
            )}

            {/* Action */}
            <div className="p-5">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium
                  bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700
                  disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analysing…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2
                           0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0
                           012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Analyse certificate
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                   1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
                   0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* What we check */}
        {!selectedFile && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              What we analyse
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: "🔬",
                  label: "Error level analysis",
                  desc: "Pixel-level manipulation detection",
                },
                {
                  icon: "🗂️",
                  label: "Metadata inspection",
                  desc: "EXIF & editing software traces",
                },
                {
                  icon: "🔤",
                  label: "OCR text extraction",
                  desc: "Confidence & field validation",
                },
                {
                  icon: "🔡",
                  label: "Font consistency",
                  desc: "Rendering variance across text",
                },
                {
                  icon: "🧩",
                  label: "Pixel analysis",
                  desc: "Noise & compression artefacts",
                },
                {
                  icon: "📊",
                  label: "Weighted verdict",
                  desc: "Confidence score with breakdown",
                },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {label}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          All processing happens on the server. Your image is not stored
          permanently.
        </p>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Upload, X, ArrowLeft } from "lucide-react";

// export default function UploadPage() {
//   const [dragActive, setDragActive] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(e.type === "dragenter" || e.type === "dragover");
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer.files?.[0]) {
//       handleFile(e.dataTransfer.files[0]);
//     }
//   };

//   const handleFile = (file: File) => {
//     if (file.type.startsWith("image/")) {
//       setSelectedFile(file);
//       const reader = new FileReader();
//       reader.onload = (e) => setPreview(e.target?.result as string);
//       reader.readAsDataURL(file);
//     } else {
//       alert("Please upload a valid image file (JPG, PNG, JPEG)");
//     }
//   };

//   const handleAnalyze = async () => {
//     if (!selectedFile) return;

//     setIsAnalyzing(true);

//     const formData = new FormData();
//     formData.append("certificate", selectedFile);

//     try {
//       const res = await fetch("/api/detect", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       console.log(data);

//       if (data.success) {
//         // Navigate to result page with data
//         localStorage.setItem("lastDetection", JSON.stringify(data.result));
//         window.location.href = `/result`;
//       } else {
//         alert("Detection failed: " + data.error);
//       }
//     } catch (err) {
//       alert("Error connecting to detection engine");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">
//       {/* Navbar */}
//       <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center font-bold text-2xl">
//               C
//             </div>
//             <span className="text-3xl font-semibold tracking-tighter">
//               CertiGuard
//             </span>
//           </div>
//           <Link
//             href="/"
//             className="flex items-center gap-2 text-slate-400 hover:text-white transition"
//           >
//             <ArrowLeft className="w-5 h-5" /> Home
//           </Link>
//         </div>
//       </nav>

//       <div className="max-w-4xl mx-auto px-8 py-20">
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold mb-4">Verify Certificate</h1>
//           <p className="text-slate-400 text-xl">
//             Upload a clear photo of the certificate for instant AI analysis
//           </p>
//         </div>

//         {/* Upload Zone */}
//         <div
//           className={`border-2 border-dashed rounded-3xl p-20 text-center transition-all duration-300 min-h-[420px] flex flex-col items-center justify-center
//             ${
//               dragActive
//                 ? "border-indigo-500 bg-indigo-950/30"
//                 : "border-white/20"
//             }
//             ${selectedFile ? "border-emerald-500 bg-emerald-950/30" : ""}`}
//           onDragEnter={handleDrag}
//           onDragLeave={handleDrag}
//           onDragOver={handleDrag}
//           onDrop={handleDrop}
//         >
//           {!selectedFile ? (
//             <>
//               <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8">
//                 <Upload className="w-12 h-12 text-slate-400" />
//               </div>
//               <h3 className="text-3xl font-semibold mb-3">
//                 Drop your certificate here
//               </h3>
//               <p className="text-slate-400 mb-8 text-lg">
//                 or click below to browse your files
//               </p>

//               <label className="cursor-pointer">
//                 <div className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-500 hover:text-white transition">
//                   Select Image File
//                 </div>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={(e) =>
//                     e.target.files && handleFile(e.target.files[0])
//                   }
//                 />
//               </label>

//               <p className="text-xs text-slate-500 mt-10">
//                 Supported: JPG, PNG, JPEG • Max 10MB
//               </p>
//             </>
//           ) : (
//             <div className="w-full max-w-lg">
//               <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
//                 <img src={preview!} alt="Preview" className="w-full" />
//                 <button
//                   onClick={() => {
//                     setSelectedFile(null);
//                     setPreview(null);
//                   }}
//                   className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 p-3 rounded-full transition"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <p className="text-center text-slate-400 mb-8">
//                 {selectedFile.name}
//               </p>

//               <button
//                 onClick={handleAnalyze}
//                 disabled={isAnalyzing}
//                 className="w-full py-6 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl text-xl font-semibold hover:brightness-110 transition disabled:opacity-70"
//               >
//                 {isAnalyzing ? "Analyzing with AI..." : "Analyze Certificate"}
//               </button>
//             </div>
//           )}
//         </div>

//         <p className="text-center text-slate-500 text-sm mt-10">
//           All processing is done securely. Your data is not stored permanently.
//         </p>
//       </div>
//     </div>
//   );
// }
