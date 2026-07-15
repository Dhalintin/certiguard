"use client";
import Footer from "@/components/ui/Footer";
import TopNav from "@/components/ui/TopNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <TopNav />

      <div className="max-w-6xl mx-auto px-8 pt-12 pb-24">
        <section className="py-16 px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Final year project — 2026
            </div>

            <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight text-gray-900 mb-5">
              Fighting Certificate Forgery
              <br />
              with Intelligent Technology
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
              A robust Fake Certificate Detection System built using Image
              Processing and Machine Learning.
            </p>
          </div>
        </section>

        {/* Vision */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-16 mb-20">
          <h2 className="text-4xl font-semibold mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-2xl text-slate-300 text-center max-w-3xl mx-auto leading-relaxed">
            To provide a reliable, fast, and accessible tool that helps
            universities, employers, and government institutions verify the
            authenticity of certificates and reduce academic fraud.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            {
              title: "High Accuracy",
              desc: "Achieves over 92% detection accuracy using advanced CNN models.",
              icon: "🎯",
            },
            {
              title: "Fast Processing",
              desc: "Delivers results in under 3 seconds after upload.",
              icon: "⚡",
            },
            {
              title: "Explainable AI",
              desc: "Shows clear reasoning behind every detection result.",
              icon: "🔍",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-white/10 rounded-3xl p-10 hover:border-indigo-500/30 transition-all group"
            >
              <div className="text-5xl mb-6">{item.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
              <p className="text-slate-400 text-lg">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="mb-20">
          <h2 className="text-4xl font-semibold text-center mb-12">
            Built With
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "Python",
              "OpenCV",
              "TensorFlow",
              "Scikit-learn",
              "Next.js",
              "Tailwind CSS",
              "Prisma",
            ].map((tech, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-semibold mb-6">
            Ready to Experience It?
          </h2>
          <a
            href="/upload"
            className="inline-block bg-white text-slate-900 px-14 py-6 rounded-2xl text-xl font-semibold hover:bg-indigo-500 hover:text-white transition-all duration-300"
          >
            Start Verifying Certificates →
          </a>
          <p className="text-slate-500 mt-6 text-sm">
            Built as a Final Year Project • 2026
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
