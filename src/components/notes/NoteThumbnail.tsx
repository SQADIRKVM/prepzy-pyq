import { useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNoteProxyUrl } from "@/services/notesSearchService";

interface NoteThumbnailProps {
  pdfUrl: string;
  className?: string;
  subjectCode?: string;
  module?: string | number | null;
}

const NoteThumbnail = ({ pdfUrl, className = "", subjectCode, module }: NoteThumbnailProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use preview URL (not download) to prevent auto-download
  const previewUrl = getNoteProxyUrl(pdfUrl, 'preview');

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background/40 border border-primary/10 rounded-xl overflow-hidden relative",
        "backdrop-blur-sm",
        className
      )}
      aria-label="Note preview"
      role="img"
    >
      {hasError ? (
        // Fallback: Show static preview with subject code
        <div className="flex flex-col items-center justify-center text-center px-4 py-6 w-full h-full">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/15 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            {subjectCode || "PDF"}
          </p>
          {module ? (
            <p className="text-xs text-primary/70 mt-1">Module {module}</p>
          ) : null}
          <p className="text-xs text-muted-foreground mt-3 max-w-[14ch] leading-tight">
            Tap to view
          </p>
        </div>
      ) : (
        <>
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}
          
          {/* PDF Preview - Scrolling enabled, controls hidden */}
          <div className="w-full h-full overflow-auto relative">
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&zoom=page-fit&page=1`}
              className="w-full h-full border-0"
              style={{
                userSelect: 'none',
                minHeight: '100%',
              }}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              onLoad={() => setIsLoading(false)}
              title={`Preview of ${subjectCode || 'PDF'}${module ? ` Module ${module}` : ''}`}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default NoteThumbnail;
