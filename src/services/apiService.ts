import { extractQuestionsFromText, extractTextFromPDF, ExtractedText } from './pdfService';
import { performOCR, extractTextFromPDFViaOCR } from './ocrService';
import { databaseService } from './databaseService';
import { findRelatedVideos } from './youtubeService';
import { Question, AnalysisResult, QuestionTopic } from '@/pages/analyzer/types';
import { enhanceText, analyzeQuestions } from './deepSeekService';
import { toast } from 'sonner';

// Helper function to extract year from text
function extractYearFromText(text: string): string | null {
  // Common year patterns
  const yearPatterns = [
    /\b20\d{2}\b/, // Regular year like 2021
    /\b20\d{2}-\d{2,4}\b/, // Year range like 2021-22 or 2021-2022
    /\b20\d{2}\/\d{2,4}\b/, // Year range with slash like 2021/22
    /\b20\d{2}\s*\(\s*\d{2,4}\s*\)/, // Year with bracket like 2021(22)
    /\b20\d{2}\s*batch\b/i, // Year with batch like 2021 Batch
    /\b20\d{2}\s*scheme\b/i // Year with scheme like 2021 Scheme
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract just the first 4-digit year
      const yearMatch = match[0].match(/\b20\d{2}\b/);
      if (yearMatch) {
        return yearMatch[0];
      }
    }
  }

  return null;
}

/**
 * API service for processing documents and managing questions
 * In a real app, this would call backend API endpoints
 */
export const apiService = {
  /**
   * Process multiple PDF files to extract questions
   */
  processMultiplePdfFiles: async (
    files: File[],
    onProgress: (progress: number, step: string, currentFile?: number, totalFiles?: number) => void
  ): Promise<AnalysisResult> => {
    const allQuestions: Question[] = [];
    const allTopicsMap = new Map<string, { count: number, questions: string[] }>();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = (i / files.length) * 100;
      const fileProgressRange = 100 / files.length;
      
      onProgress(
        fileProgress,
        `Processing file ${i + 1} of ${files.length}: ${file.name}`,
        i + 1,
        files.length
      );
      
      try {
        // Process each file with adjusted progress callback
        const result = await apiService.processPdfFile(
          file,
          (progress, step) => {
            // Scale progress to fit within this file's range
            const scaledProgress = fileProgress + (progress * fileProgressRange / 100);
            onProgress(
              scaledProgress,
              `[File ${i + 1}/${files.length}] ${step}`,
              i + 1,
              files.length
            );
          }
        );
        
        // Aggregate questions
        allQuestions.push(...result.questions);
        
        // Aggregate topics
        result.topics.forEach(topic => {
          if (!allTopicsMap.has(topic.name)) {
            allTopicsMap.set(topic.name, { count: 0, questions: [] });
          }
          const topicData = allTopicsMap.get(topic.name)!;
          topicData.count += topic.count;
          topicData.questions.push(...topic.questions);
        });
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files even if one fails
        onProgress(
          fileProgress + fileProgressRange,
          `Failed to process ${file.name}, continuing with other files...`,
          i + 1,
          files.length
        );
      }
    }
    
    // Convert topics map to array
    const topicsArray: QuestionTopic[] = Array.from(allTopicsMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        questions: Array.from(new Set(data.questions)) // Remove duplicates
      }))
      .filter(topic => topic.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const result: AnalysisResult = {
      questions: allQuestions,
      topics: topicsArray
    };
    
    // Save aggregated results (use first file name or combined name)
    const combinedFilename = files.length > 1 
      ? `${files.length} files (${files.map(f => f.name).join(', ')})`
      : files[0]?.name || 'Multiple Files';
    await databaseService.saveQuestions(result, combinedFilename);
    
    return result;
  },

  /**
   * Process a PDF file to extract questions
   */
  processPdfFile: async (
    file: File, 
    onProgress: (progress: number, step: string) => void
  ): Promise<AnalysisResult> => {
    try {
      // 1. Extract text from PDF (30%)
      onProgress(10, "Extracting text from PDF...");
      const extractedText = await extractTextFromPDF(file);
      onProgress(30, "PDF text extraction complete");
      
      // 2. Enhance text with AI (50%)
      onProgress(35, "Enhancing text with AI...");
      const combinedText = extractedText.map(page => page.text).join('\n\n');
      const enhancedTextResult = await enhanceText(combinedText);
      onProgress(50, "AI text enhancement complete");
      
      // 3. Analyze questions with AI (70%)
      onProgress(55, "Analyzing questions with AI...");
      const analysisResult = await analyzeQuestions(enhancedTextResult);
      
      // If the AI analysis was successful, convert to our Question format
      const extractedQuestions: Question[] = [];
      
      if (Array.isArray(analysisResult) && analysisResult.length > 0) {
        // Use AI-analyzed questions
        // Extract year from the first question's year field or from text (all questions from same paper should have same year)
        const extractedYear = analysisResult[0]?.year || extractYearFromText(combinedText) || "Unknown";
        
        analysisResult.forEach((item, index) => {
          if (item.questionText) {
            extractedQuestions.push({
              id: `q-${Date.now()}-${index}`,
              text: item.questionText,
              year: item.year || extractedYear, // Use year from AI analysis or extracted year
              subject: item.subject || "General",
              topics: Array.isArray(item.topics) ? item.topics : [],
              keywords: Array.isArray(item.keywords) ? item.keywords : [],
            });
          }
        });
      } else {
        // Fall back to the original question extraction method
        const enhancedText: ExtractedText[] = [{ 
          text: enhancedTextResult, 
          pageNumber: 1 
        }];
        
        const fallbackQuestions = await extractQuestionsFromText(enhancedText);
        extractedQuestions.push(...fallbackQuestions);
      }
      
      onProgress(70, "Question analysis complete");
      
      // 4. Find related videos for each question (100%)
      onProgress(75, "Finding related educational videos...");
      const enhancedQuestions = [];
      
      for (let i = 0; i < extractedQuestions.length; i++) {
        const question = extractedQuestions[i];
        const questionWithVideos = await findRelatedVideos(question);
        enhancedQuestions.push(questionWithVideos);
        
        // Update progress incrementally
        const progressIncrement = 25 * ((i + 1) / extractedQuestions.length);
        onProgress(75 + progressIncrement, `Processing question ${i+1} of ${extractedQuestions.length}`);
      }
      
      // 5. Identify common topics across questions
      const topics = extractCommonTopics(enhancedQuestions);
      
      // 6. Save to database
      const result: AnalysisResult = {
        questions: enhancedQuestions,
        topics
      };
      
      await databaseService.saveQuestions(result, file.name);
      
      return result;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  /**
   * Process an image file using OCR to extract questions
   */
  processImageFile: async (
    file: File,
    onProgress: (progress: number, step: string) => void
  ): Promise<AnalysisResult> => {
    try {
      // 1. Perform OCR on image (40%)
      onProgress(10, "Performing OCR on image...");
      const ocrResult = await performOCR(file);
      onProgress(40, "OCR processing complete");
      
      // 2. Enhance extracted text with AI (60%)
      onProgress(45, "Enhancing and correcting OCR text with AI...");
      const enhancedText = await enhanceText(ocrResult.text);
      onProgress(60, "AI text enhancement complete");
      
      // 3. Analyze questions with AI (80%)
      onProgress(65, "Analyzing questions with AI...");
      const analysisResult = await analyzeQuestions(enhancedText);
      
      // If AI analysis was successful, convert to our Question format
      let extractedQuestions: Question[] = [];
      
      if (Array.isArray(analysisResult) && analysisResult.length > 0) {
        // Use AI-analyzed questions
        // Extract year from the first question's year field or from text (all questions from same paper should have same year)
        const extractedYear = analysisResult[0]?.year || extractYearFromText(enhancedText) || "Unknown";
        
        analysisResult.forEach((item, index) => {
          if (item.questionText) {
            extractedQuestions.push({
              id: `q-${Date.now()}-${index}`,
              text: item.questionText,
              year: item.year || extractedYear, // Use year from AI analysis or extracted year
              subject: item.subject || "General",
              topics: Array.isArray(item.topics) ? item.topics : [],
              keywords: Array.isArray(item.keywords) ? item.keywords : [],
            });
          }
        });
      } else {
        // Fall back to the original question extraction method
        const extractedTextForFallback: ExtractedText[] = [{ 
          text: enhancedText, 
          pageNumber: 1 
        }];
        
        extractedQuestions = await extractQuestionsFromText(extractedTextForFallback);
      }
      
      onProgress(80, "Questions identified and analyzed");
      
      // 4. Find related videos for each question (100%)
      onProgress(85, "Finding related educational videos...");
      const enhancedQuestions = [];
      
      for (let i = 0; i < extractedQuestions.length; i++) {
        const question = extractedQuestions[i];
        const questionWithVideos = await findRelatedVideos(question);
        enhancedQuestions.push(questionWithVideos);
        
        // Update progress incrementally
        const progressIncrement = 15 * ((i + 1) / extractedQuestions.length);
        onProgress(85 + progressIncrement, `Processing question ${i+1} of ${extractedQuestions.length}`);
      }
      
      // 5. Identify common topics across questions
      const topics = extractCommonTopics(enhancedQuestions);
      
      // 6. Save to database
      const result: AnalysisResult = {
        questions: enhancedQuestions,
        topics
      };
      
      await databaseService.saveQuestions(result, file.name);
      
      return result;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  /**
   * Process a PDF file using the OCR approach (convert to images first)
   */
  processPdfWithOCR: async (
    file: File,
    onProgress: (progress: number, step: string) => void
  ): Promise<AnalysisResult> => {
    try {
      // 1. Convert PDF to images and perform OCR (50%)
      onProgress(10, "Converting PDF to images for OCR...");
      const extractedText = await extractTextFromPDFViaOCR(file);
      onProgress(50, "PDF-to-image OCR complete");
      
      // 2. Analyze questions with AI (70%)
      onProgress(55, "Analyzing questions with AI...");
      const analysisResult = await analyzeQuestions(extractedText);
      
      // If the AI analysis was successful, convert to our Question format
      let extractedQuestions: Question[] = [];
      
      if (Array.isArray(analysisResult) && analysisResult.length > 0) {
        // Use AI-analyzed questions
        // Extract year from the first question's year field or from text (all questions from same paper should have same year)
        const extractedYear = analysisResult[0]?.year || extractYearFromText(extractedText) || "Unknown";
        
        analysisResult.forEach((item, index) => {
          if (item.questionText) {
            extractedQuestions.push({
              id: `q-${Date.now()}-${index}`,
              text: item.questionText,
              year: item.year || extractedYear, // Use year from AI analysis or extracted year
              subject: item.subject || "General",
              topics: Array.isArray(item.topics) ? item.topics : [],
              keywords: Array.isArray(item.keywords) ? item.keywords : [],
            });
          }
        });
      } else {
        // Fall back to the original question extraction method
        const extractedTextForFallback: ExtractedText[] = [{ 
          text: extractedText, 
          pageNumber: 1 
        }];
        
        extractedQuestions = await extractQuestionsFromText(extractedTextForFallback);
      }
      
      onProgress(70, "Question analysis complete");
      
      // 3. Find related videos for each question (100%)
      onProgress(75, "Finding related educational videos...");
      const enhancedQuestions = [];
      
      for (let i = 0; i < extractedQuestions.length; i++) {
        const question = extractedQuestions[i];
        const questionWithVideos = await findRelatedVideos(question);
        enhancedQuestions.push(questionWithVideos);
        
        // Update progress incrementally
        const progressIncrement = 25 * ((i + 1) / extractedQuestions.length);
        onProgress(75 + progressIncrement, `Processing question ${i+1} of ${extractedQuestions.length}`);
      }
      
      // 4. Identify common topics across questions
      const topics = extractCommonTopics(enhancedQuestions);
      
      // 5. Save to database
      const result: AnalysisResult = {
        questions: enhancedQuestions,
        topics
      };
      
      await databaseService.saveQuestions(result, file.name);
      
      return result;
    } catch (error) {
      console.error("Error processing PDF with OCR:", error);
      throw new Error(`Failed to process PDF with OCR: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  /**
   * Get all questions from the database
   */
  getQuestions: async (): Promise<AnalysisResult> => {
    return await databaseService.getQuestions();
  },
  
  /**
   * Get filtered questions from the database
   */
  getFilteredQuestions: async (
    yearFilter: string,
    topicFilter: string,
    keywordFilter: string
  ): Promise<AnalysisResult> => {
    return await databaseService.getQuestionsByFilter(
      yearFilter,
      topicFilter,
      keywordFilter
    );
  }
};

/**
 * Extract common topics across multiple questions
 */
function extractCommonTopics(questions: Question[]): QuestionTopic[] {
  // Initialize topics map
  const topicsMap = new Map<string, { count: number, questions: string[] }>();
  
  // Process topics from each question
  questions.forEach(question => {
    // Process explicit topics if available
    if (question.topics && question.topics.length > 0) {
      question.topics.forEach(topic => {
        if (!topicsMap.has(topic)) {
          topicsMap.set(topic, { count: 0, questions: [] });
        }
        
        const topicData = topicsMap.get(topic)!;
        topicData.count += 1;
        topicData.questions.push(question.id);
      });
    } 
    // Otherwise use keywords
    else if (question.keywords && question.keywords.length > 0) {
      question.keywords.forEach(keyword => {
        if (!topicsMap.has(keyword)) {
          topicsMap.set(keyword, { count: 0, questions: [] });
        }
        
        const topicData = topicsMap.get(keyword)!;
        topicData.count += 1;
        topicData.questions.push(question.id);
      });
    }
  });
  
  // Convert map to array and sort by frequency
  const topicsArray: QuestionTopic[] = Array.from(topicsMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      questions: data.questions
    }))
    .filter(topic => topic.count > 1) // Only include topics that appear in multiple questions
    .sort((a, b) => b.count - a.count) // Sort by count (descending)
    .slice(0, 10); // Limit to top 10 topics
  
  return topicsArray;
}
