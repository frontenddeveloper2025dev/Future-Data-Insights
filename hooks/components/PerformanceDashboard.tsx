import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { table } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { Target, TrendingUp, TrendingDown, Award, AlertCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import ForecastComparison from './ForecastComparison';
import AccuracyTracker from './AccuracyTracker';

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

interface ModelPerformance {
  model: string;
  count: number;
  avg_accuracy: number;
  best_accuracy: number;
  success_rate: number;
}

interface TypePerformance {
  type: string;
  count: number;
  avg_accuracy: number;
  color: string;
}

const PerformanceDashboard: React.FC = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [typePerformance, setTypePerformance] = useState<TypePerformance[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#87d068', '#ffb347'];
  const TYPE_COLORS: { [key: string]: string } = {
    'sales': '#8884d8',
    'revenue': '#82ca9d', 
    'stock': '#ffc658',
    'weather': '#ff7c7c',
    'traffic': '#8dd1e1',
    'energy': '#d084d0',
    'population': '#87d068',
    'economics': '#ffb347'
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  useEffect(() => {
    if (forecasts.length > 0) {
      analyzePerformance();
    }
  }, [forecasts, outcomes]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate date filter
      let dateFilter = '';
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        dateFilter = cutoffDate.toISOString();
      }

      const [forecastsRes, outcomesRes] = await Promise.all([
        table.getItems('evn1j5kjx62o'),
        table.getItems('evtdsghlfbb4')
      ]);
      
      let filteredForecasts = forecastsRes.items as Forecast[];
      let filteredOutcomes = outcomesRes.items as Outcome[];

      // Apply time filter
      if (dateFilter) {
        filteredForecasts = filteredForecasts.filter(f => f.created_at >= dateFilter);
        filteredOutcomes = filteredOutcomes.filter(o => o.recorded_at >= dateFilter);
      }

      setForecasts(filteredForecasts);
      setOutcomes(filteredOutcomes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load performance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzePerformance = () => {
    // Analyze model performance
    const modelStats = new Map<string, {
      count: number;
      accuracies: number[];
      outcomes: number;
    }>();

    forecasts.forEach(forecast => {
      if (!modelStats.has(forecast.model)) {
        modelStats.set(forecast.model, {
          count: 0,
          accuracies: [],
          outcomes: 0
        });
      }
      
      const stats = modelStats.get(forecast.model)!;
      stats.count++;
      stats.accuracies.push(forecast.accuracy_score);

      // Count outcomes for this forecast
      const forecastOutcomes = outcomes.filter(o => o.forecast_id === forecast._id);
      stats.outcomes += forecastOutcomes.length;
    });

    const modelPerf: ModelPerformance[] = Array.from(modelStats.entries()).map(([model, stats]) => ({
      model,
      count: stats.count,
      avg_accuracy: stats.accuracies.reduce((sum, acc) => sum + acc, 0) / stats.accuracies.length,
      best_accuracy: Math.max(...stats.accuracies),
      success_rate: stats.outcomes > 0 ? (stats.outcomes / stats.count) * 100 : 0
    }));

    setModelPerformance(modelPerf.sort((a, b) => b.avg_accuracy - a.avg_accuracy));

    // Analyze type performance
    const typeStats = new Map<string, { count: number; accuracies: number[] }>();

    forecasts.forEach(forecast => {
      if (!typeStats.has(forecast.type)) {
        typeStats.set(forecast.type, { count: 0, accuracies: [] });
      }
      
      const stats = typeStats.get(forecast.type)!;
      stats.count++;
      stats.accuracies.push(forecast.accuracy_score);
    });

    const typePerf: TypePerformance[] = Array.from(typeStats.entries()).map(([type, stats]) => ({
      type,
      count: stats.count,
      avg_accuracy: stats.accuracies.reduce((sum, acc) => sum + acc, 0) / stats.accuracies.length,
      color: TYPE_COLORS[type] || '#8884d8'
    }));

    setTypePerformance(typePerf.sort((a, b) => b.avg_accuracy - a.avg_accuracy));
  };

  const getOverallStats = () => {
    if (forecasts.length === 0) return { avgAccuracy: 0, totalOutcomes: 0, bestModel: 'N/A', topPerformer: 'N/A' };

    const avgAccuracy = forecasts.reduce((sum, f) => sum + f.accuracy_score, 0) / forecasts.length;
    const totalOutcomes = outcomes.length;
    const bestModel = modelPerformance.length > 0 ? modelPerformance[0].model : 'N/A';
    const topPerformer = typePerformance.length > 0 ? typePerformance[0].type : 'N/A';

    return { avgAccuracy, totalOutcomes, bestModel, topPerformer };
  };

  const getAccuracyDistributionData = () => {
    const ranges = ['90-100%', '80-90%', '70-80%', '60-70%', '<60%'];
    const distribution = ranges.map(range => ({ range, count: 0 }));

    forecasts.forEach(forecast => {
      const accuracy = forecast.accuracy_score;
      if (accuracy >= 90) distribution[0].count++;
      else if (accuracy >= 80) distribution[1].count++;
      else if (accuracy >= 70) distribution[2].count++;
      else if (accuracy >= 60) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  const getTimeSeriesData = () => {
    const dailyStats = new Map<string, { count: number; accuracy_sum: number }>();
    
    forecasts.forEach(forecast => {
      const date = forecast.created_at.split('T')[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { count: 0, accuracy_sum: 0 });
      }
      const stats = dailyStats.get(date)!;
      stats.count++;
      stats.accuracy_sum += forecast.accuracy_score;
    });

    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        forecasts: stats.count,
        avg_accuracy: stats.accuracy_sum / stats.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive analysis of forecast performance and accuracy</p>
        </div>
        <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d' | 'all') => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Accuracy</p>
                <p className="text-2xl font-bold">{stats.avgAccuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outcomes</p>
                <p className="text-2xl font-bold">{stats.totalOutcomes}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Model</p>
                <p className="text-2xl font-bold">{stats.bestModel}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <p className="text-2xl font-bold">{stats.topPerformer}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Model Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Forecast Comparison</TabsTrigger>
          <TabsTrigger value="tracking">Accuracy Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Distribution</CardTitle>
                <CardDescription>Distribution of forecast accuracy across different ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getAccuracyDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Forecast Types Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Type</CardTitle>
                <CardDescription>Average accuracy across different forecast categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typePerformance}
                      dataKey="avg_accuracy"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ type, avg_accuracy }) => `${type}: ${avg_accuracy.toFixed(1)}%`}
                    >
                      {typePerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Time Series */}
          <Card>
            <CardHeader>
              <CardTitle>Forecasting Activity Over Time</CardTitle>
              <CardDescription>Number of forecasts created and average accuracy by date</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTimeSeriesData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="forecasts" fill="#8884d8" name="Forecasts Created" />
                  <Line yAxisId="right" type="monotone" dataKey="avg_accuracy" stroke="#82ca9d" strokeWidth={2} name="Avg Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Analysis</CardTitle>
              <CardDescription>Detailed performance metrics for each prediction model</CardDescription>
            </CardHeader>
            <CardContent>
              {modelPerformance.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No model data available</p>
                  <p className="text-muted-foreground">Create some forecasts to see model performance analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modelPerformance.map((model, index) => (
                    <div key={model.model} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{model.model}</h4>
                            <p className="text-sm text-muted-foreground">{model.count} forecasts created</p>
                          </div>
                        </div>
                        <Badge variant={model.avg_accuracy >= 80 ? 'default' : model.avg_accuracy >= 60 ? 'secondary' : 'destructive'}>
                          {model.avg_accuracy.toFixed(1)}% avg
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Best Accuracy</p>
                          <p className="font-medium text-green-600">{model.best_accuracy.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium">{model.success_rate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Used</p>
                          <p className="font-medium">{model.count} times</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <ForecastComparison />
        </TabsContent>

        <TabsContent value="tracking">
          <AccuracyTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;