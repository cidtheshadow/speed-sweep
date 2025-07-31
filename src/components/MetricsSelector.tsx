import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Smartphone, Monitor } from "lucide-react";

export interface MetricOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type DeviceType = 'mobile' | 'desktop';

interface MetricsSelectorProps {
  metrics: MetricOption[];
  onMetricsChange: (metrics: MetricOption[]) => void;
  deviceType: DeviceType;
  onDeviceTypeChange: (deviceType: DeviceType) => void;
}

export const MetricsSelector = ({ metrics, onMetricsChange, deviceType, onDeviceTypeChange }: MetricsSelectorProps) => {
  const handleMetricToggle = (metricId: string) => {
    const updatedMetrics = metrics.map(metric =>
      metric.id === metricId ? { ...metric, enabled: !metric.enabled } : metric
    );
    onMetricsChange(updatedMetrics);
  };

  const selectAll = () => {
    const updatedMetrics = metrics.map(metric => ({ ...metric, enabled: true }));
    onMetricsChange(updatedMetrics);
  };

  const clearAll = () => {
    const updatedMetrics = metrics.map(metric => ({ ...metric, enabled: false }));
    onMetricsChange(updatedMetrics);
  };

  return (
    <Card className="bg-gradient-card shadow-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Select the metrics you want to track for each URL
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Select All
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={clearAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Device Type</Label>
          <Select value={deviceType} onValueChange={onDeviceTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop</span>
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose whether to test on mobile or desktop devices. This affects viewport size and performance metrics.
          </p>
        </div>

        {/* Metrics Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleMetricToggle(metric.id)}
            >
              <Checkbox
                id={metric.id}
                checked={metric.enabled}
                onChange={() => handleMetricToggle(metric.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={metric.id}
                  className="text-sm font-medium text-foreground cursor-pointer block"
                >
                  {metric.label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};