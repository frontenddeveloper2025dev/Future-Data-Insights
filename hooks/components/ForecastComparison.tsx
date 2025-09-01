import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { table } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Target, BarChart3, Calendar } from 'lucide-react';

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

interface ComparisonData {
  date: string;
  [key: string]: number | string;
}

const ForecastComparison: React.FC = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selectedForecasts, setSelectedForecasts] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadForecasts();
  }, []);

  useEffect(() => {
    if (selectedForecasts.length > 0) {
      generateComparisonData();
    }
  }, [selectedForecasts, forecasts]);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const response = await table.getItems('evn1j5kjx62o');
      setForecasts(response.items as Forecast[]);
    } catch (error) {
      console.error('Error loading forecasts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forecasts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateComparisonData = () => {
    const selectedForecastData = forecasts.filter(f => selectedForecasts.includes(f._id));
    
    if (selectedForecastData.length === 0) return;

    // Parse predictions and create unified dataset
    const allDates = new Set<string>();
    const forecastData: { [forecastId: string]: { [date: string]: number } } = {};

    selectedForecastData.forEach(forecast => {
      try {
        const predictions = JSON.parse(forecast.predictions);
        forecastData[forecast._id] = {};
        
        predictions.forEach((pred: { date: string; value: number }) => {
          const dateStr = new Date(pred.date).toISOString().split('T')[0];
          allDates.add(dateStr);
          forecastData[forecast._id][dateStr] = pred.value;
        });
      } catch (error) {
        console.error('Error parsing predictions for forecast:', forecast._id);
      }
    });

    // Create comparison data array
    const comparison: ComparisonData[] = Array.from(allDates)
      .sort()
      .map(date => {
        const dataPoint: ComparisonData = { date };
        selectedForecastData.forEach(forecast => {
          const value = forecastData[forecast._id][date];
          if (value !== undefined) {
            dataPoint[`${forecast.title} (${forecast.model})`] = value;
          }
        });
        return dataPoint;
      });

    setComparisonData(comparison);
  };

  const handleForecastSelection = (forecastId: string, checked: boolean) => {
    setSelectedForecasts(prev => {
      if (checked) {
        return [...prev, forecastId];
      } else {
        return prev.filter(id => id !== forecastId);
      }
    });
  };

  const calculateStats = (forecast: Forecast) => {
    try {
      const predictions = JSON.parse(forecast.predictions);
      const values = predictions.map((p: { value: number }) => p.value);
      
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum: number, val: number) => sum + val, 0) / values.length,
        trend: values[values.length - 1] > values[0] ? 'up' : 'down'
      };
    } catch {
      return { min: 0, max: 0, avg: 0, trend: 'up' as const };
    }
  };

  const getModelBadgeColor = (model: string) => {
    const colors: { [key: string]: string } = {
      'linear': 'bg-blue-500',
      'exponential': 'bg-green-500',
      'polynomial': 'bg-purple-500',
      'ai_powered': 'bg-orange-500',
      'moving_average': 'bg-cyan-500',
      'arima': 'bg-red-500',
      'prophet': 'bg-yellow-500',
      'lstm': 'bg-pink-500'
    };
    return colors[model] || 'bg-gray-500';
  };

  const renderChart = () => {
    if (comparisonData.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select forecasts to compare</p>
          </div>
        </div>
      );
    }

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#87d068', '#ffb347'];
    const keys = Object.keys(comparisonData[0]).filter(key => key !== 'date');

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                opacity={0.8}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  const renderComparisonTable = () => {
    const selectedForecastData = forecasts.filter(f => selectedForecasts.includes(f._id));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedForecastData.map(forecast => {
            const stats = calculateStats(forecast);
            return (
              <Card key={forecast._id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{forecast.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getModelBadgeColor(forecast.model)} text-white`}>
                      {forecast.model}
                    </Badge>
                    <Badge variant="outline">{forecast.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">{forecast.accuracy_score.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trend</span>
                    <div className="flex items-center gap-1">
                      {stats.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{stats.trend === 'up' ? 'Upward' : 'Downward'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Min</p>
                      <p className="font-medium">{stats.min.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Avg</p>
                      <p className="font-medium">{stats.avg.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Max</p>
                      <p className="font-medium">{stats.max.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{forecast.time_horizon}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading forecasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Forecast Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Forecasts to Compare</CardTitle>
          <CardDescription>
            Choose multiple forecasts to analyze their performance and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecasts.map(forecast => (
              <div key={forecast._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={selectedForecasts.includes(forecast._id)}
                  onCheckedChange={(checked) => handleForecastSelection(forecast._id, checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{forecast.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getModelBadgeColor(forecast.model)} text-white text-xs`}>
                      {forecast.model}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{forecast.accuracy_score.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Controls */}
      {selectedForecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison View</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'chart' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('chart')}
                >
                  Chart View
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Summary View
                </Button>
              </div>
              {viewMode === 'chart' && (
                <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'chart' ? renderChart() : renderComparisonTable()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForecastComparison;