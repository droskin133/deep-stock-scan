import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock portfolio data - in real app, this would come from database
const generateMockPortfolio = () => {
  const holdings = [
    { symbol: 'AAPL', shares: 50, avgCost: 150, currentPrice: 175.25 },
    { symbol: 'GOOGL', shares: 20, avgCost: 140, currentPrice: 135.80 },
    { symbol: 'MSFT', shares: 30, avgCost: 350, currentPrice: 378.90 },
    { symbol: 'TSLA', shares: 15, avgCost: 200, currentPrice: 248.50 },
    { symbol: 'AMZN', shares: 25, avgCost: 130, currentPrice: 142.65 },
  ];

  return holdings.map(holding => ({
    ...holding,
    marketValue: holding.shares * holding.currentPrice,
    costBasis: holding.shares * holding.avgCost,
    gainLoss: (holding.currentPrice - holding.avgCost) * holding.shares,
    gainLossPercent: ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100
  }));
};

export default function Portfolio() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(generateMockPortfolio());

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

  const totalMarketValue = portfolio.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalCostBasis = portfolio.reduce((sum, holding) => sum + holding.costBasis, 0);
  const totalGainLoss = totalMarketValue - totalCostBasis;
  const totalGainLossPercent = (totalGainLoss / totalCostBasis) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Portfolio</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMarketValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCostBasis.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              {totalGainLoss > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totalGainLoss > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalGainLoss > 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              {totalGainLossPercent > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totalGainLossPercent > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalGainLossPercent > 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Symbol</th>
                    <th className="text-right p-4">Shares</th>
                    <th className="text-right p-4">Avg Cost</th>
                    <th className="text-right p-4">Current Price</th>
                    <th className="text-right p-4">Market Value</th>
                    <th className="text-right p-4">Gain/Loss</th>
                    <th className="text-right p-4">Return %</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((holding) => (
                    <tr key={holding.symbol} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/stock/${holding.symbol}`)}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {holding.symbol}
                        </button>
                      </td>
                      <td className="text-right p-4">{holding.shares}</td>
                      <td className="text-right p-4">${holding.avgCost.toFixed(2)}</td>
                      <td className="text-right p-4">${holding.currentPrice.toFixed(2)}</td>
                      <td className="text-right p-4">${holding.marketValue.toLocaleString()}</td>
                      <td className={`text-right p-4 ${
                        holding.gainLoss > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.gainLoss > 0 ? '+' : ''}${holding.gainLoss.toLocaleString()}
                      </td>
                      <td className={`text-right p-4 ${
                        holding.gainLossPercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.gainLossPercent > 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/stock/${holding.symbol}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Buy More
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Sell Shares
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Remove Position
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Chart Placeholder */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Portfolio Allocation Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Portfolio Performance Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}