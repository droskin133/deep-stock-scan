import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Calendar, 
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  Building,
  Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock news data
const generateMockNews = () => {
  const categories = ['earnings', 'merger', 'product', 'regulatory', 'market', 'analyst'];
  const sources = ['MarketWatch', 'Bloomberg', 'Reuters', 'CNBC', 'Financial Times'];
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META'];

  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `${symbols[Math.floor(Math.random() * symbols.length)]} ${
      ['Reports Strong Earnings', 'Announces New Product Launch', 'Faces Regulatory Scrutiny', 
       'Beats Revenue Expectations', 'Plans Strategic Acquisition', 'Expands Market Presence'][Math.floor(Math.random() * 6)]
    }`,
    summary: "The company exceeded analyst expectations with strong revenue growth and improved margins, driven by increased demand and operational efficiency improvements...",
    category: categories[Math.floor(Math.random() * categories.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(),
    symbols: [symbols[Math.floor(Math.random() * symbols.length)]],
    sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative'
  }));
};

export default function News() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState(generateMockNews());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.symbols.some(symbol => symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSentiment = selectedSentiment === 'all' || article.sentiment === selectedSentiment;
    
    return matchesSearch && matchesCategory && matchesSentiment;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'earnings': return '💼';
      case 'merger': return '🤝';
      case 'product': return '🚀';
      case 'regulatory': return '⚖️';
      case 'market': return '📈';
      case 'analyst': return '🔍';
      default: return '📰';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Market News</h1>
            <Badge variant="secondary">{filteredNews.length} articles</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news, stocks, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="earnings">Earnings</SelectItem>
                  <SelectItem value="merger">M&A</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* News Feed */}
        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No news found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </CardContent>
            </Card>
          ) : (
            filteredNews.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getCategoryIcon(article.category)}</span>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer">
                          {article.title}
                        </h3>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Stock symbols */}
                          <div className="flex gap-1">
                            {article.symbols.map((symbol) => (
                              <button
                                key={symbol}
                                onClick={() => navigate(`/stock/${symbol}`)}
                                className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                              >
                                {symbol}
                              </button>
                            ))}
                          </div>
                          
                          {/* Category badge */}
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          
                          {/* Sentiment badge */}
                          <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                            {article.sentiment}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            <span>{article.source}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNews.length > 0 && (
          <div className="text-center">
            <Button variant="outline">
              Load More Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}