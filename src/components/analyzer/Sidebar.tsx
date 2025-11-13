
import { Link, useLocation } from "react-router-dom";
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
  UserPlus,
  Search
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
import { chatService, ChatSession } from "@/services/chatService";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface SidebarProps {
  stats?: {
    totalQuestions: number;
    totalSubjects: number;
    totalTopics: number;
  };
  onNewUpload?: () => void;
  onLoadResult?: (result: RecentResult) => void;
  onLoadChat?: (chatId: string) => void;
  onLogout?: () => void;
  onLogin?: () => void;
  onCreateAccount?: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar = ({ stats, onNewUpload, onLoadResult, onLoadChat, onLogout, onLogin, onCreateAccount, isOpen, onClose }: SidebarProps) => {
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [session, setSession] = useState(sessionService.getCurrentSession());
  const location = useLocation();

  useEffect(() => {
    // Load recent results and chats on mount and when sidebar opens
    const loadRecentResults = () => {
      const results = recentResultsService.getRecentResults();
      setRecentResults(results);
    };

    const loadRecentChats = () => {
      const chats = chatService.getAllChats();
      setRecentChats(chats);
    };

    // Load session
    const loadSession = () => {
      setSession(sessionService.getCurrentSession());
    };

    loadRecentResults();
    loadRecentChats();
    loadSession();
    
    // Refresh when storage changes (from other tabs/windows)
    const handleStorageChange = () => {
      loadRecentResults();
      loadRecentChats();
      loadSession();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes in same tab
    const interval = setInterval(() => {
      loadRecentResults();
      loadRecentChats();
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

  const handleLoadChat = (chatId: string) => {
    if (onLoadChat) {
      onLoadChat(chatId);
      toast.success("Chat loaded");
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    chatService.deleteChat(chatId);
    setRecentChats(chatService.getAllChats());
    toast.success("Chat deleted");
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
          "max-h-screen overflow-hidden",
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

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 sm:p-4 space-y-4 sm:space-y-5 pb-4">
            {/* Main Action */}
            <Button 
              className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-sm h-9 sm:h-10"
              onClick={onNewUpload}
            >
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">New Content</span>
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

            {/* Browse Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Browse</span>
              </div>
              <div className="space-y-1">
                <Link to="/browse-notes">
                  <Button
                    variant={location.pathname === '/browse-notes' ? 'secondary' : 'ghost'}
                    className={cn(
                      "w-full justify-start text-sm h-9",
                      location.pathname === '/browse-notes' && "bg-primary/10 text-primary"
                    )}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Notes</span>
                  </Button>
                </Link>
                <Link to="/browse-papers">
                  <Button
                    variant={location.pathname === '/browse-papers' ? 'secondary' : 'ghost'}
                    className={cn(
                      "w-full justify-start text-sm h-9",
                      location.pathname === '/browse-papers' && "bg-primary/10 text-primary"
                    )}
                  >
                    <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Question Papers</span>
                  </Button>
                </Link>
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

            {/* Recent Chats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Chats</span>
              </div>
              {recentChats.length > 0 ? (
                <div className="space-y-1">
                  {recentChats.slice(0, 5).map((chat) => (
                    <div
                      key={chat.id}
                      className="group relative"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground text-sm h-auto py-2 px-2 pr-8"
                        onClick={() => handleLoadChat(chat.id)}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0 overflow-hidden">
                          <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0 text-left overflow-hidden">
                            <p className="truncate text-xs font-medium">{chat.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.messageCount} messages</span>
                              {chat.hasFiles && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">• Files</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">{formatDate(chat.lastAccessed)}</span>
                            </div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
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
                    <p className="text-xs text-muted-foreground">No recent chats</p>
                  </div>
                </div>
              )}
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
        </div>

        {/* User Section at Bottom */}
        <div 
          className="border-t border-border p-2 sm:p-2.5 md:p-3 flex-shrink-0 bg-[#0f0f0f]"
          style={{
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))'
          }}
        >
            {session ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="bg-card/50 border border-border/50 rounded-lg p-2 sm:p-2.5 md:p-3">
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{session.username}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{session.email}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                  onClick={() => {
                    if (onLogout) {
                      sessionService.logout();
                      setSession(null);
                      onLogout();
                    }
                  }}
                >
                  <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-1 sm:space-y-1.5">
                <Button
                  variant="default"
                  className="w-full text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                  onClick={() => {
                    if (onLogin) {
                      onLogin();
                    }
                  }}
                >
                  <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span className="truncate">Login</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                  onClick={() => {
                    if (onCreateAccount) {
                      onCreateAccount();
                    }
                  }}
                >
                  <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
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
