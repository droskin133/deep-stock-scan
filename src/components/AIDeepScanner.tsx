import { useState } from 'react';
import { Bot, Mic, MicOff, Send, Zap, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAlerts } from '@/hooks/useAlerts';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  ticker: string;
  condition: string;
  confidence: number;
  reasoning: string;
  type: 'buy' | 'sell' | 'watch' | 'alert';
}

interface AIDeepecannerProps {
  onStockSelect?: (ticker: string) => void;
  className?: string;
}

export function AIDeepScanner({ onStockSelect, className = "" }: AIDeepecannerProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const { createAlert } = useAlerts();
  const { createNotification } = useNotifications();
  const { toast } = useToast();

  const exampleQueries = [
    {
      category: "Momentum Scanning",
      icon: TrendingUp,
      queries: [
        "Find stocks up more than 5% with volume above 2x average",
        "Show me stocks breaking through resistance with high volume",
        "Scan for momentum stocks in the tech sector"
      ]
    },
    {
      category: "Anomaly Detection", 
      icon: AlertTriangle,
      queries: [
        "Detect unusual volume spikes in the last hour",
        "Find stocks with abnormal price movements vs sector",
        "Show me any insider trading activity today"
      ]
    },
    {
      category: "AI Insights",
      icon: Zap,
      queries: [
        "What are the best scalping opportunities right now?",
        "Find oversold stocks ready for bounce",
        "Show me stocks with bullish options flow"
      ]
    }
  ];

  const handleVoiceToggle = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice recognition not supported",
        description: "Please use a modern browser that supports voice recognition.",
        variant: "destructive"
      });
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        toast({
          title: "Voice recognition failed",
          description: "Please try again or type your query.",
          variant: "destructive"
        });
      };

      recognition.start();
    } catch (error) {
      console.error('Voice recognition error:', error);
      setListening(false);
    }
  };

  const handleScan = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Call AI Deep Scanner edge function
      const { data, error } = await supabase.functions.invoke('ai-deep-scanner', {
        body: { query }
      });

      if (error) throw error;

      const scanResults = data.results || [];
      setResults(scanResults);

      // Create notification about scan completion
      // Create notification about scan completion - simplified
      console.log(`Scan complete: Found ${scanResults.length} results`);

      toast({
        title: "Scan complete",
        description: `Found ${scanResults.length} results`,
      });

    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan failed",
        description: "Please try again or check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (result: ScanResult) => {
    try {
      await createAlert(result.ticker, result.condition, 'ai', new Date(Date.now() + 24 * 60 * 60 * 1000));
      toast({
        title: "Alert created",
        description: `Created alert for ${result.ticker}: ${result.condition}`,
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Failed to create alert",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleScan();
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Deep Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            placeholder="Ask me anything about the market... 'Find stocks up 5% with high volume' or 'Show me unusual options activity'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none"
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleVoiceToggle}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? 'Stop' : 'Voice'}
            </Button>
            <Button
              onClick={handleScan}
              disabled={!query.trim() || loading}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Scanning...' : 'Scan Market'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Scan Results</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStockSelect?.(result.ticker)}
                          className="font-mono font-bold text-primary"
                        >
                          {result.ticker}
                        </Button>
                        <Badge variant={
                          result.type === 'buy' ? 'default' : 
                          result.type === 'sell' ? 'destructive' : 
                          result.type === 'alert' ? 'secondary' : 'outline'
                        }>
                          {result.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(result.confidence * 100)}% confidence
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateAlert(result)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Alert
                      </Button>
                    </div>
                    <p className="text-sm">{result.condition}</p>
                    <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Example Queries */}
        <div className="space-y-3">
          <Separator />
          <h3 className="text-sm font-medium text-muted-foreground">Example Queries</h3>
          <div className="space-y-4">
            {exampleQueries.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">{category.category}</h4>
                </div>
                <div className="grid gap-1">
                  {category.queries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(example)}
                      className="text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}