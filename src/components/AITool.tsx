import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Sparkles, TrendingUp, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIToolProps {
  onStockSelect?: (stocks: string[]) => void;
  onScreenResults?: (results: any[]) => void;
}

const AITool = ({ onStockSelect, onScreenResults }: AIToolProps) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentQueries, setRecentQueries] = useState([
    "Find biotech stocks with EMA crossover and earnings next week",
    "Show me Apple dividend yield and P/E ratio",
    "Screen for tech stocks under $50 with high volume",
    "Analyze TSLA technical indicators on daily chart"
  ]);
  const { toast } = useToast();

  const examplePrompts = [
    {
      category: "Technical Analysis",
      prompts: [
        "Find stocks with RSI oversold and MACD bullish crossover",
        "Show stocks breaking above 200-day moving average",
        "Screen for stocks with volume spike above 3x average"
      ]
    },
    {
      category: "Fundamental Screening", 
      prompts: [
        "Find undervalued stocks with P/E under 15 and debt ratio below 0.3",
        "Show growth stocks with revenue growth above 20%",
        "Find dividend aristocrats yielding over 3%"
      ]
    },
    {
      category: "Event-Based",
      prompts: [
        "Show biotech companies with FDA approvals this month",
        "Find stocks with earnings surprises in the last quarter",
        "Screen for companies announcing buybacks"
      ]
    }
  ];

  const handleVoiceToggle = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
          toast({
            title: "Voice recognition failed",
            description: "Please try again or type your query.",
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        toast({
          title: "Voice not supported",
          description: "Voice recognition is not supported in this browser.",
          variant: "destructive",
        });
      }
    } else {
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    
    // Add to recent queries
    setRecentQueries(prev => [input, ...prev.slice(0, 3)]);

    try {
      // TODO: Implement AI processing logic
      // This would connect to your AI service
      
      toast({
        title: "Processing query",
        description: "Your AI request is being processed...",
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response based on query type
      if (input.toLowerCase().includes('screen') || input.toLowerCase().includes('find')) {
        // Mock screening results
        const mockResults = [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.15 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: -15.20 },
          { symbol: 'MSFT', name: 'Microsoft Corp.', price: 335.50, change: 5.75 }
        ];
        onScreenResults?.(mockResults);
      } else {
        // Mock stock selection
        const stockMatch = input.match(/([A-Z]{2,5})/g);
        if (stockMatch) {
          onStockSelect?.(stockMatch);
        }
      }

      setInput("");
      
    } catch (error) {
      toast({
        title: "Error processing query",
        description: "Please try again with a different request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Main AI Input */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Stock Analysis Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Ask me anything about stocks, screening criteria, or technical analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[100px] pr-20 resize-none border-2 border-input focus:border-primary/50"
              disabled={isProcessing}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={isListening ? "text-destructive" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Processing
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isListening && (
            <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <div className="animate-pulse">🎤</div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Queries */}
      {recentQueries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentQueries.map((query, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 p-2 max-w-xs truncate"
                  onClick={() => handleExampleClick(query)}
                >
                  <Search className="h-3 w-3 mr-1" />
                  {query}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Prompts */}
      <div className="grid gap-4 md:grid-cols-3">
        {examplePrompts.map((category, index) => (
          <Card key={index} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.prompts.map((prompt, promptIndex) => (
                  <button
                    key={promptIndex}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors block w-full p-2 rounded hover:bg-secondary/50"
                    disabled={isProcessing}
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AITool;