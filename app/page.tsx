"use client";

import Footer from "@/components/ui/Footer";
import TopNav from "@/components/ui/TopNav";
import Link from "next/link";

const FEATURES = [
  {
    icon: "🔬",
    label: "blue",
    title: "Error level analysis",
    desc: "Re-compresses the image and maps pixel-level error differences to reveal edited or pasted regions invisible to the human eye.",
  },
  {
    icon: "🗂️",
    label: "green",
    title: "Metadata inspection",
    desc: "Examines EXIF data for editing software traces, format conversion artefacts, and file structure inconsistencies.",
  },
  {
    icon: "🔤",
    label: "amber",
    title: "OCR text extraction",
    desc: "Reads all text, flags low-confidence regions, and validates expected fields like dates and serial numbers.",
  },
  {
    icon: "🔡",
    label: "purple",
    title: "Font consistency",
    desc: "Detects rendering variance between text blocks that indicates copy-pasted or digitally altered content.",
  },
  {
    icon: "🧩",
    label: "teal",
    title: "Pixel analysis",
    desc: "Analyses noise distribution, JPEG blocking artefacts, and background uniformity across the image.",
  },
  {
    icon: "📊",
    label: "red",
    title: "Explainable verdict",
    desc: "Returns a weighted confidence score with per-module breakdowns so you understand exactly what was flagged.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Upload",
    desc: "Drop or select your certificate — JPEG, PNG or WebP, up to 10 MB.",
  },
  {
    n: "2",
    title: "Analyse",
    desc: "Five detection modules run in parallel on the server. No data is stored.",
  },
  {
    n: "3",
    title: "Score",
    desc: "Each module returns a risk score, combined into a weighted overall verdict.",
  },
  {
    n: "4",
    title: "Report",
    desc: "View the ELA image, extracted text, and a full per-module breakdown.",
  },
];

// Feature icon colour map
const ICON_COLORS: Record<string, string> = {
  blue: "bg-blue-50   text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50  text-amber-600",
  purple: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50   text-teal-600",
  red: "bg-red-50    text-red-600",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <TopNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Final year project — 2026
          </div>

          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight text-gray-900 mb-5">
            Detecting fake certificates
            <br />
            with <span className="text-indigo-600">machine intelligence</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
            An advanced system that uses image processing and machine learning
            to verify certificate authenticity in seconds.
          </p>

          <div className="flex items-center gap-3 justify-center flex-wrap">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-sm font-medium bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
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
              Start verification now
            </Link>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-6 py-3 rounded-xl hover:border-gray-300 hover:text-gray-900 transition-all"
            >
              Learn how it works
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {[
              { icon: "🔒", label: "Private & secure" },
              { icon: "⚡", label: "Results in under 10 seconds" },
              { icon: "✓", label: "No account required" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <span className="text-gray-400">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className="border-y border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-gray-200">
          {[
            { value: "5", label: "Detection layers" },
            { value: "< 10 sec", label: "Average analysis time" },
            { value: "JPG · PNG · WebP", label: "Supported formats" },
          ].map(({ value, label }) => (
            <div key={label} className="py-7 px-6 text-center">
              <p className="text-md md:text-xl font-semibold text-gray-900 tracking-tight mb-0.5">
                {value}
              </p>
              <p className="text-xs md:text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-2">
              Capabilities
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">
              Five layers of verification
            </h2>
            <p className="text-gray-500 text-base max-w-md leading-relaxed">
              Every certificate is examined using multiple independent
              techniques so no single manipulation method can slip through.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-4 ${
                    ICON_COLORS[f.label]
                  }`}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-20 px-8 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-2">
              Process
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              How it works
            </h2>
          </div>

          {/* Steps with connector */}
          <div className="relative grid grid-cols-4 gap-4">
            <div className="absolute top-5 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gray-200" />
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 mb-4 z-10 shadow-sm">
                  {s.n}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                  {s.title}
                </h4>
                <p className="hidden md:block text-xs text-gray-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">
            Ready to verify?
          </h2>
          <p className="text-gray-500 text-base mb-8 leading-relaxed">
            Join the fight against certificate forgery. Upload a certificate and
            get a detailed authenticity report in seconds.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 text-sm font-medium bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
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
            Upload certificate now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
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

//           <div className="hidden md:flex items-center gap-10 text-lg">
//             <a href="#features" className="hover:text-indigo-400 transition">
//               Features
//             </a>
//             <a
//               href="/how-it-works"
//               className="hover:text-indigo-400 transition"
//             >
//               How it Works
//             </a>
//             <a href="/about" className="hover:text-indigo-400 transition">
//               About
//             </a>
//             <a href="/history" className="hover:text-indigo-400 transition">
//               History
//             </a>
//           </div>

//           <Link
//             href="/upload"
//             className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-semibold hover:bg-indigo-500 hover:text-white transition"
//           >
//             Verify Certificate
//           </Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="pt-32 pb-24 px-8">
//         <div className="max-w-5xl mx-auto text-center">
//           <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full mb-8 text-sm">
//             <span className="text-emerald-400">●</span>
//             Final Year Project 2026
//           </div>

//           <h1 className="text-7xl md:text-8xl font-bold leading-none tracking-tighter mb-8">
//             Detecting Fake
//             <br />
//             Certificates with
//             <br />
//             <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
//               Intelligence
//             </span>
//           </h1>

//           <p className="text-2xl text-slate-400 max-w-3xl mx-auto mb-12">
//             An advanced system that uses Image Processing and Machine Learning
//             to verify certificate authenticity in seconds.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-5 justify-center">
//             <Link
//               href="/upload"
//               className="bg-white text-slate-900 px-12 py-6 rounded-2xl text-xl font-semibold hover:bg-indigo-500 hover:text-white transition inline-flex items-center justify-center gap-3"
//             >
//               Start Verification Now
//             </Link>

//             <a
//               href="/how-it-works"
//               className="border border-white/30 px-12 py-6 rounded-2xl text-xl font-semibold hover:bg-white/5 transition"
//             >
//               Learn How It Works
//             </a>
//           </div>

//           <p className="text-sm text-slate-500 mt-10">
//             Trusted by institutions • Secure & Private
//           </p>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-24 border-t border-white/10">
//         <div className="max-w-6xl mx-auto px-8">
//           <h2 className="text-5xl font-bold text-center mb-16">
//             Powerful Capabilities
//           </h2>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 title: "Instant Analysis",
//                 desc: "Get results in seconds using state-of-the-art computer vision.",
//                 icon: "⚡",
//               },
//               {
//                 title: "Multi-Layer Verification",
//                 desc: "Checks signature, seal, font consistency, micro-text & more.",
//                 icon: "🔬",
//               },
//               {
//                 title: "Explainable Results",
//                 desc: "Understand exactly why a certificate was flagged or approved.",
//                 icon: "📊",
//               },
//             ].map((feature, i) => (
//               <div
//                 key={i}
//                 className="bg-slate-900 border border-white/10 rounded-3xl p-10 hover:border-indigo-500/50 transition group"
//               >
//                 <div className="text-5xl mb-8">{feature.icon}</div>
//                 <h3 className="text-3xl font-semibold mb-4">{feature.title}</h3>
//                 <p className="text-slate-400 text-lg leading-relaxed">
//                   {feature.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Footer */}
//       <section className="py-28 border-t border-white/10 bg-gradient-to-b from-transparent via-indigo-950/30 to-transparent">
//         <div className="max-w-4xl mx-auto text-center px-8">
//           <h2 className="text-5xl font-bold mb-6">Ready to Verify?</h2>
//           <p className="text-xl text-slate-400 mb-10">
//             Join the fight against certificate forgery
//           </p>

//           <Link
//             href="/upload"
//             className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 px-16 py-7 rounded-2xl text-2xl font-semibold hover:brightness-110 transition"
//           >
//             Upload Certificate Now
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// }
