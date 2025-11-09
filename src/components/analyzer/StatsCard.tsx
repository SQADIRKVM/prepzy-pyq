
import { Card } from "@/components/ui/card";
import { FileText, BookOpen, TrendingUp } from "lucide-react";

interface StatsCardProps {
  questions: number;
  subjects: number;
  topics: number;
}

const StatsCard = ({ questions, subjects, topics }: StatsCardProps) => {
  if (questions === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
      <Card className="p-4 md:p-6 glass-card border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-primary/10 rounded-xl flex-shrink-0">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xl md:text-2xl font-bold text-foreground">{questions}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Questions</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6 glass-card border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-primary/10 rounded-xl flex-shrink-0">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xl md:text-2xl font-bold text-foreground">{subjects}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Subjects</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6 glass-card border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-primary/10 rounded-xl flex-shrink-0">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xl md:text-2xl font-bold text-foreground">{topics}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Topics</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsCard;
