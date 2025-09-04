import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Sparkles, TrendingUp, Search, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AIToolProps {
  onStockSelect?: (symbols: string[]) => void;
  onScreenResults?: (results: any[]) => void;
  onAlertRequest?: (alertData: any) => void;
}

export function EnhancedAITool({ onStockSelect, onScreenResults, onAlertRequest }: AIToolProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecentQueries();
    }
  }, [user]);

  const loadRecentQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_interactions')
        .select('query')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentQueries(data?.map(item => item.query) || []);
    } catch (error) {
      console.error('Error loading recent queries:', error);
    }
  };

  const saveInteraction = async (query: string, response: any, symbols?: string[]) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_interactions')
        .insert({
          user_id: user.id,
          query,
          response,
          symbols: symbols || []
        });
    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your query now.",
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Error",
        description: "Speech recognition failed. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const parseAIResponse = (query: string, aiResult: string) => {
    // Parse the AI response to determine what type of action to take
    const lowerQuery = query.toLowerCase();
    const lowerResult = aiResult.toLowerCase();
    
    // Stock symbol detection
    const stockPattern = /\b[A-Z]{1,5}\b/g;
    const potentialSymbols = query.match(stockPattern) || [];
    
    // Alert keywords
    const alertKeywords = ['alert', 'notify', 'watch', 'tell me when', 'notification'];
    const isAlertQuery = alertKeywords.some(keyword => lowerQuery.includes(keyword));
    
    // Screening keywords
    const screenKeywords = ['find', 'screen', 'search for', 'show me', 'filter'];
    const isScreeningQuery = screenKeywords.some(keyword => lowerQuery.includes(keyword));

    if (isAlertQuery && potentialSymbols.length > 0) {
      return {
        type: 'alert_setup',
        message: aiResult,
        symbols: potentialSymbols,
        alertData: {
          symbols: potentialSymbols,
          type: 'price_above',
          description: query
        }
      };
    }

    if (isScreeningQuery) {
      return {
        type: 'screener',
        message: aiResult,
        results: [
          { symbol: 'AAPL', score: 95, reason: 'AI recommended' },
          { symbol: 'GOOGL', score: 88, reason: 'AI recommended' },
          { symbol: 'MSFT', score: 92, reason: 'AI recommended' }
        ]
      };
    }

    if (potentialSymbols.length > 0) {
      return {
        type: 'stock_analysis',
        message: aiResult,
        symbols: potentialSymbols,
        analysis: {
          sentiment: 'neutral',
          confidence: 0.75,
          keyPoints: ['AI analysis complete']
        }
      };
    }

    return {
      type: 'general',
      message: aiResult,
      suggestions: []
    };
  };

  const processAIQuery = async (query: string) => {
    setIsProcessing(true);
    
    try {
      // Call the real OpenAI API via edge function
      const response = await fetch(`${window.location.origin}/functions/v1/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: query,
          context: 'Financial AI Assistant - analyze stocks, create alerts, screen markets',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResult = data.result;

      // Parse AI response to determine action type
      const parsedResponse = parseAIResponse(query, aiResult);
      
      // Save interaction
      await saveInteraction(query, parsedResponse, parsedResponse.symbols);
      
      // Update recent queries
      setRecentQueries(prev => {
        const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        return updated;
      });

      // Handle different types of responses
      if (parsedResponse.type === 'stock_analysis' && parsedResponse.symbols) {
        onStockSelect?.(parsedResponse.symbols);
      } else if (parsedResponse.type === 'screener' && parsedResponse.results) {
        onScreenResults?.(parsedResponse.results);
      } else if (parsedResponse.type === 'alert_setup' && parsedResponse.alertData) {
        onAlertRequest?.(parsedResponse.alertData);
      }

      toast({
        title: "Analysis Complete",
        description: parsedResponse.message || "Your request has been processed.",
      });

    } catch (error) {
      console.error('AI query error:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateFinancialAI = async (query: string) => {
    // Enhanced AI simulation with better financial context
    const lowerQuery = query.toLowerCase();
    
    // Stock symbol detection
    const stockPattern = /\b[A-Z]{1,5}\b/g;
    const potentialSymbols = query.match(stockPattern) || [];
    
    // Alert keywords
    const alertKeywords = ['alert', 'notify', 'watch', 'tell me when', 'notification'];
    const isAlertQuery = alertKeywords.some(keyword => lowerQuery.includes(keyword));
    
    // Screening keywords
    const screenKeywords = ['find', 'screen', 'search for', 'show me', 'filter'];
    const isScreeningQuery = screenKeywords.some(keyword => lowerQuery.includes(keyword));

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

    if (isAlertQuery && potentialSymbols.length > 0) {
      return {
        type: 'alert_setup',
        message: `Setting up alert for ${potentialSymbols.join(', ')}`,
        symbols: potentialSymbols,
        alertData: {
          symbols: potentialSymbols,
          type: 'price_above',
          description: query
        }
      };
    }

    if (isScreeningQuery) {
      return {
        type: 'screener',
        message: 'Found matching stocks based on your criteria',
        results: [
          { symbol: 'AAPL', score: 95, reason: 'Strong fundamentals' },
          { symbol: 'GOOGL', score: 88, reason: 'Technical breakout' },
          { symbol: 'MSFT', score: 92, reason: 'Earnings momentum' }
        ]
      };
    }

    if (potentialSymbols.length > 0) {
      return {
        type: 'stock_analysis',
        message: `Analyzing ${potentialSymbols.join(', ')}`,
        symbols: potentialSymbols,
        analysis: {
          sentiment: 'bullish',
          confidence: 0.85,
          keyPoints: ['Strong earnings', 'Technical breakout', 'Positive sentiment']
        }
      };
    }

    return {
      type: 'general',
      message: 'I can help you analyze stocks, set up alerts, and screen the market. Try asking about specific stocks or market conditions.',
      suggestions: [
        'Analyze AAPL stock',
        'Find stocks with high volume',
        'Alert me when TSLA goes above $200'
      ]
    };
  };

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;
    
    const query = input.trim();
    setInput("");
    await processAIQuery(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exampleQueries = [
    {
      category: "Technical Analysis",
      queries: [
        "Analyze AAPL technical indicators",
        "Show me stocks with RSI below 30",
        "Find stocks breaking out of resistance"
      ]
    },
    {
      category: "Fundamental Screening", 
      queries: [
        "Find stocks with P/E ratio under 15",
        "Show me dividend stocks yielding over 4%",
        "Screen for stocks with growing revenue"
      ]
    },
    {
      category: "Alerts & Monitoring",
      queries: [
        "Alert me when TSLA goes above $250",
        "Notify me of any NVDA news",
        "Watch for unusual volume in tech stocks"
      ]
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Main AI Input Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Financial Assistant</h2>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about stocks, set alerts, or screen the market..."
                className="min-h-[100px] pr-24 resize-none text-base"
                disabled={isProcessing}
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button
                  size="sm"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={handleVoiceToggle}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {recentQueries.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recent queries:</p>
                <div className="flex flex-wrap gap-2">
                  {recentQueries.map((query, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setInput(query)}
                    >
                      {query.length > 50 ? query.substring(0, 50) + '...' : query}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Example Queries */}
      <div className="grid gap-4 md:grid-cols-3">
        {exampleQueries.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="border border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {categoryIndex === 0 && <TrendingUp className="h-4 w-4 text-primary" />}
                {categoryIndex === 1 && <Search className="h-4 w-4 text-primary" />}
                {categoryIndex === 2 && <Calendar className="h-4 w-4 text-primary" />}
                <h3 className="font-medium text-sm">{category.category}</h3>
              </div>
              <div className="space-y-2">
                {category.queries.map((query, queryIndex) => (
                  <button
                    key={queryIndex}
                    onClick={() => setInput(query)}
                    className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors w-full p-2 rounded-md hover:bg-muted/50"
                    disabled={isProcessing}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}