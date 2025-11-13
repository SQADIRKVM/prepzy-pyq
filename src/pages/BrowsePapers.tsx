import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Filter, Plus, ChevronLeft, ChevronRight, Eye, Download, Merge, X, Bookmark, BookmarkCheck, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { searchPapers, QuestionPaper, fetchPaperAsFile } from "@/services/paperSearchService";
import { savedPapersService, SavedPaper } from "@/services/savedPapersService";
import Sidebar from "@/components/analyzer/Sidebar";
import PDFThumbnail from "@/components/analyzer/PDFThumbnail";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import { PDFDocument } from "pdf-lib";

const ITEMS_PER_PAGE = 9;

const BrowsePapers = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<QuestionPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [isMerging, setIsMerging] = useState(false);
  const [viewingPaper, setViewingPaper] = useState<QuestionPaper | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAddFilterDialog, setShowAddFilterDialog] = useState(false);
  const [customFilterInput, setCustomFilterInput] = useState("");
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Filter chips - dynamically generated from papers
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);

  // Load saved papers and recent searches on mount
  useEffect(() => {
    setSavedPapers(savedPapersService.getSavedPapers());
    setRecentSearches(savedPapersService.getRecentSearches());
  }, []);

  // Extract unique subjects/years/semesters/branches from papers for filter chips (main page)
  // Advanced filters (university, exam type, paper type, state, country) only in advanced filter dialog
  useEffect(() => {
    const filters = new Set<string>();
    papers.forEach(paper => {
      if (paper.subjectCode) filters.add(paper.subjectCode);
      if (paper.year && paper.year !== 'Unknown') filters.add(paper.year);
      if (paper.semester) filters.add(paper.semester);
      if (paper.branch) filters.add(paper.branch);
      // Don't add university, examType, paperType, state, country here - only in advanced filter
    });
    setAvailableFilters(Array.from(filters).slice(0, 20)); // Limit to 20 basic filters
  }, [papers]);

  // Filter papers based on active filter
  useEffect(() => {
    if (!activeFilter) {
      setFilteredPapers(papers);
      return;
    }

    const filtered = papers.filter(paper => 
      paper.subjectCode === activeFilter || 
      paper.year === activeFilter ||
      paper.semester === activeFilter ||
      paper.branch === activeFilter ||
      paper.university === activeFilter ||
      paper.examType === activeFilter ||
      paper.paperType === activeFilter ||
      paper.state === activeFilter ||
      paper.country === activeFilter ||
      paper.title.toLowerCase().includes(activeFilter.toLowerCase())
    );
    setFilteredPapers(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activeFilter, papers]);

  const handleAddCustomFilter = () => {
    if (customFilterInput.trim()) {
      const newFilter = customFilterInput.trim();
      if (!availableFilters.includes(newFilter)) {
        setAvailableFilters([...availableFilters, newFilter].slice(0, 12));
      }
      setActiveFilter(newFilter);
      setCustomFilterInput("");
      setShowAddFilterDialog(false);
      toast.success(`Filter "${newFilter}" added`);
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilter("");
    setShowFilterDialog(false);
    toast.info("All filters cleared");
  };

  // Pagination
  const totalPages = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPapers = filteredPapers.slice(startIndex, endIndex);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error("Please enter a subject code or keyword");
      return;
    }

    setIsLoading(true);
    setPapers([]);
    setFilteredPapers([]);
    setActiveFilter("");
    setCurrentPage(1);
    setSelectedPapers(new Set());

    try {
      const searchTerm = searchKeyword.trim();
      savedPapersService.addRecentSearch(searchTerm);
      setRecentSearches(savedPapersService.getRecentSearches());
      
      const results = await searchPapers(searchTerm);
      if (results.length > 0) {
        toast.success(`Found ${results.length} papers`);
      }
      setPapers(results);
      setFilteredPapers(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search papers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePaper = (paper: QuestionPaper) => {
    savedPapersService.savePaper(paper);
    setSavedPapers(savedPapersService.getSavedPapers());
    toast.success("Paper saved!");
  };

  const handleUnsavePaper = (paperId: string) => {
    savedPapersService.removePaper(paperId);
    setSavedPapers(savedPapersService.getSavedPapers());
    toast.info("Paper removed from saved");
  };

  const handleClearRecentSearches = () => {
    savedPapersService.clearRecentSearches();
    setRecentSearches([]);
    toast.info("Recent searches cleared");
  };

  const handleClearSavedPapers = () => {
    savedPapersService.clearSavedPapers();
    setSavedPapers([]);
    toast.info("All saved papers cleared");
  };

  const handleRecentSearchClick = async (searchTerm: string) => {
    setSearchKeyword(searchTerm);
    setIsLoading(true);
    setPapers([]);
    setFilteredPapers([]);
    setActiveFilter("");
    setCurrentPage(1);
    setSelectedPapers(new Set());

    try {
      savedPapersService.addRecentSearch(searchTerm);
      setRecentSearches(savedPapersService.getRecentSearches());
      
      const results = await searchPapers(searchTerm);
      if (results.length > 0) {
        toast.success(`Found ${results.length} papers`);
      }
      setPapers(results);
      setFilteredPapers(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search papers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const togglePaperSelection = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPapers.size === currentPapers.length) {
      setSelectedPapers(new Set());
    } else {
      const newSelected = new Set(currentPapers.map(p => p.id));
      setSelectedPapers(newSelected);
    }
  };

  const handleViewPaper = (paper: QuestionPaper) => {
    // Open PDF in dialog/modal
    setViewingPaper(paper);
  };

  const handleDownloadPaper = async (paper: QuestionPaper) => {
    try {
      toast.info(`Downloading ${paper.title}...`);
      const file = await fetchPaperAsFile(paper);
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading paper:", error);
      toast.error("Failed to download paper");
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPapers.size === 0) {
      toast.error("Please select at least one paper to download");
      return;
    }

    const papersToDownload = papers.filter(p => selectedPapers.has(p.id));
    
    try {
      toast.info(`Downloading ${papersToDownload.length} paper(s)...`);
      
      for (const paper of papersToDownload) {
        try {
          await handleDownloadPaper(paper);
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to download ${paper.title}:`, error);
        }
      }
      
      toast.success("Downloads completed");
    } catch (error) {
      console.error("Error downloading papers:", error);
      toast.error("Failed to download some papers");
    }
  };

  const handleMergeSelected = async () => {
    if (selectedPapers.size === 0) {
      toast.error("Please select at least one paper to merge");
      return;
    }

    if (selectedPapers.size === 1) {
      toast.warning("Please select at least 2 papers to merge");
      return;
    }

    const papersToMerge = papers.filter(p => selectedPapers.has(p.id));
    setIsMerging(true);
    
    try {
      toast.info(`Merging ${papersToMerge.length} papers...`);
      
      // Fetch all papers
      const files: File[] = [];
      for (const paper of papersToMerge) {
        try {
          const file = await fetchPaperAsFile(paper);
          files.push(file);
        } catch (error) {
          console.error(`Failed to fetch ${paper.title}:`, error);
          toast.warning(`Failed to fetch ${paper.title}, skipping...`);
        }
      }

      if (files.length === 0) {
        toast.error("Failed to fetch any papers");
        return;
      }

      // Merge PDFs using pdf-lib
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      // Generate merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Download merged PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `Merged_Papers_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Successfully merged ${files.length} papers!`);
    } catch (error) {
      console.error("Error merging papers:", error);
      toast.error("Failed to merge papers");
    } finally {
      setIsMerging(false);
    }
  };

  const handleAnalyzeSelected = async () => {
    if (selectedPapers.size === 0) {
      toast.error("Please select at least one paper to analyze");
      return;
    }

    const papersToAnalyze = papers.filter(p => selectedPapers.has(p.id));
    
    try {
      toast.info(`Fetching ${papersToAnalyze.length} paper(s)...`);
      
      // Fetch papers as File objects
      const files: File[] = [];
      for (const paper of papersToAnalyze) {
        try {
          const file = await fetchPaperAsFile(paper);
          files.push(file);
        } catch (error) {
          console.error(`Failed to fetch ${paper.title}:`, error);
          toast.warning(`Failed to fetch ${paper.title}, skipping...`);
        }
      }

      if (files.length === 0) {
        toast.error("Failed to fetch any papers");
        return;
      }

      // Navigate to analyzer and trigger processing
      navigate('/analyzer', { 
        state: { 
          filesToProcess: files,
          fromBrowse: true 
        } 
      });
    } catch (error) {
      console.error("Error analyzing papers:", error);
      toast.error("Failed to process papers");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarOpen', String(newValue));
      return newValue;
    });
  };

  const proxyUrl = viewingPaper ? (import.meta.env.PROD 
    ? `/api/proxy?url=${encodeURIComponent(viewingPaper.pdfUrl)}`
    : `http://localhost:3001/api/proxy?url=${encodeURIComponent(viewingPaper.pdfUrl)}`) : '';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingPaper} onOpenChange={(open) => !open && setViewingPaper(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-lg line-clamp-2">{viewingPaper?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
            {viewingPaper && (
              <iframe
                src={proxyUrl}
                className="w-full h-full border border-border rounded-lg"
                title={viewingPaper.title}
                style={{ minHeight: '70vh' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Separate Filter Sections - Only show if data exists */}
            {papers.length > 0 && (() => {
              const universities = Array.from(new Set(papers.map(p => p.university).filter(Boolean)))
                .filter(type => !/^(19|20)\d{2}$/.test(type));
              const examTypes = Array.from(new Set(papers.map(p => p.examType).filter(Boolean)))
                .filter(type => !/^(19|20)\d{2}$/.test(type));
              const paperTypes = Array.from(new Set(papers.map(p => p.paperType).filter(Boolean)))
                .filter(type => !/^(19|20)\d{2}$/.test(type));
              const states = Array.from(new Set(papers.map(p => p.state).filter(Boolean)))
                .filter(type => !/^(19|20)\d{2}$/.test(type));
              const countries = Array.from(new Set(papers.map(p => p.country).filter(Boolean)))
                .filter(type => !/^(19|20)\d{2}$/.test(type));
              
              return (
                <>
                  {/* University Section */}
                  {universities.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        University
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {universities.map((type) => (
                          <Badge
                            key={type}
                            variant={activeFilter === type ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === type ? "" : type);
                              setShowFilterDialog(false);
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exam Type Section */}
                  {examTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Exam Type
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {examTypes.map((type) => (
                          <Badge
                            key={type}
                            variant={activeFilter === type ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === type ? "" : type);
                              setShowFilterDialog(false);
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Paper Type Section */}
                  {paperTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Paper Type
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {paperTypes.map((type) => (
                          <Badge
                            key={type}
                            variant={activeFilter === type ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === type ? "" : type);
                              setShowFilterDialog(false);
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* State Section */}
                  {states.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        State
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {states.map((type) => (
                          <Badge
                            key={type}
                            variant={activeFilter === type ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === type ? "" : type);
                              setShowFilterDialog(false);
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Country Section */}
                  {countries.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Country
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {countries.map((type) => (
                          <Badge
                            key={type}
                            variant={activeFilter === type ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === type ? "" : type);
                              setShowFilterDialog(false);
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Other Filters Section */}
            <div>
              <p className="text-sm font-semibold mb-3">Other Filters:</p>
              <div className="flex flex-wrap gap-2">
                {availableFilters.length > 0 ? (
                  availableFilters
                    .filter(f => {
                      // Exclude university/exam types/paper types/states/countries from this section (already shown above)
                      const universities = new Set(papers.map(p => p.university).filter(Boolean));
                      const examTypes = new Set(papers.map(p => p.examType).filter(Boolean));
                      const paperTypes = new Set(papers.map(p => p.paperType).filter(Boolean));
                      const states = new Set(papers.map(p => p.state).filter(Boolean));
                      const countries = new Set(papers.map(p => p.country).filter(Boolean));
                      return !universities.has(f) && !examTypes.has(f) && !paperTypes.has(f) && !states.has(f) && !countries.has(f);
                    })
                    .map((filter) => (
                      <Badge
                        key={filter}
                        variant={activeFilter === filter ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setActiveFilter(activeFilter === filter ? "" : filter);
                          setShowFilterDialog(false);
                        }}
                      >
                        {filter}
                      </Badge>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No filters available. Search for papers first.</p>
                )}
              </div>
            </div>

            {activeFilter && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Active filter: <span className="font-medium text-foreground">{activeFilter}</span>
                </p>
                <Button variant="outline" size="sm" onClick={handleClearAllFilters} className="w-full">
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Filter Dialog */}
      <Dialog open={showAddFilterDialog} onOpenChange={setShowAddFilterDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Custom Filter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Add a custom filter keyword (e.g., subject code, year, semester, branch)
              </p>
              <Input
                placeholder="Enter filter keyword..."
                value={customFilterInput}
                onChange={(e) => setCustomFilterInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomFilter();
                  }
                }}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowAddFilterDialog(false);
                setCustomFilterInput("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomFilter} disabled={!customFilterInput.trim()}>
                Add Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <Sidebar 
        stats={{ totalQuestions: 0, totalSubjects: 0, totalTopics: 0 }}
        onNewUpload={() => navigate('/analyzer')}
        onLoadResult={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-0"
      )}>
        {/* Top Bar */}
        <div className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-3 sm:px-4 md:px-6 bg-card/50 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-9 md:w-9"
              onClick={toggleSidebar}
            >
              <PanelLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <h1 className="text-lg md:text-xl font-bold">Browse Question Papers</h1>
          </div>
          {papers.length > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1">
              {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
            </Badge>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by keyword..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-11 bg-card/50 border-border"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-11 px-6 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-11 w-11"
                  onClick={() => setShowFilterDialog(true)}
                  title="Advanced Filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-11 w-11"
                  onClick={() => setShowAddFilterDialog(true)}
                  title="Add Custom Filter"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Chips */}
            {availableFilters.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {availableFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(activeFilter === filter ? "" : filter)}
                    className={cn(
                      "h-8 text-xs",
                      activeFilter === filter && "bg-primary text-primary-foreground"
                    )}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4 bg-card/50 border-border animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </Card>
                ))}
              </div>
            ) : currentPapers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                  {currentPapers.map((paper) => (
                    <Card
                      key={paper.id}
                      className={cn(
                        "p-0 bg-card/50 border-border hover:border-primary/50 transition-all relative overflow-hidden",
                        selectedPapers.has(paper.id) && "ring-2 ring-primary"
                      )}
                    >
                      {/* Thumbnail Preview */}
                      <div className="relative h-48 bg-muted/30 overflow-hidden group">
                        {/* PDF Thumbnail using PDF.js */}
                        <PDFThumbnail 
                          pdfUrl={paper.pdfUrl}
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                        
                        {/* Checkbox */}
                        <div className="absolute top-2 right-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedPapers.has(paper.id)}
                            onChange={() => togglePaperSelection(paper.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded border-2 border-background bg-background/90 shadow-lg cursor-pointer hover:bg-primary/20 transition-colors"
                          />
                        </div>
                        
                        {/* Save/Unsave Button */}
                        <div className="absolute top-2 left-2 z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (savedPapersService.isPaperSaved(paper.id)) {
                                handleUnsavePaper(paper.id);
                              } else {
                                handleSavePaper(paper);
                              }
                            }}
                          >
                            {savedPapersService.isPaperSaved(paper.id) ? (
                              <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                          {paper.title}
                        </h3>
                        
                        <div className="space-y-1 mb-4">
                          <p className="text-xs text-muted-foreground">
                            Subject: {paper.subjectCode || paper.year}
                          </p>
                          {paper.semester && (
                            <p className="text-xs text-muted-foreground">
                              Semester: {paper.semester}
                            </p>
                          )}
                          {paper.branch && (
                            <p className="text-xs text-muted-foreground">
                              Branch: {paper.branch}
                            </p>
                          )}
                          {paper.year && paper.year !== 'Unknown' && (
                            <p className="text-xs text-muted-foreground">
                              Year: {paper.year}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPaper(paper);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPaper(paper);
                            }}
                          >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Action Bar */}
                {selectedPapers.size > 0 && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <Card className="p-4 bg-card border-border shadow-lg">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium">
                          Selected: {selectedPapers.size} paper(s)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPapers(new Set())}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadSelected}
                          >
                            <Download className="h-4 w-4 mr-1.5" />
                            Download
                          </Button>
                          {selectedPapers.size > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleMergeSelected}
                              disabled={isMerging}
                            >
                              <Merge className="h-4 w-4 mr-1.5" />
                              {isMerging ? "Merging..." : "Merge"}
                            </Button>
                          )}
                          <Button
                            onClick={handleAnalyzeSelected}
                            className="bg-primary hover:bg-primary/90"
                            size="sm"
                          >
                            Analyze →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            ) : papers.length === 0 ? (
              <div className="space-y-8">
                {/* Show "No papers found" if a search was performed */}
                {searchKeyword.trim() ? (
                  <div className="space-y-6">
                    {/* Main Empty State */}
                    <Card className="p-8 bg-card/50 border-border text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold">No papers found</h3>
                        <p className="text-muted-foreground text-sm">
                          No papers found for your search. Search for another type or try a different subject code.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchKeyword("");
                            setPapers([]);
                            setFilteredPapers([]);
                          }}
                          className="mt-4"
                        >
                          Clear Search
                        </Button>
                      </div>
                    </Card>

                    {/* KTU DSpace Notice Banner */}
                    <div className="bg-yellow-500/20 dark:bg-yellow-600/20 border-l-4 border-yellow-500 dark:border-yellow-600 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            <span className="font-semibold">Notice:</span> Currently supporting <span className="font-semibold">KTU University</span> only. More sources coming soon!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Recent Searches Section */}
                    {recentSearches.length > 0 && (
                      <Card className="p-6 bg-card/50 border-border">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Recent Searches</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearRecentSearches}
                            className="text-xs text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleRecentSearchClick(search)}
                              className="h-9 text-sm"
                            >
                              <Search className="h-3.5 w-3.5 mr-2" />
                              {search}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Saved Papers Section */}
                    {savedPapers.length > 0 && (
                      <Card className="p-6 bg-card/50 border-border">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Saved Papers ({savedPapers.length})</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSavedPapers}
                            className="text-xs text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Clear All
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {savedPapers.slice(0, 6).map((paper) => (
                            <Card
                              key={paper.id}
                              className="p-0 bg-card/50 border-border hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
                              onClick={() => handleViewPaper(paper)}
                            >
                              {/* Thumbnail Preview */}
                              <div className="relative h-48 bg-muted/30 overflow-hidden">
                                <PDFThumbnail 
                                  pdfUrl={paper.pdfUrl}
                                  className="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                                
                                {/* Unsave Button */}
                                <div className="absolute top-2 right-2 z-10">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnsavePaper(paper.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-sm line-clamp-2 flex-1 min-h-[2.5rem]">{paper.title}</h4>
                                </div>
                                <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                                  {paper.subjectCode && <p>Subject: {paper.subjectCode}</p>}
                                  {paper.semester && <p>Semester: {paper.semester}</p>}
                                  {paper.branch && <p>Branch: {paper.branch}</p>}
                                  {paper.year && paper.year !== 'Unknown' && <p>Year: {paper.year}</p>}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewPaper(paper);
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadPaper(paper);
                                    }}
                                  >
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                        {savedPapers.length > 6 && (
                          <p className="text-sm text-muted-foreground mt-4 text-center">
                            And {savedPapers.length - 6} more saved papers...
                          </p>
                        )}
                      </Card>
                    )}

                    {/* Empty State Message - only show if no recent searches and no saved papers */}
                    {recentSearches.length === 0 && savedPapers.length === 0 && (
                      <div className="space-y-6">
                        {/* Main Empty State */}
                        <Card className="p-8 bg-card/50 border-border text-center">
                          <div className="max-w-md mx-auto space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                              <Search className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">Start Your Search</h3>
                            <p className="text-muted-foreground text-sm">
                              Enter a subject code or keyword in the search bar above to find question papers
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-6">
                              <Badge variant="secondary" className="text-xs px-3 py-1">
                                Example: CS301
                              </Badge>
                              <Badge variant="secondary" className="text-xs px-3 py-1">
                                Example: PH101
                              </Badge>
                              <Badge variant="secondary" className="text-xs px-3 py-1">
                                Example: EC301
                              </Badge>
                            </div>
                          </div>
                        </Card>

                        {/* KTU DSpace Notice Banner */}
                        <div className="bg-yellow-500/20 dark:bg-yellow-600/20 border-l-4 border-yellow-500 dark:border-yellow-600 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                <span className="font-semibold">Notice:</span> Currently supporting <span className="font-semibold">KTU University</span> only. More sources coming soon!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No papers found</h3>
                <p className="text-muted-foreground mb-4">
                  No papers match the selected filter. Try a different filter or search term.
                </p>
                {activeFilter && (
                  <Button
                    variant="outline"
                    onClick={() => setActiveFilter("")}
                    className="mt-4"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePapers;

