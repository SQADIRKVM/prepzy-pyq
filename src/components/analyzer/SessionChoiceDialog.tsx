
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
import { UserPlus, LogIn } from 'lucide-react';
import SessionCreateDialog from './SessionCreateDialog';
import SessionLoginDialog from './SessionLoginDialog';

interface SessionChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated?: () => void;
  onLoginSuccess?: () => void;
  onSessionSelected?: (resultId: string) => void;
}

const SessionChoiceDialog = ({ 
  open, 
  onOpenChange, 
  onSessionCreated,
  onLoginSuccess,
  onSessionSelected
}: SessionChoiceDialogProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleCreateClick = () => {
    setShowCreate(true);
    onOpenChange(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    onOpenChange(false);
  };

  const handleCreateClose = (open: boolean) => {
    setShowCreate(open);
    if (!open) {
      // If create dialog is closed, check if session was created
      if (onSessionCreated) {
        onSessionCreated();
      }
    }
  };

  const handleLoginClose = (open: boolean) => {
    setShowLogin(open);
    if (!open && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Session or Login
            </DialogTitle>
            <DialogDescription>
              Choose to create a new session or login to an existing one to save and manage your analysis results.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button
              onClick={handleCreateClick}
              className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20"
              variant="outline"
            >
              <div className="flex items-center gap-2 w-full">
                <UserPlus className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">Create New Session</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Create a new account to save your analysis results
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleLoginClick}
              className="w-full h-auto py-6 flex flex-col items-start gap-2 bg-card hover:bg-accent border border-border"
              variant="outline"
            >
              <div className="flex items-center gap-2 w-full">
                <LogIn className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">Login to Existing Session</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Access your saved analysis sessions
                  </div>
                </div>
              </div>
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Skip for now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <SessionCreateDialog
        open={showCreate}
        onOpenChange={handleCreateClose}
        onSessionCreated={() => {
          if (onSessionCreated) {
            onSessionCreated();
          }
          setShowCreate(false);
        }}
      />

      {/* Login Dialog */}
      <SessionLoginDialog
        open={showLogin}
        onOpenChange={handleLoginClose}
        onLoginSuccess={() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          setShowLogin(false);
        }}
        onSessionSelected={onSessionSelected}
      />
    </>
  );
};

export default SessionChoiceDialog;

