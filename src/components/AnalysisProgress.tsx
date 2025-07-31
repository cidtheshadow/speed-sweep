import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, StopCircle } from "lucide-react";

interface AnalysisProgressProps {
  totalUrls: number;
  completedUrls: number;
  currentUrl?: string;
  isRunning: boolean;
  onStop: () => void;
}

export const AnalysisProgress = ({
  totalUrls,
  completedUrls,
  currentUrl,
  isRunning,
  onStop
}: AnalysisProgressProps) => {
  const progress = totalUrls > 0 ? (completedUrls / totalUrls) * 100 : 0;

  if (!isRunning && completedUrls === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-card shadow-card border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRunning && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              <h3 className="font-semibold text-foreground">
                {isRunning ? 'Analysis in Progress' : 'Analysis Complete'}
              </h3>
            </div>
            {isRunning && (
              <Button
                onClick={onStop}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {completedUrls} of {totalUrls} URLs
              </span>
              <span className="font-medium text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentUrl && isRunning && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Currently analyzing:</span>
              <div className="mt-1 p-2 bg-muted/50 rounded text-xs font-mono truncate">
                {currentUrl}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};