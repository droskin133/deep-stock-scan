import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, Search, TrendingUp, TrendingDown, Volume2, Target } from "lucide-react";

interface ScreenerFilters {
  symbol?: string;
  marketCapMin?: number;
  marketCapMax?: number;
  guidanceChange?: "raised" | "lowered" | "any";
  revenueGrowth?: "increasing" | "decreasing" | "any";
  analystAction?: "upgrade" | "downgrade" | "any";
  earningsResult?: "beat" | "miss" | "any";
  ma1Period?: number;
  ma2Period?: number;
  maComparison?: "above" | "below" | "cross";
  athDistance?: number;
  volumeAnomaly?: boolean;
}

interface StockResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  volume: number;
  avgVolume30d: number;
  volumeRatio: number;
  guidanceChange: "raised" | "lowered" | null;
  revenueGrowth: "increasing" | "decreasing";
  recentAction: "upgrade" | "downgrade" | null;
  earningsResult: "beat" | "miss" | null;
  athDistance: number;
  ma20: number;
  ma50: number;
  ma200: number;
}

interface StockScreenerProps {
  onSelectStock: (symbol: string) => void;
}

export const StockScreener = ({ onSelectStock }: StockScreenerProps) => {
  const [filters, setFilters] = useState<ScreenerFilters>({});
  const [results, setResults] = useState<StockResult[]>([]);
  const [isScreening, setIsScreening] = useState(false);

  // Mock stock data for demonstration
  const mockStocks: StockResult[] = [
    {
      symbol: "NVDA", name: "NVIDIA Corporation", price: 875.30, change: 12.45, changePercent: 1.44,
      marketCap: "$2.16T", volume: 45230000, avgVolume30d: 28500000, volumeRatio: 1.59,
      guidanceChange: "raised", revenueGrowth: "increasing", recentAction: "upgrade",
      earningsResult: "beat", athDistance: -8.2, ma20: 840.50, ma50: 780.25, ma200: 650.75
    },
    {
      symbol: "AMD", name: "Advanced Micro Devices", price: 142.85, change: -2.15, changePercent: -1.48,
      marketCap: "$231B", volume: 52150000, avgVolume30d: 35200000, volumeRatio: 1.48,
      guidanceChange: null, revenueGrowth: "increasing", recentAction: "downgrade",
      earningsResult: "miss", athDistance: -35.6, ma20: 138.75, ma50: 125.30, ma200: 110.45
    },
    {
      symbol: "TSLA", name: "Tesla Inc", price: 248.50, change: 8.75, changePercent: 3.65,
      marketCap: "$792B", volume: 89450000, avgVolume30d: 45600000, volumeRatio: 1.96,
      guidanceChange: "raised", revenueGrowth: "decreasing", recentAction: "upgrade",
      earningsResult: "beat", athDistance: -67.8, ma20: 235.60, ma50: 220.15, ma200: 185.90
    },
    {
      symbol: "GOOGL", name: "Alphabet Inc", price: 168.75, change: 3.20, changePercent: 1.93,
      marketCap: "$2.08T", volume: 28750000, avgVolume30d: 22100000, volumeRatio: 1.30,
      guidanceChange: null, revenueGrowth: "increasing", recentAction: null,
      earningsResult: "beat", athDistance: -12.3, ma20: 162.40, ma50: 155.85, ma200: 145.20
    },
    {
      symbol: "META", name: "Meta Platforms Inc", price: 528.90, change: -8.45, changePercent: -1.57,
      marketCap: "$1.34T", volume: 19850000, avgVolume30d: 15600000, volumeRatio: 1.27,
      guidanceChange: "lowered", revenueGrowth: "increasing", recentAction: "downgrade",
      earningsResult: "miss", athDistance: -21.4, ma20: 515.30, ma50: 490.75, ma200: 445.60
    }
  ];

  const handleScreen = () => {
    setIsScreening(true);
    
    // Simulate screening delay
    setTimeout(() => {
      let filteredResults = [...mockStocks];

      // Apply filters
      if (filters.symbol) {
        filteredResults = filteredResults.filter(stock => 
          stock.symbol.toLowerCase().includes(filters.symbol!.toLowerCase()) ||
          stock.name.toLowerCase().includes(filters.symbol!.toLowerCase())
        );
      }

      if (filters.marketCapMin || filters.marketCapMax) {
        // Mock filter logic for market cap
        filteredResults = filteredResults.filter(stock => {
          const capValue = parseFloat(stock.marketCap.replace(/[$TB,]/g, ''));
          const multiplier = stock.marketCap.includes('T') ? 1000 : 1;
          const capInBillions = capValue * multiplier;
          
          if (filters.marketCapMin && capInBillions < filters.marketCapMin) return false;
          if (filters.marketCapMax && capInBillions > filters.marketCapMax) return false;
          return true;
        });
      }

      if (filters.guidanceChange && filters.guidanceChange !== "any") {
        filteredResults = filteredResults.filter(stock => stock.guidanceChange === filters.guidanceChange);
      }

      if (filters.revenueGrowth && filters.revenueGrowth !== "any") {
        filteredResults = filteredResults.filter(stock => stock.revenueGrowth === filters.revenueGrowth);
      }

      if (filters.analystAction && filters.analystAction !== "any") {
        filteredResults = filteredResults.filter(stock => stock.recentAction === filters.analystAction);
      }

      if (filters.earningsResult && filters.earningsResult !== "any") {
        filteredResults = filteredResults.filter(stock => stock.earningsResult === filters.earningsResult);
      }

      if (filters.volumeAnomaly) {
        filteredResults = filteredResults.filter(stock => stock.volumeRatio > 1.5);
      }

      if (filters.athDistance) {
        filteredResults = filteredResults.filter(stock => 
          Math.abs(stock.athDistance) >= Math.abs(filters.athDistance!)
        );
      }

      setResults(filteredResults);
      setIsScreening(false);
    }, 1500);
  };

  const clearFilters = () => {
    setFilters({});
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-to-br from-financial-card to-card shadow-card border-financial-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Stock Screener
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol/Company</Label>
              <Input
                id="symbol"
                placeholder="Search symbol or name"
                value={filters.symbol || ""}
                onChange={(e) => setFilters({...filters, symbol: e.target.value})}
                className="bg-card border-financial-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Market Cap Range (Billions)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.marketCapMin || ""}
                  onChange={(e) => setFilters({...filters, marketCapMin: Number(e.target.value)})}
                  className="bg-card border-financial-border"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.marketCapMax || ""}
                  onChange={(e) => setFilters({...filters, marketCapMax: Number(e.target.value)})}
                  className="bg-card border-financial-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Volume Anomaly</Label>
              <Select value={filters.volumeAnomaly ? "true" : "false"} onValueChange={(value) => setFilters({...filters, volumeAnomaly: value === "true"})}>
                <SelectTrigger className="bg-card border-financial-border">
                  <SelectValue placeholder="Select volume filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Normal Volume</SelectItem>
                  <SelectItem value="true">High Volume (50%+ above 30d avg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Fundamental Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Guidance Change</Label>
              <Select value={filters.guidanceChange || "any"} onValueChange={(value) => setFilters({...filters, guidanceChange: value as any})}>
                <SelectTrigger className="bg-card border-financial-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="raised">Raised</SelectItem>
                  <SelectItem value="lowered">Lowered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Revenue Growth</Label>
              <Select value={filters.revenueGrowth || "any"} onValueChange={(value) => setFilters({...filters, revenueGrowth: value as any})}>
                <SelectTrigger className="bg-card border-financial-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="increasing">Increasing</SelectItem>
                  <SelectItem value="decreasing">Decreasing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Analyst Action</Label>
              <Select value={filters.analystAction || "any"} onValueChange={(value) => setFilters({...filters, analystAction: value as any})}>
                <SelectTrigger className="bg-card border-financial-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="upgrade">Recent Upgrade</SelectItem>
                  <SelectItem value="downgrade">Recent Downgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Earnings Result</Label>
              <Select value={filters.earningsResult || "any"} onValueChange={(value) => setFilters({...filters, earningsResult: value as any})}>
                <SelectTrigger className="bg-card border-financial-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="beat">Beat Estimates</SelectItem>
                  <SelectItem value="miss">Missed Estimates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Technical Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Moving Average Periods</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="MA 1 (e.g., 20)"
                  value={filters.ma1Period || ""}
                  onChange={(e) => setFilters({...filters, ma1Period: Number(e.target.value)})}
                  className="bg-card border-financial-border"
                />
                <Input
                  type="number"
                  placeholder="MA 2 (e.g., 50)"
                  value={filters.ma2Period || ""}
                  onChange={(e) => setFilters({...filters, ma2Period: Number(e.target.value)})}
                  className="bg-card border-financial-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>MA Comparison</Label>
              <Select value={filters.maComparison || "above"} onValueChange={(value) => setFilters({...filters, maComparison: value as any})}>
                <SelectTrigger className="bg-card border-financial-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Price Above MA</SelectItem>
                  <SelectItem value="below">Price Below MA</SelectItem>
                  <SelectItem value="cross">MA Cross Over</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Distance from ATH (%)</Label>
              <Input
                type="number"
                placeholder="e.g., -20 (20% below ATH)"
                value={filters.athDistance || ""}
                onChange={(e) => setFilters({...filters, athDistance: Number(e.target.value)})}
                className="bg-card border-financial-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleScreen} 
              disabled={isScreening}
              className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-financial"
            >
              <Search className="h-4 w-4 mr-2" />
              {isScreening ? "Screening..." : "Screen Stocks"}
            </Button>
            <Button variant="outline" onClick={clearFilters} className="border-financial-border">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-gradient-to-br from-financial-card to-card shadow-card border-financial-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Screening Results ({results.length} stocks)
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {results.map((stock, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-lg border border-financial-border/50 hover:border-financial-border transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectStock(stock.symbol)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg">{stock.symbol}</h4>
                      <span className="text-sm text-muted-foreground">{stock.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">${stock.price.toFixed(2)}</span>
                        <span className={`flex items-center gap-1 ${stock.change > 0 ? 'text-success' : 'text-destructive'}`}>
                          {stock.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3 text-muted-foreground" />
                        <span>{stock.volumeRatio.toFixed(2)}x avg volume</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {stock.guidanceChange && (
                        <Badge className={stock.guidanceChange === 'raised' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                          {stock.guidanceChange === 'raised' ? 'Guidance ↑' : 'Guidance ↓'}
                        </Badge>
                      )}
                      {stock.recentAction && (
                        <Badge className={stock.recentAction === 'upgrade' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                          {stock.recentAction === 'upgrade' ? 'Upgraded' : 'Downgraded'}
                        </Badge>
                      )}
                      {stock.earningsResult && (
                        <Badge className={stock.earningsResult === 'beat' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                          Earnings {stock.earningsResult === 'beat' ? 'Beat' : 'Miss'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1 text-right">
                      <div>Market Cap: {stock.marketCap}</div>
                      <div>ATH: {stock.athDistance.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};