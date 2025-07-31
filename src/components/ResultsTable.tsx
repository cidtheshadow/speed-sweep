import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink } from "lucide-react";
import { MetricOption } from "./MetricsSelector";

export interface AnalysisResult {
  url: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  metrics: Record<string, number | string>;
  error?: string;
}

interface ResultsTableProps {
  results: AnalysisResult[];
  selectedMetrics: MetricOption[];
  onExportCSV: () => void;
}

export const ResultsTable = ({ results, selectedMetrics, onExportCSV }: ResultsTableProps) => {
  const enabledMetrics = selectedMetrics.filter(m => m.enabled);

  const getStatusColor = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'analyzing':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatMetricValue = (value: number | string, metricId: string): string => {
    if (typeof value === 'string') return value;
    
    // Format based on metric type
    switch (metricId) {
      case 'ttfb':
      case 'startRender':
      case 'fcp':
      case 'lcp':
      case 'tbt':
        return `${value}ms`;
      case 'cls':
        return value.toFixed(3);
      case 'speedIndex':
      case 'inp':
        return `${Math.round(value)}`;
      case 'pageWeight':
        return `${(value / 1024).toFixed(1)}KB`;
      default:
        return value.toString();
    }
  };

  if (results.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card border-primary/20">
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No analysis results yet. Add URLs and start analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Analysis Results
            </CardTitle>
            <CardDescription>
              Performance metrics for {results.length} URL(s)
            </CardDescription>
          </div>
          {results.some(r => r.status === 'completed') && (
            <Button onClick={onExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">URL</TableHead>
                <TableHead>Status</TableHead>
                {enabledMetrics.map(metric => (
                  <TableHead key={metric.id} className="text-center min-w-[100px]">
                    {metric.label}
                  </TableHead>
                ))}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className="hover:bg-accent/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[180px]" title={result.url}>
                        {result.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(result.status)}>
                      {result.status === 'analyzing' ? 'Analyzing...' : result.status}
                    </Badge>
                  </TableCell>
                  {enabledMetrics.map(metric => (
                    <TableCell key={metric.id} className="text-center">
                      {result.status === 'completed' && result.metrics[metric.id] !== undefined ? (
                        <span className="font-mono text-sm">
                          {formatMetricValue(result.metrics[metric.id], metric.id)}
                        </span>
                      ) : result.status === 'analyzing' ? (
                        <div className="w-12 h-4 bg-muted animate-pulse rounded mx-auto" />
                      ) : result.status === 'error' ? (
                        <span className="text-destructive text-xs">Error</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      className="p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {results.some(r => r.status === 'error') && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Errors occurred during analysis:</p>
            <ul className="text-xs text-destructive mt-1 space-y-1">
              {results
                .filter(r => r.status === 'error')
                .map((result, index) => (
                  <li key={index}>
                    {result.url}: {result.error || 'Unknown error'}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};