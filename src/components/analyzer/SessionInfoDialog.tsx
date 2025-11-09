
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from 'lucide-react';
import { sessionService } from '@/services/sessionService';

interface SessionInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SessionInfoDialog = ({ open, onOpenChange }: SessionInfoDialogProps) => {
  const handleGotIt = () => {
    sessionService.markSessionInfoShown();
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    // Only mark as seen if user clicks "Got it", not if they close via X
    if (!open) {
      sessionService.markSessionInfoShown();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            About Session Login
          </DialogTitle>
          <DialogDescription>
            Important information about your session
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">This is a temporary session-based login system.</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Your session data is stored locally in your browser</li>
              <li>If you clear your browser data, your session will be lost</li>
              <li>To keep the same session, don't clear your browser data</li>
              <li>This is not a permanent account - it's session-based only</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleGotIt}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionInfoDialog;

