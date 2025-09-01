import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { table } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface Forecast {
  _id: string;
  title: string;
  type: string;
  model: string;
  predictions: string;
  created_at: string;
  status: string;
}

interface Outcome {
  _id: string;
  forecast_id: string;
  outcome_date: string;
}

interface PendingOutcome {
  forecastId: string;
  forecastTitle: string;
  modelName: string;
  predictionDate: string;
  predictedValue: number;
  daysOverdue: number;
  priority: 'high' | 'medium' | 'low';
}

const OutcomeReminder: React.FC = () => {
  const [pendingOutcomes, setPendingOutcomes] = useState<PendingOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingOutcomes();
  }, []);

  const loadPendingOutcomes = async () => {
    try {
      setLoading(true);
      
      // Load all forecasts and outcomes
      const [forecastsRes, outcomesRes] = await Promise.all([
        table.getItems('evn1j5kjx62o'),
        table.getItems('evtdsghlfbb4')
      ]);
      
      const forecasts = forecastsRes.items as Forecast[];
      const outcomes = outcomesRes.items as Outcome[];
      
      const today = new Date();
      const pending: PendingOutcome[] = [];
      
      // Check each active forecast for missing outcomes
      forecasts
        .filter(f => f.status === 'active')
        .forEach(forecast => {
          const predictions: DataPoint[] = JSON.parse(forecast.predictions);
          const recordedDates = outcomes
            .filter(o => o.forecast_id === forecast._id)
            .map(o => o.outcome_date);
          
          predictions.forEach(prediction => {
            const predDate = new Date(prediction.date);
            const daysDiff = Math.floor((today.getTime() - predDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Include predictions that are past due (negative daysDiff means future)
            if (daysDiff >= 0 && !recordedDates.includes(prediction.date.split('T')[0])) {
              let priority: 'high' | 'medium' | 'low' = 'low';
              if (daysDiff > 30) priority = 'high';
              else if (daysDiff > 7) priority = 'medium';
              
              pending.push({
                forecastId: forecast._id,
                forecastTitle: forecast.title,
                modelName: forecast.model,
                predictionDate: prediction.date,
                predictedValue: prediction.value,
                daysOverdue: daysDiff,
                priority
              });
            }
          });
        });
      
      // Sort by priority and days overdue
      pending.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.daysOverdue - a.daysOverdue;
      });
      
      setPendingOutcomes(pending.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Error loading pending outcomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissReminder = (forecastId: string, predictionDate: string) => {
    const dismissKey = `${forecastId}-${predictionDate}`;
    setDismissed(prev => [...prev, dismissKey]);
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const visiblePendingOutcomes = pendingOutcomes.filter(outcome => {
    const dismissKey = `${outcome.forecastId}-${outcome.predictionDate}`;
    return !dismissed.includes(dismissKey);
  });

  if (loading || visiblePendingOutcomes.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-amber-600" />
          <h4 className="font-medium text-amber-800">Outcome Tracking Reminders</h4>
          <Badge variant="secondary" className="ml-auto">
            {visiblePendingOutcomes.length} pending
          </Badge>
        </div>
        
        <div className="space-y-3">
          {visiblePendingOutcomes.map((outcome, index) => {
            const dismissKey = `${outcome.forecastId}-${outcome.predictionDate}`;
            
            return (
              <Alert key={dismissKey} className={`${getPriorityColor(outcome.priority)} relative`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(outcome.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{outcome.forecastTitle}</span>
                        <Badge variant="outline" size="sm">
                          {outcome.modelName}
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm">
                        <div className="space-y-1">
                          <div>
                            <strong>Date:</strong> {new Date(outcome.predictionDate).toLocaleDateString()} 
                            <span className="text-muted-foreground ml-2">
                              ({outcome.daysOverdue === 0 ? 'Due today' : `${outcome.daysOverdue} days overdue`})
                            </span>
                          </div>
                          <div>
                            <strong>Predicted Value:</strong> {outcome.predictedValue.toFixed(2)}
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // Navigate to forecast page or trigger outcome recording
                        toast({
                          title: 'Record Outcome',
                          description: 'Navigate to the forecast page to record this outcome.',
                        });
                      }}
                      className="h-8 px-2"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Record
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissReminder(outcome.forecastId, outcome.predictionDate)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Alert>
            );
          })}
        </div>
        
        <div className="mt-3 pt-3 border-t border-amber-200">
          <div className="flex items-center justify-between text-sm text-amber-700">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Recording outcomes improves future forecast accuracy</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed([])}
              className="h-6 px-2 text-xs"
            >
              Show All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutcomeReminder;