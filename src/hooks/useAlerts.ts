import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Alert {
  id: string;
  ticker: string;
  condition: string;
  source: 'user' | 'ai' | 'community';
  status: 'active' | 'triggered' | 'canceled' | 'expired';
  expires_at?: string;
  created_at: string;
  triggered_at?: string;
}

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setAlerts([]);
      setLoading(false);
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
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (ticker: string, condition: string, source: Alert['source'] = 'user', expiresAt?: Date) => {
    try {
      const alertData = {
        ticker: ticker.toUpperCase(),
        condition,
        source,
        ...(expiresAt && { expires_at: expiresAt.toISOString() })
      };

      const { error } = await supabase
        .from('alerts')
        .insert(alertData);

      if (error) throw error;
      await fetchAlerts();
      return { error: null };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { error };
    }
  };

  return {
    alerts,
    loading,
    createAlert,
    refetch: fetchAlerts,
  };
}