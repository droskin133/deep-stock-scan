import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlerts } from "@/hooks/useAlerts";
import { useToast } from "@/hooks/use-toast";

interface AlertSetupFormProps {
  onSuccess?: () => void;
  initialSymbol?: string;
}

export function AlertSetupForm({ onSuccess, initialSymbol = "" }: AlertSetupFormProps) {
  const [formData, setFormData] = useState({
    symbol: initialSymbol.toUpperCase(),
    alert_type: 'price_above' as 'price_above' | 'price_below' | 'percent_change' | 'volume_spike' | 'technical_indicator' | 'news_event' | 'earnings',
    title: '',
    description: '',
    target_value: '',
    percentage_value: '',
    timeframe: 'daily' as '1min' | '5min' | '15min' | '30min' | '1hr' | 'daily' | 'weekly' | 'monthly'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createAlert } = useAlerts();
  const { toast } = useToast();

  const alertTypes = [
    { value: 'price_above', label: 'Price Above' },
    { value: 'price_below', label: 'Price Below' },
    { value: 'percent_change', label: 'Percent Change' },
    { value: 'volume_spike', label: 'Volume Spike' },
    { value: 'technical_indicator', label: 'Technical Indicator' },
    { value: 'news_event', label: 'News Event' },
    { value: 'earnings', label: 'Earnings' }
  ];

  const timeframes = [
    { value: '1min', label: '1 Minute' },
    { value: '5min', label: '5 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '1hr', label: '1 Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const alertData = {
        symbol: formData.symbol.toUpperCase(),
        alert_type: formData.alert_type,
        title: formData.title,
        description: formData.description || undefined,
        target_value: formData.target_value ? parseFloat(formData.target_value) : undefined,
        percentage_value: formData.percentage_value ? parseFloat(formData.percentage_value) : undefined,
        timeframe: formData.timeframe
      };

      await createAlert(alertData);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTitle = () => {
    if (!formData.symbol || !formData.alert_type) return;
    
    let title = `${formData.symbol} `;
    
    switch (formData.alert_type) {
      case 'price_above':
        title += formData.target_value ? `above $${formData.target_value}` : 'price alert';
        break;
      case 'price_below':
        title += formData.target_value ? `below $${formData.target_value}` : 'price alert';
        break;
      case 'percent_change':
        title += formData.percentage_value ? `${formData.percentage_value}% change` : 'percentage change';
        break;
      case 'volume_spike':
        title += 'unusual volume';
        break;
      case 'technical_indicator':
        title += 'technical signal';
        break;
      case 'news_event':
        title += 'news alert';
        break;
      case 'earnings':
        title += 'earnings announcement';
        break;
    }
    
    setFormData(prev => ({ ...prev, title }));
  };

  const needsTargetValue = ['price_above', 'price_below'].includes(formData.alert_type);
  const needsPercentage = formData.alert_type === 'percent_change';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symbol">Stock Symbol *</Label>
        <Input
          id="symbol"
          value={formData.symbol}
          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
          placeholder="AAPL, GOOGL, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alert_type">Alert Type *</Label>
        <Select
          value={formData.alert_type}
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, alert_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {alertTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsTargetValue && (
        <div className="space-y-2">
          <Label htmlFor="target_value">Target Price *</Label>
          <Input
            id="target_value"
            type="number"
            step="0.01"
            value={formData.target_value}
            onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
            placeholder="150.00"
            required
          />
        </div>
      )}

      {needsPercentage && (
        <div className="space-y-2">
          <Label htmlFor="percentage_value">Percentage Change *</Label>
          <Input
            id="percentage_value"
            type="number"
            step="0.1"
            value={formData.percentage_value}
            onChange={(e) => setFormData(prev => ({ ...prev, percentage_value: e.target.value }))}
            placeholder="5.0"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="timeframe">Timeframe</Label>
        <Select
          value={formData.timeframe}
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, timeframe: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map(tf => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Alert Title *</Label>
        <div className="flex gap-2">
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Alert description"
            required
          />
          <Button type="button" variant="outline" onClick={generateTitle}>
            Auto
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Additional notes about this alert..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Creating...
            </>
          ) : (
            'Create Alert'
          )}
        </Button>
      </div>
    </form>
  );
}