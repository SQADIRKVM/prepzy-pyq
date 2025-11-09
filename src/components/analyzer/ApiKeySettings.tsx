
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
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [openRouterModel, setOpenRouterModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'deepseek' | 'openrouter'>('gemini');
  const [open, setOpen] = useState(false);

  // Load saved API keys on component mount
  useEffect(() => {
    const savedYoutubeKey = localStorage.getItem('youtubeApiKey') || '';
    const savedDeepseekKey = localStorage.getItem('deepseekApiKey') || '';
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey') || '';
    const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
    const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-1.5-flash';
    const savedOpenRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
    setYoutubeApiKey(savedYoutubeKey);
    setDeepseekApiKey(savedDeepseekKey);
    setOpenRouterApiKey(savedOpenRouterKey);
    setGeminiApiKey(savedGeminiKey);
    setGeminiModel(savedGeminiModel);
    setOpenRouterModel(savedOpenRouterModel);
    
    // Determine which provider to use based on existing keys (priority: Gemini > OpenRouter > DeepSeek)
    if (savedGeminiKey) {
      setApiProvider('gemini');
    } else if (savedOpenRouterKey) {
      setApiProvider('openrouter');
    } else if (savedDeepseekKey) {
      setApiProvider('deepseek');
    }
  }, []);

  const handleSave = () => {
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
      localStorage.setItem('openRouterModel', openRouterModel);
    } else {
      localStorage.removeItem('openRouterApiKey');
      localStorage.removeItem('openRouterModel');
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
            Configure your API keys to enable AI-powered features. At least one AI API key (Gemini, DeepSeek, or OpenRouter) is required for processing documents.
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
                variant={apiProvider === 'gemini' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('gemini')}
                className="flex-1"
              >
                Gemini
              </Button>
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

          {/* Gemini API Key */}
          {apiProvider === 'gemini' && (
            <div className="space-y-2">
              <Label htmlFor="gemini-api-key">
                Gemini API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className={!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                <strong>Required</strong> for AI text processing and question analysis.{" "}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get your API key from Google AI Studio →
                </a>
              </p>
              {/* Gemini Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="gemini-model">Gemini Model</Label>
                <Select
                  value={geminiModel}
                  onValueChange={setGeminiModel}
                >
                  <SelectTrigger id="gemini-model" className="w-full">
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
                <p className="text-xs text-muted-foreground">
                  Choose the Gemini model. Flash models are faster, Pro models offer higher quality.
                </p>
              </div>
            </div>
          )}

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
                className={!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
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
                className={!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
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
              {/* OpenRouter Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="openrouter-model">OpenRouter Model (Free Models)</Label>
                <Select
                  value={openRouterModel}
                  onValueChange={setOpenRouterModel}
                >
                  <SelectTrigger id="openrouter-model" className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek/deepseek-chat-v3-0324:free">
                      DeepSeek Chat V3 (Free) - Recommended
                    </SelectItem>
                    <SelectItem value="z-ai/glm-4.5-air:free">
                      Z-AI GLM 4.5 Air (Free)
                    </SelectItem>
                    <SelectItem value="moonshotai/kimi-k2:free">
                      Moonshot AI Kimi K2 (Free)
                    </SelectItem>
                    <SelectItem value="qwen/qwen3-30b-a3b:free">
                      Qwen 3 30B A3B (Free)
                    </SelectItem>
                    <SelectItem value="google/gemini-2.0-flash-exp:free">
                      Google Gemini 2.0 Flash (Free)
                    </SelectItem>
                    <SelectItem value="meta-llama/llama-3.2-3b-instruct:free">
                      Meta Llama 3.2 3B (Free)
                    </SelectItem>
                    <SelectItem value="microsoft/phi-3-mini-128k-instruct:free">
                      Microsoft Phi-3 Mini (Free)
                    </SelectItem>
                    <SelectItem value="mistralai/mistral-7b-instruct:free">
                      Mistral 7B Instruct (Free)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose a free model from OpenRouter. DeepSeek Chat V3 is recommended for best performance.
                </p>
              </div>
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
