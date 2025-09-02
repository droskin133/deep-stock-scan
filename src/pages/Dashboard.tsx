import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AITool from "@/components/AITool";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Settings, User, Bell, TrendingUp, BarChart3, Wallet, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [screenResults, setScreenResults] = useState<any[]>([]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleStockSelect = (stocks: string[]) => {
    setSelectedStocks(stocks);
  };

  const handleScreenResults = (results: any[]) => {
    setScreenResults(results);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">DeepStock Scan</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Stock Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="hidden sm:flex">
              {profile?.role === 'user' ? 'Trial Account' : profile?.role}
            </Badge>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
          </h2>
          <p className="text-muted-foreground">
            Use the AI tool below to analyze stocks, create screens, or get market insights.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - AI Tool */}
          <div className="lg:col-span-2 space-y-6">
            <AITool 
              onStockSelect={handleStockSelect}
              onScreenResults={handleScreenResults}
            />

            {/* Results Section */}
            {(selectedStocks.length > 0 || screenResults.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="stocks" className="w-full">
                    <TabsList>
                      <TabsTrigger value="stocks">Selected Stocks</TabsTrigger>
                      <TabsTrigger value="screening">Screen Results</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stocks">
                      {selectedStocks.length > 0 ? (
                        <div className="grid gap-3">
                          {selectedStocks.map((stock) => (
                            <Card key={stock} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{stock}</h3>
                                  <p className="text-sm text-muted-foreground">Click to analyze</p>
                                </div>
                                <Button size="sm">View Details</Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No stocks selected yet. Use the AI tool to search for stocks.
                        </p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="screening">
                      {screenResults.length > 0 ? (
                        <div className="grid gap-3">
                          {screenResults.map((result, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{result.symbol}</h3>
                                  <p className="text-sm text-muted-foreground">{result.name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">${result.price}</p>
                                  <p className={`text-sm ${result.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {result.change >= 0 ? '+' : ''}{result.change}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No screening results yet. Use the AI tool to create a stock screen.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Market Status</span>
                  <Badge variant="default">Open</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">S&P 500</span>
                  <span className="text-sm font-semibold text-success">+0.45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NASDAQ</span>
                  <span className="text-sm font-semibold text-success">+0.72%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DOW</span>
                  <span className="text-sm font-semibold text-destructive">-0.23%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  My Portfolios
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Stock Screener
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="mr-2 h-4 w-4" />
                  Watchlists
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </CardContent>
            </Card>

            {/* Trial Info */}
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader>
                <CardTitle className="text-lg text-warning-foreground">Free Trial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-warning-foreground mb-3">
                  2 days remaining in your free trial
                </p>
                <Button size="sm" className="w-full">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;