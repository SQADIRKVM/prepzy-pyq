import { useState } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFThumbnailProps {
  pdfUrl: string;
  className?: string;
}

const PDFThumbnail = ({ pdfUrl, className = '' }: PDFThumbnailProps) => {
  const [hasError, setHasError] = useState(false);

  // Use proxy URL for PDF
  const proxyUrl = import.meta.env.PROD 
    ? `/api/proxy?url=${encodeURIComponent(pdfUrl)}`
    : `http://localhost:3001/api/proxy?url=${encodeURIComponent(pdfUrl)}`;

  // Use object tag for simple PDF preview (browser native)
  return (
    <div 
      className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden relative", className)}
    >
      {hasError ? (
        <div className="text-center p-4">
          <FileText className="h-12 w-12 text-primary/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">PDF Preview</p>
        </div>
      ) : (
        <object
          data={`${proxyUrl}#page=1&zoom=page-fit`}
          type="application/pdf"
          className="w-full h-full"
          onError={() => setHasError(true)}
          aria-label="PDF Preview"
        >
          <div className="text-center p-4">
            <FileText className="h-12 w-12 text-primary/50 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">PDF Preview</p>
          </div>
        </object>
      )}
    </div>
  );
};

export default PDFThumbnail;

