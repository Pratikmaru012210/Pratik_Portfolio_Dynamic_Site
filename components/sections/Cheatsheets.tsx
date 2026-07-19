"use client";

import { cheatsheetsText } from "../../constants/texts";
import { FileText, Download } from "lucide-react";
import { Cheatsheet } from "@/types";

interface CheatsheetsProps {
  cheatsheets: Cheatsheet[];
}

export default function Cheatsheets({ cheatsheets }: CheatsheetsProps) {
  const handleDownload = async (e: React.MouseEvent, pdfUrl: string, title: string) => {
    e.stopPropagation(); // Stop click from opening the pdf in browser
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = title.toLowerCase().endsWith(".pdf") ? title : `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download PDF directly, opening with attachment parameter:", error);
      // Fallback: imagekit query parameter for attachment download
      const downloadUrl = pdfUrl.includes("?") 
        ? `${pdfUrl}&ik-attachment=true` 
        : `${pdfUrl}?ik-attachment=true`;
      window.open(downloadUrl, "_blank");
    }
  };

  const handleCardClick = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  if (!cheatsheets || cheatsheets.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center w-full pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
      {/* Label */}
      <div className="text-overline text-center mb-4 text-foreground/50">
        {cheatsheetsText.heading}
      </div>

      {/* Heading */}
      <h1 className="text-heading text-center mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
        {cheatsheetsText.subHeading}
      </h1>

      {/* Introduction Text */}
      <div className="text-body text-foreground/80 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-center mb-12 mx-auto px-2 sm:px-4">
        {cheatsheetsText.introduction}
      </div>

      {/* Cheatsheets List Scroll Container */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <div className="flex flex-nowrap md:justify-center gap-4 sm:gap-6 md:gap-8 pt-6 px-4 pb-6 w-max min-w-full">
          {cheatsheets.map((cheatsheet) => (
            <div
              onClick={() => handleCardClick(cheatsheet.pdfUrl)}
              key={cheatsheet._id}
              className="glossy-glass-card flex-shrink-0 flex flex-col items-start rounded-2xl p-5 sm:p-6 md:p-8 w-[85vw] max-w-[260px] sm:min-w-[260px] md:min-w-[280px] sm:max-w-[300px] md:max-w-[360px] min-h-[160px] sm:min-h-[180px] md:min-h-[200px] cursor-pointer hover:scale-[1.04] hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(var(--primary-rgb),0.15)] group relative overflow-hidden transition-all duration-300"
            >
              {/* Card Header Vibe */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="rounded-xl p-2.5 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] w-12 h-12 sm:w-14 sm:h-14 overflow-hidden">
                  {cheatsheet.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cheatsheet.logoUrl}
                      alt=""
                      className="w-full h-full object-contain rounded-md"
                    />
                  ) : (
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                  )}
                </div>
                
                {/* Download Button */}
                <button
                  type="button"
                  onClick={(e) => handleDownload(e, cheatsheet.pdfUrl, cheatsheet.title)}
                  className="p-2.5 rounded-full bg-neutral-900 border border-white/10 hover:border-primary/40 hover:bg-primary/20 hover:text-primary transition-all duration-200 cursor-pointer"
                  title="Download Cheatsheet"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {cheatsheet.title}
              </h3>
              
              {/* Visual Cue - View In Browser */}
              <div className="text-xs text-foreground/45 mt-auto font-medium transition-colors duration-300 group-hover:text-primary/80">
                Click to view in browser
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
