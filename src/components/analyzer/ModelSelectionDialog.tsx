import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Sparkles, Zap, Gauge, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModelSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (model: string) => void;
  paperCount: number;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
}

const models: ModelOption[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Fast and efficient analysis - Best for quick results",
    icon: <Zap className="h-5 w-5" />,
    badge: "Recommended",
    badgeVariant: "default",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Most accurate and detailed analysis - Best for comprehensive insights",
    icon: <Brain className="h-5 w-5" />,
    badge: "Most Accurate",
    badgeVariant: "secondary",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    description: "Ultra-fast processing - Best for basic analysis",
    icon: <Gauge className="h-5 w-5" />,
    badge: "Fastest",
    badgeVariant: "outline",
  },
];

export default function ModelSelectionDialog({
  open,
  onClose,
  onConfirm,
  paperCount,
}: ModelSelectionDialogProps) {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const handleConfirm = () => {
    onConfirm(selectedModel);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Select Analysis Model
          </DialogTitle>
          <DialogDescription>
            Choose the AI model to analyze your {paperCount} selected paper{paperCount > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
            {models.map((model) => (
              <div
                key={model.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                  selectedModel === model.id
                    ? "border-primary bg-accent"
                    : "border-border"
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={model.id}
                    className="flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    {model.icon}
                    {model.name}
                    {model.badge && (
                      <Badge variant={model.badgeVariant} className="ml-auto">
                        {model.badge}
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90">
            Start Analysis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
