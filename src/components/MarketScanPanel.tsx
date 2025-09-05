import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, AlertTriangle, Newspaper, Clock } from "lucide-react";

interface ScanResult {
  id: number;
  symbol: string;
  type: "price_move" | "volume_spike" | "filing" | "news";
  title: string;
  description: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

export function MarketScanPanel() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Demo scan results
    setScanResults([
      {
        id: 1,
        symbol: "TSLA",
        type: "price_move",
        title: "Unusual Price Movement",
        description: "TSLA up 8.5% in pre-market on AI partnership rumors",
        timestamp: "2 minutes ago",
        severity: "high"
      },
      {
        id: 2,
        symbol: "NVDA",
        type: "volume_spike",
        title: "Volume Spike",
        description: "Volume 4x average in first hour of trading",
        timestamp: "5 minutes ago",
        severity: "medium"
      },
      {
        id: 3,
        symbol: "AAPL",
        type: "filing",
        title: "SEC Filing Alert",
        description: "Form 4 - Insider purchase of 50,000 shares",
        timestamp: "12 minutes ago",
        severity: "medium"
      },
      {
        id: 4,
        symbol: "MSFT",
        type: "news",
        title: "Breaking News",
        description: "Microsoft announces new cloud partnership deal",
        timestamp: "18 minutes ago",
        severity: "low"
      }
    ]);
  }, []);

  const getSeverityColor = (severity: ScanResult['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: ScanResult['type']) => {
    switch (type) {
      case 'price_move':
        return <TrendingUp className="h-4 w-4" />;
      case 'volume_spike':
        return <Activity className="h-4 w-4" />;
      case 'filing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'news':
        return <Newspaper className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const startScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Scan Engine
          </CardTitle>
          <Button 
            onClick={startScan} 
            disabled={isScanning}
            size="sm"
          >
            {isScanning ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">Live Alerts</TabsTrigger>
            <TabsTrigger value="config">Scan Config</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Continuous AI scanning for market anomalies
              </p>
              <Badge variant="outline" className="text-xs">
                {scanResults.length} alerts today
              </Badge>
            </div>

            <div className="space-y-3">
              {scanResults.map((result) => (
                <div 
                  key={result.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(result.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {result.symbol}
                      </Badge>
                      <Badge variant={getSeverityColor(result.severity)} className="text-xs">
                        {result.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">
                      {result.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {result.description}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Scan Configuration</p>
              <p className="text-xs mt-1">Configure alert thresholds and criteria.</p>
              <Button variant="outline" size="sm" className="mt-4">
                Configure Scans
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Scan History</p>
              <p className="text-xs mt-1">View historical scan results and performance.</p>
              <Button variant="outline" size="sm" className="mt-4">
                View History
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}