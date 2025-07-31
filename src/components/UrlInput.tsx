import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UrlInputProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
}

export const UrlInput = ({ urls, onUrlsChange }: UrlInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const handleBulkInput = () => {
    if (!inputValue.trim()) return;

    const newUrls = inputValue
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && isValidUrl(url));

    if (newUrls.length === 0) {
      toast({
        title: "Invalid URLs",
        description: "Please enter valid URLs separated by new lines.",
        variant: "destructive",
      });
      return;
    }

    const uniqueUrls = [...new Set([...urls, ...newUrls])];
    onUrlsChange(uniqueUrls);
    setInputValue("");
    
    toast({
      title: "URLs Added",
      description: `Successfully added ${newUrls.length} URL(s)`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileUrls = content
        .split('\n')
        .map(url => url.trim())
        .filter(url => url && isValidUrl(url));

      if (fileUrls.length === 0) {
        toast({
          title: "No Valid URLs Found",
          description: "The uploaded file doesn't contain valid URLs.",
          variant: "destructive",
        });
        return;
      }

      const uniqueUrls = [...new Set([...urls, ...fileUrls])];
      onUrlsChange(uniqueUrls);
      
      toast({
        title: "File Uploaded",
        description: `Successfully imported ${fileUrls.length} URL(s)`,
      });
    };
    reader.readAsText(file);
  };

  const removeUrl = (indexToRemove: number) => {
    const updatedUrls = urls.filter((_, index) => index !== indexToRemove);
    onUrlsChange(updatedUrls);
  };

  const clearAll = () => {
    onUrlsChange([]);
    setInputValue("");
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Link className="w-5 h-5 text-primary" />
          URL Management
        </CardTitle>
        <CardDescription>
          Add URLs to analyze - paste multiple URLs (one per line) or upload a text file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Enter URLs here, one per line:&#10;https://example1.com&#10;https://example2.com&#10;https://example3.com"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="min-h-[120px] resize-none border-primary/20 focus:border-primary transition-colors"
          />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleBulkInput} 
              disabled={!inputValue.trim()}
              variant="default"
              className="flex-1"
            >
              <Link className="w-4 h-4 mr-2" />
              Add URLs
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            
            {urls.length > 0 && (
              <Button 
                onClick={clearAll} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {urls.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                URLs to Analyze ({urls.length})
              </h4>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-3 bg-muted/30">
              {urls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-background rounded border hover:border-primary/40 transition-colors"
                >
                  <span className="text-sm text-foreground truncate flex-1 mr-2">
                    {url}
                  </span>
                  <button
                    onClick={() => removeUrl(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};