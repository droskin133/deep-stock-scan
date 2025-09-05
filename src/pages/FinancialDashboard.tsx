import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  Settings, 
  Bell,
  TrendingUp,
  Search,
  BarChart3,
  Newspaper,
  User,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EnhancedAITool } from "@/components/EnhancedAITool";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { AlertsPanel } from "@/components/AlertsPanel";
import { useNavigate } from "react-router-dom";

export default function FinancialDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [screenResults, setScreenResults] = useState<any[]>([]);

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

  const handleStockSelect = (symbols: string[]) => {
    setSelectedStocks(symbols);
  };

  const handleScreenResults = (results: any[]) => {
    setScreenResults(results);
  };

  const handleAlertRequest = (alertData: any) => {
    // Handle alert creation request from AI
    console.log('AI requested alert:', alertData);
  };

  const navigation = [
    {
      name: "AI Assistant",
      icon: Search,
      current: true,
      onClick: () => {}
    },
    {
      name: "Deep Scan",
      icon: Activity,
      current: false,
      onClick: () => navigate('/deep-scan')
    },
    {
      name: "Watchlist",
      icon: TrendingUp,
      current: false,
      onClick: () => {}
    },
    {
      name: "Alerts",
      icon: Bell,
      current: false,
      onClick: () => {}
    },
    {
      name: "Portfolio",
      icon: BarChart3,
      current: false,
      onClick: () => navigate('/portfolio')
    },
    {
      name: "News",
      icon: Newspaper,
      current: false,
      onClick: () => navigate('/news')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FinanceAI Pro
            </h1>
            {profile?.role && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {profile.role}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  size="sm"
                  onClick={item.onClick}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              ))}
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {profile?.full_name && (
                      <p className="font-medium">{profile.full_name}</p>
                    )}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main AI Tool Section - 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Tool */}
            <div>
              <EnhancedAITool 
                onStockSelect={handleStockSelect}
                onScreenResults={handleScreenResults}
                onAlertRequest={handleAlertRequest}
              />
            </div>

            {/* Analysis Results */}
            {(selectedStocks.length > 0 || screenResults.length > 0) && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Results
                </h2>
                
                {selectedStocks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Selected Stocks</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedStocks.map((symbol) => (
                        <div 
                          key={symbol} 
                          className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/stock/${symbol}`)}
                        >
                          <div className="font-medium">{symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            Click to view detailed analysis
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {screenResults.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Screening Results</h3>
                    <div className="space-y-2">
                      {screenResults.map((result, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/stock/${result.symbol}`)}
                        >
                          <div>
                            <div className="font-medium">{result.symbol}</div>
                            <div className="text-sm text-muted-foreground">{result.reason}</div>
                          </div>
                          <Badge variant="secondary">
                            Score: {result.score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - 1 column on large screens */}
          <div className="space-y-6">
            {/* Open Alerts */}
            <AlertsPanel />
            
            {/* Watchlist */}
            <WatchlistPanel />
          </div>
        </div>
      </div>
    </div>
  );
}