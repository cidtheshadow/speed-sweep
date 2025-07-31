import { AnalysisResult } from "@/components/ResultsTable";
import { MetricOption } from "@/components/MetricsSelector";

export const exportToCSV = (
  results: AnalysisResult[],
  selectedMetrics: MetricOption[]
): void => {
  const enabledMetrics = selectedMetrics.filter(m => m.enabled);
  const completedResults = results.filter(r => r.status === 'completed');

  if (completedResults.length === 0) {
    console.warn('No completed results to export');
    return;
  }

  // Create CSV headers
  const headers = ['URL', 'Status', ...enabledMetrics.map(m => m.label)];
  
  // Create CSV rows
  const rows = completedResults.map(result => {
    const row = [
      result.url,
      result.status,
      ...enabledMetrics.map(metric => {
        const value = result.metrics[metric.id];
        if (value === undefined) return '';
        
        // Format values for CSV
        if (typeof value === 'number') {
          switch (metric.id) {
            case 'cls':
              return value.toFixed(3);
            case 'pageWeight':
              return Math.round(value / 1024); // Convert to KB
            default:
              return Math.round(value);
          }
        }
        return value.toString();
      })
    ];
    return row;
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `website-performance-metrics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Format metric values for display
export const formatMetricForCSV = (value: number | string, metricId: string): string => {
  if (typeof value === 'string') return value;
  
  switch (metricId) {
    case 'cls':
      return value.toFixed(3);
    case 'pageWeight':
      return (value / 1024).toFixed(1); // KB
    case 'ttfb':
    case 'startRender':
    case 'fcp':
    case 'lcp':
    case 'tbt':
    case 'inp':
    case 'totalLoadingFirstView':
      return Math.round(value).toString(); // ms
    default:
      return Math.round(value).toString();
  }
};