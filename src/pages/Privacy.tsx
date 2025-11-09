import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileX, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
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
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 sm:space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                Prepzy PYQ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
              </p>
              <p>
                Our application is designed with privacy as a core principle. All processing happens locally in your browser, and we do not store your personal data on any server.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">1. Local Storage Data</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-2">
                  We store the following information locally in your browser:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-muted-foreground ml-4">
                  <li>API keys (DeepSeek, OpenRouter, YouTube) - stored securely in your browser's localStorage</li>
                  <li>User session data (username, email, encrypted password) - stored locally</li>
                  <li>Analysis results and extracted questions - stored in your browser's localStorage</li>
                  <li>Application preferences and settings</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">2. No Server-Side Storage</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  We do not collect, transmit, or store any of your data on our servers. All data remains on your device.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileX className="h-5 w-5 text-primary" />
                File Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                When you upload files (PDFs or images) for analysis:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Files are processed entirely in your browser using client-side OCR technology</li>
                <li>Uploaded files are automatically deleted after processing (within 5 minutes)</li>
                <li>No files are transmitted to our servers</li>
                <li>No files are stored permanently</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                API Keys and Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                When you use API keys (DeepSeek, OpenRouter, or YouTube):
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>API keys are stored locally in your browser's localStorage</li>
                <li>API requests are made directly from your browser to the respective service providers</li>
                <li>We do not intercept, log, or store API responses</li>
                <li>Your API keys are never transmitted to our servers</li>
                <li>Please review the privacy policies of DeepSeek, OpenRouter, and Google (YouTube) for their data handling practices</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                We implement the following security measures:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All data is stored locally in your browser</li>
                <li>Passwords are encrypted using base64 encoding before storage</li>
                <li>No data transmission to external servers (except API calls you initiate)</li>
                <li>Automatic cleanup of uploaded files after processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                Since all data is stored locally in your browser, you have full control:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You can clear all data by clearing your browser's localStorage</li>
                <li>You can delete individual analysis sessions through the application</li>
                <li>You can remove API keys at any time from the Settings page</li>
                <li>You can delete your user account and all associated data</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                We do not use cookies or any tracking technologies. The application does not collect analytics or usage data.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                Our application is designed for educational purposes and is suitable for users of all ages. Since we do not collect or store personal information on servers, we comply with children's privacy requirements by default.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy, please contact us through our GitHub repository or by creating an issue on our project page.
              </p>
            </CardContent>
          </Card>
        </div>
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

export default Privacy;

