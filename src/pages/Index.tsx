import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Zap, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Video,
  Search,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Brain,
  Target,
  Award,
  Download,
  Upload,
  Filter,
  Star,
  GraduationCap,
  Rocket,
  Globe,
  Layers,
  Code,
  Database,
  Lock,
  Infinity,
  Lightbulb,
  LineChart,
  HelpCircle,
  Info,
  ArrowDown,
  Map,
  Calendar,
  CheckCircle,
  Circle,
  Menu,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";


// Animated Counter Component
const AnimatedCounter = ({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const startTime = Date.now();
            const startValue = 0;
            const endValue = target;

            const animate = () => {
              const now = Date.now();
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
              
              setCount(currentValue);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(endValue);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [target, duration, hasAnimated]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary whitespace-nowrap">
      {count}{suffix}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ name, role, content }: { name: string; role: string; content: string }) => {
  return (
    <Card className="glass-card p-4 sm:p-5 w-[240px] h-[240px] sm:w-[320px] sm:h-auto md:w-[360px] flex-shrink-0 flex flex-col">
      <div className="flex items-center gap-1 mb-3 sm:mb-4 flex-shrink-0">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-1 overflow-y-auto">
        "{content}"
      </p>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-auto">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-xs sm:text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </Card>
  );
};

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationId: number;
    let position = 0;
    
    // Get speed based on screen size
    const getSpeed = () => {
      if (window.innerWidth <= 640) {
        return 0.3; // Slower on mobile
      }
      return 0.5; // Normal speed on desktop/tablet
    };
    
    let speed = getSpeed();
    let isPaused = false;

    // Update speed on resize
    const handleResize = () => {
      speed = getSpeed();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!isPaused) {
        position -= speed;
        const containerWidth = container.scrollWidth / 2; // Half because we'll duplicate
        
        // Reset position when we've scrolled one full set
        if (Math.abs(position) >= containerWidth) {
          position = 0;
        }
        
        container.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Handle pause on hover
    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
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
          <nav className="flex gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0 items-center">
            {/* Desktop Navigation */}
            <div className="hidden sm:flex gap-1.5 sm:gap-2 md:gap-4 items-center">
              <Link to="/documentation">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 h-8 sm:h-9">
                  <BookOpen className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Documentation
                </Button>
            </Link>
              <a 
                href="https://github.com/SQADIRKVM/prepzy-pyq" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
                aria-label="GitHub Repository"
              >
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 h-8 sm:h-9">
                  <svg 
                    className="h-4 w-4 sm:h-5 sm:w-5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1.5 hidden md:inline">GitHub</span>
                </Button>
              </a>
            </div>

            {/* Mobile Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <img 
                      src="/prepzy_logo.svg" 
                      alt="Prepzy PYQ Logo" 
                      className="h-8 w-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/logo.png') {
                          target.src = '/logo.png';
                        }
                      }}
                    />
                    <h2 className="text-lg font-bold">Prepzy PYQ</h2>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Link to="/analyzer" className="w-full">
                        <Button className="w-full justify-start" size="lg">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link to="/documentation" className="w-full">
                        <Button variant="outline" className="w-full justify-start" size="lg">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Documentation
                        </Button>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        size="lg"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setTimeout(() => {
                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                      >
                        <ArrowDown className="mr-2 h-4 w-4" />
                        View Features
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        size="lg"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setTimeout(() => {
                            document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                      >
                        <Map className="mr-2 h-4 w-4" />
                        Roadmap
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        size="lg"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setTimeout(() => {
                            const faqSection = document.querySelector('[id*="faq"], [id*="FAQ"]');
                            faqSection?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        FAQ
                      </Button>
                    </SheetClose>

                    <div className="border-t border-border/40 pt-4 mt-2">
                      <SheetClose asChild>
                        <Link to="/about" className="w-full">
                          <Button variant="ghost" className="w-full justify-start" size="lg">
                            <Users className="mr-2 h-4 w-4" />
                            About Us
                          </Button>
            </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <a 
                          href="https://github.com/SQADIRKVM/prepzy-pyq" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button variant="ghost" className="w-full justify-start" size="lg">
                            <svg 
                              className="mr-2 h-4 w-4" 
                              fill="currentColor" 
                              viewBox="0 0 24 24" 
                              aria-hidden="true"
                            >
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                          </Button>
                        </a>
                      </SheetClose>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex items-center"
        >
          {/* Background Elements */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"
          />
          <div 
            className="absolute top-10 right-5 sm:top-20 sm:right-10 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          />
          <div 
            className="absolute bottom-10 left-5 sm:bottom-20 sm:left-10 w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          />
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 mb-8 sm:mb-12 md:mb-16">
              <div 
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-medium mb-3 sm:mb-4 animate-pulse"
              >
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">AI-Powered Question Analysis</span>
              </div>
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight px-2"
              >
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Master Your Exams
                </span>
                <br />
                <span className="text-foreground">with Previous Year Questions</span>
                </h1>
              <p 
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
              >
                Upload your PYQ papers and let AI extract, analyze, and help you understand every question with personalized insights and curated video resources.
              </p>
              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 px-4"
              >
                <Link to="/analyzer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                      Get Started
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glass-card hover:bg-primary/5"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <ArrowDown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  View Features
                </Button>
                </div>
              <div 
                className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 pt-6 sm:pt-8 text-xs sm:text-sm text-muted-foreground px-4"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="whitespace-nowrap">No Credit Card Required</span>
              </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="whitespace-nowrap">Free to Start</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="whitespace-nowrap">Instant Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 border-y border-border/40">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Trusted by students preparing for</p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 opacity-60">
                    <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-semibold text-sm sm:text-base">JEE</span>
                      </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-semibold text-sm sm:text-base">NEET</span>
                    </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-semibold text-sm sm:text-base">UPSC</span>
                  </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-semibold text-sm sm:text-base">GATE</span>
              </div>
                    <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-semibold text-sm sm:text-base">SSC</span>
              </div>
            </div>
          </div>
        </section>

        {/* Session Login Info Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-primary/5 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
          >
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-4xl relative z-10">
            <Card className="glass-card border-primary/30 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl flex-shrink-0">
                  <Info className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span className="break-words">Local Session Login Only</span>
                      </div>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm md:text-base space-y-2 sm:space-y-3">
                    <p>
                      <strong>No Server-Side Authentication:</strong> Prepzy PYQ uses local session management only. 
                      Your account credentials are stored securely in your browser's local storage. 
                      We don't use any server-side authentication or third-party login services.
                    </p>
                    <p>
                      <strong>Privacy First:</strong> All your data, including login credentials and analysis results, 
                      remain on your device. We never send your login information to any server or third-party service.
                    </p>
                    <p>
                      <strong>Session-Based:</strong> Create a local session to save and manage your analysis results. 
                      Your sessions are stored locally and can only be accessed from the same browser where you created them.
                    </p>
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <strong>Note:</strong> If you clear your browser data or use a different browser, 
                        you'll need to create a new session. Sessions are device and browser-specific for maximum privacy.
                      </p>
                    </div>
                  </CardDescription>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section 
          id="features"
          className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">Powerful Features</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Everything you need to analyze and master previous year questions
                    </p>
                  </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl w-fit">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl">Smart Extraction</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Upload multiple PDFs and let AI extract questions with perfect accuracy, even from scanned documents.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Multiple file support
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      OCR for scanned papers
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Batch processing
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl w-fit">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Get intelligent insights on topics, subjects, and keywords. Understand what each question is testing.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Topic classification
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Subject identification
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Keyword extraction
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl w-fit">
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl">Video Resources</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Find relevant educational videos for each question to deepen your understanding.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Curated content
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Multiple sources
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Direct integration
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl w-fit">
                  <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl">Smart Filtering</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Filter questions by year, topic, subject, or keywords to focus on what matters most.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Multi-criteria filtering
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Real-time search
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Quick access
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl w-fit">
                  <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Track your progress with detailed statistics and insights on your question analysis.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Visual statistics
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Progress tracking
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Export data
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl w-fit">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg sm:text-xl">Session Management</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Organize your analysis sessions with local user accounts and secure data storage.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Multiple sessions
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Privacy-first storage
                    </li>
                    <li className="flex items-center gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      Easy organization
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Detailed Features Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20"
          >
            <div className="absolute top-10 left-5 sm:top-20 sm:left-20 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-20 w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-primary/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Advanced Capabilities</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Built with cutting-edge technology for the best experience
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all">
                <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Multi-Format Support</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Supports PDF, images, and scanned documents with automatic format detection.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all">
                <Database className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Smart Storage</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Save and organize your analysis sessions for easy access anytime.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all">
                <Code className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Dual API Support</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Choose between DeepSeek or OpenRouter APIs for flexible AI analysis.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all">
                <LineChart className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Analytics Dashboard</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Track your progress with detailed analytics and insights.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Privacy First</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your data is processed securely and automatically deleted after analysis.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 hover:shadow-lg transition-all">
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Export Results</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Download your analysis results in JSON format for further use.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section 
          className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 opacity-5"
          >
            <div className="absolute top-1/4 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-56 sm:w-80 h-56 sm:h-80 bg-primary/30 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">How It Works</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Three simple steps to transform your PYQ papers into actionable insights
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div 
                className="text-center space-y-3 sm:space-y-4 glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full flex flex-col"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow-lg shadow-primary/25 flex-shrink-0">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">Upload Your Papers</h3>
                <p className="text-sm sm:text-base text-muted-foreground flex-grow">
                  Drag and drop your PDF question papers. Support for multiple files at once with automatic processing.
                </p>
                <div className="pt-3 sm:pt-4 flex-shrink-0">
                  <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-primary/50 mx-auto" />
                </div>
              </div>
              <div 
                className="text-center space-y-3 sm:space-y-4 glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full flex flex-col"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow-lg shadow-primary/25 flex-shrink-0">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">AI Processing</h3>
                <p className="text-sm sm:text-base text-muted-foreground flex-grow">
                  Our AI extracts text, enhances it, and analyzes every question automatically with real-time progress tracking.
                </p>
                <div className="pt-3 sm:pt-4 flex-shrink-0">
                  <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary/50 mx-auto" />
                </div>
              </div>
              <div 
                className="text-center space-y-3 sm:space-y-4 glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full flex flex-col lg:col-span-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow-lg shadow-primary/25 flex-shrink-0">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">Get Insights</h3>
                <p className="text-sm sm:text-base text-muted-foreground flex-grow">
                  View organized questions, topics, and related video resources for better learning and exam preparation.
                </p>
                <div className="pt-3 sm:pt-4 flex-shrink-0">
                  <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-primary/50 mx-auto" />
                </div>
              </div>
            </div>
                      </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
          >
            <div className="absolute top-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-56 sm:w-80 h-56 sm:h-80 bg-primary/20 rounded-full blur-3xl" />
                    </div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Perfect For</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Whether you're a student or educator, we've got you covered
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <Card className="glass-card p-6 sm:p-8 hover:shadow-xl transition-all">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-xl flex-shrink-0">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl mb-2">Students</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Analyze previous year papers to identify patterns, focus on important topics, and track your preparation progress. Get instant insights on question types and difficulty levels.
                    </CardDescription>
                  </div>
                </div>
              </Card>
              <Card className="glass-card p-8 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Educators</CardTitle>
                    <CardDescription className="text-base">
                      Create comprehensive question banks, analyze exam patterns, and prepare better study materials. Understand question distribution across topics and years.
                    </CardDescription>
                  </div>
                </div>
              </Card>
              <Card className="glass-card p-8 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Coaching Institutes</CardTitle>
                    <CardDescription className="text-base">
                      Build comprehensive question databases, create mock tests, and provide students with detailed analysis reports. Scale your teaching with AI-powered insights.
                    </CardDescription>
                  </div>
                </div>
              </Card>
              <Card className="glass-card p-8 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Research & Analysis</CardTitle>
                    <CardDescription className="text-base">
                      Study exam trends, analyze question patterns over years, and conduct research on educational assessment methods. Export data for further analysis.
                    </CardDescription>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Why Choose Prepzy PYQ?</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Everything you need to excel in your exams
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="glass-card p-4 sm:p-6 text-center hover:shadow-lg transition-all">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Fast Processing</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Analyze papers in seconds, not hours. Get results instantly.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 text-center hover:shadow-lg transition-all">
                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Accurate Results</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Advanced AI ensures high accuracy in question extraction and analysis.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 text-center hover:shadow-lg transition-all">
                <Filter className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Smart Filtering</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Filter by year, topic, subject, or keywords to find exactly what you need.
                </CardDescription>
              </Card>
              <Card className="glass-card p-4 sm:p-6 text-center hover:shadow-lg transition-all">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-base sm:text-lg mb-2">Secure & Private</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your data is processed securely and automatically deleted after analysis.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
          >
            <div className="absolute top-0 left-1/4 w-56 sm:w-72 h-56 sm:h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">What Students Say</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Join thousands of successful students
              </p>
            </div>
            
            {/* Scrolling Testimonials */}
            <div className="relative overflow-hidden -mx-4 sm:-mx-6">
              <div 
                ref={scrollContainerRef}
                className="flex gap-4 sm:gap-6 md:gap-8"
                style={{ width: 'max-content', willChange: 'transform' }}
              >
                <TestimonialCard
                  name="Sarhan Qadir"
                  role="KTU Student"
                  content="Prepzy helped me for preparing for exams. The AI analysis and video integration features made my study sessions so much more effective and efficient."
                />
                <TestimonialCard
                  name="Shahin"
                  role="KTU Student"
                  content="As a KTU student, Prepzy PYQ transformed how I study. The smart filtering and AI insights help me focus on what matters most for my exams."
                />
                <TestimonialCard
                  name="Rajesh K."
                  role="JEE Aspirant"
                  content="Prepzy PYQ has completely transformed how I prepare for exams. The AI analysis helps me focus on the right topics and identify patterns I would have missed otherwise. The comprehensive question database and smart filtering make studying so much more efficient."
                />
                <TestimonialCard
                  name="Priya S."
                  role="NEET Student"
                  content="The video integration feature is amazing! I can instantly find explanations for any question I'm stuck on. The AI-powered analysis has helped me understand my strengths and weaknesses, making my exam preparation much more targeted and effective."
                />
                <TestimonialCard
                  name="Dr. Amit M."
                  role="Educator"
                  content="As a teacher, this tool helps me create better study materials and understand question patterns across years. The analytics and insights provided are invaluable for curriculum planning and helping students prepare more effectively."
                />
                {/* Duplicate set for seamless infinite scroll */}
                <TestimonialCard
                  name="Sarhan Qadir"
                  role="KTU Student"
                  content="Prepzy helped me for preparing for exams. The AI analysis and video integration features made my study sessions so much more effective and efficient."
                />
                <TestimonialCard
                  name="Shahin"
                  role="KTU Student"
                  content="As a KTU student, Prepzy PYQ transformed how I study. The smart filtering and AI insights help me focus on what matters most for my exams."
                />
                <TestimonialCard
                  name="Rajesh K."
                  role="JEE Aspirant"
                  content="Prepzy PYQ has completely transformed how I prepare for exams. The AI analysis helps me focus on the right topics and identify patterns I would have missed otherwise. The comprehensive question database and smart filtering make studying so much more efficient."
                />
                <TestimonialCard
                  name="Priya S."
                  role="NEET Student"
                  content="The video integration feature is amazing! I can instantly find explanations for any question I'm stuck on. The AI-powered analysis has helped me understand my strengths and weaknesses, making my exam preparation much more targeted and effective."
                />
                <TestimonialCard
                  name="Dr. Amit M."
                  role="Educator"
                  content="As a teacher, this tool helps me create better study materials and understand question patterns across years. The analytics and insights provided are invaluable for curriculum planning and helping students prepare more effectively."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 text-center">
              <div className="space-y-2 flex flex-col justify-center items-center min-h-[100px]">
                <AnimatedCounter target={50} suffix="+" />
                <div className="text-sm md:text-base text-muted-foreground px-1">Questions Analyzed</div>
              </div>
              <div className="space-y-2 flex flex-col justify-center items-center min-h-[100px]">
                <AnimatedCounter target={20} suffix="+" />
                <div className="text-sm md:text-base text-muted-foreground px-1">Active Users</div>
              </div>
              <div className="space-y-2 flex flex-col justify-center items-center min-h-[100px]">
                <AnimatedCounter target={95} suffix="%" />
                <div className="text-sm md:text-base text-muted-foreground px-1">Accuracy Rate</div>
              </div>
              <div className="space-y-2 flex flex-col justify-center items-center min-h-[100px]">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary whitespace-nowrap">24/7</div>
                <div className="text-sm md:text-base text-muted-foreground px-1">Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="roadmap" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
          />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
                <Map className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Product Roadmap</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Building towards a complete AI Study Operating System
              </p>
            </div>

            {/* Roadmap Timeline */}
            <div className="space-y-8 sm:space-y-12">
              {/* Phase 1 - Foundation */}
              <div className="relative">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="w-0.5 h-full bg-primary/20 mt-2 min-h-[120px] sm:min-h-[150px]"></div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm font-semibold text-primary bg-primary/10 px-2 sm:px-3 py-1 rounded-full">Phase 1 - Completed</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Foundation & Core Modules</h3>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <Card className="glass-card p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">PYQ Analyzer</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">OCR extraction, AI analysis, question classification</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Smart Study Hub</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Exam management, study resources, focus mode</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">YouTube Integration</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Video suggestions for questions</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Local Storage & Sessions</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Privacy-first local data management</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 2 - Connect & Smart */}
              <div className="relative">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="w-0.5 h-full bg-primary/20 mt-2 min-h-[120px] sm:min-h-[150px]"></div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm font-semibold text-amber-500 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-full">Phase 2 - In Development</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Connect & Intelligence</h3>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <Card className="glass-card p-4 sm:p-5 border-primary/30">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Module Integration</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Seamless connection between PYQ Analyzer and Study Hub</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 border-primary/30">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">AI Timetable Import</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Smart OCR extraction and auto-categorization</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 border-primary/30">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Cloud Sync & Multi-Device</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Access your data from any device</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 border-primary/30">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">AI Q&A Assistant</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Get instant answers to your study questions</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 border-primary/30">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Smart Flashcards</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Auto-generated from notes and PYQ analysis</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 border-primary/30">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Smart Notifications</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Exam reminders and study streak tracking</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 3 - Intelligence & Personalization */}
              <div className="relative">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background">
                      <Circle className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" />
                    </div>
                    <div className="w-0.5 h-full bg-primary/20 mt-2 min-h-[120px] sm:min-h-[150px]"></div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60" />
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-muted px-2 sm:px-3 py-1 rounded-full">Phase 3 - Planned</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Advanced Intelligence & Personalization</h3>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <Card className="glass-card p-4 sm:p-5 opacity-75">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Question Understanding Engine</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Structured Q/A extraction, topic identification, step-by-step solutions</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-75">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Advanced Video Matching</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Transcript-based matching with precise timestamp segments</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-75">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Pattern Recognition</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Topic frequency analysis, repeated questions detection</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-75">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Weakness Analysis</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Personalized recommendations based on weak areas</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-75">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Smart Revision Plans</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">AI-generated study plans based on time, difficulty, and patterns</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-75">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Multi-Language Support</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Full OCR and analysis support for multiple languages</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 4 - OS & Ecosystem */}
              <div className="relative">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background">
                      <Circle className="h-6 w-6 sm:h-8 sm:w-8 text-primary/40" />
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary/40" />
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-muted px-2 sm:px-3 py-1 rounded-full">Phase 4 - Future Vision</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Complete Study Operating System</h3>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <Card className="glass-card p-4 sm:p-5 opacity-60">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Resource Library</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Shared notes, PYQ archive, community content</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-60">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Study Marketplace</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Connect with tutors, courses, and study materials</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-60">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Community Features</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Study groups, peer Q&A, leaderboards</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-60">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Mobile Applications</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Native iOS and Android apps</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-60">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">AI Plugin System</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Extensible platform for developers</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="glass-card p-4 sm:p-5 opacity-60">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base mb-1">Offline Mode</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Full functionality without internet</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 sm:mt-16 text-center">
              <Card className="glass-card p-6 sm:p-8 border-primary/20">
                <CardContent className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold">Have Feature Suggestions?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    We'd love to hear your ideas! Contribute to our roadmap by sharing your feedback.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <a 
                      href="https://github.com/SQADIRKVM/prepzy-pyq/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Code className="mr-2 h-4 w-4" />
                        Suggest on GitHub
                      </Button>
                    </a>
                    <Link to="/about">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Learn More About Us
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary/5 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
          >
            <div className="absolute top-0 left-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-56 sm:w-80 h-56 sm:h-80 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
                <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Everything you need to know about Prepzy PYQ
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
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
                  API keys are optional but recommended for full functionality. You can add your DeepSeek API key for AI analysis and YouTube API key for video resources. Basic text extraction works without API keys, but advanced features require them.
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
              <AccordionItem value="item-7" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                  Can I access my sessions from different devices?
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  No, sessions are device and browser-specific. This is by design for maximum privacy. Each browser/device maintains its own local storage. If you need to access your data from multiple devices, you'll need to create separate sessions on each device.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8" className="glass-card rounded-lg px-4 sm:px-6 border-primary/20">
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold">
                  How long does analysis take?
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Analysis typically takes 10-20 seconds per document, depending on file size and complexity. Multiple files are processed sequentially. You can track progress in real-time, and the system supports pause/resume functionality for long processing tasks.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
          />
          <div className="container mx-auto max-w-4xl relative z-10">
            <Card className="glass-card border-primary/20 p-6 sm:p-8 md:p-12 text-center">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  Ready to Transform Your Exam Preparation?
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Join thousands of students who are already using Prepzy PYQ to ace their exams
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/analyzer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                      Start Analyzing Now
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <Link to="/documentation" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glass-card">
                      <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Learn More
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
                  <a 
                    href="#features" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a 
                    href="#roadmap" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Roadmap
                  </a>
                </li>
                <li>
                  <a 
                    href="#faq" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const faqSection = document.querySelector('[id*="faq"], [id*="FAQ"]');
                      faqSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    FAQ
                  </a>
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
}
