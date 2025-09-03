import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Star,
  MoreVertical,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWatchlist, type WatchlistItem } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function WatchlistPanel() {
  const [searchSymbol, setSearchSymbol] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { defaultWatchlist, addToWatchlist, removeFromWatchlist, loading } = useWatchlist();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock price data - in real app, this would come from financial API
  const getMockPrice = (symbol: string) => {
    const prices: Record<string, { price: number; change: number; changePercent: number }> = {
      'AAPL': { price: 175.25, change: 2.15, changePercent: 1.24 },
      'GOOGL': { price: 135.80, change: -1.45, changePercent: -1.06 },
      'MSFT': { price: 378.90, change: 4.20, changePercent: 1.12 },
      'TSLA': { price: 248.50, change: -3.25, changePercent: -1.29 },
      'AMZN': { price: 142.65, change: 0.85, changePercent: 0.60 },
    };
    
    return prices[symbol] || { 
      price: Math.random() * 200 + 50, 
      change: (Math.random() - 0.5) * 10, 
      changePercent: (Math.random() - 0.5) * 5 
    };
  };

  const handleAddStock = async () => {
    if (!searchSymbol.trim()) return;
    
    setIsAdding(true);
    try {
      await addToWatchlist(searchSymbol.trim().toUpperCase());
      setSearchSymbol("");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStock = async (itemId: string) => {
    await removeFromWatchlist(itemId);
  };

  const handleViewStock = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {defaultWatchlist?.name || "Watchlist"}
          </div>
          <Badge variant="secondary">
            {defaultWatchlist?.items?.length || 0} stocks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Stock Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Add stock symbol..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
              className="pl-9"
              disabled={isAdding}
            />
          </div>
          <Button 
            onClick={handleAddStock} 
            disabled={!searchSymbol.trim() || isAdding}
            size="sm"
          >
            {isAdding ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Watchlist Items */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {!defaultWatchlist?.items?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No stocks in watchlist</p>
              <p className="text-xs">Add stocks to track them here</p>
            </div>
          ) : (
            defaultWatchlist.items.map((item: WatchlistItem) => {
              const priceData = getMockPrice(item.symbol);
              const isPositive = priceData.change > 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewStock(item.symbol)}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {item.symbol}
                      </button>
                      {item.company_name && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.company_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">
                        ${priceData.price.toFixed(2)}
                      </span>
                      <div className={`flex items-center gap-1 text-xs ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{priceData.change > 0 ? '+' : ''}{priceData.change.toFixed(2)}</span>
                        <span>({priceData.changePercent > 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewStock(item.symbol)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemoveStock(item.id)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}