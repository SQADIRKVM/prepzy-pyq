
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, FileText, Loader2, Pause, Play, X, Sparkles, Zap } from "lucide-react";
import { ProcessStatus } from "@/pages/analyzer/types";

interface ProcessingStatusProps {
  status: ProcessStatus;
  progress: number;
  errorMessage: string;
  currentStep?: string;
  questionCount?: number;
  currentFile?: number;
  totalFiles?: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

const ProcessingStatus = ({ 
  status, 
  progress, 
  errorMessage,
  currentStep,
  questionCount,
  currentFile,
  totalFiles,
  onPause,
  onResume,
  onCancel
}: ProcessingStatusProps) => {
  return (
    <div className="space-y-6 md:space-y-8 py-6 md:py-8">
      {/* Main Status Card */}
      <Card className="glass-card border-2 border-border/50 p-6 md:p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
        {status === "uploading" && (
            <>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 md:p-6 rounded-2xl shadow-lg shadow-primary/20">
                  <FileText className="h-10 w-10 md:h-12 md:w-12 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="h-3 w-3 bg-primary rounded-full animate-ping" />
                </div>
            </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Uploading Document
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                  Preparing your file for analysis...
                </p>
          </div>
            </>
        )}
        
        {status === "processing" && (
            <>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 md:p-6 rounded-2xl shadow-lg shadow-primary/20">
                  <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                </div>
            </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {totalFiles && totalFiles > 1 
                    ? `Processing ${totalFiles} Documents`
                    : "Analyzing Document"}
                </h3>
                {totalFiles && totalFiles > 1 && currentFile && (
                  <p className="text-sm md:text-base text-muted-foreground">
                    File {currentFile} of {totalFiles}
                  </p>
                )}
            {currentStep && (
                  <p className="text-xs md:text-sm text-muted-foreground font-medium mt-2 px-4 py-2 bg-primary/5 rounded-lg inline-block">
                    {currentStep}
                  </p>
            )}
          </div>
            </>
          )}
          
          {status === "paused" && (
            <>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 p-4 md:p-6 rounded-2xl shadow-lg shadow-amber-500/20">
                <Pause className="h-10 w-10 md:h-12 md:w-12 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-amber-500">
                  Processing Paused
                </h3>
                {currentStep && (
                  <p className="text-sm md:text-base text-muted-foreground">
                    {currentStep}
                  </p>
                )}
                <p className="text-xs md:text-sm text-muted-foreground">
                  Click Resume to continue processing
                </p>
              </div>
            </>
        )}
        
        {status === "completed" && (
            <>
              <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 p-4 md:p-6 rounded-2xl shadow-lg shadow-green-500/20">
                <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-500" />
            </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-green-500">
                  Analysis Complete!
                </h3>
            {questionCount !== undefined && questionCount > 0 && (
                  <p className="text-base md:text-lg text-green-500 font-semibold">
                    {questionCount} question{questionCount !== 1 ? 's' : ''} extracted successfully
              </p>
            )}
                <p className="text-xs md:text-sm text-muted-foreground">
                  Your document has been processed and analyzed
                </p>
          </div>
            </>
        )}
        
        {status === "error" && (
            <>
              <div className="bg-gradient-to-br from-red-500/20 to-red-500/10 p-4 md:p-6 rounded-2xl shadow-lg shadow-red-500/20">
                <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-red-500">
                  Processing Failed
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Something went wrong during processing
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
      
      {/* Progress Bar - Only show when processing, paused, or uploading */}
      {(status === "uploading" || status === "processing" || status === "paused") && (
        <Card className="glass-card border border-border/50 p-4 md:p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="font-medium text-muted-foreground">
                {getStatusLabel(status, currentStep)}
              </span>
              <span className="font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 md:h-3 bg-muted/50"
            />
          </div>
        </Card>
      )}
      
      {/* Control Buttons */}
      {(status === "processing" || status === "paused") && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center px-4">
          {status === "processing" && onPause && (
            <Button
              variant="outline"
              onClick={onPause}
              className="w-full sm:w-auto sm:min-w-[120px] border-2"
              size="lg"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {status === "paused" && onResume && (
            <Button
              onClick={onResume}
              className="w-full sm:w-auto sm:min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          {onCancel && (
            <Button
              variant="destructive"
              onClick={onCancel}
              className="w-full sm:w-auto sm:min-w-[120px]"
              size="lg"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      )}
      
      {/* Info Messages */}
      {status === "processing" && (
        <Card className="glass-card border border-primary/20 bg-primary/5 p-4 md:p-6">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs md:text-sm text-foreground font-medium mb-1">
                What's happening?
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {totalFiles && totalFiles > 1 
                  ? `We're processing ${totalFiles} file(s). This includes extracting text, enhancing with AI, analyzing questions, and finding related educational videos. This may take a few minutes depending on file size.`
                  : "We're extracting text from your document, enhancing it with AI, analyzing questions, and finding related educational videos. This may take a few minutes."}
          </p>
        </div>
          </div>
        </Card>
      )}
      
      {status === "completed" && (
        <Card className="glass-card border border-green-500/20 bg-green-500/5 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-xs md:text-sm text-foreground">
              <span className="font-semibold">All done!</span> Switch to the "View Results" tab to explore your extracted questions.
            </p>
        </div>
        </Card>
      )}
      
      {status === "error" && errorMessage && (
        <Alert variant="destructive" className="border-2 border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="font-semibold text-red-500">Error Details</AlertTitle>
          <AlertDescription className="text-sm mt-2 text-red-400/90 whitespace-pre-line">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const getStatusLabel = (status: ProcessStatus, currentStep?: string): string => {
  switch (status) {
    case "uploading":
      return "Uploading file...";
    case "processing":
      return currentStep || "Processing document...";
    case "paused":
      return currentStep || "Processing paused";
    case "completed":
      return "Processing complete";
    case "error":
      return "Processing failed";
    default:
      return "";
  }
};

export default ProcessingStatus;
