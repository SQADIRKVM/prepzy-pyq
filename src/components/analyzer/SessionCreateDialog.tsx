
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
import { UserPlus, Mail, Lock, User, BookOpen, Info } from 'lucide-react';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SessionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated: () => void;
}

const SessionCreateDialog = ({ open, onOpenChange, onSessionCreated }: SessionCreateDialogProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    // Validation
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!sessionName.trim()) {
      toast.error("Session name is required");
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
      toast.success("Session created successfully!");
      onSessionCreated();
      onOpenChange(false);
      
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setSessionName('');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        toast.error("User with this email already exists. Please login instead.");
      } else {
        toast.error("Failed to create session");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create Your Session
          </DialogTitle>
          <DialogDescription>
            Create a temporary session to personalize your experience. This is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        {/* Session Login Info Alert */}
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-semibold">Local Session Only</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            <strong>No Server-Side Authentication:</strong> Your account is created and stored locally in your browser only. 
            We don't use any server-side authentication or third-party login services. Your data remains completely private and device-specific.
            <br />
            <span className="text-muted-foreground mt-1 block">
              <strong>Note:</strong> If you clear browser data or use a different browser, you'll need to create a new session.
            </span>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="session-name" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Session Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., My Study Session, JEE Prep, etc."
            />
            <p className="text-xs text-muted-foreground">
              Give your session a memorable name to identify it later
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="session-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 4 characters)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-confirm-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionCreateDialog;

