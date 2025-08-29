import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown } from "lucide-react";

interface PriceTarget {
  analyst: string;
  target: number;
  rating: "Buy" | "Hold" | "Sell";
  date: string;
}

interface PriceTargetsProps {
  currentPrice: number;
  targets: PriceTarget[];
  consensus: {
    target: number;
    rating: string;
    upside: number;
  };
}

export const PriceTargets = ({ currentPrice, targets, consensus }: PriceTargetsProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'buy':
        return 'bg-success text-success-foreground';
      case 'sell':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-warning text-warning-foreground';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-financial-card to-card shadow-card border-financial-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Price Targets
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Consensus */}
        <div className="bg-gradient-to-r from-muted/50 to-accent/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Analyst Consensus</h4>
            <Badge className={getRatingColor(consensus.rating)}>
              {consensus.rating}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold">${formatNumber(consensus.target)}</p>
              <p className="text-sm text-muted-foreground">Average Target</p>
            </div>
            <div className="flex items-center gap-1">
              {consensus.upside > 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`font-semibold ${
                consensus.upside > 0 ? 'text-success' : 'text-destructive'
              }`}>
                {consensus.upside > 0 ? '+' : ''}{consensus.upside.toFixed(1)}% upside
              </span>
            </div>
          </div>
        </div>

        {/* Individual Targets */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Recent Analyst Targets</h4>
          {targets.map((target, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <p className="font-medium">{target.analyst}</p>
                <p className="text-sm text-muted-foreground">{target.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">${formatNumber(target.target)}</p>
                  <p className="text-xs text-muted-foreground">
                    {((target.target - currentPrice) / currentPrice * 100).toFixed(1)}%
                  </p>
                </div>
                <Badge className={getRatingColor(target.rating)}>
                  {target.rating}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};