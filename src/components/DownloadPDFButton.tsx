"use client";

import { useState, useRef } from "react";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
  slug: string;
}

export function DownloadPDFButton({ slug }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      // Dynamically import html2canvas and jspdf
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Hide header and footer temporarily
      const header = document.querySelector("header.print-header");
      const footer = document.querySelector("footer");

      const originalHeaderDisplay = header
        ? (header as HTMLElement).style.display || ""
        : "";
      const originalFooterDisplay = footer
        ? (footer as HTMLElement).style.display || ""
        : "";

      // Hide elements
      if (header) {
        (header as HTMLElement).style.display = "none";
      }
      if (footer) {
        (footer as HTMLElement).style.display = "none";
      }
      if (buttonRef.current) {
        buttonRef.current.style.display = "none";
      }

      // Get only the document content element (excluding header and footer)
      const contentElement =
        document.querySelector("main.print-content-wrapper") ||
        document.querySelector("article.print-content") ||
        document.querySelector(".print-content") ||
        document.body;

      // Wait a bit for any animations or rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the content
      const canvas = await html2canvas(contentElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: contentElement.scrollWidth,
        windowHeight: contentElement.scrollHeight,
        ignoreElements: (element) => {
          // Exclude header, footer, and download button
          return (
            element.classList.contains("print-header") ||
            element.tagName === "HEADER" ||
            element.tagName === "FOOTER" ||
            element.getAttribute("aria-label") === "Download PDF"
          );
        },
      });

      // Restore header and footer visibility
      if (header) {
        (header as HTMLElement).style.display = originalHeaderDisplay || "";
      }
      if (footer) {
        (footer as HTMLElement).style.display = originalFooterDisplay || "";
      }
      if (buttonRef.current) {
        buttonRef.current.style.display = "";
      }

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png", 1.0),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`${slug}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback: trigger print dialog
      window.print();
    } finally {
      // Ensure button is always restored
      if (buttonRef.current) {
        buttonRef.current.style.display = "";
      }
      // Restore header and footer in case of error
      const header = document.querySelector("header.print-header");
      const footer = document.querySelector("footer");
      if (header) {
        (header as HTMLElement).style.display = "";
      }
      if (footer) {
        (footer as HTMLElement).style.display = "";
      }
      setIsGenerating(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#92C36F] text-white rounded-full shadow-lg hover:bg-[#7BA860] transition-all duration-300 hover:shadow-xl no-print cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Download PDF"
    >
      <Download className="size-5" />
      <span className="hidden sm:inline font-medium">
        {isGenerating ? "Generating..." : "Download PDF"}
      </span>
    </button>
  );
}

