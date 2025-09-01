import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, PlusCircle, Settings, LogOut, Clock, Target, Activity, LineChart, BarChart4, FileText, Download, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { auth, table } from '@devvai/devv-code-backend';

// Import visualization components
import { TrendChart, ForecastDashboard, CorrelationHeatmap, ScatterAnalysis } from '@/components/forecast';

interface Forecast {
  _id: string;
  title: string;
  type: string;
  model: string;
  accuracy_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Sample data for demonstration
const sampleTrendData = [
  { date: '2024-01', actual: 1200, predicted: 1180, confidence_upper: 1220, confidence_lower: 1140 },
  { date: '2024-02', actual: 1350, predicted: 1340, confidence_upper: 1380, confidence_lower: 1300 },
  { date: '2024-03', actual: 1280, predicted: 1290, confidence_upper: 1330, confidence_lower: 1250 },
  { date: '2024-04', actual: 1420, predicted: 1400, confidence_upper: 1440, confidence_lower: 1360 },
  { date: '2024-05', actual: 1380, predicted: 1385, confidence_upper: 1425, confidence_lower: 1345 },
  { date: '2024-06', predicted: 1450, confidence_upper: 1490, confidence_lower: 1410 },
  { date: '2024-07', predicted: 1520, confidence_upper: 1560, confidence_lower: 1480 },
  { date: '2024-08', predicted: 1580, confidence_upper: 1620, confidence_lower: 1540 },
];

const sampleMetrics = [
  { name: 'Revenue Forecast', value: 1580000, change: 0.12, changeType: 'increase' as const, accuracy: 0.89, confidence: 0.85 },
  { name: 'User Growth', value: 25400, change: 0.08, changeType: 'increase' as const, accuracy: 0.92, confidence: 0.78 },
  { name: 'Churn Rate', value: 0.035, change: -0.15, changeType: 'decrease' as const, accuracy: 0.76, confidence: 0.82 },
  { name: 'Market Share', value: 0.18, change: 0.05, changeType: 'increase' as const, accuracy: 0.84, confidence: 0.75 }
];

const sampleAccuracyData = [
  { model: 'Linear Regression', accuracy: 0.82, precision: 0.78, recall: 0.85, f1Score: 0.81 },
  { model: 'Random Forest', accuracy: 0.89, precision: 0.87, recall: 0.91, f1Score: 0.89 },
  { model: 'Neural Network', accuracy: 0.93, precision: 0.90, recall: 0.95, f1Score: 0.92 },
  { model: 'ARIMA', accuracy: 0.76, precision: 0.74, recall: 0.78, f1Score: 0.76 }
];

const sampleTimeSeriesData = [
  { date: '2024-01', actual: 1200, predicted: 1180, error: 20 },
  { date: '2024-02', actual: 1350, predicted: 1340, error: 10 },
  { date: '2024-03', actual: 1280, predicted: 1290, error: -10 },
  { date: '2024-04', actual: 1420, predicted: 1400, error: 20 },
  { date: '2024-05', actual: 1380, predicted: 1385, error: -5 }
];

const sampleCorrelationData = {
  variables: ['Revenue', 'Marketing Spend', 'User Count', 'Seasonality', 'Competition'],
  correlationMatrix: [
    [1.00, 0.78, 0.85, 0.42, -0.35],
    [0.78, 1.00, 0.65, 0.38, -0.28],
    [0.85, 0.65, 1.00, 0.51, -0.42],
    [0.42, 0.38, 0.51, 1.00, -0.18],
    [-0.35, -0.28, -0.42, -0.18, 1.00]
  ]
};

const sampleScatterData = [
  { x: 1200, y: 1180, category: 'Q1', label: 'Jan' },
  { x: 1350, y: 1340, category: 'Q1', label: 'Feb' },
  { x: 1280, y: 1290, category: 'Q1', label: 'Mar' },
  { x: 1420, y: 1400, category: 'Q2', label: 'Apr' },
  { x: 1380, y: 1385, category: 'Q2', label: 'May' },
  { x: 1450, y: 1440, category: 'Q2', label: 'Jun' },
  { x: 1520, y: 1510, category: 'Q3', label: 'Jul' },
  { x: 1580, y: 1570, category: 'Q3', label: 'Aug' }
];

export default function DashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      const response = await table.getItems('evn1j5kjx62o', { 
        limit: 10,
        sort: '_id',
        order: 'desc'
      });
      setForecasts(response.items as Forecast[]);
    } catch (error) {
      console.error('Failed to load forecasts:', error);
      toast({
        title: 'Failed to load forecasts',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      logout();
      navigate('/');
      toast({
        title: 'Logged out successfully',
        description: 'Come back soon!',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">ForecastPro</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/performance')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/charts')}>
                <BarChart4 className="w-4 h-4 mr-2" />
                Charts
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/templates')}>
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/monitoring')}>
                <Bell className="w-4 h-4 mr-2" />
                Monitoring
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/export')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming Soon", description: "Settings panel under development" })}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Forecasts</p>
                  <p className="text-2xl font-bold">{forecasts.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Models</p>
                  <p className="text-2xl font-bold">{forecasts.filter(f => f.status === 'active').length}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold">
                    {forecasts.length > 0 
                      ? (forecasts.reduce((sum, f) => sum + f.accuracy_score, 0) / forecasts.length).toFixed(1) + '%'
                      : '0%'
                    }
                  </p>
                </div>
                <Target className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-primary/20" 
                onClick={() => navigate('/forecast')}>
            <CardHeader>
              <PlusCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Create New Forecast</CardTitle>
              <CardDescription>
                Start building a new predictive model with your data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate('/performance')}>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Performance Dashboard</CardTitle>
              <CardDescription>
                Compare forecasts and track accuracy over time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate('/charts')}>
            <CardHeader>
              <BarChart4 className="w-8 h-8 text-chart-4 mb-2" />
              <CardTitle>Advanced Charts</CardTitle>
              <CardDescription>
                Explore interactive visualizations and data analysis tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate('/templates')}>
            <CardHeader>
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Templates & Config</CardTitle>
              <CardDescription>
                Save and manage forecast templates and configurations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Forecasts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Forecasts</CardTitle>
                <CardDescription>
                  Your latest forecasting projects and updates
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadForecasts} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : forecasts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No forecasts yet</p>
                <p className="text-sm mb-4">Create your first forecast to get started with predictive analytics</p>
                <Button onClick={() => navigate('/forecast')}>
                  Create Your First Forecast
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {forecasts.map((forecast) => (
                  <Card key={forecast._id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{forecast.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Model: {forecast.model}</span>
                            <span>Type: {forecast.type}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(forecast.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{forecast.accuracy_score.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(forecast.status)}`}>
                            {forecast.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {forecasts.length > 0 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "View all forecasts page under development" })}>
                      View All Forecasts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="space-y-6">
              <ForecastDashboard
                metrics={sampleMetrics}
                accuracyData={sampleAccuracyData}
                timeSeriesData={sampleTimeSeriesData}
                title="Forecast Performance Analytics"
              />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6">
              <TrendChart
                data={sampleTrendData}
                title="Revenue Forecast Trend"
                description="Monthly revenue predictions with confidence intervals"
                metric="USD"
                accuracy={0.89}
                showConfidenceInterval={true}
                forecastStartIndex={5}
                height={400}
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <ScatterAnalysis
                  data={sampleScatterData}
                  xAxisLabel="Actual Values"
                  yAxisLabel="Predicted Values"
                  title="Prediction Accuracy Analysis"
                  description="Scatter plot showing model prediction accuracy"
                  showTrendLine={true}
                  colorByCategory={true}
                  categories={['Q1', 'Q2', 'Q3']}
                />
                
                <CorrelationHeatmap
                  data={sampleCorrelationData}
                  title="Feature Correlation Matrix"
                  description="Correlation between different forecasting variables"
                  showLabels={true}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {/* Key Insights Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">Best Performing Model</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">Neural Network</p>
                      <p className="text-sm text-muted-foreground">93% accuracy with strong generalization</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-600">↑ 12%</span>
                        <span className="text-muted-foreground">vs previous month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Forecast Confidence</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-muted-foreground">Average confidence interval</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-blue-600">↑ 5%</span>
                        <span className="text-muted-foreground">improved stability</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <BarChart4 className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">Data Quality Score</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">92%</p>
                      <p className="text-sm text-muted-foreground">Clean, consistent data inputs</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-purple-600">↑ 8%</span>
                        <span className="text-muted-foreground">data cleaning improvements</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-chart-1" />
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on your forecasting patterns and model performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-900">Optimize Model Selection</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Consider using ensemble methods combining Neural Network and Random Forest for 3-5% accuracy improvement.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-green-900">Seasonal Adjustments</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Strong seasonal correlation (r=0.42) detected. Enable seasonal decomposition for better long-term forecasts.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-yellow-900">Data Collection</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add competitor analysis data to improve market share predictions (current accuracy: 84%).
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-purple-900">Forecast Horizon</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence drops significantly after 6 months. Consider shorter forecasting intervals for better reliability.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}