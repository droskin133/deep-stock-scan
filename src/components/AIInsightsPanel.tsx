import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pin, X, TrendingUp, TrendingDown, Newspaper, BarChart3, Target } from "lucide-react";

interface Insight {
  id: number;
  type: "support" | "resistance" | "news" | "volume" | "analyst";
  text: string;
}

interface AIInsightsPanelProps {
  insights: Insight[];
  onPinOverlay: (insight: Insight) => void;
  onRemoveOverlay: (id: number) => void;
}

const getInsightIcon = (type: Insight['type']) => {
  switch (type) {
    case 'support':
      return <TrendingUp className="h-4 w-4 text-success" />;
    case 'resistance':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case 'news':
      return <Newspaper className="h-4 w-4 text-primary" />;
    case 'volume':
      return <BarChart3 className="h-4 w-4 text-warning" />;
    case 'analyst':
      return <Target className="h-4 w-4 text-accent-foreground" />;
    default:
      return null;
  }
};

const getInsightBadgeVariant = (type: Insight['type']): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case 'support':
      return 'default';
    case 'resistance':
      return 'destructive';
    case 'news':
      return 'outline';
    case 'volume':
      return 'secondary';
    case 'analyst':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function AIInsightsPanel({ insights, onPinOverlay, onRemoveOverlay }: AIInsightsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">AI Insights</h3>
        <Badge variant="secondary">{insights.length} insights</Badge>
      </div>
      
      <div className="grid gap-3">
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                  {insight.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {insight.text}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onPinOverlay(insight)}
                className="h-8 px-2"
                title="Pin to chart"
              >
                <Pin className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onRemoveOverlay(insight.id)}
                className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
                title="Remove insight"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {insights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No AI insights available yet.</p>
            <p className="text-xs mt-1">Insights will appear as market conditions change.</p>
          </div>
        )}
      </div>
    </div>
  );
}