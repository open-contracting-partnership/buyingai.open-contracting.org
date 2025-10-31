"use client";

import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Download, X } from "lucide-react";

interface PrintViewProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  chapterTitle?: string;
}

export function PrintView({
  title,
  content,
  isOpen,
  onClose,
  chapterTitle,
}: PrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      // Show loading state
      const loadingMessage = document.createElement("div");
      loadingMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
      `;
      loadingMessage.textContent = "Generating PDF...";
      document.body.appendChild(loadingMessage);

      // Ensure images inside the print area are loaded and CORS-safe
      const images = Array.from(
        printRef.current.querySelectorAll("img")
      ) as HTMLImageElement[];
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              try {
                img.setAttribute("crossorigin", "anonymous");
              } catch (_) {}
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      // Limit snapshot width to avoid huge canvases (fit to A4 ~ 794px @96dpi)
      const originalWidth = (printRef.current as HTMLDivElement).style.width;
      (printRef.current as HTMLDivElement).style.width = "794px";

      // Small delay to ensure layout settles
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Configure canvas options for better quality
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Ignore all SVG elements to avoid lab() color parsing errors
          if (element instanceof SVGElement || element.tagName === "svg") {
            return true;
          }
          // Ignore buttons and icons in the content (if any leak through)
          if (
            element.classList.contains("lucide") ||
            element.closest("button")
          ) {
            return true;
          }
          return false;
        },
        onclone: (clonedDoc, element) => {
          // Remove all SVG elements to prevent lab() color parsing errors
          const svgElements = element.querySelectorAll("svg");
          svgElements.forEach((svg) => {
            svg.remove();
          });

          // Remove buttons that might contain SVG icons
          const buttons = element.querySelectorAll("button");
          buttons.forEach((button) => {
            button.remove();
          });

          // Function to sanitize style attribute
          const sanitizeStyleAttribute = (el: Element) => {
            if (el.hasAttribute("style")) {
              const style = el.getAttribute("style") || "";
              // Remove any color functions that html2canvas can't handle
              const sanitized = style
                .replace(/lab\([^)]+\)/gi, "#000000")
                .replace(/lch\([^)]+\)/gi, "#000000")
                .replace(/oklab\([^)]+\)/gi, "#000000")
                .replace(/oklch\([^)]+\)/gi, "#000000");
              if (sanitized !== style) {
                el.setAttribute("style", sanitized);
              }
            }
          };

          // Sanitize all elements in the cloned document
          const allElements = element.querySelectorAll("*");
          allElements.forEach((el) => {
            sanitizeStyleAttribute(el);
          });

          // Inject comprehensive safe color overrides
          const safeStyle = clonedDoc.createElement("style");
          safeStyle.setAttribute("data-print-sanitize", "true");
          safeStyle.textContent = `
            .print-view-container, .print-view-container * {
              color: #000 !important;
              background: transparent !important;
              background-color: transparent !important;
              background-image: none !important;
              border-color: #cccccc !important;
              box-shadow: none !important;
              text-shadow: none !important;
              outline-color: #cccccc !important;
            }
            .print-view-container .print-header h1 { color: #000 !important; }
            .print-view-container a { color: #000 !important; text-decoration-color: #000 !important; }
            .print-view-container blockquote { border-left-color: #C8D419 !important; }
            .print-view-container table { border-color: #cccccc !important; }
            .print-view-container th, .print-view-container td { border-color: #cccccc !important; }
            svg { display: none !important; }
          `;
          clonedDoc.head.appendChild(safeStyle);
        },
      });

      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth; // Fit to page width
      const imgScaledWidth = pdfWidth;
      const imgScaledHeight = imgHeight * ratio;

      // Split into pages
      let heightLeft = imgScaledHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgScaledWidth,
        imgScaledHeight
      );
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgScaledWidth,
          imgScaledHeight
        );
        heightLeft -= pdfHeight;
      }

      // Generate filename
      const filename = chapterTitle
        ? `${chapterTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        : `chapter_${Date.now()}.pdf`;

      // Save PDF
      pdf.save(filename);

      // Restore mutated styles
      (printRef.current as HTMLDivElement).style.width = originalWidth;

      // Remove loading message
      document.body.removeChild(loadingMessage);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Error generating PDF. ${message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-gteesti-display font-semibold text-gray-900">
              PDF Preview
            </h2>
            <div className="flex items-center gap-2">
              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#92C36F] text-white rounded-lg hover:bg-[#7BA860] transition-colors"
                aria-label="Download PDF"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 print-content-scroll">
            <div
              ref={printRef}
              className="print-view-container bg-white mx-auto"
            >
              {/* Print Header */}
              <div className="print-header mb-8 pb-6 border-b-2 border-gray-300">
                <h1 className="text-3xl font-gteesti-display font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                {chapterTitle && (
                  <p className="text-lg text-gray-600">{chapterTitle}</p>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Print Content */}
              <div className="print-content prose prose-slate max-w-none print-prose">
                <div className="print-content-wrapper">{content}</div>
              </div>

              {/* Print Footer */}
              <div className="print-footer mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-500">
                <p>Open Contracting Partnership - Buying AI Guide</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-view-container,
          .print-view-container * {
            visibility: visible;
          }
          .print-view-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .print-header,
          .print-content,
          .print-footer {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
