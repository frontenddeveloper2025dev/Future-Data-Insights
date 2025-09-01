import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface MetricData {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  accuracy?: number;
  confidence?: number;
}

interface AccuracyData {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface TimeSeriesPoint {
  date: string;
  actual: number;
  predicted: number;
  error: number;
}

interface ForecastDashboardProps {
  metrics: MetricData[];
  accuracyData: AccuracyData[];
  timeSeriesData: TimeSeriesPoint[];
  title?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const ForecastDashboard: React.FC<ForecastDashboardProps> = ({
  metrics,
  accuracyData,
  timeSeriesData,
  title = "Forecast Performance Dashboard"
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const formatValue = (value: number, decimals = 2) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const MetricCard: React.FC<{ metric: MetricData }> = ({ metric }) => {
    const Icon = metric.changeType === 'increase' ? TrendingUp : 
                 metric.changeType === 'decrease' ? TrendingDown : Activity;
    
    const changeColor = metric.changeType === 'increase' ? 'text-green-600' : 
                       metric.changeType === 'decrease' ? 'text-red-600' : 'text-muted-foreground';

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
              <p className="text-2xl font-bold">{formatValue(metric.value)}</p>
              <div className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 ${changeColor}`} />
                <span className={`text-sm ${changeColor}`}>
                  {metric.change > 0 ? '+' : ''}{formatPercentage(metric.change)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {metric.accuracy && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                  <Badge variant="outline" className="text-xs">
                    {formatPercentage(metric.accuracy)}
                  </Badge>
                </div>
              )}
              {metric.confidence && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <Progress value={metric.confidence * 100} className="w-16 h-2" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.dataKey.includes('accuracy') || entry.dataKey.includes('precision') || entry.dataKey.includes('recall') || entry.dataKey.includes('f1Score') ? 
                formatPercentage(entry.value) : formatValue(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and accuracy analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accuracy">Model Accuracy</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          {/* Overall Accuracy Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-chart-1" />
                Model Accuracy Comparison
              </CardTitle>
              <CardDescription>
                Accuracy, precision, and recall scores across different models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                  <XAxis 
                    dataKey="model" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatPercentage}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="accuracy" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="precision" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recall" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Accuracy Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Distribution</CardTitle>
                <CardDescription>Model performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accuracyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, accuracy }) => `${name}: ${formatPercentage(accuracy)}`}
                      outerRadius={80}
                      fill="hsl(var(--chart-1))"
                      dataKey="accuracy"
                    >
                      {accuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatPercentage(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radial Accuracy Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Scores</CardTitle>
                <CardDescription>F1 scores across different models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={accuracyData}>
                    <RadialBar
                      dataKey="f1Score"
                      fill="hsl(var(--chart-2))"
                    />
                    <Tooltip formatter={(value: number) => formatPercentage(value)} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Accuracy Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Model</th>
                      <th className="text-left p-2">Accuracy</th>
                      <th className="text-left p-2">Precision</th>
                      <th className="text-left p-2">Recall</th>
                      <th className="text-left p-2">F1 Score</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accuracyData.map((model, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{model.model}</td>
                        <td className="p-2">{formatPercentage(model.accuracy)}</td>
                        <td className="p-2">{formatPercentage(model.precision)}</td>
                        <td className="p-2">{formatPercentage(model.recall)}</td>
                        <td className="p-2">{formatPercentage(model.f1Score)}</td>
                        <td className="p-2">
                          {model.accuracy > 0.8 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Excellent
                            </Badge>
                          ) : model.accuracy > 0.6 ? (
                            <Badge variant="secondary">Good</Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Needs Improvement
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-chart-2" />
                Prediction vs Actual Performance
              </CardTitle>
              <CardDescription>
                Time series comparison of predicted vs actual values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatValue}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="actual" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="predicted" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="error" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Prediction errors over time to identify patterns and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatValue}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="error" 
                    fill="hsl(var(--chart-3))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Error Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mean Absolute Error</p>
                    <p className="text-2xl font-bold">
                      {formatValue(
                        timeSeriesData.reduce((sum, point) => sum + Math.abs(point.error), 0) / timeSeriesData.length
                      )}
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
                    <p className="text-sm font-medium text-muted-foreground">Max Error</p>
                    <p className="text-2xl font-bold">
                      {formatValue(Math.max(...timeSeriesData.map(point => Math.abs(point.error))))}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Variance</p>
                    <p className="text-2xl font-bold">
                      {formatValue(
                        timeSeriesData.reduce((sum, point) => sum + Math.pow(point.error, 2), 0) / timeSeriesData.length
                      )}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForecastDashboard;