"use client";

import Footer from "@/components/ui/Footer";
import TopNav from "@/components/ui/TopNav";

export default function HistoryPage() {
  const scans = [
    {
      id: 1,
      file: "bsc_certificate_john_doe.jpg",
      date: "July 08, 2026",
      time: "14:32",
      result: "Genuine",
      confidence: 98,
      status: "success",
    },
    {
      id: 2,
      file: "msc_transcript_2025.pdf.jpg",
      date: "July 07, 2026",
      time: "09:15",
      result: "Genuine",
      confidence: 95,
      status: "success",
    },
    {
      id: 3,
      file: "phd_certificate_smith.jpg",
      date: "July 06, 2026",
      time: "16:45",
      result: "Suspicious",
      confidence: 67,
      status: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <TopNav />

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-bold">Scan History</h1>
            <p className="text-slate-400 mt-2 text-xl">
              All previous certificate verifications
            </p>
          </div>
          <a
            href="/upload"
            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-500 hover:text-white transition"
          >
            New Scan
          </a>
        </div>

        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-6 px-10 font-medium text-slate-400">
                  Certificate
                </th>
                <th className="text-left py-6 px-10 font-medium text-slate-400">
                  Date & Time
                </th>
                <th className="text-left py-6 px-10 font-medium text-slate-400">
                  Result
                </th>
                <th className="text-left py-6 px-10 font-medium text-slate-400">
                  Confidence
                </th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-white/5 transition">
                  <td className="py-7 px-10 font-medium">{scan.file}</td>
                  <td className="py-7 px-10 text-slate-400">
                    {scan.date}
                    <br />
                    <span className="text-sm">{scan.time}</span>
                  </td>
                  <td className="py-7 px-10">
                    <span
                      className={`inline-block px-5 py-1.5 rounded-full text-sm font-medium
                      ${
                        scan.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {scan.result}
                    </span>
                  </td>
                  <td className="py-7 px-10">
                    <span className="font-mono text-lg">
                      {scan.confidence}%
                    </span>
                  </td>
                  <td className="py-7 px-10 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                      View Report →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {scans.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No scans yet. Start by verifying your first certificate.
          </div>
        )}

        <div className="text-center mt-12 text-sm text-slate-500">
          Only the last 30 days of scans are shown • Data is stored locally for
          this demo
        </div>
      </div>

      <Footer />
    </div>
  );
}
