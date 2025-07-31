// Mock API service for Google PageSpeed Insights
// In production, this would use the actual Google PageSpeed Insights API

export interface PageSpeedResult {
  url: string;
  metrics: {
    ttfb: number; // Time to First Byte (ms)
    startRender: number; // Start Render (ms)
    fcp: number; // First Contentful Paint (ms)
    speedIndex: number; // Speed Index
    lcp: number; // Largest Contentful Paint (ms)
    cls: number; // Cumulative Layout Shift
    tbt: number; // Total Blocking Time (ms)
    pageWeight: number; // Page Weight (bytes)
    inp: number; // Interaction to Next Paint (ms)
    totalLoadingFirstView: number; // Total Loading Time First View (ms)
  };
  score: number; // Performance score (0-100)
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate realistic mock data
const generateMockMetrics = (): PageSpeedResult['metrics'] => ({
  ttfb: Math.random() * 500 + 100, // 100-600ms
  startRender: Math.random() * 1000 + 500, // 500-1500ms
  fcp: Math.random() * 1500 + 800, // 800-2300ms
  speedIndex: Math.random() * 2000 + 1000, // 1000-3000
  lcp: Math.random() * 2500 + 1200, // 1200-3700ms
  cls: Math.random() * 0.3, // 0-0.3
  tbt: Math.random() * 300 + 50, // 50-350ms
  pageWeight: Math.random() * 2048000 + 512000, // 512KB-2.5MB
  inp: Math.random() * 200 + 50, // 50-250ms
  totalLoadingFirstView: Math.random() * 3000 + 2000, // 2000-5000ms
});

export const analyzeUrl = async (url: string): Promise<PageSpeedResult> => {
  // Simulate API call delay
  await delay(2000 + Math.random() * 3000); // 2-5 seconds

  // Simulate occasional errors
  if (Math.random() < 0.1) { // 10% chance of error
    throw new Error('Failed to analyze URL - timeout or invalid response');
  }

  const metrics = generateMockMetrics();
  
  // Calculate a performance score based on key metrics
  const score = Math.min(100, Math.max(0, 
    100 - (
      (metrics.fcp / 1000 * 10) + // FCP impact
      (metrics.lcp / 1000 * 8) + // LCP impact
      (metrics.cls * 50) + // CLS impact
      (metrics.tbt / 100 * 5) // TBT impact
    )
  ));

  return {
    url,
    metrics,
    score: Math.round(score)
  };
};

// Batch analyze multiple URLs with progress callback
export const analyzeUrls = async (
  urls: string[],
  onProgress?: (url: string, index: number, total: number) => void,
  onResult?: (result: PageSpeedResult | { url: string; error: string }) => void
): Promise<PageSpeedResult[]> => {
  const results: PageSpeedResult[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    try {
      onProgress?.(url, i, urls.length);
      const result = await analyzeUrl(url);
      results.push(result);
      onResult?.(result);
    } catch (error) {
      const errorResult = {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      onResult?.(errorResult);
    }
  }

  return results;
};