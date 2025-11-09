
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { FileText, Calendar, Hash, Loader2 } from 'lucide-react';
import { sessionService, AnalysisSession } from '@/services/sessionService';
import { recentResultsService } from '@/services/recentResultsService';
import { formatDistanceToNow } from 'date-fns';

interface SessionSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionSelected: (resultId: string) => void;
}

const SessionSelectDialog = ({ open, onOpenChange, onSessionSelected }: SessionSelectDialogProps) => {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      const userSessions = sessionService.getUserAnalysisSessions();
      setSessions(userSessions);
      setLoading(false);
    }
  }, [open]);

  const handleSelectSession = (session: AnalysisSession) => {
    sessionService.updateSessionAccess(session.id);
    onSessionSelected(session.resultId);
    onOpenChange(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Select a Session
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Choose a session to load your analysis results
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 mt-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base text-muted-foreground">
                No sessions found. Create a session by processing a document.
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 sm:p-6 border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
                onClick={() => handleSelectSession(session)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 truncate">
                      {session.sessionName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>{session.questionCount} questions</span>
                      </div>
                      {session.year && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>{session.year}</span>
                        </div>
                      )}
                      {session.subject && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="truncate">{session.subject}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last accessed {formatDistanceToNow(new Date(session.lastAccessed), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSession(session);
                    }}
                  >
                    Open
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionSelectDialog;


