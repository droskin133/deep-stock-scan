import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  ai_suggestions_default: boolean;
  theme: 'system' | 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (!data && user) {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          ai_suggestions_default: true,
          theme: 'system' as const,
        };

        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      if (!user) return { error: 'No user logged in' };

      const { error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSettings();
      return { error: null };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { error };
    }
  };

  const updateTheme = async (theme: UserSettings['theme']) => {
    return updateSettings({ theme });
  };

  return {
    settings,
    loading,
    updateSettings,
    updateTheme,
    refetch: fetchSettings,
  };
}