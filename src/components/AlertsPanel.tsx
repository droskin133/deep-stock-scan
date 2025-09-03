import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellOff, 
  Clock, 
  X, 
  Play,
  Pause,
  MoreVertical,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAlerts, type Alert } from "@/hooks/useAlerts";
import { AlertSetupForm } from "./AlertSetupForm";
import { formatDistanceToNow } from "date-fns";

export function AlertsPanel() {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const { alerts, activeAlerts, updateAlertStatus, deleteAlert, loading } = useAlerts();

  const getAlertIcon = (type: Alert['alert_type']) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return '💰';
      case 'volume_spike':
        return '📈';
      case 'technical_indicator':
        return '📊';
      case 'news_event':
        return '📰';
      case 'earnings':
        return '💼';
      default:
        return '🔔';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'triggered':
        return 'bg-blue-500';
      case 'snoozed':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleSnoozeAlert = (alertId: string) => {
    const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    updateAlertStatus(alertId, 'snoozed', snoozeUntil);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Open Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Open Alerts
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {activeAlerts.length} active
              </Badge>
              <Button 
                size="sm" 
                onClick={() => setShowCreateAlert(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Alert
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!alerts.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts set up</p>
              <p className="text-xs">Create alerts to track price movements and events</p>
              <Button 
                className="mt-3" 
                size="sm" 
                onClick={() => setShowCreateAlert(true)}
              >
                Create Your First Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                      <span className="font-medium text-sm">{alert.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.alert_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {alert.title}
                    </p>
                    
                    {alert.target_value && (
                      <p className="text-xs text-muted-foreground">
                        Target: ${alert.target_value}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                      {alert.status === 'snoozed' && alert.snoozed_until && (
                        <>
                          <span>•</span>
                          <span>Snoozed until {new Date(alert.snoozed_until).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {alert.status === 'active' && (
                        <DropdownMenuItem onClick={() => handleSnoozeAlert(alert.id)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Snooze 24h
                        </DropdownMenuItem>
                      )}
                      
                      {alert.status === 'snoozed' && (
                        <DropdownMenuItem onClick={() => updateAlertStatus(alert.id, 'active')}>
                          <Play className="h-4 w-4 mr-2" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => updateAlertStatus(alert.id, 'cancelled')}
                      >
                        <BellOff className="h-4 w-4 mr-2" />
                        Disable
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
          </DialogHeader>
          <AlertSetupForm onSuccess={() => setShowCreateAlert(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}