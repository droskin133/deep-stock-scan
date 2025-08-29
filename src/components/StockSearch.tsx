import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

export const StockSearch = ({ onSearch, isLoading }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
            className="pl-10 bg-card border-financial-border shadow-card"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !symbol.trim()}
          className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-financial"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Research
        </Button>
      </form>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-muted-foreground mr-2">Popular:</span>
        {popularStocks.map((stock) => (
          <Button
            key={stock}
            variant="outline"
            size="sm"
            onClick={() => {
              setSymbol(stock);
              onSearch(stock);
            }}
            className="text-xs border-financial-border hover:bg-financial-card"
          >
            {stock}
          </Button>
        ))}
      </div>
    </div>
  );
};