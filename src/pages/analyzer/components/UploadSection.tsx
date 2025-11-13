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
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onAddApiKey?: () => void;
  onApiKeyRequired?: (provider: 'gemini' | 'deepseek' | 'openrouter' | 'openai') => void;
  initialChatId?: string;
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
  onAddApiKey,
  onApiKeyRequired,
  initialChatId
}: UploadSectionProps) => {
  return (
    <div className="flex flex-col h-full w-full">
      {/* ChatGPT-Style Chat Interface */}
      {status === "idle" && (
        <div className="flex-1 flex flex-col min-h-0">
          <FileUpload 
            onUploadPdf={onUploadPdf}
            onUploadImage={onUploadImage}
            onUploadPdfOcr={onUploadPdfOcr}
            onApiKeyRequired={onApiKeyRequired}
            initialChatId={initialChatId}
          />
        </div>
      )}
      
      {/* Processing Status */}
      {status !== "idle" && (
        <div className="flex-1">
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
        </div>
      )}
    </div>
  );
};

export default UploadSection;
