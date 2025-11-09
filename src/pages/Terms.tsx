import { Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, Shield, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
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
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 sm:space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                By accessing and using Prepzy PYQ ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                Prepzy PYQ is an AI-powered web application that helps users analyze previous year question papers. The Service provides:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>OCR-based text extraction from PDFs and images</li>
                <li>AI-powered question analysis and classification</li>
                <li>Topic and subject categorization</li>
                <li>Keyword extraction and pattern recognition</li>
                <li>Video resource recommendations (when YouTube API key is provided)</li>
                <li>Local session management and data storage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                3. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Provide accurate information when creating user accounts</li>
                <li>Maintain the security of your API keys and account credentials</li>
                <li>Not use the Service to violate any applicable laws or regulations</li>
                <li>Not attempt to reverse engineer, decompile, or disassemble the Service</li>
                <li>Not use the Service to process copyrighted material without proper authorization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>4. API Keys and Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                The Service integrates with third-party APIs (DeepSeek, OpenRouter, YouTube). By using these services:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You are responsible for obtaining and maintaining valid API keys</li>
                <li>You agree to comply with the terms of service of these third-party providers</li>
                <li>You understand that API usage may be subject to rate limits and costs imposed by the providers</li>
                <li>We are not responsible for the availability, accuracy, or content of third-party services</li>
                <li>API keys are stored locally in your browser and are your sole responsibility</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                5. Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
                <li>Any errors in the Service will be corrected</li>
                <li>The Service will meet your specific requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PREPZY PYQ, ITS DEVELOPERS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                7. Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>You may not use the Service:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>For any illegal purpose or to solicit others to perform illegal acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To collect or track the personal information of others</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                The Service and its original content, features, and functionality are owned by Prepzy PYQ and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                As an open-source project, the code is available under the project's license. Please refer to the LICENSE file in the repository for specific terms.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. All data stored locally in your browser will remain until you clear it manually.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>11. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which the project is maintained, without regard to its conflict of law provisions.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <p>
                If you have any questions about these Terms of Service, please contact us through our GitHub repository or by creating an issue on our project page.
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

export default Terms;

