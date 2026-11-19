"use client";

import { Download } from "lucide-react";

export function DownloadPDFButton() {
  return (
    <button
      onClick={() => window.print()}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#92C36F] text-white rounded-full shadow-lg hover:bg-[#7BA860] transition-all duration-300 hover:shadow-xl no-print cursor-pointer"
      aria-label="Save as PDF"
    >
      <Download className="size-5" />
      <span className="hidden sm:inline font-medium">Save as PDF</span>
    </button>
  );
}
