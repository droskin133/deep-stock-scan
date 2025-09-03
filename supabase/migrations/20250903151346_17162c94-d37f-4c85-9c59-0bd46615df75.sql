-- Create comprehensive database schema for financial application

-- Create enum types for better data integrity
CREATE TYPE public.alert_type AS ENUM (
  'price_above',
  'price_below',
  'percent_change',
  'volume_spike',
  'technical_indicator',
  'news_event',
  'earnings'
);

CREATE TYPE public.alert_status AS ENUM ('active', 'triggered', 'snoozed', 'cancelled');

CREATE TYPE public.timeframe AS ENUM (
  '1min', '5min', '15min', '30min', '1hr',
  'daily', 'weekly', 'monthly'
);

-- Watchlists table
CREATE TABLE public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Watchlist',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Watchlist items table
CREATE TABLE public.watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  company_name TEXT,
  sector TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(watchlist_id, symbol)
);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  alert_type public.alert_type NOT NULL,
  status public.alert_status NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(15, 6),
  percentage_value DECIMAL(5, 2),
  timeframe public.timeframe DEFAULT 'daily',
  conditions JSONB DEFAULT '{}',
  triggered_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_timeframe public.timeframe DEFAULT 'daily',
  preferred_indicators TEXT[] DEFAULT ARRAY[]::TEXT[],
  notification_settings JSONB DEFAULT '{"push": true, "email": false}',
  theme_preference TEXT DEFAULT 'system',
  data_sharing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI interactions table for personalized learning
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  response JSONB,
  symbols TEXT[],
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watchlists
CREATE POLICY "Users can view their own watchlists" 
ON public.watchlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlists" 
ON public.watchlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlists" 
ON public.watchlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists" 
ON public.watchlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for watchlist items
CREATE POLICY "Users can view their own watchlist items" 
ON public.watchlist_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.watchlists 
  WHERE watchlists.id = watchlist_items.watchlist_id 
  AND watchlists.user_id = auth.uid()
));

CREATE POLICY "Users can create their own watchlist items" 
ON public.watchlist_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.watchlists 
  WHERE watchlists.id = watchlist_items.watchlist_id 
  AND watchlists.user_id = auth.uid()
));

CREATE POLICY "Users can update their own watchlist items" 
ON public.watchlist_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.watchlists 
  WHERE watchlists.id = watchlist_items.watchlist_id 
  AND watchlists.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own watchlist items" 
ON public.watchlist_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.watchlists 
  WHERE watchlists.id = watchlist_items.watchlist_id 
  AND watchlists.user_id = auth.uid()
));

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts" 
ON public.alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" 
ON public.alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" 
ON public.alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for user preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for AI interactions
CREATE POLICY "Users can view their own AI interactions" 
ON public.ai_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI interactions" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI interactions" 
ON public.ai_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_symbol ON public.watchlist_items(symbol);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_symbol ON public.alerts(symbol);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at);
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON public.ai_interactions(created_at);

-- Triggers for updating timestamps
CREATE TRIGGER update_watchlists_updated_at
BEFORE UPDATE ON public.watchlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default watchlist for new users
CREATE OR REPLACE FUNCTION public.create_default_watchlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Create default watchlist
  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (NEW.user_id, 'My Watchlist', true);
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Don't block profile creation if this fails
  RAISE WARNING 'create_default_watchlist failed for %: %', NEW.user_id, SQLERRM;
  RETURN NEW;
END;
$function$;

-- Trigger to create default watchlist when profile is created
CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_watchlist();