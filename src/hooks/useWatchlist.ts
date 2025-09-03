import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface WatchlistItem {
  id: string;
  symbol: string;
  company_name?: string;
  sector?: string;
  added_at: string;
  notes?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  items?: WatchlistItem[];
}

export function useWatchlist() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [defaultWatchlist, setDefaultWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWatchlists();
    }
  }, [user]);

  const fetchWatchlists = async () => {
    try {
      const { data: watchlistsData, error: watchlistsError } = await supabase
        .from('watchlists')
        .select(`
          *,
          watchlist_items (*)
        `)
        .order('created_at', { ascending: true });

      if (watchlistsError) throw watchlistsError;

      const watchlistsWithItems = watchlistsData.map(watchlist => ({
        ...watchlist,
        items: watchlist.watchlist_items || []
      }));

      setWatchlists(watchlistsWithItems);
      const defaultWL = watchlistsWithItems.find(wl => wl.is_default);
      setDefaultWatchlist(defaultWL || watchlistsWithItems[0] || null);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch watchlists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol: string, companyName?: string, watchlistId?: string) => {
    if (!user) return;

    try {
      const targetWatchlistId = watchlistId || defaultWatchlist?.id;
      if (!targetWatchlistId) {
        toast({
          title: "Error",
          description: "No watchlist available",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('watchlist_items')
        .insert({
          watchlist_id: targetWatchlistId,
          symbol: symbol.toUpperCase(),
          company_name: companyName
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${symbol.toUpperCase()} added to watchlist`,
      });

      fetchWatchlists();
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      if (error.code === '23505') {
        toast({
          title: "Info",
          description: `${symbol.toUpperCase()} is already in this watchlist`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to watchlist",
          variant: "destructive",
        });
      }
    }
  };

  const removeFromWatchlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item removed from watchlist",
      });

      fetchWatchlists();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    }
  };

  const createWatchlist = async (name: string, description?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlists')
        .insert({
          user_id: user.id,
          name,
          description
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Watchlist created successfully",
      });

      fetchWatchlists();
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to create watchlist",
        variant: "destructive",
      });
    }
  };

  return {
    watchlists,
    defaultWatchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    createWatchlist,
    refetch: fetchWatchlists
  };
}