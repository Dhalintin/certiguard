import React from "react";

export default function Footer() {
  return (
    <>
      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">
            CertiGuard{" "}
            <span className="hidden md:inline">· Final year project, 2026</span>
          </p>
          <div className="flex gap-6">
            {["Privacy", "Documentation", "GitHub"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs md:text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
