"use client";

import { useEffect, useState } from "react";
import type { DetectionResult } from "@/types/detection";
import Link from "next/link";

export default function ResultsPage() {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const r = sessionStorage.getItem("certiguard_result");
    const f = sessionStorage.getItem("certiguard_filename");
    const p = sessionStorage.getItem("certiguard_preview");
    if (r) setResult(JSON.parse(r));
    if (f) setFileName(f);
    if (p) setPreview(p);
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 mb-8">
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
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">
            No analysis result found.
          </p>
          <a
            href="/upload"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Upload a certificate →
          </a>
        </div>
      </div>
    );
  }

  // Map DetectionResult to the shape the results UI expects
  // const isGenuine = result.verdict === "AUTHENTIC";
  // const confidence = result.confidenceScore;
  // const riskScore = result.riskScore;
  // const processingTimeMs = result.processingTimeMs;

  // const breakdown = [
  //   {
  //     label: "Error level analysis",
  //     status:
  //       result.ela.score < 30
  //         ? "Low risk"
  //         : result.ela.score < 60
  //         ? "Moderate"
  //         : "High risk",
  //     risk: result.ela.score,
  //     variant:
  //       result.ela.score < 30
  //         ? "success"
  //         : result.ela.score < 60
  //         ? "warning"
  //         : "danger",
  //   },
  //   {
  //     label: "Metadata inspection",
  //     status:
  //       result.metadata.score < 30
  //         ? "No issues"
  //         : result.metadata.score < 60
  //         ? "Suspicious"
  //         : "High risk",
  //     risk: result.metadata.score,
  //     variant:
  //       result.metadata.score < 30
  //         ? "success"
  //         : result.metadata.score < 60
  //         ? "warning"
  //         : "danger",
  //   },
  //   {
  //     label: "OCR text quality",
  //     status:
  //       result.ocr.confidence > 70
  //         ? "Good"
  //         : result.ocr.confidence > 40
  //         ? "Fair"
  //         : "Poor",
  //     risk: 100 - result.ocr.confidence,
  //     variant:
  //       result.ocr.confidence > 70
  //         ? "success"
  //         : result.ocr.confidence > 40
  //         ? "warning"
  //         : "danger",
  //   },
  //   {
  //     label: "Font consistency",
  //     status: result.fontConsistency.score < 30 ? "Consistent" : "Inconsistent",
  //     risk: result.fontConsistency.score,
  //     variant:
  //       result.fontConsistency.score < 30
  //         ? "success"
  //         : result.fontConsistency.score < 60
  //         ? "warning"
  //         : "danger",
  //   },
  //   {
  //     label: "Pixel analysis",
  //     status:
  //       result.pixelAnalysis.score < 30
  //         ? "Clean"
  //         : result.pixelAnalysis.score < 60
  //         ? "Moderate"
  //         : "Suspicious",
  //     risk: result.pixelAnalysis.score,
  //     variant:
  //       result.pixelAnalysis.score < 30
  //         ? "success"
  //         : result.pixelAnalysis.score < 60
  //         ? "warning"
  //         : "danger",
  //   },
  // ] as const;

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

      <div className="max-w-3xl mx-auto px-8 py-16 space-y-5">
        {/* Page heading */}
        <div className="mb-2">
          <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-2">
            Analysis result
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
            Certificate report
          </h1>
          {fileName && (
            <p className="text-sm text-gray-400 truncate">{fileName}</p>
          )}
        </div>

        {/* ── Verdict banner ─────────────────────────────────────────────────── */}
        {(() => {
          const isGenuine = result.verdict === "AUTHENTIC";
          const isSuspect = result.verdict === "SUSPICIOUS";
          const cfg = isGenuine
            ? {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                badgeBg: "bg-emerald-50",
                badgeText: "text-emerald-700",
                badgeBorder: "border-emerald-200",
                barColor: "bg-emerald-500",
                title: "Certificate appears authentic",
                body: "No significant signs of tampering or forgery were detected across all five analysis layers.",
              }
            : isSuspect
            ? {
                bg: "bg-amber-50",
                border: "border-amber-200",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                badgeBg: "bg-amber-50",
                badgeText: "text-amber-700",
                badgeBorder: "border-amber-200",
                barColor: "bg-amber-500",
                title: "Certificate is suspicious",
                body: "Several anomalies were detected. Manual verification from the issuing institution is strongly recommended.",
              }
            : {
                bg: "bg-red-50",
                border: "border-red-200",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
                badgeBg: "bg-red-50",
                badgeText: "text-red-700",
                badgeBorder: "border-red-200",
                barColor: "bg-red-500",
                title: "Certificate is likely fraudulent",
                body: "Strong indicators of image manipulation were detected. Do not accept this certificate without independent confirmation.",
              };

          return (
            <div className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-6`}>
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}
                >
                  {isGenuine ? (
                    <svg
                      className={`w-5 h-5 ${cfg.iconColor}`}
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
                  ) : isSuspect ? (
                    <svg
                      className={`w-5 h-5 ${cfg.iconColor}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4
                       c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={`w-5 h-5 ${cfg.iconColor}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0
                       015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-base font-semibold text-gray-900">
                      {cfg.title}
                    </h2>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border
                  ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
                    >
                      {result.verdict.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{cfg.body}</p>

                  {/* Score bars */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-500">
                          Authenticity score
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {result.confidenceScore}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
                          style={{ width: `${result.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-500">
                          Risk score
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {result.riskScore}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-200">
                        <div
                          className="h-full rounded-full bg-gray-400 transition-all duration-700"
                          style={{ width: `${result.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing time */}
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-200">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs text-gray-400">
                  Analysis completed in{" "}
                  {(result.processingTimeMs / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          );
        })()}

        {/* ── ELA image ──────────────────────────────────────────────────────── */}
        {result.ela?.amplifiedImageBase64 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Error level analysis (ELA)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Brighter regions indicate potential manipulation
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border
            ${
              result.ela.score < 30
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : result.ela.score < 60
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
              >
                Risk {result.ela.score}/100
              </span>
            </div>

            {/* ELA image */}
            <div className="bg-gray-900 relative">
              <img
                src={result.ela.amplifiedImageBase64}
                alt="Error level analysis"
                className="w-full max-h-72 object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                <p className="text-xs text-white/70">
                  Brighter pixels = higher error level = possible manipulation
                </p>
              </div>
            </div>

            {/* ELA stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="px-6 py-4">
                <p className="text-xs text-gray-400 mb-1">Suspicious pixels</p>
                <p className="text-lg font-semibold text-gray-800">
                  {result.ela.suspiciousRegions.toLocaleString()}
                </p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs text-gray-400 mb-1">
                  Avg. error difference
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {result.ela.averageDifference}
                </p>
              </div>
            </div>

            {/* ELA explanation */}
            <div className="mx-5 mb-5 flex gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                ELA re-saves the image at a known compression level and maps the
                difference. Authentic regions show uniform error. Tampered
                regions — pasted text, altered signatures — show abnormally high
                error levels because they were compressed fewer times than the
                rest of the document.
              </p>
            </div>
          </div>
        )}

        {/* ── Per-module breakdown ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Analysis breakdown
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Risk score per detection module — lower is safer
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              {
                label: "Error level analysis",
                risk: result.ela?.score ?? 0,
                icon: "🔬",
              },
              {
                label: "Metadata inspection",
                risk: result.metadata?.score ?? 0,
                icon: "🗂️",
              },
              {
                label: "OCR text quality",
                risk: 100 - (result.ocr?.confidence ?? 100),
                icon: "🔤",
              },
              {
                label: "Font consistency",
                risk: result.fontConsistency?.score ?? 0,
                icon: "🔡",
              },
              {
                label: "Pixel analysis",
                risk: result.pixelAnalysis?.score ?? 0,
                icon: "🧩",
              },
            ].map(({ label, risk, icon }) => {
              const variant =
                risk < 30
                  ? {
                      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      bar: "bg-emerald-500",
                      status: "Low risk",
                    }
                  : risk < 60
                  ? {
                      pill: "bg-amber-50 text-amber-700 border-amber-200",
                      bar: "bg-amber-500",
                      status: "Moderate",
                    }
                  : {
                      pill: "bg-red-50 text-red-700 border-red-200",
                      bar: "bg-red-500",
                      status: "High risk",
                    };
              return (
                <div key={label} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${variant.pill}`}
                    >
                      {variant.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${variant.bar}`}
                        style={{ width: `${risk}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-7 text-right">
                      {risk}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Extracted text ─────────────────────────────────────────────────── */}
        {result.ocr?.text && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Extracted text (OCR)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Overall OCR confidence:{" "}
                  <span className="font-medium text-gray-600">
                    {result.ocr.confidence}%
                  </span>
                </p>
              </div>
            </div>

            {/* Detected fields */}
            {Object.keys(result.ocr.detectedFields ?? {}).length > 0 && (
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Detected fields
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.ocr.detectedFields).map(([key, val]) =>
                    val ? (
                      <div
                        key={key}
                        className="bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <p className="text-xs text-gray-400 capitalize mb-0.5">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {val}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Raw text */}
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Raw text
              </p>
              <pre
                className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3
            whitespace-pre-wrap leading-relaxed font-mono max-h-48 overflow-y-auto"
              >
                {result.ocr.text.trim()}
              </pre>
            </div>
          </div>
        )}

        {/* ── Metadata findings ──────────────────────────────────────────────── */}
        {(result.metadata?.inconsistencies?.length > 0 ||
          result.metadata?.softwareEdited) && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Metadata findings
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Issues detected in the file's embedded data
              </p>
            </div>
            <div className="px-6 py-4 space-y-2">
              {result.metadata.softwareEdited && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732
                     4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-red-700">
                    Editing software detected:{" "}
                    <strong>{result.metadata.softwareEdited}</strong>
                  </p>
                </div>
              )}
              {result.metadata.inconsistencies.map((issue: string) => (
                <div
                  key={issue}
                  className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl"
                >
                  <svg
                    className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732
                     4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-amber-700">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 text-sm font-medium
          bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Verify another certificate
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600
          bg-white border border-gray-200 py-3 rounded-xl hover:border-gray-300
          hover:text-gray-900 transition-all"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download report (PDF)
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          This system is for demonstration and academic purposes only.
        </p>
      </div>
    </div>
  );
}
