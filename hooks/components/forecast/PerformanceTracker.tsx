import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  AlertCircle, 
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  trend: number;
  target: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  category: 'accuracy' | 'reliability' | 'efficiency' | 'consistency';
}

interface ForecastPerformance {
  id: string;
  name: string;
  model: string;
  accuracy: number;
  reliability: number;
  efficiency: number;
  consistency: number;
  predictions: number;
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
}

interface TimeSeriesData {
  timestamp: string;
  accuracy: number;
  reliability: number;
  efficiency: number;
  predictions: number;
}

interface ModelComparison {
  model: string;
  accuracy: number;
  usage: number;
  performance: number;
  color: string;
}

interface PerformanceTrackerProps {
  forecasts?: Array<{
    id: string;
    name: string;
    model: string;
    accuracy: number;
  }>;
}

export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ forecasts = [] }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [forecastPerformance, setForecastPerformance] = useState<ForecastPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [modelComparison, setModelComparison] = useState<ModelComparison[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    generatePerformanceData();
  }, [forecasts, selectedTimeframe]);

  const generatePerformanceData = () => {
    // Generate performance metrics
    const sampleMetrics: PerformanceMetric[] = [
      {
        id: '1',
        name: 'Overall Accuracy',
        value: 87.3,
        trend: 2.1,
        target: 85,
        status: 'excellent',
        category: 'accuracy'
      },
      {
        id: '2',
        name: 'Prediction Reliability',
        value: 92.1,
        trend: 1.5,
        target: 90,
        status: 'excellent',
        category: 'reliability'
      },
      {
        id: '3',
        name: 'Processing Efficiency',
        value: 78.9,
        trend: -0.8,
        target: 80,
        status: 'fair',
        category: 'efficiency'
      },
      {
        id: '4',
        name: 'Consistency Score',
        value: 84.7,
        trend: 0.3,
        target: 85,
        status: 'good',
        category: 'consistency'
      }
    ];

    // Generate forecast performance data
    const sampleForecastPerformance: ForecastPerformance[] = forecasts.map((forecast, index) => ({
      id: forecast.id,
      name: forecast.name,
      model: forecast.model,
      accuracy: forecast.accuracy,
      reliability: 85 + Math.random() * 15,
      efficiency: 75 + Math.random() * 20,
      consistency: 80 + Math.random() * 15,
      predictions: Math.floor(Math.random() * 100) + 50,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any
    }));

    // Generate time series data
    const timeframeDays = selectedTimeframe === '24h' ? 1 : selectedTimeframe === '7d' ? 7 : 30;
    const sampleTimeSeriesData: TimeSeriesData[] = Array.from({ length: timeframeDays * 4 }, (_, i) => {
      const date = new Date(Date.now() - (timeframeDays * 4 - i - 1) * 6 * 60 * 60 * 1000);
      return {
        timestamp: date.toLocaleDateString(),
        accuracy: 85 + Math.sin(i * 0.1) * 5 + Math.random() * 5,
        reliability: 88 + Math.cos(i * 0.15) * 4 + Math.random() * 4,
        efficiency: 80 + Math.sin(i * 0.2) * 8 + Math.random() * 6,
        predictions: Math.floor(20 + Math.sin(i * 0.3) * 10 + Math.random() * 15)
      };
    });

    // Generate model comparison data
    const models = ['Linear Regression', 'Neural Network', 'ARIMA', 'Random Forest', 'LSTM'];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
    const sampleModelComparison: ModelComparison[] = models.map((model, index) => ({
      model,
      accuracy: 75 + Math.random() * 20,
      usage: Math.floor(Math.random() * 50) + 10,
      performance: 70 + Math.random() * 25,
      color: colors[index]
    }));

    setMetrics(sampleMetrics);
    setForecastPerformance(sampleForecastPerformance);
    setTimeSeriesData(sampleTimeSeriesData);
    setModelComparison(sampleModelComparison);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    generatePerformanceData();
    setIsRefreshing(false);
  };

  const exportData = () => {
    const data = {
      metrics,
      forecastPerformance,
      timeSeriesData,
      modelComparison,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Performance Tracker</h2>
          <p className="text-muted-foreground">
            Monitor and analyze forecast performance across all models and timeframes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toFixed(1)}%</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Target: {metric.target}%</span>
                <span className={metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metric.trend >= 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                </span>
              </div>
              <Progress value={(metric.value / 100) * 100} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="models">Model Comparison</TabsTrigger>
          <TabsTrigger value="forecasts">Individual Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: 'Accuracy', A: 87, fullMark: 100 },
                      { subject: 'Reliability', A: 92, fullMark: 100 },
                      { subject: 'Efficiency', A: 79, fullMark: 100 },
                      { subject: 'Consistency', A: 85, fullMark: 100 },
                      { subject: 'Speed', A: 88, fullMark: 100 },
                      { subject: 'Adaptability', A: 82, fullMark: 100 }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Goal Achievement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.name}</span>
                        <span className="font-medium">
                          {metric.value.toFixed(1)}% / {metric.target}%
                        </span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Trends</span>
              </CardTitle>
              <CardDescription>
                Track performance metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="accuracy"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      stroke="#8884d8"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="reliability"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                    <Bar yAxisId="right" dataKey="predictions" fill="#ff7300" opacity={0.7} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Model Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#8884d8" />
                      <Bar dataKey="performance" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Model Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelComparison}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ model, usage }) => `${model}: ${usage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="usage"
                      >
                        {modelComparison.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="accuracy">Accuracy</SelectItem>
                <SelectItem value="reliability">Reliability</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
                <SelectItem value="consistency">Consistency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecastPerformance.map((forecast) => (
              <Card key={forecast.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{forecast.name}</CardTitle>
                    {getTrendIcon(forecast.trend)}
                  </div>
                  <CardDescription>{forecast.model}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Accuracy</span>
                      <div className="font-medium">{forecast.accuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reliability</span>
                      <div className="font-medium">{forecast.reliability.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Efficiency</span>
                      <div className="font-medium">{forecast.efficiency.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Predictions</span>
                      <div className="font-medium">{forecast.predictions}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Overall Score</span>
                      <span>{((forecast.accuracy + forecast.reliability + forecast.efficiency) / 3).toFixed(1)}%</span>
                    </div>
                    <Progress value={(forecast.accuracy + forecast.reliability + forecast.efficiency) / 3} />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {forecast.lastUpdated.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};