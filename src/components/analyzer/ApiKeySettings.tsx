
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
import { Settings, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { recentResultsService } from '@/services/recentResultsService';
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

const ApiKeySettings = () => {
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'deepseek' | 'openrouter'>('deepseek');
  const [open, setOpen] = useState(false);

  // Load saved API keys on component mount
  useEffect(() => {
    const savedYoutubeKey = localStorage.getItem('youtubeApiKey') || '';
    const savedDeepseekKey = localStorage.getItem('deepseekApiKey') || '';
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey') || '';
    setYoutubeApiKey(savedYoutubeKey);
    setDeepseekApiKey(savedDeepseekKey);
    setOpenRouterApiKey(savedOpenRouterKey);
    
    // Determine which provider to use based on existing keys
    if (savedOpenRouterKey) {
      setApiProvider('openrouter');
    } else if (savedDeepseekKey) {
      setApiProvider('deepseek');
    }
  }, []);

  const handleSave = () => {
    // At least one AI API key (DeepSeek or OpenRouter) should be present
    if (!deepseekApiKey.trim() && !openRouterApiKey.trim()) {
      toast.error("Either DeepSeek or OpenRouter API key is required");
      return;
    }
    
    // Save API keys to localStorage
    if (youtubeApiKey) {
      localStorage.setItem('youtubeApiKey', youtubeApiKey);
    } else {
      localStorage.removeItem('youtubeApiKey');
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4 mr-2" />
          API Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys to enable AI-powered features. Either DeepSeek or OpenRouter API key is required for processing documents.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-api-key">YouTube API Key</Label>
            <Input
              id="youtube-api-key"
              value={youtubeApiKey}
              onChange={(e) => setYoutubeApiKey(e.target.value)}
              placeholder="Enter your YouTube API key"
            />
            <p className="text-xs text-muted-foreground">
              Used for fetching related videos. Create a key in the Google Cloud Console.
            </p>
          </div>
          
          {/* API Provider Selection */}
          <div className="space-y-2">
            <Label>AI API Provider</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={apiProvider === 'deepseek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('deepseek')}
                className="flex-1"
              >
                DeepSeek
              </Button>
              <Button
                type="button"
                variant={apiProvider === 'openrouter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('openrouter')}
                className="flex-1"
              >
                OpenRouter
              </Button>
            </div>
          </div>

          {/* DeepSeek API Key */}
          {apiProvider === 'deepseek' && (
            <div className="space-y-2">
              <Label htmlFor="deepseek-api-key">
                DeepSeek API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deepseek-api-key"
                type="password"
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
                className={!deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                <strong>Required</strong> for AI text processing and question analysis.{" "}
                <a 
                  href="https://platform.deepseek.com/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get your API key from DeepSeek →
                </a>
              </p>
            </div>
          )}

          {/* OpenRouter API Key */}
          {apiProvider === 'openrouter' && (
            <div className="space-y-2">
              <Label htmlFor="openrouter-api-key">
                OpenRouter API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="openrouter-api-key"
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className={!deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                <strong>Required</strong> for AI text processing and question analysis.{" "}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get your API key from OpenRouter →
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                OpenRouter provides access to DeepSeek models and other AI models. Uses the model: <code className="text-xs bg-muted px-1 rounded">deepseek/deepseek-chat-v3-0324:free</code>
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ClearStorageSettings = () => {
  const [open, setOpen] = useState(false);

  const handleClearStorage = () => {
    try {
      recentResultsService.clearAllLocalStorage();
      toast.success("All stored data has been cleared");
      setOpen(false);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error clearing storage:", error);
      toast.error("Failed to clear storage");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:text-destructive"
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
  );
};

export default ApiKeySettings;
