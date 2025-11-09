import { AnalysisResult, Question, QuestionTopic } from "@/pages/analyzer/types";
import { recentResultsService } from "./recentResultsService";

export const databaseService = {
  saveQuestions: async (result: AnalysisResult, filename?: string): Promise<void> => {
    try {
      localStorage.setItem('analyzedQuestions', JSON.stringify(result.questions));
      localStorage.setItem('questionTopics', JSON.stringify(result.topics));
      
      // Also save to recent results if filename is provided
      if (filename) {
        recentResultsService.saveResult(filename, result);
      }
    } catch (error) {
      console.error('Error saving questions:', error);
    }
  },

  getQuestions: async (): Promise<AnalysisResult> => {
    try {
      const questionsJson = localStorage.getItem('analyzedQuestions');
      const topicsJson = localStorage.getItem('questionTopics');

      const questions: Question[] = questionsJson ? JSON.parse(questionsJson) : [];
      const topics: QuestionTopic[] = topicsJson ? JSON.parse(topicsJson) : [];

      return { questions, topics };
    } catch (error) {
      console.error('Error getting questions:', error);
      return { questions: [], topics: [] };
    }
  },

  getQuestionsByFilter: async (
    yearFilter: string,
    topicFilter: string,
    keywordFilter: string
  ): Promise<AnalysisResult> => {
    try {
      const questionsJson = localStorage.getItem('analyzedQuestions');
      const topicsJson = localStorage.getItem('questionTopics');

      let questions: Question[] = questionsJson ? JSON.parse(questionsJson) : [];
      let topics: QuestionTopic[] = topicsJson ? JSON.parse(topicsJson) : [];

      // Apply filters
      if (yearFilter !== 'all_years') {
        questions = questions.filter(q => q.year === yearFilter);
      }
      if (topicFilter !== 'all_topics') {
        questions = questions.filter(q =>
          (q.topics && q.topics.some(t => t === topicFilter)) ||
          (q.keywords && q.keywords.some(k => k === topicFilter))
        );
      }
      if (keywordFilter) {
        const keyword = keywordFilter.toLowerCase();
        questions = questions.filter(q =>
          q.text.toLowerCase().includes(keyword) ||
          (q.keywords && q.keywords.some(k => k.toLowerCase().includes(keyword))) ||
          (q.topics && q.topics.some(t => t.toLowerCase().includes(keyword)))
        );
      }

      // Recalculate topics based on filtered questions
      const filteredTopicNames = new Set<string>();
      questions.forEach(q => {
        if (q.topics) {
          q.topics.forEach(t => filteredTopicNames.add(t));
        }
        if (q.keywords) {
          q.keywords.forEach(k => filteredTopicNames.add(k));
        }
      });

      // Filter topics to only include those present in filtered questions
      topics = topics.filter(t => filteredTopicNames.has(t.name));

      return { questions, topics };
    } catch (error) {
      console.error('Error getting filtered questions:', error);
      return { questions: [], topics: [] };
    }
  },
  clearQuestions: async () => {
    try {
      localStorage.removeItem('analyzedQuestions');
      localStorage.removeItem('questionTopics');
    } catch (error) {
      console.error('Error clearing saved questions:', error);
    }
  }
};
