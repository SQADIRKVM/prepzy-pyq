
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Filter, Calendar, Tag } from "lucide-react";

interface FilterBarProps {
  years: string[];
  topicNames: string[];
  filters: {
    year: string;
    topic: string;
    keyword: string;
  };
  onFilterChange: (name: string, value: string) => void;
}

const FilterBar = ({ 
  years,
  topicNames,
  filters,
  onFilterChange 
}: FilterBarProps) => {
  // Always show filters, even if there's only one option
  const hasYears = years.length > 0;
  const hasTopics = topicNames.length > 0;

  return (
    <Card className="glass-card border border-border/50 p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <h3 className="text-base md:text-lg font-semibold">Filter & Search</h3>
        </div>
        
        <div className={`grid gap-3 md:gap-4 ${
          hasYears && hasTopics 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : hasYears || hasTopics
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1'
        }`}>
          {hasYears && (
      <div className="space-y-2">
              <label htmlFor="year-filter" className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Year
        </label>
        <Select
          value={filters.year}
          onValueChange={(value) => onFilterChange("year", value)}
        >
                <SelectTrigger id="year-filter" className="h-9 md:h-10">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_years">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
          )}
      
          {hasTopics && (
      <div className="space-y-2">
              <label htmlFor="topic-filter" className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Topic
        </label>
        <Select
                value={filters.topic}
                onValueChange={(value) => onFilterChange("topic", value)}
        >
                <SelectTrigger id="topic-filter" className="h-9 md:h-10">
                  <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
                  <SelectItem value="all_topics">All Topics</SelectItem>
                  {topicNames.map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
          )}
      
          <div className={`space-y-2 ${hasYears && hasTopics ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
            <label htmlFor="keyword-filter" className="text-xs md:text-sm font-medium text-muted-foreground">
              Search Keywords
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="keyword-filter"
            placeholder="Search questions..."
                className="pl-10 h-9 md:h-10"
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
          />
        </div>
      </div>
    </div>
      </div>
    </Card>
  );
};

export default FilterBar;
