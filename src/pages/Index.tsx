import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UrlInput } from "@/components/UrlInput";
import { MetricsSelector, MetricOption } from "@/components/MetricsSelector";
import { ResultsTable, AnalysisResult } from "@/components/ResultsTable";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { Play, BarChart3, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeUrls } from "@/services/pageSpeedApi";
import { exportToCSV } from "@/utils/csvExport";
import heroImage from "@/assets/hero-dashboard.jpg";

const DEFAULT_METRICS: MetricOption[] = [
  {
    id: 'ttfb',
    label: 'TTFB',
    description: 'Time to First Byte - Server response time',
    enabled: true
  },
  {
    id: 'startRender',
    label: 'Start Render',
    description: 'When the first pixel is painted',
    enabled: true
  },
  {
    id: 'fcp',
    label: 'FCP',
    description: 'First Contentful Paint - First text/image render',
    enabled: true
  },
  {
    id: 'speedIndex',
    label: 'Speed Index',
    description: 'How quickly content is visually populated',
    enabled: true
  },
  {
    id: 'lcp',
    label: 'LCP',
    description: 'Largest Contentful Paint - Main content load time',
    enabled: true
  },
  {
    id: 'cls',
    label: 'CLS',
    description: 'Cumulative Layout Shift - Visual stability',
    enabled: true
  },
  {
    id: 'tbt',
    label: 'TBT',
    description: 'Total Blocking Time - Interactivity delay',
    enabled: false
  },
  {
    id: 'pageWeight',
    label: 'Page Weight',
    description: 'Total size of the page in bytes',
    enabled: false
  },
  {
    id: 'inp',
    label: 'INP',
    description: 'Interaction to Next Paint - Responsiveness',
    enabled: false
  },
  {
    id: 'totalLoadingFirstView',
    label: 'Total Loading Time',
    description: 'Complete page load time for first view',
    enabled: false
  }
];

const Index = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<MetricOption[]>(DEFAULT_METRICS);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalyzingUrl, setCurrentAnalyzingUrl] = useState<string>();
  const [completedCount, setCompletedCount] = useState(0);
  const { toast } = useToast();

  const handleStartAnalysis = async () => {
    const enabledMetrics = metrics.filter(m => m.enabled);
    
    if (urls.length === 0) {
      toast({
        title: "No URLs",
        description: "Please add URLs to analyze first.",
        variant: "destructive",
      });
      return;
    }

    if (enabledMetrics.length === 0) {
      toast({
        title: "No Metrics Selected",
        description: "Please select at least one metric to track.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setCompletedCount(0);
    
    // Initialize results with pending status
    const initialResults: AnalysisResult[] = urls.map(url => ({
      url,
      status: 'pending',
      metrics: {}
    }));
    setResults(initialResults);

    try {
      await analyzeUrls(
        urls,
        (url, index, total) => {
          setCurrentAnalyzingUrl(url);
          // Update status to analyzing for current URL
          setResults(prev => prev.map(result => 
            result.url === url 
              ? { ...result, status: 'analyzing' }
              : result
          ));
        },
        (result) => {
          if ('error' in result) {
            // Handle error result
            setResults(prev => prev.map(r => 
              r.url === result.url 
                ? { ...r, status: 'error', error: result.error }
                : r
            ));
          } else {
            // Handle successful result
            setResults(prev => prev.map(r => 
              r.url === result.url 
                ? { 
                    ...r, 
                    status: 'completed', 
                    metrics: result.metrics 
                  }
                : r
            ));
          }
          setCompletedCount(prev => prev + 1);
        }
      );

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${urls.length} URL(s)`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalyzingUrl(undefined);
    }
  };

  const handleStopAnalysis = () => {
    setIsAnalyzing(false);
    setCurrentAnalyzingUrl(undefined);
    toast({
      title: "Analysis Stopped",
      description: "Analysis has been stopped by user.",
    });
  };

  const handleExportCSV = () => {
    exportToCSV(results, metrics);
    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Website Performance
              <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Analytics Tool
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Streamline your weekly performance metrics collection with automated analysis 
              and beautiful reporting for multiple websites.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Bulk URL Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>Custom Metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>Easy Export</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* URL Input Section */}
        <UrlInput urls={urls} onUrlsChange={setUrls} />

        {/* Metrics Selection */}
        <MetricsSelector metrics={metrics} onMetricsChange={setMetrics} />

        {/* Analysis Controls */}
        <Card className="bg-gradient-card shadow-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-muted-foreground">
                  {urls.length} URL(s) • {metrics.filter(m => m.enabled).length} metric(s) selected
                </p>
              </div>
              <Button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || urls.length === 0 || metrics.filter(m => m.enabled).length === 0}
                variant="hero"
                size="lg"
                className="min-w-[160px]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <AnalysisProgress
          totalUrls={urls.length}
          completedUrls={completedCount}
          currentUrl={currentAnalyzingUrl}
          isRunning={isAnalyzing}
          onStop={handleStopAnalysis}
        />

        {/* Results Table */}
        <ResultsTable
          results={results}
          selectedMetrics={metrics}
          onExportCSV={handleExportCSV}
        />
      </div>
    </div>
  );
};

export default Index;