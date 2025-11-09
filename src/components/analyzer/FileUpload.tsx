
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, FileText, Wand2, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadPdf: (files: File[]) => void;
  onUploadImage: (files: File[]) => void;
  onUploadPdfOcr?: (files: File[]) => void;
}

const FileUpload = ({ onUploadPdf, onUploadImage, onUploadPdfOcr }: FileUploadProps) => {
  const [isOver, setIsOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<'pdf' | 'image' | 'pdfocr'>('pdf');
  
  const onDropPdf = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 10MB limit.`);
      return;
    }
    
    setSelectedFiles(acceptedFiles);
    if (acceptedFiles.length > 1) {
      toast.info(`Selected ${acceptedFiles.length} PDF files`);
    }
  }, []);

  const onDropImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    setSelectedFiles(acceptedFiles);
  }, []);

  const onDropPdfOcr = useCallback((acceptedFiles: File[]) => {
    if (!onUploadPdfOcr || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    setSelectedFiles(acceptedFiles);
  }, [onUploadPdfOcr]);

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    if (uploadType === 'pdf') {
      onUploadPdf(selectedFiles);
    } else if (uploadType === 'image') {
      onUploadImage(selectedFiles);
    } else if (uploadType === 'pdfocr' && onUploadPdfOcr) {
      onUploadPdfOcr(selectedFiles);
    }
    setSelectedFiles([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const { 
    getRootProps: getPdfRootProps, 
    getInputProps: getPdfInputProps, 
    isDragActive: isPdfDragActive 
  } = useDropzone({
    onDrop: onDropPdf,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    onDragEnter: () => setIsOver(true),
    onDragLeave: () => setIsOver(false),
    noClick: selectedFiles.length > 0 && uploadType === 'pdf',
  });

  const { 
    getRootProps: getImageRootProps, 
    getInputProps: getImageInputProps, 
    isDragActive: isImageDragActive 
  } = useDropzone({
    onDrop: onDropImage,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsOver(true),
    onDragLeave: () => setIsOver(false),
    noClick: selectedFiles.length > 0 && uploadType === 'image',
  });

  const { 
    getRootProps: getPdfOcrRootProps, 
    getInputProps: getPdfOcrInputProps, 
    isDragActive: isPdfOcrDragActive 
  } = useDropzone({
    onDrop: onDropPdfOcr,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsOver(true),
    onDragLeave: () => setIsOver(false),
    disabled: !onUploadPdfOcr,
    noClick: selectedFiles.length > 0 && uploadType === 'pdfocr',
  });

  const getDropzoneProps = () => {
    if (uploadType === 'pdf') return { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive };
    if (uploadType === 'image') return { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive };
    return { getRootProps: getPdfOcrRootProps, getInputProps: getPdfOcrInputProps, isDragActive: isPdfOcrDragActive };
  };

  const { getRootProps, getInputProps, isDragActive } = getDropzoneProps();

  return (
    <div className="w-full space-y-6">
      {/* Upload Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card 
          className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
            uploadType === 'pdf' 
              ? 'border-primary bg-primary/5 shadow-lg' 
              : 'border-border hover:border-primary/30 hover:shadow-md'
          }`}
          onClick={() => {
            setUploadType('pdf');
            setSelectedFiles([]);
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-xl transition-colors ${
              uploadType === 'pdf' ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <FileText className={`h-6 w-6 transition-colors ${
                uploadType === 'pdf' ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm transition-colors ${
                uploadType === 'pdf' ? 'text-primary' : 'text-foreground'
              }`}>
                PDF Extract
              </p>
              <p className="text-xs text-muted-foreground mt-1">Direct text extraction</p>
              {uploadType === 'pdf' && (
                <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Multiple files
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card 
          className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
            uploadType === 'image' 
              ? 'border-primary bg-primary/5 shadow-lg' 
              : 'border-border hover:border-primary/30 hover:shadow-md'
          }`}
          onClick={() => {
            setUploadType('image');
            setSelectedFiles([]);
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-xl transition-colors ${
              uploadType === 'image' ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <FileImage className={`h-6 w-6 transition-colors ${
                uploadType === 'image' ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm transition-colors ${
                uploadType === 'image' ? 'text-primary' : 'text-foreground'
              }`}>
                Image OCR
              </p>
              <p className="text-xs text-muted-foreground mt-1">Scan images</p>
            </div>
          </div>
        </Card>

        <Card 
          className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
            uploadType === 'pdfocr' 
              ? 'border-primary bg-primary/5 shadow-lg' 
              : 'border-border hover:border-primary/30 hover:shadow-md'
          } ${!onUploadPdfOcr ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => {
            if (onUploadPdfOcr) {
              setUploadType('pdfocr');
              setSelectedFiles([]);
            }
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-xl transition-colors ${
              uploadType === 'pdfocr' ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <Wand2 className={`h-6 w-6 transition-colors ${
                uploadType === 'pdfocr' ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm transition-colors ${
                uploadType === 'pdfocr' ? 'text-primary' : 'text-foreground'
              }`}>
                PDF OCR
              </p>
              <p className="text-xs text-muted-foreground mt-1">Advanced OCR</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Upload Area */}
      <Card className="border-2 border-dashed overflow-hidden bg-card/50">
        <div
          {...getRootProps()}
          className={`relative p-6 md:p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive || isOver
              ? 'bg-primary/5 border-primary scale-[1.01]' 
              : 'bg-muted/20 hover:bg-muted/30'
            }`}
          >
          <input {...getInputProps()} />
          
          {selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <div className={`p-6 rounded-2xl transition-all ${
                isDragActive ? 'bg-primary/20 scale-110' : 'bg-primary/10'
              }`}>
                <Upload className={`h-16 w-16 transition-colors ${
                  isDragActive ? 'text-primary' : 'text-primary/70'
                }`} />
              </div>
              
              <div className="space-y-2 max-w-md px-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  {isDragActive ? 'Drop files here' : 'Upload your question papers'}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {uploadType === 'pdf' && 'Drag and drop PDF files here, or click to browse. Supports multiple files.'}
                  {uploadType === 'image' && 'Drag and drop image files here, or click to browse. JPG, PNG, TIFF supported.'}
                  {uploadType === 'pdfocr' && 'Drag and drop PDF files here for advanced OCR processing.'}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Maximum file size: 10MB per file
                </p>
              </div>

              <Button 
                type="button" 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 px-8"
              >
                <Upload className="mr-2 h-5 w-5" />
                Choose Files
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-semibold text-lg">{selectedFiles.length} file(s) selected</span>
          </div>
              
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
              </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFiles([]);
                  }}
                >
                  Clear All
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Process
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-card/50 border-l-4 border-l-primary p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">PDF Extract</h4>
              <p className="text-xs text-muted-foreground">
                Best for digital PDFs with selectable text. Fast and accurate extraction.
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 border-l-4 border-l-primary p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileImage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Image OCR</h4>
              <p className="text-xs text-muted-foreground">
                Perfect for scanned images. Uses advanced OCR to extract text from images.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-card/50 border-l-4 border-l-primary p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <div>
              <h4 className="font-semibold text-sm mb-1">PDF OCR</h4>
              <p className="text-xs text-muted-foreground">
                Advanced processing for scanned PDFs. Converts pages to images first for better accuracy.
                </p>
            </div>
          </div>
        </Card>
          </div>
    </div>
  );
};

export default FileUpload;
