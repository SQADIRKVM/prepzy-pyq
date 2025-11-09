
import { Badge } from "@/components/ui/badge";
import { QuestionTopic } from "@/pages/analyzer/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TopicsDisplayProps {
  topics: QuestionTopic[];
}

const TopicsDisplay = ({ topics }: TopicsDisplayProps) => {
  if (!topics || topics.length === 0) {
    return null;
  }

  // Sort topics by occurrence count (highest first)
  const sortedTopics = [...topics].sort((a, b) => b.count - a.count);

  return (
    <Card className="glass-card border border-border/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Most frequently discussed topics
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {sortedTopics.map((topic, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="px-3 py-1.5 md:px-4 md:py-2 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors text-xs md:text-sm"
            >
              <span className="font-medium">{topic.name}</span>
              <span className="ml-2 text-primary/70">({topic.count})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicsDisplay;
