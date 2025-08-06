import { DeviceType } from "@/components/MetricsSelector";

export interface PageSpeedResult {
  url: string;
  testUrl: string;
  metrics: {
    ttfb: number;
    startRender: number | null;
    fcp: number;
    speedIndex: number;
    lcp: number;
    cls: number;
    tbt: number;
    pageWeight: number;
    inp: number;
    totalLoadingFirstView: number;
  };
  score: number;
  deviceType: DeviceType;
}

// Use your actual API key
const GOOGLE_API_KEY = 'AIzaSyBthk3NiawoHbOfchFSlna_H3YTTddjc44';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractMetricsFromApiResponse = (data: any): PageSpeedResult['metrics'] => {
  const audits = data.lighthouseResult.audits;
  const pageWeight = Number(audits['total-byte-weight']?.numericValue || 0);

  return {
    ttfb: audits['server-response-time']?.numericValue || 0,
    startRender: audits['first-contentful-paint']?.numericValue || null,
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    speedIndex: audits['speed-index']?.numericValue || 0,
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    tbt: audits['total-blocking-time']?.numericValue || 0,
    inp: audits['interactive']?.numericValue || 0, // interactive is often used for INP-like estimate
    pageWeight: pageWeight,
    totalLoadingFirstView: audits['interactive']?.numericValue || 0,
  };
};

export const analyzeUrl = async (
  url: string,
  deviceType: DeviceType = 'desktop'
): Promise<PageSpeedResult> => {
  const strategy = deviceType;
  const apiURL = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${GOOGLE_API_KEY}&strategy=${strategy}`;

  try {
    await delay(500); // minimum artificial delay

    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`API call failed for ${url} (${response.status})`);
    }

    const data = await response.json();
    const metrics = extractMetricsFromApiResponse(data);

    const performanceScore = Math.round(
      (data.lighthouseResult.categories.performance.score || 0) * 100
    );

    const analysisURL =
      data.lighthouseResult.finalUrl || `https://pagespeed.web.dev/?url=${encodeURIComponent(url)}`;

    return {
      url,
      testUrl: analysisURL,
      metrics,
      score: performanceScore,
      deviceType
    };
  } catch (error: any) {
    throw new Error(error.message || 'Unknown error');
  }
};

export const analyzeUrls = async (
  urls: string[],
  deviceType: DeviceType = 'desktop',
  onProgress?: (url: string, index: number, total: number) => void,
  onResult?: (result: PageSpeedResult | { url: string; error: string }) => void
): Promise<PageSpeedResult[]> => {
  const results: PageSpeedResult[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    try {
      onProgress?.(url, i, urls.length);
      const result = await analyzeUrl(url, deviceType);
      results.push(result);
      onResult?.(result);
    } catch (error: any) {
      const errorResult = {
        url,
        error: error instanceof Error ? error.message : 'Unknown Error'
      };
      onResult?.(errorResult);
    }

    await delay(1000 + Math.random() * 1500); // delay between requests to reduce API throttling
  }

  return results;
};
