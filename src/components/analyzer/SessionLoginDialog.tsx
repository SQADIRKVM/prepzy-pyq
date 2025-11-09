
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, UserPlus, User, Info } from 'lucide-react';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';
import SessionSelectDialog from './SessionSelectDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SessionLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
  onSessionSelected?: (resultId: string) => void;
  onCreateAccount?: () => void;
}

const SessionLoginDialog = ({ open, onOpenChange, onLoginSuccess, onSessionSelected, onCreateAccount }: SessionLoginDialogProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSessionSelect, setShowSessionSelect] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // Ensure migration happens before login
      sessionService.migrateExistingSession();
      
      const success = sessionService.login(email.trim(), password);
      if (success) {
        toast.success("Logged in successfully!");
        
        // Check if user has any sessions
        const userSessions = sessionService.getUserAnalysisSessions();
        if (userSessions.length > 0 && onSessionSelected) {
          // Show session selection dialog
          setShowSessionSelect(true);
          onOpenChange(false);
        } else {
          // No sessions, just login
          onLoginSuccess();
          onOpenChange(false);
        }
        setEmail('');
        setPassword('');
      } else {
        // Check if user exists but password is wrong
        const allUsers = sessionService.getAllUsers();
        const emailLower = email.trim().toLowerCase();
        const userExists = allUsers.some(u => u.email.toLowerCase() === emailLower);
        
        if (userExists) {
          toast.error("Invalid password. Please check your password and try again.");
        } else {
          toast.error("No account found with this email. Please create an account first.");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // Validation
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      sessionService.createSession(email, password, username);
      toast.success("Account created successfully!");
      
      // Check if user has any sessions
      const userSessions = sessionService.getUserAnalysisSessions();
      if (userSessions.length > 0 && onSessionSelected) {
        // Show session selection dialog
        setShowSessionSelect(true);
        onOpenChange(false);
      } else {
        // No sessions, just login
        onLoginSuccess();
        onOpenChange(false);
      }
      
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setIsCreatingAccount(false);
    } catch (error) {
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelected = (resultId: string) => {
    if (onSessionSelected) {
      onSessionSelected(resultId);
    }
    onLoginSuccess();
    setShowSessionSelect(false);
  };

  const toggleMode = () => {
    setIsCreatingAccount(!isCreatingAccount);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreatingAccount ? (
              <>
                <UserPlus className="h-5 w-5 text-primary" />
                Create Account
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 text-primary" />
                Session Login
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCreatingAccount 
              ? "Create a new account to save and manage your analysis sessions"
              : "Enter your credentials to access your session"
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Session Login Info Alert */}
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-semibold">Local Session Login</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            This is a local session login. Your credentials are stored securely in your browser only. 
            No server-side authentication or third-party login services are used. Your data remains private and local to your device.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 py-4">
          {isCreatingAccount && (
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="login-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              onKeyDown={(e) => e.key === 'Enter' && (isCreatingAccount ? handleCreateAccount() : handleLogin())}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="login-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isCreatingAccount ? "Create a password (min 4 characters)" : "Enter your password"}
              onKeyDown={(e) => e.key === 'Enter' && (isCreatingAccount ? handleCreateAccount() : handleLogin())}
            />
          </div>

          {isCreatingAccount && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center justify-center w-full sm:w-auto text-xs sm:text-sm text-muted-foreground">
            {isCreatingAccount ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button 
              onClick={isCreatingAccount ? handleCreateAccount : handleLogin} 
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              {loading 
                ? (isCreatingAccount ? "Creating..." : "Logging in...") 
                : (isCreatingAccount ? "Create Account" : "Login")
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Session Selection Dialog */}
      {onSessionSelected && (
        <SessionSelectDialog
          open={showSessionSelect}
          onOpenChange={setShowSessionSelect}
          onSessionSelected={handleSessionSelected}
        />
      )}
    </Dialog>
  );
};

export default SessionLoginDialog;

