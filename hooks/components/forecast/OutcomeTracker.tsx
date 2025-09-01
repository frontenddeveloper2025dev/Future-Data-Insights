import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { table } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
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

interface OutcomeTrackerProps {
  forecastId: string;
  predictions: DataPoint[];
  forecastTitle: string;
  modelName: string;
}

const OutcomeTracker: React.FC<OutcomeTrackerProps> = ({
  forecastId,
  predictions,
  forecastTitle,
  modelName
}) => {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOutcome, setShowAddOutcome] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    outcome_date: '',
    actual_value: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadOutcomes();
  }, [forecastId]);

  const loadOutcomes = async () => {
    try {
      setLoading(true);
      const response = await table.getItems('evtdsghlfbb4');
      const allOutcomes = response.items as Outcome[];
      const forecastOutcomes = allOutcomes.filter(outcome => outcome.forecast_id === forecastId);
      setOutcomes(forecastOutcomes.sort((a, b) => new Date(a.outcome_date).getTime() - new Date(b.outcome_date).getTime()));
    } catch (error) {
      console.error('Error loading outcomes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load outcome data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addOutcome = async () => {
    if (!newOutcome.outcome_date || !newOutcome.actual_value) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find the matching prediction for this date
      const matchingPrediction = predictions.find(p => {
        const predDate = new Date(p.date).toISOString().split('T')[0];
        return predDate === newOutcome.outcome_date;
      });

      if (!matchingPrediction) {
        toast({
          title: 'Date Mismatch',
          description: 'No prediction found for the selected date. Please choose a date from your forecast period.',
          variant: 'destructive',
        });
        return;
      }

      const actualValue = parseFloat(newOutcome.actual_value);
      const predictedValue = matchingPrediction.value;
      const variance = actualValue - predictedValue;
      const accuracyPercentage = Math.max(0, 100 - (Math.abs(variance) / Math.abs(actualValue)) * 100);

      const outcomeData = {
        forecast_id: forecastId,
        actual_value: actualValue,
        predicted_value: predictedValue,
        variance: variance,
        accuracy_percentage: accuracyPercentage,
        outcome_date: newOutcome.outcome_date,
        recorded_at: new Date().toISOString()
      };

      await table.addItem('evtdsghlfbb4', outcomeData);

      toast({
        title: 'Outcome Recorded!',
        description: `Accuracy: ${accuracyPercentage.toFixed(1)}% (${variance > 0 ? '+' : ''}${variance.toFixed(2)} variance)`,
      });

      setNewOutcome({ outcome_date: '', actual_value: '' });
      setShowAddOutcome(false);
      loadOutcomes(); // Reload outcomes
    } catch (error) {
      console.error('Error adding outcome:', error);
      toast({
        title: 'Error',
        description: 'Failed to record outcome. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateStats = () => {
    if (outcomes.length === 0) return null;

    const accuracies = outcomes.map(o => o.accuracy_percentage);
    const variances = outcomes.map(o => Math.abs(o.variance));
    
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const bestAccuracy = Math.max(...accuracies);
    const worstAccuracy = Math.min(...accuracies);
    const avgVariance = variances.reduce((sum, var) => sum + var, 0) / variances.length;
    
    // Calculate trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (accuracies.length > 1) {
      const recent = accuracies.slice(-3); // Last 3 outcomes
      const earlier = accuracies.slice(0, -3);
      if (earlier.length > 0) {
        const recentAvg = recent.reduce((sum, acc) => sum + acc, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, acc) => sum + acc, 0) / earlier.length;
        if (recentAvg > earlierAvg + 2) trend = 'improving';
        else if (recentAvg < earlierAvg - 2) trend = 'declining';
      }
    }

    return {
      avgAccuracy,
      bestAccuracy,
      worstAccuracy,
      avgVariance,
      trend,
      totalOutcomes: outcomes.length,
      trackedPeriods: outcomes.length,
      remainingPeriods: predictions.length - outcomes.length
    };
  };

  const getUpcomingPredictions = () => {
    const recordedDates = outcomes.map(o => o.outcome_date);
    const today = new Date().toISOString().split('T')[0];
    
    return predictions
      .filter(p => {
        const predDate = new Date(p.date).toISOString().split('T')[0];
        return !recordedDates.includes(predDate) && predDate <= today;
      })
      .slice(0, 3); // Show next 3 upcoming
  };

  const getAccuracyTrendData = () => {
    return outcomes.map((outcome, index) => ({
      date: new Date(outcome.outcome_date).toLocaleDateString(),
      accuracy: outcome.accuracy_percentage,
      cumulative: outcomes
        .slice(0, index + 1)
        .reduce((sum, o) => sum + o.accuracy_percentage, 0) / (index + 1),
      variance: Math.abs(outcome.variance)
    }));
  };

  const getVarianceDistribution = () => {
    const ranges = [
      { label: '0-5%', min: 0, max: 5, count: 0 },
      { label: '5-10%', min: 5, max: 10, count: 0 },
      { label: '10-20%', min: 10, max: 20, count: 0 },
      { label: '20%+', min: 20, max: Infinity, count: 0 }
    ];

    outcomes.forEach(outcome => {
      const variancePercent = (Math.abs(outcome.variance) / Math.abs(outcome.actual_value)) * 100;
      const range = ranges.find(r => variancePercent >= r.min && variancePercent < r.max);
      if (range) range.count++;
    });

    return ranges;
  };

  const stats = calculateStats();
  const upcomingPredictions = getUpcomingPredictions();
  const trendData = getAccuracyTrendData();
  const varianceDistribution = getVarianceDistribution();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Loading outcome tracking...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Outcome Tracking
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor real-world performance of "{forecastTitle}"
          </p>
        </div>
        <div className="flex gap-2">
          {upcomingPredictions.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {upcomingPredictions.length} pending
            </Badge>
          )}
          <Dialog open={showAddOutcome} onOpenChange={setShowAddOutcome}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Record Outcome
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Actual Outcome</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Forecast: {forecastTitle}</p>
                  <p className="text-sm text-muted-foreground">Model: {modelName}</p>
                </div>
                
                <div>
                  <Label htmlFor="outcome_date">Outcome Date</Label>
                  <Input
                    id="outcome_date"
                    type="date"
                    value={newOutcome.outcome_date}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, outcome_date: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {newOutcome.outcome_date && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Predicted Value: </strong>
                      {predictions.find(p => new Date(p.date).toISOString().split('T')[0] === newOutcome.outcome_date)?.value.toFixed(2) || 'No prediction for this date'}
                    </div>
                  )}
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
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={addOutcome} className="flex-1">
                    Record Outcome
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddOutcome(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pending Outcomes Alert */}
      {upcomingPredictions.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{upcomingPredictions.length} outcome(s) ready to track:</strong> {
              upcomingPredictions.map(p => new Date(p.date).toLocaleDateString()).join(', ')
            }. Record actual values to improve accuracy tracking.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold">{stats.avgAccuracy.toFixed(1)}%</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Accuracy</p>
                  <p className="text-2xl font-bold text-green-600">{stats.bestAccuracy.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tracked</p>
                  <p className="text-2xl font-bold">{stats.trackedPeriods}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <div className="flex items-center gap-1">
                    {stats.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {stats.trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {stats.trend === 'stable' && <Activity className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm font-medium capitalize">{stats.trend}</span>
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tracking Progress</CardTitle>
          <CardDescription>
            {stats ? `${stats.trackedPeriods} of ${predictions.length} predictions tracked` : 'No outcomes recorded yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress 
              value={stats ? (stats.trackedPeriods / predictions.length) * 100 : 0} 
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0 outcomes</span>
              <span>{predictions.length} predictions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      {outcomes.length > 0 && (
        <Tabs defaultValue="accuracy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accuracy">Accuracy Trends</TabsTrigger>
            <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
            <TabsTrigger value="outcomes">Outcome History</TabsTrigger>
          </TabsList>

          <TabsContent value="accuracy">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Over Time</CardTitle>
                <CardDescription>
                  Track how your forecast accuracy improves with each recorded outcome
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Accuracy %"
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Cumulative Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variance">
            <Card>
              <CardHeader>
                <CardTitle>Variance Distribution</CardTitle>
                <CardDescription>
                  How often your predictions fall within different accuracy ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={varianceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes">
            <Card>
              <CardHeader>
                <CardTitle>Recorded Outcomes</CardTitle>
                <CardDescription>
                  Complete history of actual vs predicted values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outcomes.map(outcome => (
                    <div key={outcome._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(outcome.outcome_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Actual: {outcome.actual_value} | Predicted: {outcome.predicted_value.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={outcome.accuracy_percentage >= 90 ? "default" : 
                                  outcome.accuracy_percentage >= 70 ? "secondary" : "destructive"}
                        >
                          {outcome.accuracy_percentage.toFixed(1)}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {outcome.variance > 0 ? '+' : ''}{outcome.variance.toFixed(2)} variance
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {outcomes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">Start Tracking Outcomes</h4>
            <p className="text-muted-foreground mb-4">
              Record actual results to validate your forecast accuracy and improve future predictions.
            </p>
            <Button onClick={() => setShowAddOutcome(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Record First Outcome
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OutcomeTracker;