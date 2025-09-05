import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Overlay {
  id: number;
  type: "support" | "resistance" | "news" | "volume" | "analyst";
  text: string;
}

interface TradingViewChartProps {
  ticker: string;
  overlays: Overlay[];
  onTickerChange: (ticker: string) => void;
}

export function TradingViewChart({ ticker, overlays, onTickerChange }: TradingViewChartProps) {
  const [inputTicker, setInputTicker] = useState(ticker);

  const handleTickerSubmit = () => {
    if (inputTicker.trim()) {
      onTickerChange(inputTicker.toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTickerSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Ticker Input */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Input
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter ticker symbol (e.g., AAPL)"
              className="pr-10"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleTickerSubmit}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {overlays.length > 0 && (
          <Badge variant="secondary">
            {overlays.length} overlay{overlays.length !== 1 ? 's' : ''} active
          </Badge>
        )}
      </div>

      {/* Chart Container */}
      <div className="w-full h-[500px] border rounded-lg bg-card relative overflow-hidden">
        <iframe
          src={`https://s.tradingview.com/widgetembed/?symbol=${ticker}&interval=15&symboledit=0&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=${ticker}`}
          width="100%" 
          height="100%" 
          frameBorder="0"
          allowTransparency
          scrolling="no"
          className="absolute inset-0"
        />
        
        {/* Overlay Indicators */}
        {overlays.length > 0 && (
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 space-y-1 max-w-xs">
            <div className="text-xs font-medium text-muted-foreground">Active Overlays:</div>
            {overlays.slice(0, 3).map((overlay) => (
              <div key={overlay.id} className="text-xs px-2 py-1 bg-primary/10 rounded text-primary">
                {overlay.type.toUpperCase()}: {overlay.text.slice(0, 30)}...
              </div>
            ))}
            {overlays.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{overlays.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}