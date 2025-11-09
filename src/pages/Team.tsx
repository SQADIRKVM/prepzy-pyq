import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Calendar, 
  Target, 
  Eye, 
  Rocket, 
  Bug, 
  Presentation, 
  MessageSquare, 
  Code, 
  CheckCircle2,
  Linkedin,
  Building2,
  BookOpen,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-5xl">
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
            Our Team & Journey
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            A mini project by third year CSE students, batch 2022-26
          </p>
        </div>

        {/* Project Information */}
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-muted-foreground space-y-3">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">Institution</p>
                <p>Eranad Knowledge City College</p>
                <p className="text-xs mt-1">Affiliated with APJ Abdul Kalam Technical University (KTU)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">Batch</p>
                <p>2022-26 (Third Year CSE Students)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">Project Type</p>
                <p>Mini Project - Prepzy PYQ Analyzer Module</p>
                <p className="text-xs mt-1">This is Prepzy's PYQ Analyzer module. Prepzy is a Complete Study OS that will be built by KTU Students, with each module developed by different teams of students.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision & Mission */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-muted-foreground">
              <p>
                To evolve into a complete AI Study Operating System—a unified platform that seamlessly connects exam preparation, study materials, AI tutoring, revision planning, and analytics. We envision an ecosystem where every aspect of a student's learning journey is intelligently connected and personalized.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-muted-foreground">
              <p>
                To help students and educators efficiently analyze and understand previous year question papers using AI technology. We aim to make exam preparation more effective, organized, and accessible to everyone, transforming how students prepare for their examinations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Prepzy OS */}
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              About Prepzy - Complete Study OS
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Prepzy</strong> is a Complete Study Operating System that will be built by KTU Students. Each module of Prepzy will be developed by different teams of students, creating a comprehensive ecosystem for education and study management.
            </p>
            <p>
              This project is <strong className="text-foreground">Prepzy's PYQ Analyzer module</strong> - designed to help students analyze previous year question papers using AI technology.
            </p>
            <p>
              Prepzy already has another module: <strong className="text-foreground">Exam Countdown</strong> (named Prepzy), which serves as the base foundation. Eventually, all Prepzy modules will be combined and connected to become a <strong className="text-foreground">Complete AI OS for Study and Education</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Project Journey Timeline */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Project Journey
          </h2>
          
          <div className="space-y-6">
            {/* January 23, 2025 - Project Kickoff */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">January 23, 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2">Project Kickoff</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Initial planning and ideation phase. The project started with a basic black and white UI, focusing on core functionality for an AI-powered question paper analyzer.
                  </p>
                </div>
              </div>
            </div>

            {/* Initial Development - Basic UI */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">January - February 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2">Initial Development - Basic UI</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    Initially, the UI was basic black and white. The project started with a simple, functional interface focused on core functionality:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                    <li>Implemented OCR functionality using Tesseract.js</li>
                    <li>Integrated DeepSeek and OpenRouter AI APIs for question analysis</li>
                    <li>Built session management system for user data</li>
                    <li>Created basic file upload and processing workflows</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bugs & Challenges */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">Throughout Development</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Bug className="h-5 w-5 text-primary" />
                    Lots of Bugs & Challenges Fixed
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    Encountered and resolved numerous challenges and bugs:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                    <li>OCR accuracy issues with low-quality images</li>
                    <li>API rate limiting and error handling</li>
                    <li>Session management and data persistence bugs</li>
                    <li>Responsive design challenges across devices</li>
                    <li>File upload and processing optimization issues</li>
                    <li>User authentication and security implementation bugs</li>
                    <li>Performance optimization for large PDF files</li>
                    <li>UI/UX inconsistencies and layout issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews & Feedback */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">February - March 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Reviews & Feedback
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    Gathered valuable feedback through reviews:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                    <li>Peer reviews from classmates and faculty</li>
                    <li>User testing with actual students</li>
                    <li>Faculty evaluations and suggestions</li>
                    <li>Continuous improvement based on feedback</li>
                    <li>Multiple review sessions and iterations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Presentations */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">February - March 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Presentation className="h-5 w-5 text-primary" />
                    Project Presentations
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    Multiple presentation sessions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                    <li>Initial project proposal presentation</li>
                    <li>Mid-term progress review</li>
                    <li>Final project demonstration</li>
                    <li>Technical documentation and code review</li>
                    <li>Faculty evaluation presentations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* April 8, 2025 - Final Submission */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">April 8, 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Final Project Submission
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Final project submission completed. The Prepzy PYQ Analyzer module is ready for evaluation and future integration with other Prepzy modules.
                  </p>
                </div>
              </div>
            </div>

            {/* November 4th - Name Adoption */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">November 4, 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Name Adoption: Prepzy
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Adopted the name "Prepzy" for the project, aligning it with the vision of a Complete Study Operating System.
                  </p>
                </div>
              </div>
            </div>

            {/* November 8th - Redesign */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">November 8, 2025</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Website Redesign by EdotStudio
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    EdotStudio redesigned the website and implemented new features, transforming the basic black and white UI into a modern, professional interface:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                    <li>Complete visual redesign with modern design principles</li>
                    <li>Enhanced user experience and interface</li>
                    <li>Improved feature implementations</li>
                    <li>Professional branding and styling</li>
                    <li>Responsive design improvements</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Future Vision */}
            <div className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">Future Vision</Badge>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Complete AI Study OS
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">
                    The ultimate goal is to combine all Prepzy modules into a unified platform:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                    <li>All Prepzy modules will be combined and connected</li>
                    <li>Integration with existing Prepzy Exam Countdown module</li>
                    <li>Seamless connection between all study tools</li>
                    <li>Complete AI-powered Study Operating System</li>
                    <li>Unified platform for all educational needs</li>
                    <li>Each module built by different teams of KTU students</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Development Team
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Sarhan Qadir KVM */}
            <Card className="glass-card hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Sarhan Qadir KVM</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">SQADIRKVM</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">KTU Student • Developer</p>
                  </div>
                  <a 
                    href="https://www.linkedin.com/in/sqadirkvm/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Shahin EK */}
            <Card className="glass-card hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Shahin EK</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">KTU Student • Developer</p>
                  </div>
                  <a 
                    href="https://www.linkedin.com/in/shahinek/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors justify-center"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Hana K */}
            <Card className="glass-card hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Hana K</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">KTU Student • Developer</p>
                  </div>
                  <a 
                    href="https://www.linkedin.com/in/fathima-hana-k-678708333/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Mohammed Suhair */}
            <Card className="glass-card hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Mohammed Suhair</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">KTU Student • Developer</p>
                  </div>
                  <a 
                    href="https://www.linkedin.com/in/mohammed-suhair-a21224384/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Design Credit */}
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Design & Development
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-muted-foreground">
            <p>
              Designed by{" "}
              <a 
                href="https://www.edot.studio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                EdotStudio
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Key Achievements */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base mb-1">Open Source</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Project made open source for community contribution</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base mb-1">Privacy First</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Local-only data storage, no server-side tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base mb-1">Dual API Support</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Integrated both DeepSeek and OpenRouter APIs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base mb-1">Responsive Design</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Fully responsive across all devices</p>
                </div>
              </div>
            </div>
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
                  <Link to="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/#roadmap" className="text-muted-foreground hover:text-primary transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/#faq" className="text-muted-foreground hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/team" className="text-muted-foreground hover:text-primary transition-colors">
                    Team
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
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Gemini API
                  </a>
                </li>
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
};

export default Team;

