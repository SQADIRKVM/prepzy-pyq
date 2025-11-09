
import { Link } from "react-router-dom";
import { 
  Plus, 
  FileText, 
  Settings,
  BarChart3,
  TrendingUp,
  FolderOpen,
  Upload,
  FileImage,
  Wand2,
  Info,
  X,
  Clock,
  Trash2,
  User,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import SettingsDialog from "./SettingsDialog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { recentResultsService, RecentResult } from "@/services/recentResultsService";
import { sessionService } from "@/services/sessionService";
import { toast } from "sonner";

interface SidebarProps {
  stats?: {
    totalQuestions: number;
    totalSubjects: number;
    totalTopics: number;
  };
  onNewUpload?: () => void;
  onLoadResult?: (result: RecentResult) => void;
  onLogout?: () => void;
  onLogin?: () => void;
  onCreateAccount?: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar = ({ stats, onNewUpload, onLoadResult, onLogout, onLogin, onCreateAccount, isOpen, onClose }: SidebarProps) => {
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [session, setSession] = useState(sessionService.getCurrentSession());

  useEffect(() => {
    // Load recent results on mount and when sidebar opens
    const loadRecentResults = () => {
      const results = recentResultsService.getRecentResults();
      setRecentResults(results);
    };

    // Load session
    const loadSession = () => {
      setSession(sessionService.getCurrentSession());
    };

    loadRecentResults();
    loadSession();
    
    // Refresh when storage changes (from other tabs/windows)
    const handleStorageChange = () => {
      loadRecentResults();
      loadSession();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes in same tab
    const interval = setInterval(() => {
      loadRecentResults();
      loadSession();
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLoadResult = (result: RecentResult) => {
    if (onLoadResult) {
      onLoadResult(result);
      toast.success(`Loaded ${result.questionCount} questions from ${result.filename}`);
    }
  };

  const handleDeleteResult = (e: React.MouseEvent, resultId: string) => {
    e.stopPropagation();
    recentResultsService.deleteResult(resultId);
    setRecentResults(recentResultsService.getRecentResults());
    toast.success("Result deleted");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-screen bg-[#0f0f0f] border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out",
          "w-[85vw] max-w-[320px] md:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // On desktop, when closed, hide completely
          !isOpen && "md:hidden"
        )}
      >
        {/* Logo */}
        <div className="p-3 sm:p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 min-w-0 flex-1">
              <img 
                src="/prepzy_logo.svg" 
                alt="Prepzy PYQ Logo" 
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                onError={(e) => {
                  // Fallback to PNG if SVG doesn't exist
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/logo.png') {
                    target.src = '/logo.png';
                  }
                }}
              />
              <span className="font-bold text-base sm:text-lg text-foreground truncate">Prepzy PYQ</span>
            </Link>
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 flex-shrink-0 ml-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
            {/* Main Action */}
            <Button 
              className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-sm h-9 sm:h-10"
              onClick={onNewUpload}
            >
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">New Upload</span>
            </Button>

            <Separator className="bg-border" />

            {/* Quick Stats - Always visible */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</span>
              </div>
              <div className="space-y-2">
                <Card className="p-2.5 sm:p-3 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">Questions</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stats?.totalQuestions || 0}</p>
                </Card>
                <Card className="p-2.5 sm:p-3 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">Subjects</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stats?.totalSubjects || 0}</p>
                </Card>
                {stats && stats.totalTopics > 0 && (
                  <Card className="p-2.5 sm:p-3 bg-card/50 border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">Topics</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{stats.totalTopics}</p>
                  </Card>
                )}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Upload Methods Quick Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upload Types</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50">
                  <div className="p-1.5 bg-primary/10 rounded flex-shrink-0">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-medium text-foreground truncate">PDF Extract</p>
                    <p className="text-xs text-muted-foreground truncate">Direct text</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50">
                  <div className="p-1.5 bg-primary/10 rounded flex-shrink-0">
                    <FileImage className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-medium text-foreground truncate">Image OCR</p>
                    <p className="text-xs text-muted-foreground truncate">Scan images</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/50">
                  <div className="p-1.5 bg-primary/10 rounded flex-shrink-0">
                    <Wand2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-medium text-foreground truncate">PDF OCR</p>
                    <p className="text-xs text-muted-foreground truncate">Advanced</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Recent Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Results</span>
              </div>
              {recentResults.length > 0 ? (
                <div className="space-y-1">
                  {recentResults.slice(0, 5).map((result) => (
                    <div
                      key={result.id}
                      className="group relative"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground text-sm h-auto py-2 px-2 pr-8"
                        onClick={() => handleLoadResult(result)}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0 overflow-hidden">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0 text-left overflow-hidden">
                            <p className="truncate text-xs font-medium">{result.filename}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{result.questionCount} questions</span>
                              {result.year && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">• {result.year}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">{formatDate(result.date)}</span>
                            </div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteResult(e, result.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-card/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">No recent results</p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-border" />

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</span>
              </div>
              <div className="px-2">
                <SettingsDialog onLogout={onLogout} onLogin={onLogin} />
              </div>
            </div>
            </div>
          </ScrollArea>

          {/* User Section at Bottom */}
          <div className="border-t border-border p-3 sm:p-4 flex-shrink-0">
            {session ? (
              <div className="space-y-3">
                <div className="bg-card/50 border border-border/50 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{session.username}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{session.email}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-sm h-9 sm:h-10"
                  onClick={() => {
                    if (onLogout) {
                      sessionService.logout();
                      setSession(null);
                      onLogout();
                    }
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full text-sm h-9 sm:h-10"
                  onClick={() => {
                    if (onLogin) {
                      onLogin();
                    }
                  }}
                >
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Login</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm h-9 sm:h-10"
                  onClick={() => {
                    if (onCreateAccount) {
                      onCreateAccount();
                    }
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Create Account</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };
  
  export default Sidebar;
