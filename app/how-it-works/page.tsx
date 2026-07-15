"use client";

import Footer from "@/components/ui/Footer";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "Upload Certificate",
      desc: "User uploads a clear image of the certificate through a simple drag-and-drop interface.",
    },
    {
      step: "02",
      title: "Image Preprocessing",
      desc: "The system applies noise reduction, contrast enhancement, and normalization techniques.",
    },
    {
      step: "03",
      title: "Feature Extraction",
      desc: "Advanced computer vision extracts key elements like signatures, seals, fonts, and security patterns.",
    },
    {
      step: "04",
      title: "AI Analysis",
      desc: "Convolutional Neural Networks and anomaly detection models analyze the extracted features.",
    },
    {
      step: "05",
      title: "Final Decision",
      desc: "The system generates a confidence score and detailed report with explainable results.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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

      <div className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6">How It Works</h1>
          <p className="text-2xl text-slate-400 max-w-2xl mx-auto">
            Our system combines Image Processing and Machine Learning to detect
            forged certificates with high accuracy.
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((item, index) => (
            <div key={index} className="flex gap-16 items-start">
              <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-5xl font-bold shadow-xl">
                {item.step}
              </div>

              <div className="flex-1 pt-6">
                <h2 className="text-4xl font-semibold mb-6">{item.title}</h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Technology Section */}
        <div className="mt-28 bg-slate-900 rounded-3xl p-16">
          <h3 className="text-3xl font-semibold text-center mb-12">
            Core Technologies Used
          </h3>
          <div className="grid md:grid-cols-2 gap-10 text-lg">
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="text-indigo-400 font-mono">→</span>
                <div>
                  <strong>Image Processing:</strong> OpenCV, Edge Detection, OCR
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-indigo-400 font-mono">→</span>
                <div>
                  <strong>Machine Learning:</strong> CNN, Anomaly Detection
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="text-indigo-400 font-mono">→</span>
                <div>
                  <strong>Frontend:</strong> Next.js 14 + Tailwind CSS
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-indigo-400 font-mono">→</span>
                <div>
                  <strong>Deployment:</strong> Ready for Vercel / Localhost
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-20">
          <a
            href="/upload"
            className="inline-block bg-white hover:bg-indigo-500 hover:text-white text-slate-900 px-12 py-6 rounded-2xl text-xl font-semibold transition-all"
          >
            Try the System Now
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// "use client";

// export default function HowItWorksPage() {
//   const steps = [
//     {
//       number: "01",
//       title: "Upload Certificate",
//       description:
//         "User uploads a clear image of the certificate (JPG or PNG).",
//       color: "bg-blue-500",
//     },
//     {
//       number: "02",
//       title: "Image Preprocessing",
//       description:
//         "The system enhances image quality, removes noise, and normalizes the document.",
//       color: "bg-indigo-500",
//     },
//     {
//       number: "03",
//       title: "Feature Extraction",
//       description:
//         "Advanced image processing extracts signatures, seals, fonts, and micro-text patterns.",
//       color: "bg-violet-500",
//     },
//     {
//       number: "04",
//       title: "Machine Learning Analysis",
//       description:
//         "Our trained model compares features against known genuine patterns.",
//       color: "bg-purple-500",
//     },
//     {
//       number: "05",
//       title: "Final Verdict",
//       description: "System generates authenticity score with detailed report.",
//       color: "bg-emerald-500",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Navbar */}
//       <nav className="bg-white border-b sticky top-0 z-50">
//         <div className="max-w-5xl mx-auto px-8 py-5 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold">
//               C
//             </div>
//             <span className="text-2xl font-semibold tracking-tight">
//               CertiGuard
//             </span>
//           </div>
//           <a
//             href="/"
//             className="text-slate-600 hover:text-slate-900 font-medium"
//           >
//             ← Home
//           </a>
//         </div>
//       </nav>

//       <div className="max-w-5xl mx-auto px-8 py-16">
//         <div className="text-center mb-16">
//           <h1 className="text-5xl font-bold text-slate-900 mb-4">
//             How It Works
//           </h1>
//           <p className="text-xl text-slate-600 max-w-2xl mx-auto">
//             Our system combines Image Processing and Machine Learning to detect
//             fake certificates with high accuracy.
//           </p>
//         </div>

//         <div className="space-y-20">
//           {steps.map((step, index) => (
//             <div key={index} className="flex gap-12 items-center">
//               <div
//                 className="w-24 h-24 flex-shrink-0 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-lg"
//                 style={{
//                   background: `linear-gradient(135deg, #4f46e5, #7c3aed)`,
//                 }}
//               >
//                 {step.number}
//               </div>

//               <div className="flex-1">
//                 <h2 className="text-3xl font-semibold text-slate-800 mb-3">
//                   {step.title}
//                 </h2>
//                 <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
//                   {step.description}
//                 </p>
//               </div>

//               {index !== steps.length - 1 && (
//                 <div className="hidden lg:block w-px h-28 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Technical Summary */}
//         <div className="mt-24 bg-white border rounded-3xl p-12">
//           <h3 className="text-2xl font-semibold mb-8 text-center">
//             Technical Approach
//           </h3>
//           <div className="grid md:grid-cols-2 gap-10">
//             <div>
//               <h4 className="font-medium text-lg mb-4">
//                 Image Processing Techniques
//               </h4>
//               <ul className="space-y-3 text-slate-600">
//                 <li>• Grayscale Conversion &amp; Noise Reduction</li>
//                 <li>• Edge Detection (Canny Algorithm)</li>
//                 <li>• Optical Character Recognition (OCR)</li>
//                 <li>• Seal &amp; Signature Segmentation</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-medium text-lg mb-4">
//                 Machine Learning Models
//               </h4>
//               <ul className="space-y-3 text-slate-600">
//                 <li>• Convolutional Neural Networks (CNN)</li>
//                 <li>• Anomaly Detection Models</li>
//                 <li>• Trained on real vs forged certificate dataset</li>
//                 <li>• Ensemble Learning for higher accuracy</li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="text-center mt-16">
//           <a
//             href="/upload"
//             className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-medium hover:bg-indigo-700 transition"
//           >
//             Try It Now — Upload a Certificate
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }
