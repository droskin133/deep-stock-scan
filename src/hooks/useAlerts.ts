import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  symbol: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike' | 'technical_indicator' | 'news_event' | 'earnings';
  status: 'active' | 'triggered' | 'snoozed' | 'cancelled';
  title: string;
  description?: string;
  target_value?: number;
  percentage_value?: number;
  timeframe?: string;
  conditions?: any;
  triggered_at?: string;
  snoozed_until?: string;
  created_at: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAlerts(data || []);
      setActiveAlerts(data?.filter(alert => alert.status === 'active') || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Omit<Alert, 'id' | 'created_at' | 'status'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          symbol: alertData.symbol,
          alert_type: alertData.alert_type,
          title: alertData.title,
          description: alertData.description,
          target_value: alertData.target_value,
          percentage_value: alertData.percentage_value,
          timeframe: alertData.timeframe as '1min' | '5min' | '15min' | '30min' | '1hr' | 'daily' | 'weekly' | 'monthly',
          conditions: alertData.conditions
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert created successfully",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  const updateAlertStatus = async (alertId: string, status: Alert['status'], snoozeUntil?: string) => {
    try {
      const updateData: any = { status };
      if (status === 'snoozed' && snoozeUntil) {
        updateData.snoozed_until = snoozeUntil;
      }

      const { error } = await supabase
        .from('alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${status}`,
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    }
  };

  return {
    alerts,
    activeAlerts,
    loading,
    createAlert,
    updateAlertStatus,
    deleteAlert,
    refetch: fetchAlerts
  };
}