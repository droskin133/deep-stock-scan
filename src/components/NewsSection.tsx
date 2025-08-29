import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Clock, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  summary: string;
  url: string;
}

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection = ({ news }: NewsSectionProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success text-success-foreground';
      case 'negative':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'Bullish';
      case 'negative':
        return 'Bearish';
      default:
        return 'Neutral';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-financial-card to-card shadow-card border-financial-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Recent News
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="group p-4 bg-muted/20 hover:bg-muted/40 rounded-lg border border-financial-border/50 hover:border-financial-border transition-all duration-200">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-muted-foreground">{item.source}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSentimentColor(item.sentiment)}>
                  {getSentimentLabel(item.sentiment)}
                </Badge>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {item.summary}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};