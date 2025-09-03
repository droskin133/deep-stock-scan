import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  Volume2,
  Calendar,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { AlertSetupForm } from "@/components/AlertSetupForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock financial data - in real app, this would come from financial APIs
const getMockStockData = (symbol: string) => {
  const basePrice = Math.random() * 200 + 50;
  const change = (Math.random() - 0.5) * 20;
  const volume = Math.floor(Math.random() * 10000000) + 1000000;
  
  return {
    symbol: symbol.toUpperCase(),
    companyName: `${symbol.toUpperCase()} Inc.`,
    price: basePrice,
    change: change,
    changePercent: (change / basePrice) * 100,
    volume: volume,
    marketCap: `$${(Math.random() * 500 + 100).toFixed(1)}B`,
    peRatio: (Math.random() * 30 + 10).toFixed(1),
    dividend: `${(Math.random() * 5).toFixed(2)}%`,
    high52w: basePrice * 1.3,
    low52w: basePrice * 0.7,
    avgVolume: volume * 0.8,
    beta: (Math.random() * 2 + 0.5).toFixed(2)
  };
};

// Mock chart data
const generateMockChartData = (days: number) => {
  const data = [];
  let price = Math.random() * 200 + 100;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    price += (Math.random() - 0.5) * 10;
    price = Math.max(50, price); // Minimum price
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 1000000
    });
  }
  
  return data;
};

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToWatchlist } = useWatchlist();
  const [timeframe, setTimeframe] = useState('1D');
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [stockData, setStockData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (symbol) {
      const data = getMockStockData(symbol);
      setStockData(data);
      
      // Generate chart data based on timeframe
      const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365;
      setChartData(generateMockChartData(days));
    }
  }, [symbol, timeframe]);

  if (!symbol || !stockData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stock Not Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToWatchlist = async () => {
    if (!user) {
      toast.error("Please log in to add stocks to watchlist");
      return;
    }
    
    await addToWatchlist(symbol, stockData.companyName);
  };

  const isPositive = stockData.change > 0;
  const timeframes = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{stockData.symbol}</h1>
                <p className="text-muted-foreground">{stockData.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleAddToWatchlist}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button onClick={() => setShowAlertDialog(true)}>
                <Bell className="h-4 w-4 mr-2" />
                Set Alert
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Price and Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Price Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    ${stockData.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-2 text-lg ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span>
                      {stockData.change > 0 ? '+' : ''}{stockData.change.toFixed(2)}
                    </span>
                    <span>
                      ({stockData.changePercent > 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {timeframes.map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Chart Placeholder */}
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Interactive Chart</p>
                  <p className="text-xs">Real-time price data visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Market Cap</p>
                  <p className="font-semibold">{stockData.marketCap}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">P/E Ratio</p>
                  <p className="font-semibold">{stockData.peRatio}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dividend</p>
                  <p className="font-semibold">{stockData.dividend}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Beta</p>
                  <p className="font-semibold">{stockData.beta}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">52W High</p>
                  <p className="font-semibold">${stockData.high52w.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">52W Low</p>
                  <p className="font-semibold">${stockData.low52w.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technicals">Technical Analysis</TabsTrigger>
            <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
            <TabsTrigger value="news">News & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Trading Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Today's Volume</span>
                      <span className="font-semibold">{stockData.volume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Volume</span>
                      <span className="font-semibold">{stockData.avgVolume.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Price Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Analyst High</span>
                      <span className="font-semibold">${(stockData.price * 1.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Analyst Low</span>
                      <span className="font-semibold">${(stockData.price * 0.8).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-semibold">${stockData.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technicals">
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Moving Averages</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>SMA 20</span>
                        <Badge variant="secondary">${(stockData.price * 0.98).toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>SMA 50</span>
                        <Badge variant="secondary">${(stockData.price * 0.95).toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>SMA 200</span>
                        <Badge variant="secondary">${(stockData.price * 0.90).toFixed(2)}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Oscillators</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>RSI (14)</span>
                        <Badge variant="outline">45.2</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>MACD</span>
                        <Badge variant="outline">Bullish</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Stochastic</span>
                        <Badge variant="outline">62.1</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Support & Resistance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Support</span>
                        <Badge variant="destructive">${(stockData.price * 0.92).toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Resistance</span>
                        <Badge variant="default">${(stockData.price * 1.08).toFixed(2)}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fundamentals">
            <Card>
              <CardHeader>
                <CardTitle>Financial Fundamentals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Valuation Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">P/E Ratio</p>
                        <p className="font-semibold">{stockData.peRatio}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">P/B Ratio</p>
                        <p className="font-semibold">{(Math.random() * 5 + 1).toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">EV/EBITDA</p>
                        <p className="font-semibold">{(Math.random() * 20 + 5).toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">PEG Ratio</p>
                        <p className="font-semibold">{(Math.random() * 3 + 0.5).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Financial Health</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">ROE</p>
                        <p className="font-semibold">{(Math.random() * 30 + 5).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROA</p>
                        <p className="font-semibold">{(Math.random() * 15 + 2).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Debt/Equity</p>
                        <p className="font-semibold">{(Math.random() * 2).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Ratio</p>
                        <p className="font-semibold">{(Math.random() * 3 + 1).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          {stockData.symbol} Reports Strong Q{Math.floor(Math.random() * 4) + 1} Earnings
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          The company exceeded analyst expectations with revenue growth and improved margins...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{Math.floor(Math.random() * 24) + 1} hours ago</span>
                          <Badge variant="outline">Earnings</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Alert Setup Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Alert for {stockData.symbol}</DialogTitle>
          </DialogHeader>
          <AlertSetupForm 
            initialSymbol={stockData.symbol}
            onSuccess={() => setShowAlertDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}