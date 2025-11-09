import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Zap,
  Brain,
  Video,
  Settings,
  Linkedin,
  Lock,
  Upload,
  Search,
  Filter,
  Download,
  Code,
  Database,
  Shield,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Key,
  User,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Documentation() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border/40 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <img 
              src="/prepzy_logo.svg" 
              alt="Prepzy PYQ Logo" 
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/logo.png') {
                  target.src = '/logo.png';
                }
              }}
            />
            <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
              Prepzy PYQ
            </h1>
          </div>
          <nav className="flex gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
            <Link to="/">
              <Button size="sm" variant="ghost" className="text-xs sm:text-sm">
                <ArrowLeft className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                Back
              </Button>
            </Link>
            <Link to="/analyzer">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 md:px-4 h-8 sm:h-9">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="ml-1 sm:ml-1.5 md:ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-b border-border/40">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Documentation
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete guide to using Prepzy PYQ for analyzing previous year questions
              </p>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a href="#getting-started" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    1. Getting Started
                  </a>
                  <a href="#uploading-files" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    2. Uploading Files
                  </a>
                  <a href="#api-keys" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    3. API Keys Setup
                  </a>
                  <a href="#session-management" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    4. Session Management
                  </a>
                  <a href="#analyzing-results" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    5. Analyzing Results
                  </a>
                  <a href="#features" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    6. Features & Capabilities
                  </a>
                  <a href="#chatbot" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    7. AI Chatbot Assistant
                  </a>
                  <a href="#faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    8. Frequently Asked Questions
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  1. Getting Started
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Prepzy PYQ is an AI-powered platform designed to help students and educators analyze previous year question papers. 
                  Get started in just a few simple steps.
                </p>
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                  <CardDescription>Follow these steps to begin analyzing your PYQ papers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Navigate to Analyzer</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the "Get Started" button on the homepage or navigate to the Analyzer page. New users will see a helpful onboarding guide.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Set Up API Keys</h4>
                      <p className="text-sm text-muted-foreground">
                        If you haven't configured API keys yet, you'll be prompted to set up your AI API key (DeepSeek or OpenRouter). This is required for AI analysis. Basic text extraction works without API keys, but AI features require them.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Create a Session (Optional)</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a local session to save and manage your analysis results. Sessions are stored locally in your browser. This step is optional but recommended for better organization.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Upload Your Papers</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload PDF files or images of your question papers. You can upload multiple files at once. The app will process them automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Uploading Files */}
        <section id="uploading-files" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  2. Uploading Files
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Learn how to upload and process your question papers effectively.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Supported Formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        PDF files (.pdf)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Image files (.jpg, .png)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Scanned documents (via OCR)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Multiple files at once
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Upload Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Drag and drop files
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Click to browse files
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Batch upload support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Real-time progress tracking
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Processing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">File Quality Matters</p>
                      <p className="text-sm text-muted-foreground">
                        Higher quality scans result in better OCR accuracy. Ensure your PDFs or images are clear and well-lit.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Processing Time</p>
                      <p className="text-sm text-muted-foreground">
                        Analysis typically takes 10-20 seconds per document. Larger files may take longer.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Automatic Cleanup</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded files are automatically deleted after processing (within 5 minutes) for privacy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section id="api-keys" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <Key className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  3. API Keys Setup
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Configure API keys to unlock advanced features like AI analysis and video resources.
                </p>
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Required API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      AI API Key (DeepSeek or OpenRouter)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Required for AI-powered question analysis, topic classification, and keyword extraction. You can use either DeepSeek or OpenRouter API key.
                    </p>
                    <div className="space-y-2 mb-2">
                      <div className="p-3 bg-background rounded border border-primary/20">
                        <p className="text-xs font-semibold mb-1">Option A: DeepSeek API Key</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Get your API key from: <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.deepseek.com</a>
                        </p>
                      </div>
                      <div className="p-3 bg-background rounded border border-primary/20">
                        <p className="text-xs font-semibold mb-1">Option B: OpenRouter API Key</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Get your API key from: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai/keys</a>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          OpenRouter provides access to DeepSeek models. Uses: <code className="text-xs bg-muted px-1 rounded">deepseek/deepseek-chat-v3-0324:free</code>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> You only need one AI API key (either DeepSeek or OpenRouter), not both.
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      YouTube API Key (Optional)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Optional. Enables video resource recommendations for each question.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get your API key from: <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>How to Add API Keys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <p className="text-sm">Navigate to Settings (gear icon in the sidebar)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <p className="text-sm">Click on the "API Keys" section in the sidebar</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <p className="text-sm">Select your AI provider (DeepSeek or OpenRouter)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <p className="text-sm">Enter your AI API key (either DeepSeek or OpenRouter) and optional YouTube API key</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      5
                    </div>
                    <p className="text-sm">Click "Save" to store your keys securely</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Session Management */}
        <section id="session-management" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  4. Session Management
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Understand how local session management works in Prepzy PYQ.
                </p>
              </div>

              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Local Session Only
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">No Server-Side Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Prepzy PYQ uses local session management only. Your account credentials are stored securely in your browser's local storage. 
                      We don't use any server-side authentication or third-party login services.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Privacy First</h4>
                    <p className="text-sm text-muted-foreground">
                      All your data, including login credentials and analysis results, remain on your device. 
                      We never send your login information to any server or third-party service.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Session-Based</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a local session to save and manage your analysis results. Your sessions are stored locally 
                      and can only be accessed from the same browser where you created them.
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> If you clear your browser data or use a different browser, you'll need to create a new session. 
                      Sessions are device and browser-specific for maximum privacy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Creating a Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Click "Create Account" in the sidebar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Enter your email, password, and username</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Optionally add a session name</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Your session is created and stored locally</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Managing Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>View all your analysis sessions in Settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Delete individual sessions or clear all data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Update your profile information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Change your password anytime</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Analyzing Results */}
        <section id="analyzing-results" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  5. Analyzing Results
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Learn how to effectively use the analysis results and features.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Filtering Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use the filter options to find specific questions:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary flex-shrink-0" />
                        Filter by year
                      </li>
                      <li className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary flex-shrink-0" />
                        Filter by topic
                      </li>
                      <li className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary flex-shrink-0" />
                        Filter by subject
                      </li>
                      <li className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary flex-shrink-0" />
                        Search by keywords
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Exporting Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export your analysis results for offline use:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Download as JSON
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Export filtered results
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Save analysis reports
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Understanding Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      AI Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Each question is analyzed to identify topics, subjects, and keywords. This helps you understand 
                      what concepts are being tested and track patterns across different papers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      Video Resources
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      When YouTube API key is configured, relevant educational videos are automatically suggested 
                      for each question to help deepen your understanding.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Session Storage
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      All your analysis results are saved in your session and can be accessed anytime. 
                      You can manage multiple analysis sessions for different purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  6. Features & Capabilities
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Explore all the powerful features available in Prepzy PYQ.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Smart Extraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Advanced OCR technology extracts text from scanned documents with high accuracy. 
                      Supports multiple file formats and batch processing.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Intelligent question classification by topics and subjects. Automatic keyword extraction 
                      and pattern recognition across multiple papers.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Video Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Curated educational video recommendations for each question. Direct integration with 
                      YouTube API for relevant learning resources.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Privacy First
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All processing happens locally. Files are automatically deleted after analysis. 
                      No server-side storage of your data.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* AI Chatbot */}
        <section id="chatbot" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  7. AI Chatbot Assistant
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Get instant help and answers from our AI-powered chatbot on the landing page.
                </p>
              </div>

              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Interactive Help Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What is the Chatbot?</h4>
                    <p className="text-sm text-muted-foreground">
                      The Prepzy AI Assistant is an interactive chatbot available on the landing page that provides instant help and answers questions about Prepzy PYQ. It's designed to help users understand features, get setup guidance, and find answers to common questions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">How to Use</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Look for the chat icon in the bottom-right corner of the landing page</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Click the icon to open the chat window</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Type your question or use the quick suggestion buttons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>The AI assistant will provide detailed, helpful responses</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What Can It Help With?</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Understanding Prepzy PYQ features and capabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Getting started guide and setup instructions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>API key setup and configuration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Privacy and security questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Roadmap and future features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>General troubleshooting and support</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> The chatbot provides context-aware suggestions after each response to help guide your conversation. Hover over the testimonial cards on the landing page to pause the scrolling animation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  8. Frequently Asked Questions
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Common questions and answers about Prepzy PYQ.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-3">
                <AccordionItem value="item-1" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                    How does the session login work?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    Prepzy PYQ uses local session management. When you create an account, your credentials are stored securely in your browser's local storage. There's no server-side authentication or third-party login services. Your data remains completely private and local to your device.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                    Will I lose my data if I clear browser data?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    Yes, since all data is stored locally in your browser, clearing browser data will remove your sessions and analysis results. We recommend exporting important results before clearing data. Sessions are device and browser-specific for maximum privacy.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                    What file formats are supported?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    We support PDF files and image formats (JPG, PNG). The system can extract text from both digital PDFs and scanned documents using OCR technology. You can upload multiple files at once for batch processing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                    Do I need API keys to use the service?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    API keys are optional but recommended for full functionality. You can add either a DeepSeek or OpenRouter API key for AI analysis, and a YouTube API key for video resources. Basic text extraction works without API keys, but advanced features require them.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                    How accurate is the question extraction?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    Our AI-powered extraction achieves 95%+ accuracy for digital PDFs and 85-90% for scanned documents. The accuracy depends on document quality, but our OCR technology handles most scanned papers effectively.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                    Is my data secure and private?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                    Absolutely. All processing happens locally in your browser. Your files are automatically deleted after processing (within 5 minutes). We don't store your data on any server, and there's no server-side authentication. Everything remains on your device.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <Card className="glass-card border-primary/20 p-6 sm:p-8 md:p-12 text-center">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Start analyzing your previous year questions today
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/analyzer">
                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                      Start Analyzing Now
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glass-card">
                      <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 sm:py-12 mt-12 sm:mt-20">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src="/prepzy_logo.svg" 
                  alt="Prepzy PYQ Logo" 
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 object-contain"
                  style={{ filter: 'brightness(1.1)' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/logo.png') {
                      target.src = '/logo.png';
                    }
                  }}
                />
                <div>
                  <p className="font-semibold text-base sm:text-lg">Prepzy PYQ</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                AI-powered platform for analyzing previous year questions. Privacy-first, fast, and efficient.
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">Features</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    Smart Extraction
                  </Link>
                </li>
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    AI Analysis
                  </Link>
                </li>
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    Video Resources
                  </Link>
                </li>
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    Smart Filtering
                  </Link>
                </li>
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    Analytics Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    Session Management
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/analyzer" className="text-muted-foreground hover:text-primary transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link to="/documentation" className="text-muted-foreground hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com/SQADIRKVM/prepzy-pyq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">Resources</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a 
                    href="https://platform.deepseek.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    DeepSeek API
                  </a>
                </li>
                <li>
                  <a 
                    href="https://openrouter.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    OpenRouter API
                  </a>
                </li>
                <li>
                  <a 
                    href="https://console.cloud.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    YouTube API
                  </a>
                </li>
                <li>
                  <Link to="/documentation" className="text-muted-foreground hover:text-primary transition-colors">
                    API Setup Guide
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Credits Section */}
          <div className="border-t border-border/40 pt-6 sm:pt-8">
            <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Developed by{" "}
                <Link to="/team" className="text-primary hover:underline">
                  KTU students
                </Link>
                {" • "}
                Designed by{" "}
                <a 
                  href="https://www.edot.studio/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  EdotStudio
                </a>
              </p>
            </div>

            {/* Copyright Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border/40">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                © {new Date().getFullYear()} Prepzy PYQ. All rights reserved.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Made with ❤️ for students and educators
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

