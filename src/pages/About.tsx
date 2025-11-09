import { Link } from "react-router-dom";
import { ArrowLeft, Target, Users, Code, Heart, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            About Prepzy PYQ
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Empowering students and educators with AI-powered question analysis
          </p>
        </div>

        {/* Mission */}
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-muted-foreground space-y-4">
            <p>
              Prepzy PYQ was created to help students and educators efficiently analyze and understand previous year question papers. We believe that by leveraging AI technology, we can make exam preparation more effective, organized, and accessible to everyone.
            </p>
            <p>
              Our vision is to evolve into a complete AI Study Operating System—a unified platform that seamlessly connects exam preparation, study materials, AI tutoring, revision planning, and analytics. We're building towards an ecosystem where every aspect of your learning journey is intelligently connected and personalized.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">What We Do</h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Zap className="h-5 w-5 text-primary" />
                  Smart Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground">
                <p>
                  Extract questions from PDFs and images using advanced OCR technology, then analyze them with AI to identify topics, subjects, and patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground">
                <p>
                  All processing happens locally in your browser. No data is sent to our servers. Your files are automatically deleted after processing.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Code className="h-5 w-5 text-primary" />
                  Open Source
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground">
                <p>
                  Built with transparency in mind. The code is open source, allowing the community to contribute, improve, and customize the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Heart className="h-5 w-5 text-primary" />
                  Free & Accessible
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-base text-muted-foreground">
                <p>
                  Completely free to use. Designed to be accessible to students and educators worldwide, regardless of their technical background.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Key Features</h2>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>OCR Technology:</strong> Extract text from scanned PDFs and images with high accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>AI-Powered Analysis:</strong> Automatically classify questions by topic, subject, and difficulty</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Smart Filtering:</strong> Filter questions by year, topic, subject, or keywords</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Video Resources:</strong> Get relevant educational videos for each question (optional)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Session Management:</strong> Organize your analysis sessions and track your progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Analytics Dashboard:</strong> View statistics and insights about your question papers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Export Options:</strong> Download your analysis results in JSON format</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Technology Stack</h2>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
                <div>
                  <h3 className="font-semibold mb-2">Frontend</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• React + TypeScript</li>
                    <li>• Vite</li>
                    <li>• Tailwind CSS</li>
                    <li>• shadcn/ui</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI & Processing</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Tesseract.js (OCR)</li>
                    <li>• DeepSeek API</li>
                    <li>• OpenRouter API</li>
                    <li>• YouTube Data API</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Source */}
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Open Source
            </CardTitle>
            <CardDescription>
              Built by the community, for the community
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-muted-foreground space-y-4">
            <p>
              Prepzy PYQ is an open-source project. We welcome contributions from developers, educators, and students who want to improve the platform.
            </p>
            <p>
              Whether you want to fix a bug, add a feature, improve documentation, or suggest an idea, your contributions are valuable to us.
            </p>
            <div className="pt-4">
              <a 
                href="https://github.com/SQADIRKVM/prepzy-pyq" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  View on GitHub
                  <Code className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have questions, suggestions, or feedback?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-muted-foreground space-y-4">
            <p>
              We'd love to hear from you! You can reach us through:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>GitHub Issues: Report bugs or request features</li>
              <li>GitHub Discussions: Join the community discussion</li>
              <li>Pull Requests: Contribute code improvements</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
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

          {/* Copyright Section */}
          <div className="border-t border-border/40 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
};

export default About;

