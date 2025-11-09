
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";
import UploadSection from "./components/UploadSection";
import ResultsSection from "./components/ResultsSection";
import Sidebar from "@/components/analyzer/Sidebar";
import { Question, ProcessStatus, AnalysisResult, QuestionTopic } from "./types";
import { RecentResult, recentResultsService } from "@/services/recentResultsService";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, PanelLeft } from "lucide-react";
import { databaseService } from "@/services/databaseService";
import { cn } from "@/lib/utils";
import ApiKeySetupDialog from "@/components/analyzer/ApiKeySetupDialog";
import SessionCreateDialog from "@/components/analyzer/SessionCreateDialog";
import SessionLoginDialog from "@/components/analyzer/SessionLoginDialog";
import SessionInfoDialog from "@/components/analyzer/SessionInfoDialog";
import SessionChoiceDialog from "@/components/analyzer/SessionChoiceDialog";
import OnboardingDialog from "@/components/analyzer/OnboardingDialog";
import { sessionService } from "@/services/sessionService";

const AnalyzerPage = () => {
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<QuestionTopic[]>([]);
  // Store original unfiltered data to prevent saving filtered results
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const [originalTopics, setOriginalTopics] = useState<QuestionTopic[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<number | undefined>(undefined);
  const [totalFiles, setTotalFiles] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("upload");
  const [filters, setFilters] = useState({
    year: "all_years",
    topic: "all_topics",
    keyword: "",
  });
  const [hasSavedToRecent, setHasSavedToRecent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Load from localStorage, default to true on desktop, false on mobile
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) return saved === 'true';
      // Default: open on desktop, closed on mobile
      return window.innerWidth >= 768;
    }
    return true;
  });
  
  // Check if API key setup is needed
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  
  // Session management
  const [showSessionCreate, setShowSessionCreate] = useState(false);
  const [showSessionLogin, setShowSessionLogin] = useState(false);
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [showSessionChoice, setShowSessionChoice] = useState(false);
  const [session, setSession] = useState(sessionService.getCurrentSession());
  
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Processing control
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseResumePromise, setPauseResumePromise] = useState<{
    resolve: () => void;
    reject: () => void;
  } | null>(null);

  // Check for onboarding, API key setup, and session on mount
  // Show dialogs sequentially, one at a time
  // Priority order: Onboarding > API Key > Session Info
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    const deepseekApiKey = localStorage.getItem('deepseekApiKey');
    const openRouterApiKey = localStorage.getItem('openRouterApiKey');
    const hasApiKey = !!deepseekApiKey || !!openRouterApiKey;
    const setupCompleted = localStorage.getItem('apiKeySetupCompleted');
    const setupDismissed = localStorage.getItem('apiKeySetupDismissed');
    const currentSession = sessionService.getCurrentSession();
    const hasSeenSessionInfo = sessionService.hasSeenSessionInfo();
    
    // Priority order: Onboarding > API Key > Session Info
    // Only show one dialog at a time
    
    if (!onboardingCompleted) {
      // Show onboarding first for new users
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    } else if (!hasApiKey && !setupCompleted && !setupDismissed) {
      // Show API key setup second
      setTimeout(() => {
        setShowApiKeySetup(true);
      }, 500);
    } else if (!currentSession && !hasSeenSessionInfo) {
      // Show session info last
      setTimeout(() => {
        setShowSessionInfo(true);
      }, 500);
    }
    
    // Always set session state
    setSession(currentSession);
  }, []);

  useEffect(() => {
    const loadSavedQuestions = async () => {
      try {
        const savedResult = await apiService.getQuestions();
        if (savedResult.questions.length > 0) {
          setOriginalQuestions(savedResult.questions);
          setOriginalTopics(savedResult.topics);
          setQuestions(savedResult.questions);
          setTopics(savedResult.topics);
          if (status === "idle") {
            setStatus("completed");
            
            // Check if this result is already in recent results
            const recentResults = recentResultsService.getRecentResults();
            const hasRecentResult = recentResults.some(r => 
              r.data.questions.length === savedResult.questions.length &&
              r.data.questions[0]?.id === savedResult.questions[0]?.id
            );
            
            // If not in recent results, save it (filename will be auto-generated from question details)
            if (!hasRecentResult) {
              recentResultsService.saveResult('', savedResult);
              setHasSavedToRecent(true);
            } else {
              setHasSavedToRecent(true);
            }
            
            toast.info(`Loaded ${savedResult.questions.length} questions from your previous session`);
          }
        }
      } catch (error) {
        console.error("Error loading saved questions:", error);
      }
    };

    loadSavedQuestions();
  }, [status]);

  const resetForNewUpload = () => {
    // Cancel any ongoing processing
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsPaused(false);
    setPauseResumePromise(null);
    setStatus("idle");
    setProgress(0);
    setCurrentStep("");
    setErrorMessage("");
    setQuestions([]);
    setTopics([]);
    setOriginalQuestions([]);
    setOriginalTopics([]);
    setHasSavedToRecent(false);
    setCurrentFile(undefined);
    setTotalFiles(undefined);
    setActiveTab("upload");
    setFilters({
      year: "all_years",
      topic: "all_topics",
      keyword: "",
    });
    
    databaseService.clearQuestions();
    
    toast.info("Ready for new document upload");
  };

  const handlePause = () => {
    setIsPaused(true);
    setStatus("paused");
    toast.info("Processing paused");
  };

  const handleResume = () => {
    setIsPaused(false);
    if (status === "paused") {
      setStatus("processing");
    }
    if (pauseResumePromise) {
      pauseResumePromise.resolve();
      setPauseResumePromise(null);
    }
    toast.info("Processing resumed");
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsPaused(false);
    setPauseResumePromise(null);
    setStatus("idle");
    setProgress(0);
    setCurrentStep("");
    setCurrentFile(undefined);
    setTotalFiles(undefined);
    toast.info("Processing cancelled");
  };

  // Helper function to wait if paused
  const waitIfPaused = async () => {
    if (isPaused) {
      return new Promise<void>((resolve, reject) => {
        setPauseResumePromise({ resolve, reject });
      });
    }
  };

  const handlePdfUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Check if API key exists
    const deepseekApiKey = localStorage.getItem('deepseekApiKey');
    const openRouterApiKey = localStorage.getItem('openRouterApiKey');
    if (!deepseekApiKey && !openRouterApiKey) {
      setShowApiKeySetup(true);
      toast.error("Please configure your API key (DeepSeek or OpenRouter) first");
      return;
    }
    
    try {
      setStatus("uploading");
      setProgress(0);
      setCurrentStep("");
      
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      setTimeout(() => {
        clearInterval(uploadInterval);
        setStatus("processing");
        setProgress(0);
        
        if (files.length === 1) {
          processPdfFile(files[0]);
        } else {
          processMultiplePdfFiles(files);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error uploading files:", error);
      setStatus("error");
      setErrorMessage("Failed to upload the files. Please try again.");
      toast.error("Failed to upload the files");
    }
  };

  const handlePdfOcrUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Check if API key exists
    const deepseekApiKey = localStorage.getItem('deepseekApiKey');
    const openRouterApiKey = localStorage.getItem('openRouterApiKey');
    if (!deepseekApiKey && !openRouterApiKey) {
      setShowApiKeySetup(true);
      toast.error("Please configure your API key (DeepSeek or OpenRouter) first");
      return;
    }
    
    const pdfFile = files[0];
    
    try {
      setStatus("uploading");
      setProgress(0);
      setCurrentStep("");
      
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      setTimeout(() => {
        clearInterval(uploadInterval);
        setStatus("processing");
        setProgress(0);
        processPdfWithOcr(pdfFile);
      }, 1000);
      
    } catch (error) {
      console.error("Error uploading file for OCR:", error);
      setStatus("error");
      setErrorMessage("Failed to upload the file. Please try again.");
      toast.error("Failed to upload the file");
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Check if API key exists
    const deepseekApiKey = localStorage.getItem('deepseekApiKey');
    const openRouterApiKey = localStorage.getItem('openRouterApiKey');
    if (!deepseekApiKey && !openRouterApiKey) {
      setShowApiKeySetup(true);
      toast.error("Please configure your API key (DeepSeek or OpenRouter) first");
      return;
    }
    
    const imageFile = files[0];
    
    try {
      setStatus("uploading");
      setProgress(0);
      setCurrentStep("");
      
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      setTimeout(() => {
        clearInterval(uploadInterval);
        setStatus("processing");
        setProgress(0);
        processImageFile(imageFile);
      }, 1000);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      setStatus("error");
      setErrorMessage("Failed to upload the image. Please try again.");
      toast.error("Failed to upload the image");
    }
  };

  const processPdfFile = async (file: File) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const result = await apiService.processPdfFile(
        file,
        async (progress, step) => {
          if (controller.signal.aborted) {
            throw new Error("Processing cancelled");
          }
          await waitIfPaused();
          if (controller.signal.aborted) {
            throw new Error("Processing cancelled");
          }
          setProgress(progress);
          setCurrentStep(step);
        },
        controller.signal
      );
      
      if (controller.signal.aborted) {
        return;
      }
      
      setProgress(100);
      setStatus("completed");
      setOriginalQuestions(result.questions);
      setOriginalTopics(result.topics);
      setQuestions(result.questions);
      setTopics(result.topics);
      setHasSavedToRecent(false);
      setActiveTab("results");
      setAbortController(null);
      
      toast.success(`Successfully extracted ${result.questions.length} questions!`);
      
      // Show session choice dialog if no session exists
      const currentSession = sessionService.getCurrentSession();
      if (!currentSession) {
        setTimeout(() => {
          setShowSessionChoice(true);
        }, 2000);
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === "Processing cancelled") {
        // Cancelled by user
        return;
      }
      console.error("Error processing file:", error);
      setStatus("error");
      setErrorMessage("Failed to process the file. Please try a different PDF.");
      setAbortController(null);
      toast.error("Failed to process the file");
    }
  };

  const processMultiplePdfFiles = async (files: File[]) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setTotalFiles(files.length);
      const result = await apiService.processMultiplePdfFiles(
        files,
        async (progress, step, currentFileNum, totalFilesNum) => {
          if (controller.signal.aborted) {
            throw new Error("Processing cancelled");
          }
          await waitIfPaused();
          if (controller.signal.aborted) {
            throw new Error("Processing cancelled");
          }
          setProgress(progress);
          setCurrentFile(currentFileNum);
          setTotalFiles(totalFilesNum);
          if (currentFileNum && totalFilesNum) {
            setCurrentStep(`${step} (File ${currentFileNum}/${totalFilesNum})`);
          } else {
            setCurrentStep(step);
          }
        },
        controller.signal
      );
      
      if (controller.signal.aborted) {
        return;
      }
      
      setProgress(100);
      setStatus("completed");
      setOriginalQuestions(result.questions);
      setOriginalTopics(result.topics);
      setQuestions(result.questions);
      setTopics(result.topics);
      setHasSavedToRecent(false);
      setCurrentFile(undefined);
      setTotalFiles(undefined);
      setActiveTab("results");
      setAbortController(null);
      
      toast.success(`Successfully processed ${files.length} file(s) and extracted ${result.questions.length} questions!`);
      
      // Show session choice dialog if no session exists
      const currentSession = sessionService.getCurrentSession();
      if (!currentSession) {
        setTimeout(() => {
          setShowSessionChoice(true);
        }, 2000);
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === "Processing cancelled") {
        // Cancelled by user
        return;
      }
      console.error("Error processing files:", error);
      setStatus("error");
      setCurrentFile(undefined);
      setTotalFiles(undefined);
      setErrorMessage(`Failed to process some files. ${error instanceof Error ? error.message : 'Please try again.'}`);
      setAbortController(null);
      toast.error("Failed to process some files");
    }
  };

  const processPdfWithOcr = async (file: File) => {
    try {
      const result = await apiService.processPdfWithOCR(
        file,
        (progress, step) => {
          setProgress(progress);
          setCurrentStep(step);
        }
      );
      
      setProgress(100);
      setStatus("completed");
      setOriginalQuestions(result.questions);
      setOriginalTopics(result.topics);
      setQuestions(result.questions);
      setTopics(result.topics);
      setHasSavedToRecent(false);
      setActiveTab("results");
      
      toast.success(`Successfully extracted ${result.questions.length} questions!`);
      
      // Show session choice dialog if no session exists
      const currentSession = sessionService.getCurrentSession();
      if (!currentSession) {
        setTimeout(() => {
          setShowSessionChoice(true);
        }, 2000);
      }
      
    } catch (error) {
      console.error("Error processing file with OCR:", error);
      setStatus("error");
      setErrorMessage("Failed to process the file with OCR. Please try a different approach.");
      toast.error("Failed to process the file with OCR");
    }
  };

  const processImageFile = async (file: File) => {
    try {
      const result = await apiService.processImageFile(
        file,
        (progress, step) => {
          setProgress(progress);
          setCurrentStep(step);
        }
      );
      
      setProgress(100);
      setStatus("completed");
      setOriginalQuestions(result.questions);
      setOriginalTopics(result.topics);
      setQuestions(result.questions);
      setTopics(result.topics);
      setHasSavedToRecent(false);
      
      const message = result.questions.length > 0
        ? `Successfully extracted ${result.questions.length} questions!`
        : "Processing complete, but no questions were found.";
        
      toast.success(message);
      
      // Show session choice dialog if no session exists and questions were found
      if (result.questions.length > 0 && !sessionService.getCurrentSession()) {
        setTimeout(() => {
          setShowSessionChoice(true);
        }, 2000);
      }
      
    } catch (error) {
      console.error("Error processing image:", error);
      setStatus("error");
      setErrorMessage("Failed to process the image. Please try a different image with clearer text.");
      toast.error("Failed to process the image");
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const applyFilters = () => {
      if (status !== "completed" || originalQuestions.length === 0) return;
      
      // If no filters are active, show original data
      if (filters.year === "all_years" && filters.topic === "all_topics" && !filters.keyword) {
        setQuestions(originalQuestions);
        setTopics(originalTopics);
        return;
      }
      
      // Apply filters to original data
      let filteredQuestions = [...originalQuestions];
      let filteredTopics = [...originalTopics];
      
      // Filter by year
      if (filters.year !== 'all_years') {
        filteredQuestions = filteredQuestions.filter(q => q.year === filters.year);
      }
      
      // Filter by topic
      if (filters.topic !== 'all_topics') {
        filteredQuestions = filteredQuestions.filter(q =>
          (q.topics && q.topics.some(t => t === filters.topic)) ||
          (q.keywords && q.keywords.some(k => k === filters.topic))
        );
      }
      
      // Filter by keyword
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredQuestions = filteredQuestions.filter(q =>
          q.text.toLowerCase().includes(keyword) ||
          (q.keywords && q.keywords.some(k => k.toLowerCase().includes(keyword))) ||
          (q.topics && q.topics.some(t => t.toLowerCase().includes(keyword)))
        );
      }
      
      // Recalculate topics based on filtered questions
      const filteredTopicNames = new Set<string>();
      filteredQuestions.forEach(q => {
        if (q.topics) {
          q.topics.forEach(t => filteredTopicNames.add(t));
        }
        if (q.keywords) {
          q.keywords.forEach(k => filteredTopicNames.add(k));
        }
      });
      
      // Filter topics to only include those present in filtered questions
      filteredTopics = filteredTopics.filter(t => filteredTopicNames.has(t.name));
      
      setQuestions(filteredQuestions);
      setTopics(filteredTopics);
    };

    applyFilters();
  }, [filters, status, originalQuestions, originalTopics]);

  // Ensure results are saved to recent results only when processing completes (not when filtering)
  useEffect(() => {
    if (status === "completed" && originalQuestions.length > 0 && !hasSavedToRecent) {
      // Check if this result is already in recent results
      const recentResults = recentResultsService.getRecentResults();
      let resultId: string | null = null;
      const hasRecentResult = recentResults.some(r => {
        // Check if questions match by comparing first question ID and count
        if (r.data.questions.length !== originalQuestions.length) return false;
        if (r.data.questions.length === 0) return false;
        const matches = r.data.questions[0]?.id === originalQuestions[0]?.id;
        if (matches) {
          resultId = r.id;
        }
        return matches;
      });
      
      // If not in recent results, save it (filename will be auto-generated from question details)
      if (!hasRecentResult) {
        // Save to recent results first
        recentResultsService.saveResult('', { questions: originalQuestions, topics: originalTopics });
        
        // Get the newly saved result ID
        const updatedResults = recentResultsService.getRecentResults();
        const newResult = updatedResults.find(r => {
          if (r.data.questions.length !== originalQuestions.length) return false;
          if (r.data.questions.length === 0) return false;
          return r.data.questions[0]?.id === originalQuestions[0]?.id;
        });
        
        if (newResult) {
          resultId = newResult.id;
        }
      }
      
      // Create analysis session if user is logged in
      if (resultId && session) {
        const sessionName = recentResultsService.getResultById(resultId)?.filename || 
          `Analysis - ${new Date().toLocaleDateString()}`;
        const year = originalQuestions[0]?.year;
        const subject = originalQuestions[0]?.subject;
        
        sessionService.createAnalysisSession(
          resultId,
          sessionName,
          originalQuestions.length,
          year,
          subject
        );
      }
      
      setHasSavedToRecent(true);
    }
  }, [status, originalQuestions, originalTopics, hasSavedToRecent, session]);

  const getUniqueYears = () => {
    const years = new Set<string>();
    originalQuestions.forEach(q => years.add(q.year));
    return Array.from(years).sort().reverse();
  };

  const getUniqueTopics = () => {
    const topicNames = new Set<string>();
    originalTopics.forEach(t => topicNames.add(t.name));
    return Array.from(topicNames).sort();
  };

  // Calculate stats
  const stats = {
    totalQuestions: questions.length,
    totalSubjects: new Set(questions.map(q => q.subject)).size,
    totalTopics: topics.length
  };

  const handleNewUpload = () => {
    setActiveTab("upload");
    resetForNewUpload();
  };

  const handleLoadResult = (result: RecentResult) => {
    setOriginalQuestions(result.data.questions);
    setOriginalTopics(result.data.topics);
    setQuestions(result.data.questions);
    setTopics(result.data.topics);
    setHasSavedToRecent(true); // Don't save again since it's already in recent results
    setStatus("completed");
    setActiveTab("results");
    setFilters({
      year: "all_years",
      topic: "all_topics",
      keyword: "",
    });
    // Also save to current session
    databaseService.saveQuestions(result.data, result.filename);
  };

  const handleSessionSelected = (resultId: string) => {
    const result = recentResultsService.getResultById(resultId);
    if (result) {
      handleLoadResult(result);
    } else {
      toast.error("Session result not found");
    }
  };

  const handleSessionCreated = () => {
    const newSession = sessionService.getCurrentSession();
    setSession(newSession);
    
    // If there are completed results, link them to the new session
    if (status === "completed" && originalQuestions.length > 0) {
      const recentResults = recentResultsService.getRecentResults();
      const currentResult = recentResults.find(r => {
        if (r.data.questions.length !== originalQuestions.length) return false;
        if (r.data.questions.length === 0) return false;
        return r.data.questions[0]?.id === originalQuestions[0]?.id;
      });
      
      if (currentResult && newSession) {
        const sessionName = currentResult.filename || 
          `Analysis - ${new Date().toLocaleDateString()}`;
        const year = originalQuestions[0]?.year;
        const subject = originalQuestions[0]?.subject;
        
        sessionService.createAnalysisSession(
          currentResult.id,
          sessionName,
          originalQuestions.length,
          year,
          subject
        );
      }
    }
  };

  const handleLogout = () => {
    setSession(null);
    toast.info("You have been logged out");
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarOpen', String(newValue));
      return newValue;
    });
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // On mobile, close sidebar when resizing to mobile size
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Onboarding Dialog - Shows first for new users */}
      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open);
          // After onboarding closes, check for API key setup
          if (!open) {
            const deepseekApiKey = localStorage.getItem('deepseekApiKey');
            const openRouterApiKey = localStorage.getItem('openRouterApiKey');
            const hasApiKey = !!deepseekApiKey || !!openRouterApiKey;
            const setupCompleted = localStorage.getItem('apiKeySetupCompleted');
            const setupDismissed = localStorage.getItem('apiKeySetupDismissed');
            if (!hasApiKey && !setupCompleted && !setupDismissed) {
              setTimeout(() => {
                setShowApiKeySetup(true);
              }, 500);
            } else {
              // If no API key needed, check for session info
              const currentSession = sessionService.getCurrentSession();
              const hasSeenSessionInfo = sessionService.hasSeenSessionInfo();
              if (!currentSession && !hasSeenSessionInfo) {
                setTimeout(() => {
                  setShowSessionInfo(true);
                }, 500);
              }
            }
          }
        }}
        onComplete={() => {
          toast.success("Welcome to Prepzy PYQ! You're all set.");
        }}
      />

      {/* API Key Setup Dialog - Shows second */}
      <ApiKeySetupDialog
        open={showApiKeySetup}
        onOpenChange={(open) => {
          setShowApiKeySetup(open);
          // After API key dialog closes, check for session info
          if (!open) {
            const currentSession = sessionService.getCurrentSession();
            const hasSeenSessionInfo = sessionService.hasSeenSessionInfo();
            if (!currentSession && !hasSeenSessionInfo) {
              setTimeout(() => {
                setShowSessionInfo(true);
              }, 500);
            }
          }
        }}
        onSave={() => {
          toast.success("API keys saved! You can now process documents.");
        }}
      />

      {/* Session Info Dialog - Shows last */}
      <SessionInfoDialog
        open={showSessionInfo}
        onOpenChange={setShowSessionInfo}
      />

      {/* Session Choice Dialog */}
      <SessionChoiceDialog
        open={showSessionChoice}
        onOpenChange={setShowSessionChoice}
        onSessionCreated={handleSessionCreated}
        onLoginSuccess={() => {
          setSession(sessionService.getCurrentSession());
        }}
        onSessionSelected={handleSessionSelected}
      />

      {/* Session Login Dialog */}
      <SessionLoginDialog
        open={showSessionLogin}
        onOpenChange={setShowSessionLogin}
        onLoginSuccess={() => {
          setSession(sessionService.getCurrentSession());
        }}
        onSessionSelected={handleSessionSelected}
      />

      {/* Session Create Dialog (for direct access from sidebar) */}
      <SessionCreateDialog
        open={showSessionCreate}
        onOpenChange={setShowSessionCreate}
        onSessionCreated={handleSessionCreated}
      />

      {/* Sidebar */}
      <Sidebar 
        stats={stats} 
        onNewUpload={handleNewUpload}
        onLoadResult={handleLoadResult}
        onLogout={handleLogout}
        onLogin={() => setShowSessionLogin(true)}
        onCreateAccount={() => setShowSessionCreate(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-0"
      )}>
        {/* Top Bar */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/50">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={toggleSidebar}
            >
              <PanelLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            {questions.length > 0 && (
              <>
                <div className="px-2 md:px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium">
                  {questions.length} Questions
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  {new Set(questions.map(q => q.subject)).size} Subject{new Set(questions.map(q => q.subject)).size !== 1 ? 's' : ''}
                </div>
                {topics.length > 0 && (
                  <>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                      {topics.length} Topic{topics.length !== 1 ? 's' : ''}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
              {status === "completed" && (
                  <Button 
                    onClick={resetForNewUpload} 
                    variant="outline" 
                size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                New Upload
                  </Button>
            )}
          </div>
                </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 md:mb-6 bg-card border border-border w-full sm:w-auto">
                <TabsTrigger 
                  value="upload" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  Upload & Process
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  disabled={questions.length === 0}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-50 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  View Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
              <UploadSection 
                status={status}
                progress={progress}
                errorMessage={errorMessage}
                currentStep={currentStep}
                questionCount={status === "completed" ? questions.length : undefined}
                  currentFile={currentFile}
                  totalFiles={totalFiles}
                onUploadPdf={handlePdfUpload}
                onUploadImage={handleImageUpload}
                onUploadPdfOcr={handlePdfOcrUpload}
                onAddApiKey={() => setShowApiKeySetup(true)}
                  onPause={handlePause}
                  onResume={handleResume}
                  onCancel={handleCancel}
              />
        </TabsContent>
        
              <TabsContent value="results" className="mt-0">
          <ResultsSection 
            questions={questions}
            topics={topics}
            years={getUniqueYears()}
                  topicNames={getUniqueTopics()}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </TabsContent>
      </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzerPage;
