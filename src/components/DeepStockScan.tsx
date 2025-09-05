import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradingViewChart } from "./TradingViewChart";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { MarketScanPanel } from "./MarketScanPanel";
import { TutorialOverlay } from "./TutorialOverlay";

interface Insight {
  id: number;
  type: "support" | "resistance" | "news" | "volume" | "analyst";
  text: string;
}

interface Overlay extends Insight {}

export function DeepStockScan() {
  const { user } = useAuth();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [ticker, setTicker] = useState("AAPL");

  // Initialize demo insights
  useEffect(() => {
    setInsights([
      { id: 1, type: "support", text: "Support detected at $230.50 (Vol > 2x avg)" },
      { id: 2, type: "resistance", text: "Resistance at $238.80 (5-day high)" },
      { id: 3, type: "news", text: "SEC Filing: Insider Buy at 10:42 AM" },
      { id: 4, type: "volume", text: "Volume anomaly: 3x avg between 11:00–11:15 AM" },
      { id: 5, type: "analyst", text: "Goldman Sachs: Target $250, Rating: Outperform" }
    ]);
  }, []);

  const pinOverlay = (insight: Insight) => {
    setOverlays([...overlays, insight]);
  };

  const removeOverlay = (id: number) => {
    setOverlays(overlays.filter((o) => o.id !== id));
  };

  const clearAllOverlays = () => setOverlays([]);

  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home">Live Analysis</TabsTrigger>
            <TabsTrigger value="scan">Market Scan</TabsTrigger>
          </TabsList>

          {/* Home Tab - Live Analysis */}
          <TabsContent value="home" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">{ticker} Analysis</CardTitle>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={clearAllOverlays} 
                    disabled={overlays.length === 0}
                  >
                    Clear All Overlays
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* TradingView Chart */}
                <TradingViewChart 
                  ticker={ticker} 
                  overlays={overlays}
                  onTickerChange={handleTickerChange}
                />

                {/* AI Insights Panel */}
                <AIInsightsPanel 
                  insights={insights}
                  onPinOverlay={pinOverlay}
                  onRemoveOverlay={removeOverlay}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Scan Tab */}
          <TabsContent value="scan">
            <MarketScanPanel />
          </TabsContent>
        </Tabs>

        {/* Tutorial Overlay */}
        <TutorialOverlay
          tutorialStep={tutorialStep}
          setTutorialStep={setTutorialStep}
        />
      </div>
    </div>
  );
}