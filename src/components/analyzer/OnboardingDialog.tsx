import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Filter,
  BarChart3,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const OnboardingDialog = ({
  open,
  onOpenChange,
  onComplete,
}: OnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Prepzy PYQ!",
      description: "Let's get you started with analyzing previous year questions",
      icon: FileText,
      content: (
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Prepzy PYQ helps you analyze previous year question papers using AI.
              Upload your PDFs, extract questions, and get insights to ace your exams.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="glass-card p-4 rounded-lg text-center">
              <Upload className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Upload PDFs</p>
            </div>
            <div className="glass-card p-4 rounded-lg text-center">
              <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Get Insights</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "upload",
      title: "Upload Your Papers",
      description: "Learn how to upload and process your question papers",
      icon: Upload,
      content: (
        <div className="space-y-4 py-4">
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Drag & Drop Files</h4>
                <p className="text-sm text-muted-foreground">
                  Simply drag and drop your PDF files into the upload area, or click to browse.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Multiple Files Supported</h4>
                <p className="text-sm text-muted-foreground">
                  You can upload multiple PDFs at once. The system will process them sequentially.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Automatic Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Once uploaded, the AI will automatically extract and analyze all questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "results",
      title: "View Your Results",
      description: "Understand how to navigate and use your analysis results",
      icon: BarChart3,
      content: (
        <div className="space-y-4 py-4">
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Question List</h4>
                <p className="text-sm text-muted-foreground">
                  View all extracted questions organized by year, topic, and subject.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Topic Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  See common topics and their frequency to identify important areas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Video Resources</h4>
                <p className="text-sm text-muted-foreground">
                  Access relevant educational videos for each question directly from the results.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Save & Load</h4>
                <p className="text-sm text-muted-foreground">
                  Save your analysis results and load them later from the sidebar.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "filters",
      title: "Use Filters",
      description: "Learn how to filter and search through your questions",
      icon: Filter,
      content: (
        <div className="space-y-4 py-4">
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-4">
              <Filter className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Filter by Year</h4>
                <p className="text-sm text-muted-foreground">
                  Select specific years to focus on questions from those periods.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Filter className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Filter by Topic</h4>
                <p className="text-sm text-muted-foreground">
                  Narrow down questions by specific topics or subjects.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Filter className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Keyword Search</h4>
                <p className="text-sm text-muted-foreground">
                  Search for specific keywords within questions to find exactly what you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Configure Settings",
      description: "Set up your API keys and manage your account",
      icon: Settings,
      content: (
        <div className="space-y-4 py-4">
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-4">
              <Settings className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">API Keys</h4>
                <p className="text-sm text-muted-foreground">
                  Add your DeepSeek and YouTube API keys in Settings to enable full functionality.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Settings className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Account Management</h4>
                <p className="text-sm text-muted-foreground">
                  Create an account to save your analysis sessions and access them later.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Settings className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Session Management</h4>
                <p className="text-sm text-muted-foreground">
                  Organize your analysis results into sessions for better management.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    localStorage.setItem("onboardingCompleted", "true");
    if (onComplete) {
      onComplete();
    }
    onOpenChange(false);
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [open]);

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>{currentStepData.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  {currentStepData.description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Bar */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-8 bg-primary"
                    : completedSteps.has(index)
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[200px]">{currentStepData.content}</div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Complete
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;

