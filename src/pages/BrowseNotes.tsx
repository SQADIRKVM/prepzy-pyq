import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Filter, Plus, ChevronLeft, ChevronRight, Eye, Download, X, Bookmark, BookmarkCheck, Clock, Trash2, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { searchNotes, Note, fetchNoteAsFile, getNoteProxyUrl } from "@/services/notesSearchService";
import { savedNotesService, SavedNote } from "@/services/savedNotesService";
import Sidebar from "@/components/analyzer/Sidebar";
import NoteThumbnail from "@/components/notes/NoteThumbnail";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import { PDFDocument } from "pdf-lib";

const ITEMS_PER_PAGE = 9;

const BrowseNotes = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [isMerging, setIsMerging] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Filter chips - dynamically generated from notes
  const [availableFilters, setAvailableFilters] = useState<string[]>([]);

  // Load saved notes and recent searches on mount
  useEffect(() => {
    setSavedNotes(savedNotesService.getSavedNotes());
    setRecentSearches(savedNotesService.getRecentSearches());
  }, []);

  // Extract unique subjects/semesters/branches/schemes from notes for filter chips
  useEffect(() => {
    const filters = new Set<string>();
    notes.forEach(note => {
      if (note.subjectCode) filters.add(note.subjectCode);
      if (note.semester) filters.add(`S${note.semester}`);
      if (note.branch) filters.add(note.branch);
      if (note.scheme) filters.add(note.scheme);
      if (note.source) filters.add(note.source);
    });
    setAvailableFilters(Array.from(filters).slice(0, 20)); // Limit to 20 basic filters
  }, [notes]);

  // Filter notes based on active filter
  useEffect(() => {
    if (!activeFilter) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(note => 
      note.subjectCode === activeFilter || 
      note.semester === activeFilter ||
      `S${note.semester}` === activeFilter ||
      note.branch === activeFilter ||
      note.scheme === activeFilter ||
      note.source === activeFilter ||
      note.title.toLowerCase().includes(activeFilter.toLowerCase())
    );
    setFilteredNotes(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activeFilter, notes]);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setNotes([]);
    setFilteredNotes([]);
    setActiveFilter("");
    setCurrentPage(1);

    try {
      const searchTerm = searchKeyword.trim();
      savedNotesService.addRecentSearch(searchTerm);
      setRecentSearches(savedNotesService.getRecentSearches());
      
      const results = await searchNotes(searchTerm);
      if (results.length > 0) {
        toast.success(`Found ${results.length} notes`);
      }
      setNotes(results);
      setFilteredNotes(results);
    } catch (error: any) {
      console.error("Search error:", error);
      const errorMessage = error?.message || "Failed to search notes";
      
      if (errorMessage.includes('Proxy server not available') || errorMessage.includes('404')) {
        toast.error("Proxy server not running. Please start it: cd src/server && npm start", {
          duration: 6000
        });
      } else {
        toast.error(errorMessage || "Failed to search notes. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = async (searchTerm: string) => {
    setSearchKeyword(searchTerm);
    setIsLoading(true);
    setNotes([]);
    setFilteredNotes([]);
    setActiveFilter("");
    setCurrentPage(1);

    try {
      savedNotesService.addRecentSearch(searchTerm);
      setRecentSearches(savedNotesService.getRecentSearches());
      
      const results = await searchNotes(searchTerm);
      if (results.length > 0) {
        toast.success(`Found ${results.length} notes`);
      }
      setNotes(results);
      setFilteredNotes(results);
    } catch (error: any) {
      console.error("Search error:", error);
      const errorMessage = error?.message || "Failed to search notes";
      
      if (errorMessage.includes('Proxy server not available') || errorMessage.includes('404')) {
        toast.error("Proxy server not running. Please start it: cd src/server && npm start", {
          duration: 6000
        });
      } else {
        toast.error(errorMessage || "Failed to search notes. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSaveNote = (note: Note) => {
    savedNotesService.saveNote(note);
    setSavedNotes(savedNotesService.getSavedNotes());
    toast.success("Note saved!");
  };

  const handleUnsaveNote = (noteId: string) => {
    savedNotesService.removeNote(noteId);
    setSavedNotes(savedNotesService.getSavedNotes());
    toast.success("Note removed from saved");
  };

  const handleClearRecentSearches = () => {
    savedNotesService.clearRecentSearches();
    setRecentSearches([]);
    toast.info("Recent searches cleared");
  };

  const handleClearSavedNotes = () => {
    savedNotesService.clearSavedNotes();
    setSavedNotes([]);
    toast.info("All saved notes cleared");
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
  };

  const handleDownloadNote = async (note: Note) => {
    try {
      toast.info("Downloading note...");
      const blob = await fetchNoteAsFile(note.pdfUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename from note title and module
      const filename = `${note.title}${note.module ? '_Module' + note.module : ''}.pdf`
        .replace(/[^a-z0-9_\-\.]/gi, '_') // Replace invalid chars
        .replace(/_+/g, '_'); // Remove multiple underscores
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Note downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download note");
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = () => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const currentNotes = filteredNotes.slice(startIdx, endIdx);
    if (selectedNotes.size === currentNotes.length) {
      setSelectedNotes(new Set());
    } else {
      const newSelected = new Set(currentNotes.map(n => n.id));
      setSelectedNotes(newSelected);
    }
  };

  const handleMergeSelected = async () => {
    if (selectedNotes.size === 0) {
      toast.error("Please select at least one note to merge");
      return;
    }

    if (selectedNotes.size === 1) {
      toast.warning("Please select at least 2 notes to merge");
      return;
    }

    const notesToMerge = notes.filter(n => selectedNotes.has(n.id));
    setIsMerging(true);
    
    try {
      toast.info(`Merging ${notesToMerge.length} notes...`);
      
      // Fetch all notes
      const files: File[] = [];
      for (const note of notesToMerge) {
        try {
          const blob = await fetchNoteAsFile(note.pdfUrl);
          const file = new File([blob], `${note.title}.pdf`, { type: 'application/pdf' });
          files.push(file);
        } catch (error) {
          console.error(`Failed to fetch ${note.title}:`, error);
          toast.warning(`Failed to fetch ${note.title}, skipping...`);
        }
      }

      if (files.length === 0) {
        toast.error("Failed to fetch any notes");
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
      a.download = `Merged_Notes_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Successfully merged ${files.length} notes!`);
      setSelectedNotes(new Set());
    } catch (error) {
      console.error("Error merging notes:", error);
      toast.error("Failed to merge notes");
    } finally {
      setIsMerging(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarOpen', String(newValue));
      return newValue;
    });
  };

  const proxyUrl = viewingNote ? getNoteProxyUrl(viewingNote.pdfUrl, 'preview') : '';

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotes = filteredNotes.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-lg line-clamp-2">{viewingNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
            {viewingNote && (
              <iframe
                src={proxyUrl}
                className="w-full h-full border border-border rounded-lg"
                title={viewingNote.title}
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
            {notes.length > 0 && (() => {
              const schemes = Array.from(new Set(notes.map(n => n.scheme).filter(Boolean)));
              const branches = Array.from(new Set(notes.map(n => n.branch).filter(Boolean)));
              const sources = Array.from(new Set(notes.map(n => n.source).filter(Boolean)));
              
              return (
                <>
                  {/* Scheme Section */}
                  {schemes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Scheme
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {schemes.map((scheme) => (
                          <Badge
                            key={scheme}
                            variant={activeFilter === scheme ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === scheme ? "" : scheme);
                              setShowFilterDialog(false);
                            }}
                          >
                            {scheme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Branch Section */}
                  {branches.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Branch
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {branches.map((branch) => (
                          <Badge
                            key={branch}
                            variant={activeFilter === branch ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === branch ? "" : branch);
                              setShowFilterDialog(false);
                            }}
                          >
                            {branch}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source Section */}
                  {sources.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Source
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sources.map((source) => (
                          <Badge
                            key={source}
                            variant={activeFilter === source ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setActiveFilter(activeFilter === source ? "" : source);
                              setShowFilterDialog(false);
                            }}
                          >
                            {source}
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
                      const schemes = new Set(notes.map(n => n.scheme).filter(Boolean));
                      const branches = new Set(notes.map(n => n.branch).filter(Boolean));
                      const sources = new Set(notes.map(n => n.source).filter(Boolean));
                      return !schemes.has(f) && !branches.has(f) && !sources.has(f);
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
                  <p className="text-sm text-muted-foreground">No filters available</p>
                )}
              </div>
            </div>

            {activeFilter && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Active filter: <span className="font-medium text-foreground">{activeFilter}</span>
                </p>
                <Button variant="outline" size="sm" onClick={() => setActiveFilter("")} className="w-full">
                  Clear Filter
                </Button>
              </div>
            )}
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
            <h1 className="text-lg md:text-xl font-bold">Browse Notes</h1>
          </div>
          {notes.length > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
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
                    placeholder="Search by subject code, keyword..."
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
            ) : currentNotes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                  {currentNotes.map((note) => (
                    <Card
                      key={note.id}
                      className={cn(
                        "p-0 bg-card/50 border-border hover:border-primary/50 transition-all relative overflow-hidden",
                        selectedNotes.has(note.id) && "ring-2 ring-primary"
                      )}
                    >
                      {/* Thumbnail Preview */}
                      <div className="relative h-48 bg-muted/30 overflow-hidden group">
                        <NoteThumbnail 
                          pdfUrl={note.pdfUrl}
                          className="w-full h-full"
                          subjectCode={note.subjectCode || note.title}
                          module={note.module}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                        
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 right-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedNotes.has(note.id)}
                            onChange={() => toggleNoteSelection(note.id)}
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
                              if (savedNotesService.isNoteSaved(note.id)) {
                                handleUnsaveNote(note.id);
                              } else {
                                handleSaveNote(note);
                              }
                            }}
                          >
                            {savedNotesService.isNoteSaved(note.id) ? (
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
                          {note.title}
                        </h3>
                        
                        <div className="space-y-1 mb-4">
                          <p className="text-xs text-muted-foreground">
                            Subject: {note.subjectCode}
                          </p>
                          {note.semester && (
                            <p className="text-xs text-muted-foreground">
                              Semester: S{note.semester}
                            </p>
                          )}
                          {note.branch && (
                            <p className="text-xs text-muted-foreground">
                              Branch: {note.branch}
                            </p>
                          )}
                          {note.scheme && (
                            <p className="text-xs text-muted-foreground">
                              Scheme: {note.scheme}
                            </p>
                          )}
                          {note.module && (
                            <p className="text-xs text-muted-foreground">
                              {note.module}
                            </p>
                          )}
                          {note.source && (
                            <p className="text-xs text-muted-foreground">
                              Source: {note.source}
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
                              handleViewNote(note);
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
                              handleDownloadNote(note);
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

                {/* Action Bar */}
                {selectedNotes.size > 0 && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <Card className="p-4 bg-card border-border shadow-lg">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium">
                          Selected: {selectedNotes.size} note(s)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedNotes(new Set())}
                          >
                            <X className="h-4 w-4 mr-1.5" />
                            Clear
                          </Button>
                          {selectedNotes.size > 1 && (
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
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

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
              </>
            ) : notes.length === 0 ? (
              <div className="space-y-8">
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

                {/* Saved Notes Section */}
                {savedNotes.length > 0 && (
                  <Card className="p-6 bg-card/50 border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Saved Notes ({savedNotes.length})</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSavedNotes}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedNotes.slice(0, 6).map((note) => (
                        <Card
                          key={note.id}
                          className={cn(
                            "p-0 bg-card/50 border-border hover:border-primary/50 transition-all cursor-pointer group overflow-hidden",
                            selectedNotes.has(note.id) && "ring-2 ring-primary"
                          )}
                          onClick={() => handleViewNote(note)}
                        >
                          {/* Thumbnail Preview */}
                          <div className="relative h-48 bg-muted/30 overflow-hidden">
                            <NoteThumbnail 
                              pdfUrl={note.pdfUrl}
                              className="w-full h-full"
                              subjectCode={note.subjectCode || note.title}
                              module={note.module}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                            
                            {/* Selection Checkbox */}
                            <div className="absolute top-2 right-2 z-10">
                              <input
                                type="checkbox"
                                checked={selectedNotes.has(note.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleNoteSelection(note.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5 rounded border-2 border-background bg-background/90 shadow-lg cursor-pointer hover:bg-primary/20 transition-colors"
                              />
                            </div>
                            
                            {/* Unsave Button */}
                            <div className="absolute top-2 left-2 z-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnsaveNote(note.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm line-clamp-2 flex-1 min-h-[2.5rem]">{note.title}</h4>
                            </div>
                            <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                              {note.subjectCode && <p>Subject: {note.subjectCode}</p>}
                              {note.semester && <p>Semester: S{note.semester}</p>}
                              {note.branch && <p>Branch: {note.branch}</p>}
                              {note.scheme && <p>Scheme: {note.scheme}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewNote(note);
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
                                  handleDownloadNote(note);
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
                    {savedNotes.length > 6 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        And {savedNotes.length - 6} more saved notes...
                      </p>
                    )}
                  </Card>
                )}

                {/* Empty State Message */}
                {recentSearches.length === 0 && savedNotes.length === 0 && (
                  <div className="space-y-6">
                    {/* Main Empty State */}
                    <Card className="p-8 bg-card/50 border-border text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                          {searchKeyword.trim() ? (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          ) : (
                            <Search className="h-10 w-10 text-primary" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold">
                          {searchKeyword.trim() ? "No notes found" : "Start Your Search"}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {searchKeyword.trim() 
                            ? "No notes found for your search. Search for another type or try a different subject code."
                            : "Enter a subject code or keyword in the search bar above to find KTU notes"}
                        </p>
                        {searchKeyword.trim() ? (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchKeyword("");
                              setNotes([]);
                              setFilteredNotes([]);
                            }}
                            className="mt-4"
                          >
                            Clear Search
                          </Button>
                        ) : (
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
                        )}
                      </div>
                    </Card>

                    {/* KTU Notes Notice Banner */}
                    <div className="bg-yellow-500/20 dark:bg-yellow-600/20 border-l-4 border-yellow-500 dark:border-yellow-600 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            <span className="font-semibold">Notice:</span> Currently supporting <span className="font-semibold">KTU Notes</span> from multiple repositories (KTUNotes.in, KTUQBank.com, KTUStudents.in, KeralaNotes.com, KTUAssist.in). All schemes (2015, 2019, 2024) available.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                <p className="text-muted-foreground mb-4">
                  No notes match the selected filter. Try a different filter or search term.
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

export default BrowseNotes;

