import { useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { StockScreener } from "@/components/StockScreener";
import { PriceDisplay } from "@/components/PriceDisplay";
import { PriceTargets } from "@/components/PriceTargets";
import { NewsSection } from "@/components/NewsSection";
import { OwnershipData } from "@/components/OwnershipData";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockStockData = {
  AAPL: {
    price: 178.72,
    change: 2.45,
    changePercent: 1.39,
    high: 179.88,
    low: 175.16,
    volume: 48567890,
    marketCap: "$2.89T",
    targets: [
      { analyst: "Goldman Sachs", target: 195.00, rating: "Buy" as const, date: "Nov 15, 2024" },
      { analyst: "Morgan Stanley", target: 185.00, rating: "Hold" as const, date: "Nov 12, 2024" },
      { analyst: "JP Morgan", target: 200.00, rating: "Buy" as const, date: "Nov 8, 2024" },
    ],
    consensus: { target: 193.33, rating: "Buy", upside: 8.2 },
    news: [
      {
        title: "Apple Reports Strong Q4 Earnings, iPhone Sales Exceed Expectations",
        source: "Reuters",
        time: "2 hours ago",
        sentiment: "positive" as const,
        summary: "Apple Inc. reported better-than-expected quarterly earnings driven by robust iPhone 15 sales and growing services revenue...",
        url: "#"
      },
      {
        title: "Apple's AI Strategy Under Scrutiny as Competition Intensifies",
        source: "Bloomberg",
        time: "4 hours ago", 
        sentiment: "neutral" as const,
        summary: "Analysts question Apple's artificial intelligence roadmap as competitors like Google and Microsoft advance their AI capabilities...",
        url: "#"
      }
    ],
    institutional: [
      { name: "Berkshire Hathaway Inc", shares: 915750000, percentage: 5.8, change: 0.2, value: "$163.7B" },
      { name: "Vanguard Group Inc", shares: 1285430000, percentage: 8.1, change: -0.1, value: "$229.8B" },
      { name: "BlackRock Inc", shares: 1047250000, percentage: 6.6, change: 0.5, value: "$187.2B" },
    ],
    government: [
      { name: "California Public Employees", shares: 25430000, percentage: 0.16, change: 1.2, value: "$4.5B" },
      { name: "New York State Common", shares: 18750000, percentage: 0.12, change: -0.3, value: "$3.4B" },
    ],
    insiderTrades: [
      { name: "Tim Cook", position: "CEO", transaction: "Sell" as const, shares: 223000, price: 176.50, date: "Nov 10", value: "$39.3M" },
      { name: "Luca Maestri", position: "CFO", transaction: "Sell" as const, shares: 89000, price: 178.20, date: "Nov 8", value: "$15.9M" },
    ]
  }
};

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (symbol: string) => {
    setIsLoading(true);
    setSelectedStock("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mockStockData[symbol as keyof typeof mockStockData]) {
        setSelectedStock(symbol);
        toast({
          title: "Stock data loaded",
          description: `Research data for ${symbol} has been loaded successfully.`,
        });
      } else {
        toast({
          title: "Stock not found",
          description: `No data available for ${symbol}. Try AAPL for demo data.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load stock data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stockData = selectedStock ? mockStockData[selectedStock as keyof typeof mockStockData] : null;

  return (
    <div className="min-h-screen bg-financial-bg">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-financial">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Stock Research Pro
            </h1>
            <p className="text-lg opacity-90">
              Professional stock analysis with real-time data and insights
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="research" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
              <TabsTrigger value="research" className="text-sm">Stock Research</TabsTrigger>
              <TabsTrigger value="screener" className="text-sm">Stock Screener</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="research" className="space-y-8">
            {/* Search Section */}
            <div className="text-center">
              <StockSearch onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Stock Data */}
            {stockData && !isLoading && (
              <div className="space-y-6">
                {/* Price Display */}
                <PriceDisplay
                  symbol={selectedStock}
                  price={stockData.price}
                  change={stockData.change}
                  changePercent={stockData.changePercent}
                  high={stockData.high}
                  low={stockData.low}
                  volume={stockData.volume}
                  marketCap={stockData.marketCap}
                />

                {/* Price Targets and News */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PriceTargets
                    currentPrice={stockData.price}
                    targets={stockData.targets}
                    consensus={stockData.consensus}
                  />
                  <NewsSection news={stockData.news} />
                </div>

                {/* Ownership Data */}
                <OwnershipData
                  institutional={stockData.institutional}
                  government={stockData.government}
                  insiderTrades={stockData.insiderTrades}
                  totalShares={15000000000}
                />
              </div>
            )}

            {/* Welcome Message */}
            {!selectedStock && !isLoading && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-card to-financial-card p-8 rounded-lg border border-financial-border shadow-card max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Stock Research</h2>
                  <p className="text-muted-foreground mb-6">
                    Get comprehensive stock analysis including current prices, analyst price targets, 
                    recent news, institutional ownership, and insider trading activity.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try searching for <strong>AAPL</strong> to see sample data, or enter any stock symbol to get started.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="screener">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Discover New Investment Opportunities</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Use advanced filters to screen stocks based on technical indicators, fundamental metrics, 
                volume patterns, and analyst activity to find your next investment.
              </p>
            </div>
            <StockScreener onSelectStock={(symbol) => {
              setSelectedStock(symbol);
              // Switch to research tab when stock is selected from screener
              const researchTab = document.querySelector('[data-state="inactive"][value="research"]') as HTMLElement;
              if (researchTab) researchTab.click();
            }} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;