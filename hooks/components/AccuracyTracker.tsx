import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { table } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { Target, TrendingUp, TrendingDown, Plus, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface Forecast {
  _id: string;
  title: string;
  type: string;
  model: string;
  predictions: string;
  accuracy_score: number;
  time_horizon: string;
  status: string;
  created_at: string;
}

interface Outcome {
  _id: string;
  forecast_id: string;
  actual_value: number;
  predicted_value: number;
  variance: number;
  accuracy_percentage: number;
  outcome_date: string;
  recorded_at: string;
}

interface AccuracyMetrics {
  forecast_id: string;
  title: string;
  model: string;
  total_outcomes: number;
  avg_accuracy: number;
  best_accuracy: number;
  worst_accuracy: number;
  trend: 'improving' | 'declining' | 'stable';
  last_updated: string;
}

const AccuracyTracker: React.FC = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [metrics, setMetrics] = useState<AccuracyMetrics[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddOutcome, setShowAddOutcome] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    forecast_id: '',
    actual_value: '',
    outcome_date: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (forecasts.length > 0 && outcomes.length >= 0) {
      calculateMetrics();
    }
  }, [forecasts, outcomes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [forecastsRes, outcomesRes] = await Promise.all([
        table.getItems('evn1j5kjx62o'),
        table.getItems('evtdsghlfbb4')
      ]);
      
      setForecasts(forecastsRes.items as Forecast[]);
      setOutcomes(outcomesRes.items as Outcome[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tracking data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const metricsMap = new Map<string, AccuracyMetrics>();

    forecasts.forEach(forecast => {
      const forecastOutcomes = outcomes.filter(o => o.forecast_id === forecast._id);
      
      if (forecastOutcomes.length > 0) {
        const accuracies = forecastOutcomes.map(o => o.accuracy_percentage);
        const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        const bestAccuracy = Math.max(...accuracies);
        const worstAccuracy = Math.min(...accuracies);
        
        // Calculate trend (improving/declining/stable)
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (accuracies.length > 1) {
          const firstHalf = accuracies.slice(0, Math.floor(accuracies.length / 2));
          const secondHalf = accuracies.slice(Math.floor(accuracies.length / 2));
          const firstAvg = firstHalf.reduce((sum, acc) => sum + acc, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, acc) => sum + acc, 0) / secondHalf.length;
          
          if (secondAvg > firstAvg + 2) trend = 'improving';
          else if (secondAvg < firstAvg - 2) trend = 'declining';
        }

        metricsMap.set(forecast._id, {
          forecast_id: forecast._id,
          title: forecast.title,
          model: forecast.model,
          total_outcomes: forecastOutcomes.length,
          avg_accuracy: avgAccuracy,
          best_accuracy: bestAccuracy,
          worst_accuracy: worstAccuracy,
          trend,
          last_updated: forecastOutcomes[forecastOutcomes.length - 1]?.recorded_at || forecast.created_at
        });
      }
    });

    setMetrics(Array.from(metricsMap.values()));
  };

  const addOutcome = async () => {
    if (!newOutcome.forecast_id || !newOutcome.actual_value || !newOutcome.outcome_date) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const forecast = forecasts.find(f => f._id === newOutcome.forecast_id);
      if (!forecast) return;

      // Find the predicted value for the outcome date
      const predictions = JSON.parse(forecast.predictions);
      const matchingPrediction = predictions.find((p: any) => {
        const predDate = new Date(p.date).toISOString().split('T')[0];
        return predDate === newOutcome.outcome_date;
      });

      if (!matchingPrediction) {
        toast({
          title: 'Error',
          description: 'No prediction found for this date',
          variant: 'destructive',
        });
        return;
      }

      const actualValue = parseFloat(newOutcome.actual_value);
      const predictedValue = matchingPrediction.value;
      const variance = actualValue - predictedValue;
      const accuracyPercentage = Math.max(0, 100 - (Math.abs(variance) / Math.abs(actualValue)) * 100);

      const outcomeData = {
        forecast_id: newOutcome.forecast_id,
        actual_value: actualValue,
        predicted_value: predictedValue,
        variance: variance,
        accuracy_percentage: accuracyPercentage,
        outcome_date: newOutcome.outcome_date,
        recorded_at: new Date().toISOString()
      };

      await table.addItem('evtdsghlfbb4', outcomeData);

      toast({
        title: 'Success',
        description: 'Outcome added successfully',
      });

      setNewOutcome({ forecast_id: '', actual_value: '', outcome_date: '' });
      setShowAddOutcome(false);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error adding outcome:', error);
      toast({
        title: 'Error',
        description: 'Failed to add outcome',
        variant: 'destructive',
      });
    }
  };

  const getAccuracyTrendData = (forecastId: string) => {
    const forecastOutcomes = outcomes
      .filter(o => o.forecast_id === forecastId)
      .sort((a, b) => new Date(a.outcome_date).getTime() - new Date(b.outcome_date).getTime());

    return forecastOutcomes.map((outcome, index) => ({
      date: outcome.outcome_date,
      accuracy: outcome.accuracy_percentage,
      cumulative_avg: forecastOutcomes
        .slice(0, index + 1)
        .reduce((sum, o) => sum + o.accuracy_percentage, 0) / (index + 1)
    }));
  };

  const getVarianceScatterData = (forecastId: string) => {
    return outcomes
      .filter(o => o.forecast_id === forecastId)
      .map(outcome => ({
        predicted: outcome.predicted_value,
        actual: outcome.actual_value,
        accuracy: outcome.accuracy_percentage
      }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accuracy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Outcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accuracy Tracking</h2>
          <p className="text-muted-foreground">Monitor and analyze forecast performance over time</p>
        </div>
        <Dialog open={showAddOutcome} onOpenChange={setShowAddOutcome}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Outcome
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Actual Outcome</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="forecast">Select Forecast</Label>
                <Select value={newOutcome.forecast_id} onValueChange={(value) => setNewOutcome(prev => ({ ...prev, forecast_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a forecast" />
                  </SelectTrigger>
                  <SelectContent>
                    {forecasts.map(forecast => (
                      <SelectItem key={forecast._id} value={forecast._id}>
                        {forecast.title} ({forecast.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="actual_value">Actual Value</Label>
                <Input
                  id="actual_value"
                  type="number"
                  step="0.01"
                  value={newOutcome.actual_value}
                  onChange={(e) => setNewOutcome(prev => ({ ...prev, actual_value: e.target.value }))}
                  placeholder="Enter the actual outcome value"
                />
              </div>
              <div>
                <Label htmlFor="outcome_date">Outcome Date</Label>
                <Input
                  id="outcome_date"
                  type="date"
                  value={newOutcome.outcome_date}
                  onChange={(e) => setNewOutcome(prev => ({ ...prev, outcome_date: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={addOutcome} className="flex-1">Add Outcome</Button>
                <Button variant="outline" onClick={() => setShowAddOutcome(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Forecasts</p>
                <p className="text-2xl font-bold">{forecasts.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked Outcomes</p>
                <p className="text-2xl font-bold">{outcomes.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Accuracy</p>
                <p className="text-2xl font-bold">
                  {metrics.length > 0 
                    ? (metrics.reduce((sum, m) => sum + m.avg_accuracy, 0) / metrics.length).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Improving Trends</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.filter(m => m.trend === 'improving').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Performance Summary</CardTitle>
          <CardDescription>
            Overview of accuracy metrics for all tracked forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No accuracy data available</p>
              <p className="text-muted-foreground">Add actual outcomes to start tracking performance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.map(metric => (
                <div key={metric.forecast_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{metric.title}</h4>
                      <Badge variant="outline" className="mt-1">{metric.model}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getTrendColor(metric.trend)}>
                        {metric.trend}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Outcomes</p>
                      <p className="font-medium">{metric.total_outcomes}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Accuracy</p>
                      <p className="font-medium">{metric.avg_accuracy.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Best</p>
                      <p className="font-medium text-green-600">{metric.best_accuracy.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Worst</p>
                      <p className="font-medium text-red-600">{metric.worst_accuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
            <div>
              <Select value={selectedForecast} onValueChange={setSelectedForecast}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select forecast for detailed view" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.forecast_id} value={metric.forecast_id}>
                      {metric.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedForecast && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accuracy Trend */}
                <div>
                  <h4 className="font-medium mb-4">Accuracy Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getAccuracyTrendData(selectedForecast)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        name="Accuracy %"
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative_avg"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Cumulative Average"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Predicted vs Actual Scatter */}
                <div>
                  <h4 className="font-medium mb-4">Predicted vs Actual Values</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={getVarianceScatterData(selectedForecast)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="predicted" name="Predicted" />
                      <YAxis dataKey="actual" name="Actual" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter
                        dataKey="actual"
                        fill="#8884d8"
                        name="Predictions"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccuracyTracker;