
import { useEffect, useState } from "react";
import FileUpload from "@/components/analyzer/FileUpload";
import ProcessingStatus from "@/components/analyzer/ProcessingStatus";
import { ProcessStatus } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Key } from "lucide-react";

interface UploadSectionProps {
  status: ProcessStatus;
  progress: number;
  errorMessage: string;
  currentStep: string;
  questionCount?: number;
  currentFile?: number;
  totalFiles?: number;
  onUploadPdf: (files: File[]) => void;
  onUploadImage: (files: File[]) => void;
  onUploadPdfOcr?: (files: File[]) => void;
  onAddApiKey?: () => void;
}

const UploadSection = ({ 
  status, 
  progress, 
  errorMessage, 
  currentStep,
  questionCount,
  currentFile,
  totalFiles,
  onUploadPdf,
  onUploadImage,
  onUploadPdfOcr,
  onPause,
  onResume,
  onCancel,
  onAddApiKey
}: UploadSectionProps) => {
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = () => {
      const deepseekKey = localStorage.getItem('deepseekApiKey');
      const openRouterKey = localStorage.getItem('openRouterApiKey');
      setHasApiKey(!!deepseekKey || !!openRouterKey);
    };

    checkApiKey();
    // Check every second to catch when user adds the key
    const interval = setInterval(checkApiKey, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {!hasApiKey && status === "idle" && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <AlertTitle className="text-amber-400 font-semibold">API Key Required</AlertTitle>
            <AlertDescription className="text-amber-300/80 mt-1">
              Please configure your DeepSeek or OpenRouter API key in settings to enable AI-powered analysis.
            </AlertDescription>
            {onAddApiKey && (
              <div className="mt-3">
                <Button
                  onClick={onAddApiKey}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}
      
      {status === "idle" && (
        <FileUpload 
          onUploadPdf={onUploadPdf}
          onUploadImage={onUploadImage}
          onUploadPdfOcr={onUploadPdfOcr}
        />
      )}
      
      {status !== "idle" && (
        <ProcessingStatus 
          status={status}
          progress={progress}
          errorMessage={errorMessage}
          currentStep={currentStep}
          questionCount={questionCount}
          currentFile={currentFile}
          totalFiles={totalFiles}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default UploadSection;
