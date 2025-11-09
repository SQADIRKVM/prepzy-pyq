
import { useState } from "react";
import { Question } from "@/pages/analyzer/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Youtube, Calendar, BookOpen, Hash } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuestionCardProps {
  question: Question;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
  const [showVideos, setShowVideos] = useState(false);

  return (
    <Card className="w-full glass-card border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {question.year}
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              {question.subject}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm md:text-base leading-relaxed text-foreground">
          {question.text}
        </p>
        {question.keywords && question.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {question.keywords.slice(0, 6).map((keyword, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-primary/5 border-primary/20 text-primary/80 text-xs px-2 py-0.5"
              >
                <Hash className="h-3 w-3 mr-1" />
              {keyword}
            </Badge>
          ))}
            {question.keywords.length > 6 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{question.keywords.length - 6} more
              </Badge>
            )}
        </div>
        )}
      </CardContent>
      {question.relatedVideos && question.relatedVideos.length > 0 && (
        <CardFooter className="flex-col items-stretch pt-0 gap-3">
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full hover:bg-primary/5"
            onClick={() => setShowVideos(!showVideos)}
          >
            <span className="flex items-center gap-2 text-sm md:text-base">
              <Youtube className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
              <span className="font-medium">Related Videos</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {question.relatedVideos.length}
              </Badge>
            </span>
            {showVideos ? (
              <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
          
          {showVideos && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-2">
              {question.relatedVideos.map((video) => (
                <Dialog key={video.id}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer group">
                      <div className="relative overflow-hidden rounded-lg border border-border/50 hover:border-primary/50 transition-all">
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                        </AspectRatio>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity rounded-lg">
                          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                            <Youtube className="h-8 w-8 md:h-10 md:w-10 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs md:text-sm font-medium line-clamp-2 text-foreground px-1">
                        {video.title}
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-base md:text-lg">{video.title}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <AspectRatio ratio={16 / 9}>
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.id}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        ></iframe>
                      </AspectRatio>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default QuestionCard;
