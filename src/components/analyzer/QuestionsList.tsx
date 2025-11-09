
import { Question } from "@/pages/analyzer/types";
import QuestionCard from "./QuestionCard";
import { Card } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

interface QuestionsListProps {
  questions: Question[];
}

const QuestionsList = ({ questions }: QuestionsListProps) => {
  if (questions.length === 0) {
    return (
      <Card className="glass-card border border-border/50 p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-muted/50 rounded-full">
            <FileSearch className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-base md:text-lg font-semibold text-foreground">
              No questions found
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-md">
              Try adjusting your filters or search keywords to find more results.
            </p>
          </div>
      </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;
