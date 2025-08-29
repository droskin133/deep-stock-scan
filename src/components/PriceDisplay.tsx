import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceDisplayProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap: string;
}

export const PriceDisplay = ({
  symbol,
  price,
  change,
  changePercent,
  high,
  low,
  volume,
  marketCap
}: PriceDisplayProps) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`;
    }
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`;
    }
    return vol.toString();
  };

  return (
    <Card className="bg-gradient-to-br from-financial-card to-card shadow-financial border-financial-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{symbol}</CardTitle>
          <Badge 
            variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
            className={`px-3 py-1 ${
              isPositive ? "bg-success text-success-foreground" : 
              isNegative ? "bg-destructive text-destructive-foreground" : 
              "bg-muted text-muted-foreground"
            }`}
          >
            {isPositive && <TrendingUp className="h-3 w-3 mr-1" />}
            {isNegative && <TrendingDown className="h-3 w-3 mr-1" />}
            {!isPositive && !isNegative && <Minus className="h-3 w-3 mr-1" />}
            {changePercent > 0 ? "+" : ""}{changePercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">${formatNumber(price)}</span>
          <span className={`text-lg font-medium ${
            isPositive ? "text-success" : 
            isNegative ? "text-destructive" : 
            "text-muted-foreground"
          }`}>
            {change > 0 ? "+" : ""}{formatNumber(change)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-financial-border">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Day High</p>
            <p className="font-semibold">${formatNumber(high)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Day Low</p>
            <p className="font-semibold">${formatNumber(low)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="font-semibold">{formatVolume(volume)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-semibold">{marketCap}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};