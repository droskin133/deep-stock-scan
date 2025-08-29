import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";

interface Institution {
  name: string;
  shares: number;
  percentage: number;
  change: number;
  value: string;
}

interface InsiderTrade {
  name: string;
  position: string;
  transaction: "Buy" | "Sell";
  shares: number;
  price: number;
  date: string;
  value: string;
}

interface OwnershipDataProps {
  institutional: Institution[];
  government: Institution[];
  insiderTrades: InsiderTrade[];
  totalShares: number;
}

export const OwnershipData = ({ institutional, government, insiderTrades, totalShares }: OwnershipDataProps) => {
  const formatShares = (shares: number) => {
    if (shares >= 1000000) {
      return `${(shares / 1000000).toFixed(1)}M`;
    }
    if (shares >= 1000) {
      return `${(shares / 1000).toFixed(1)}K`;
    }
    return shares.toString();
  };

  const InstitutionList = ({ institutions }: { institutions: Institution[] }) => (
    <div className="space-y-3">
      {institutions.map((inst, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border border-financial-border/50 transition-colors">
          <div className="flex-1">
            <p className="font-medium">{inst.name}</p>
            <p className="text-sm text-muted-foreground">{inst.value}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{formatShares(inst.shares)}</p>
              <p className="text-sm text-muted-foreground">{inst.percentage.toFixed(2)}%</p>
            </div>
            <div className={`flex items-center gap-1 ${
              inst.change > 0 ? 'text-success' : inst.change < 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {inst.change > 0 ? <TrendingUp className="h-3 w-3" /> : 
               inst.change < 0 ? <TrendingDown className="h-3 w-3" /> : 
               <ArrowUpDown className="h-3 w-3" />}
              <span className="text-xs font-medium">
                {inst.change > 0 ? '+' : ''}{inst.change.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-financial-card to-card shadow-card border-financial-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Ownership & Insider Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="institutional" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="institutional" className="text-xs">Institutional</TabsTrigger>
            <TabsTrigger value="government" className="text-xs">Government</TabsTrigger>
            <TabsTrigger value="insider" className="text-xs">Insider Trades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="institutional" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Top institutional holders
              </span>
            </div>
            <InstitutionList institutions={institutional} />
          </TabsContent>
          
          <TabsContent value="government" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Government ownership
              </span>
            </div>
            <InstitutionList institutions={government} />
          </TabsContent>
          
          <TabsContent value="insider" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Recent insider transactions
              </span>
            </div>
            <div className="space-y-3">
              {insiderTrades.map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 rounded-lg border border-financial-border/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{trade.name}</p>
                    <p className="text-sm text-muted-foreground">{trade.position}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatShares(trade.shares)} shares</p>
                      <p className="text-xs text-muted-foreground">@ ${trade.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={trade.transaction === 'Buy' ? 
                          'bg-success text-success-foreground' : 
                          'bg-destructive text-destructive-foreground'
                        }
                      >
                        {trade.transaction}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{trade.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};