
import FilterBar from "@/components/analyzer/FilterBar";
import QuestionsList from "@/components/analyzer/QuestionsList";
import StatsCard from "@/components/analyzer/StatsCard";
import { Question, QuestionTopic } from "../types";
import { Separator } from "@/components/ui/separator";
import TopicsDisplay from "@/components/analyzer/TopicsDisplay";
import { FileText, TrendingUp } from "lucide-react";

interface ResultsSectionProps {
  questions: Question[];
  topics?: QuestionTopic[];
  years: string[];
  topicNames: string[];
  filters: {
    year: string;
    topic: string;
    keyword: string;
  };
  onFilterChange: (name: string, value: string) => void;
}

const ResultsSection = ({ 
  questions, 
  topics = [],
  years, 
  topicNames, 
  filters, 
  onFilterChange 
}: ResultsSectionProps) => {
  const uniqueSubjects = new Set(questions.map(q => q.subject)).size;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <StatsCard 
        questions={questions.length}
        subjects={uniqueSubjects}
        topics={topics.length}
      />

      {/* Filter Bar */}
      <FilterBar
        years={years}
        topicNames={topicNames}
        onFilterChange={onFilterChange}
        filters={filters}
      />
      
      {/* Topics Display */}
      {topics.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h3 className="text-lg md:text-xl font-bold">Common Topics</h3>
          </div>
          <TopicsDisplay topics={topics} />
          <Separator className="my-4 md:my-6" />
        </div>
      )}
      
      {/* Questions List */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h3 className="text-lg md:text-xl font-bold">Extracted Questions</h3>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {questions.length} question{questions.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <QuestionsList questions={questions} />
      </div>
    </div>
  );
};

export default ResultsSection;
