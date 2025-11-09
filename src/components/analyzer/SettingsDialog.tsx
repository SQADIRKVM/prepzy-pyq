
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Trash2, 
  AlertTriangle, 
  Key, 
  BarChart3,
  Edit,
  X,
  User,
  Mail,
  Lock,
  LogOut,
  LogIn,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { recentResultsService, RecentResult } from '@/services/recentResultsService';
import { sessionService } from '@/services/sessionService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  onResultRename?: (id: string, newName: string) => void;
  onLogout?: () => void;
  onLogin?: () => void;
}

const SettingsDialog = ({ onResultRename, onLogout, onLogin }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'deepseek' | 'openrouter'>('gemini');
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Session management state
  const [session, setSession] = useState(sessionService.getCurrentSession());
  const [userSessions, setUserSessions] = useState(sessionService.getUserAnalysisSessions());
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [activeSection, setActiveSection] = useState<string>("api");

  // Load saved API keys and recent results on mount
  useEffect(() => {
    if (open) {
      const savedYoutubeKey = localStorage.getItem('youtubeApiKey') || '';
      const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
      const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-1.5-flash';
      const savedDeepseekKey = localStorage.getItem('deepseekApiKey') || '';
      const savedOpenRouterKey = localStorage.getItem('openRouterApiKey') || '';
      setYoutubeApiKey(savedYoutubeKey);
      setGeminiApiKey(savedGeminiKey);
      setGeminiModel(savedGeminiModel);
      setDeepseekApiKey(savedDeepseekKey);
      setOpenRouterApiKey(savedOpenRouterKey);
      
      // Determine which provider to use based on existing keys (priority: Gemini > OpenRouter > DeepSeek)
      if (savedGeminiKey) {
        setApiProvider('gemini');
      } else if (savedOpenRouterKey) {
        setApiProvider('openrouter');
      } else if (savedDeepseekKey) {
        setApiProvider('deepseek');
      }
      setRecentResults(recentResultsService.getRecentResults());
      
      // Load session data
      const currentSession = sessionService.getCurrentSession();
      setSession(currentSession);
      if (currentSession) {
        setEditUsername(currentSession.username);
        setEditEmail(currentSession.email);
      }
      
      // Load user sessions
      setUserSessions(sessionService.getUserAnalysisSessions());
    }
  }, [open]);

  // Update active section based on session
  useEffect(() => {
    if (session) {
      setActiveSection("profile");
    } else {
      setActiveSection("api");
    }
  }, [session]);

  const handleSaveApiKeys = () => {
    // At least one AI API key (Gemini, DeepSeek, or OpenRouter) should be present
    if (!geminiApiKey.trim() && !deepseekApiKey.trim() && !openRouterApiKey.trim()) {
      toast.error("At least one AI API key (Gemini, DeepSeek, or OpenRouter) is required");
      return;
    }
    
    // Save API keys to localStorage
    if (youtubeApiKey) {
      localStorage.setItem('youtubeApiKey', youtubeApiKey);
    } else {
      localStorage.removeItem('youtubeApiKey');
    }
    
    if (geminiApiKey) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
      localStorage.setItem('geminiModel', geminiModel);
    } else {
      localStorage.removeItem('geminiApiKey');
      localStorage.removeItem('geminiModel');
    }
    
    if (deepseekApiKey) {
      localStorage.setItem('deepseekApiKey', deepseekApiKey);
    } else {
      localStorage.removeItem('deepseekApiKey');
    }
    
    if (openRouterApiKey) {
      localStorage.setItem('openRouterApiKey', openRouterApiKey);
    } else {
      localStorage.removeItem('openRouterApiKey');
    }
    
    toast.success('API settings saved');
  };

  const handleClearStorage = () => {
    try {
      // Clear all recent results and questions
      recentResultsService.clearAllLocalStorage();
      
      // Clear all user sessions if logged in
      if (session) {
        sessionService.deleteAllUserSessions();
      }
      
      toast.success("All stored data has been cleared");
      setRecentResults([]);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error clearing storage:", error);
      toast.error("Failed to clear storage");
    }
  };

  const handleStartRename = (result: RecentResult) => {
    setEditingId(result.id);
    setEditName(result.filename);
  };

  const handleSaveRename = () => {
    if (!editingId || !editName.trim()) return;
    
    const result = recentResults.find(r => r.id === editingId);
    if (result) {
      // Update the result in localStorage
      const allResults = recentResultsService.getRecentResults();
      const updatedResults = allResults.map(r => 
        r.id === editingId ? { ...r, filename: editName.trim() } : r
      );
      localStorage.setItem('prepzy_recent_results', JSON.stringify(updatedResults));
      
      setRecentResults(updatedResults);
      setEditingId(null);
      setEditName('');
      
      if (onResultRename) {
        onResultRename(editingId, editName.trim());
      }
      
      toast.success('Result renamed successfully');
    }
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteResult = (id: string) => {
    recentResultsService.deleteResult(id);
    setRecentResults(recentResultsService.getRecentResults());
    toast.success("Result deleted");
  };

  // Session management handlers
  const handleUpdateUserDetails = () => {
    if (!editUsername.trim()) {
      toast.error("Username is required");
      return;
    }
    
    const success = sessionService.updateUserDetails(editUsername, editEmail);
    if (success) {
      setSession(sessionService.getCurrentSession());
      toast.success("User details updated");
    } else {
      toast.error("Failed to update user details");
    }
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    
    if (newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    const success = sessionService.changePassword(oldPassword, newPassword);
    if (success) {
      toast.success("Password changed successfully");
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      toast.error("Old password is incorrect");
    }
  };

  const handleLogout = () => {
    sessionService.logout();
    setSession(null);
    toast.success("Logged out successfully");
    if (onLogout) {
      onLogout();
    }
    setOpen(false);
  };

  // Calculate analytics
  const totalAnalyses = recentResults.length;
  const totalQuestions = recentResults.reduce((sum, r) => sum + r.questionCount, 0);
  const uniqueSubjects = new Set(recentResults.flatMap(r => 
    r.data.questions.map(q => q.subject)
  )).size;
  const uniqueYears = new Set(recentResults.flatMap(r => 
    r.data.questions.map(q => q.year).filter(Boolean)
  )).size;

  const sections = [
    { id: "profile", label: "Profile", icon: User, requiresLogin: false },
    { id: "api", label: "API Keys", icon: Key, requiresLogin: false },
    { id: "results", label: "Results", icon: FileText, requiresLogin: true },
    { id: "analytics", label: "Analytics", icon: BarChart3, requiresLogin: true },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-border/50 bg-card/50 flex-shrink-0 flex flex-col">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border/50 sm:border-b-0 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-semibold">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                Settings
              </DialogTitle>
              <DialogDescription className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Manage your preferences
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto scrollbar-hide border-b sm:border-b-0 sm:border-t border-border/50 flex-1 min-h-0">
              {sections.map((section) => {
                const Icon = section.icon;
                const isDisabled = section.requiresLogin && !session;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => !isDisabled && setActiveSection(section.id)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full sm:w-auto flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3 text-left text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "bg-primary/10 text-primary border-l-2 sm:border-l-0 sm:border-r-2 border-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="space-y-4 sm:space-y-6">
                  {session ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* User Info Card */}
                      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30 shadow-sm flex-shrink-0">
                            <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg sm:text-xl font-bold truncate">{session.username}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{session.email}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Member since {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Edit User Details */}
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-foreground">
                            <User className="h-4 w-4 text-primary flex-shrink-0" />
                            Personal Information
                          </h3>
                          <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-border/50 shadow-sm">
                            <div className="space-y-2">
                              <Label htmlFor="edit-username" className="text-xs sm:text-sm font-medium">Username</Label>
                              <Input
                                id="edit-username"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Enter username"
                                className="h-10 sm:h-11 w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-email" className="text-xs sm:text-sm font-medium">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Enter email"
                                className="h-10 sm:h-11 w-full"
                              />
                            </div>
                            <Button onClick={handleUpdateUserDetails} className="w-full mt-2">
                              Save Changes
                            </Button>
                          </Card>
                        </div>

                        {/* Change Password */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-foreground">
                            <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                            Security
                          </h3>
                          <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-border/50 shadow-sm">
                            <div className="space-y-2">
                              <Label htmlFor="old-password" className="text-xs sm:text-sm font-medium">Current Password</Label>
                              <Input
                                id="old-password"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="h-10 sm:h-11 w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password" className="text-xs sm:text-sm font-medium">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 4 characters)"
                                className="h-10 sm:h-11 w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-new-password" className="text-xs sm:text-sm font-medium">Confirm New Password</Label>
                              <Input
                                id="confirm-new-password"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="h-10 sm:h-11 w-full"
                              />
                            </div>
                            <Button onClick={handleChangePassword} className="w-full mt-2">
                              Update Password
                            </Button>
                          </Card>
                        </div>

                        {/* Logout */}
                        <div className="pt-2">
                          <Button 
                            variant="destructive" 
                            onClick={handleLogout}
                            className="w-full"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>

                      {/* Danger Zone Section */}
                      <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-destructive/30">
                        <div className="space-y-4 sm:space-y-6">
                          {/* Danger Zone Header */}
                          <div className="border-l-4 border-destructive pl-4 py-2">
                            <h3 className="text-base sm:text-lg font-semibold text-destructive flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              Danger Zone
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Irreversible and destructive actions. Proceed with caution.
                            </p>
                          </div>

                          {/* User Sessions Management */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-foreground">
                                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                Your Analysis Sessions
                              </h4>
                              <Card className="p-4 sm:p-6 border-destructive/20 bg-destructive/5">
                                {userSessions.length > 0 ? (
                                  <div className="space-y-3">
                                    {userSessions.map((analysisSession) => (
                                      <div
                                        key={analysisSession.id}
                                        className="flex items-center justify-between gap-3 sm:gap-4 p-3 bg-background rounded-lg border border-border/50"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs sm:text-sm font-medium truncate">
                                            {analysisSession.sessionName}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {analysisSession.questionCount} questions
                                            {analysisSession.year && ` • ${analysisSession.year}`}
                                            {analysisSession.subject && ` • ${analysisSession.subject}`}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Last accessed: {new Date(analysisSession.lastAccessed).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              className="flex-shrink-0"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                              Delete
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                Delete Session?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription className="pt-2">
                                                This will permanently delete the session:
                                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                                  <p className="font-medium">{analysisSession.sessionName}</p>
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    {analysisSession.questionCount} questions
                                                  </p>
                                                </div>
                                                <p className="mt-3 text-xs text-muted-foreground">
                                                  This action cannot be undone.
                                                </p>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => {
                                                  sessionService.deleteAnalysisSession(analysisSession.id);
                                                  setUserSessions(sessionService.getUserAnalysisSessions());
                                                  toast.success("Session deleted");
                                                }}
                                                className="bg-destructive hover:bg-destructive/90"
                                              >
                                                Delete Session
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    ))}
                                    {userSessions.length > 1 && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="destructive"
                                            className="w-full mt-2"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete All Sessions
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2">
                                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                                              Delete All Sessions?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="pt-2">
                                              This will permanently delete all {userSessions.length} of your analysis sessions.
                                              <p className="mt-3 font-medium">This action cannot be undone.</p>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => {
                                                sessionService.deleteAllUserSessions();
                                                setUserSessions(sessionService.getUserAnalysisSessions());
                                                toast.success("All sessions deleted");
                                              }}
                                              className="bg-destructive hover:bg-destructive/90"
                                            >
                                              Delete All Sessions
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-6">
                                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                    <p className="text-xs sm:text-sm text-muted-foreground">No analysis sessions found</p>
                                  </div>
                                )}
                              </Card>
                            </div>

                            {/* Clear All Data */}
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-foreground">
                                <Trash2 className="h-4 w-4 text-destructive flex-shrink-0" />
                                Clear All Data
                              </h4>
                              <Card className="p-4 sm:p-6 border-destructive/20 bg-destructive/5">
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                      This will permanently delete all your stored data including:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground ml-2">
                                      <li>All recent analysis results</li>
                                      <li>All saved questions and topics</li>
                                      <li>All analysis sessions</li>
                                      <li>Current session data</li>
                                    </ul>
                                    <p className="mt-3 text-xs sm:text-sm font-medium text-foreground">
                                      Your API keys will be preserved.
                                    </p>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="destructive" 
                                        className="w-full"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear All Data
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                                          Clear All Stored Data?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="pt-2">
                                          This will permanently delete:
                                          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                            <li>All recent analysis results</li>
                                            <li>All saved questions and topics</li>
                                            <li>All analysis sessions</li>
                                            <li>Current session data</li>
                                          </ul>
                                          <p className="mt-3 font-medium">Your API keys will be preserved.</p>
                                          <p className="mt-2 text-xs text-muted-foreground">This action cannot be undone.</p>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={handleClearStorage}
                                          className="bg-destructive hover:bg-destructive/90"
                                        >
                                          Clear All Data
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                      <div className="bg-muted/30 rounded-lg sm:rounded-xl p-6 sm:p-8 space-y-3 sm:space-y-4 border border-border/50">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold mb-1">No active session</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                            Login to access your session or create one after processing a document
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (onLogin) {
                              onLogin();
                              setOpen(false);
                            }
                          }}
                          className="w-full"
                          size="lg"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login to Session
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results Section */}
              {activeSection === "results" && (
                <div className="space-y-3 sm:space-y-4">
                  {!session ? (
                    <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                      <div className="bg-muted/30 rounded-lg sm:rounded-xl p-6 sm:p-8 space-y-3 sm:space-y-4 border border-border/50">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold mb-1">Login Required</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                            Please login to view and manage your recent results.
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (onLogin) {
                              onLogin();
                              setOpen(false);
                            }
                          }}
                          className="w-full"
                          size="lg"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login to Continue
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {recentResults.length > 0 ? (
                        recentResults.map((result) => (
                          <Card key={result.id} className="p-3 sm:p-4 border-border/50 hover:border-border transition-colors">
                            {editingId === result.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1 h-9 text-sm"
                                  autoFocus
                                />
                                <Button size="sm" onClick={handleSaveRename} className="text-xs sm:text-sm">
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelRename} className="h-9 w-9 p-0">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 sm:gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium truncate">{result.filename}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {result.questionCount} questions • {new Date(result.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStartRename(result)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                  >
                                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteResult(result.id)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-xs sm:text-sm text-muted-foreground">No recent results to manage</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* API Keys Section */}
              {activeSection === "api" && (
                <div className="space-y-4 sm:space-y-6">
                  {!session && (
                    <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <div className="bg-muted/30 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4 border border-border/50">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold mb-1">Login Required</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                            Please login to edit API keys. You can view your current API keys below.
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (onLogin) {
                              onLogin();
                              setOpen(false);
                            }
                          }}
                          className="w-full"
                          size="lg"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login to Edit
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 sm:space-y-6 w-full">
                    {/* API Provider Selection */}
                    <div className="space-y-3 sm:space-y-4 w-full">
                      <Label className="text-xs sm:text-sm font-semibold">AI API Provider</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={apiProvider === 'gemini' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setApiProvider('gemini')}
                          disabled={!session}
                          className="flex-1"
                        >
                          Gemini
                        </Button>
                        <Button
                          type="button"
                          variant={apiProvider === 'deepseek' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setApiProvider('deepseek')}
                          disabled={!session}
                          className="flex-1"
                        >
                          DeepSeek
                        </Button>
                        <Button
                          type="button"
                          variant={apiProvider === 'openrouter' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setApiProvider('openrouter')}
                          disabled={!session}
                          className="flex-1"
                        >
                          OpenRouter
                        </Button>
                      </div>
                    </div>

                    {/* Gemini API Key */}
                    {apiProvider === 'gemini' && (
                      <div className="space-y-3 sm:space-y-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Key className="h-4 w-4 text-primary flex-shrink-0" />
                            <Label htmlFor="gemini-api-key" className="text-xs sm:text-sm font-semibold truncate">
                              Gemini API Key <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          {!session && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded self-start sm:self-auto flex-shrink-0">Read-only</span>
                          )}
                        </div>
                        <Input
                          id="gemini-api-key"
                          type="password"
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          placeholder="Enter your Gemini API key"
                          disabled={!session}
                          className={!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500 h-10 sm:h-11 w-full" : "h-10 sm:h-11 w-full"}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          <strong>Required</strong> for AI text processing and question analysis.{" "}
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium break-all"
                          >
                            Get your API key from Google AI Studio →
                          </a>
                        </p>
                        
                        {/* Gemini Model Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="gemini-model" className="text-xs sm:text-sm font-semibold">
                            Gemini Model
                          </Label>
                          <Select
                            value={geminiModel}
                            onValueChange={setGeminiModel}
                            disabled={!session}
                          >
                            <SelectTrigger 
                              id="gemini-model"
                              className="h-10 sm:h-11 w-full"
                            >
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gemini-1.5-flash">
                                Gemini 1.5 Flash (Fast & Efficient)
                              </SelectItem>
                              <SelectItem value="gemini-2.5-flash">
                                Gemini 2.5 Flash (Latest Flash)
                              </SelectItem>
                              <SelectItem value="gemini-flash-latest">
                                Gemini Flash Latest (Auto-updated)
                              </SelectItem>
                              <SelectItem value="gemini-2.5-pro">
                                Gemini 2.5 Pro (Most Capable)
                              </SelectItem>
                              <SelectItem value="gemini-1.5-pro">
                                Gemini 1.5 Pro (High Quality)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground leading-relaxed break-words">
                            Choose the Gemini model for analysis. Flash models are faster, Pro models offer higher quality.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* DeepSeek API Key */}
                    {apiProvider === 'deepseek' && (
                      <div className="space-y-3 sm:space-y-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Key className="h-4 w-4 text-primary flex-shrink-0" />
                            <Label htmlFor="deepseek-api-key" className="text-xs sm:text-sm font-semibold truncate">
                              DeepSeek API Key <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          {!session && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded self-start sm:self-auto flex-shrink-0">Read-only</span>
                          )}
                        </div>
                        <Input
                          id="deepseek-api-key"
                          type="password"
                          value={deepseekApiKey}
                          onChange={(e) => setDeepseekApiKey(e.target.value)}
                          placeholder="Enter your DeepSeek API key"
                          disabled={!session}
                          className={!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500 h-10 sm:h-11 w-full" : "h-10 sm:h-11 w-full"}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          <strong>Required</strong> for AI text processing and question analysis.{" "}
                          <a 
                            href="https://platform.deepseek.com/api_keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium break-all"
                          >
                            Get your API key from DeepSeek →
                          </a>
                        </p>
                      </div>
                    )}

                    {/* OpenRouter API Key */}
                    {apiProvider === 'openrouter' && (
                      <div className="space-y-3 sm:space-y-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Key className="h-4 w-4 text-primary flex-shrink-0" />
                            <Label htmlFor="openrouter-api-key" className="text-xs sm:text-sm font-semibold truncate">
                              OpenRouter API Key <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          {!session && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded self-start sm:self-auto flex-shrink-0">Read-only</span>
                          )}
                        </div>
                        <Input
                          id="openrouter-api-key"
                          type="password"
                          value={openRouterApiKey}
                          onChange={(e) => setOpenRouterApiKey(e.target.value)}
                          placeholder="Enter your OpenRouter API key"
                          disabled={!session}
                          className={!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500 h-10 sm:h-11 w-full" : "h-10 sm:h-11 w-full"}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          <strong>Required</strong> for AI text processing and question analysis.{" "}
                          <a 
                            href="https://openrouter.ai/keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium break-all"
                          >
                            Get your API key from OpenRouter →
                          </a>
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          OpenRouter provides access to DeepSeek models and other AI models. Uses the model: <code className="text-xs bg-muted px-1 rounded">deepseek/deepseek-chat-v3-0324:free</code>
                        </p>
                      </div>
                    )}
                    
                    {/* YouTube API Key */}
                    <div className="space-y-3 sm:space-y-4 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Key className="h-4 w-4 text-primary flex-shrink-0" />
                          <Label htmlFor="youtube-api-key" className="text-xs sm:text-sm font-semibold truncate">
                            YouTube API Key
                          </Label>
                        </div>
                        {!session && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded self-start sm:self-auto flex-shrink-0">Read-only</span>
                        )}
                      </div>
                      <Input
                        id="youtube-api-key"
                        value={youtubeApiKey}
                        onChange={(e) => setYoutubeApiKey(e.target.value)}
                        placeholder="Enter your YouTube API key"
                        disabled={!session}
                        className="h-10 sm:h-11 w-full"
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">
                        Used for fetching related educational videos. Create a key in the Google Cloud Console.
                      </p>
                    </div>
                  </div>
                  
                  {session && (
                    <div className="pt-4 sm:pt-6 border-t">
                      <Button onClick={handleSaveApiKeys} className="w-full sm:w-auto min-w-[120px]">
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Section */}
              {activeSection === "analytics" && (
                <div className="space-y-4">
                  {!session ? (
              <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                <div className="bg-muted/30 rounded-lg sm:rounded-xl p-6 sm:p-8 space-y-3 sm:space-y-4 border border-border/50">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold mb-1">Login Required</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                      Please login to view your analytics and statistics.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      if (onLogin) {
                        onLogin();
                        setOpen(false);
                      }
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to View Analytics
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="p-4 sm:p-6 border-border/50 hover:border-border transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Analyses</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{totalAnalyses}</p>
                </Card>
                
                <Card className="p-4 sm:p-6 border-border/50 hover:border-border transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Questions</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{totalQuestions}</p>
                </Card>
                
                <Card className="p-4 sm:p-6 border-border/50 hover:border-border transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Subjects</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{uniqueSubjects}</p>
                </Card>
                
                <Card className="p-4 sm:p-6 border-border/50 hover:border-border transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Years</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{uniqueYears}</p>
                  </Card>
                </div>
              )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;

