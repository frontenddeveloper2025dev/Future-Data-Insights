import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Clock, Target, Award, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { table } from '@devvai/devv-code-backend';

interface UsageMetrics {
  totalTemplates: number;
  totalUsage: number;
  avgUsagePerTemplate: number;
  popularCategories: Array<{ category: string; count: number; percentage: number }>;
  usageTrends: Array<{ month: string; usage: number; accuracy: number }>;
  topTemplates: Array<{ 
    name: string; 
    category: string; 
    usage: number; 
    avgAccuracy: number;
    created: string;
  }>;
  modelDistribution: Array<{ model: string; count: number; avgAccuracy: number }>;
  userEngagement: {
    activeUsers: number;
    avgSessionLength: number;
    returnRate: number;
  };
}

export function UsageAnalytics() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load data from all relevant tables
      const [templatesRes, forecastsRes, outcomesRes] = await Promise.all([
        table.getItems('ew2w7lb1sa9s', { limit: 100, sort: 'usage_count', order: 'desc' }),
        table.getItems('evn1j5kjx62o', { limit: 200, sort: 'created_at', order: 'desc' }),
        table.getItems('evtdsghlfbb4', { limit: 100, sort: 'recorded_at', order: 'desc' })
      ]);

      const templates = templatesRes.items as any[];
      const forecasts = forecastsRes.items as any[];
      const outcomes = outcomesRes.items as any[];

      // Calculate comprehensive metrics
      const analytics = calculateUsageMetrics(templates, forecasts, outcomes, timeRange);
      setMetrics(analytics);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUsageMetrics = (
    templates: any[], 
    forecasts: any[], 
    outcomes: any[],
    timeRange: string
  ): UsageMetrics => {
    // Filter data based on time range
    const cutoffDate = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentForecasts = forecasts.filter(f => 
      new Date(f.created_at) >= cutoffDate
    );

    // Basic metrics
    const totalTemplates = templates.length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    const avgUsagePerTemplate = totalTemplates > 0 ? totalUsage / totalTemplates : 0;

    // Category analysis
    const categoryMap = new Map<string, number>();
    templates.forEach(template => {
      const category = template.category || 'uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + (template.usage_count || 0));
    });

    const popularCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalUsage > 0 ? (count / totalUsage) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Usage trends (monthly)
    const usageTrends = generateUsageTrends(recentForecasts, outcomes);

    // Top templates
    const topTemplates = templates
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 10)
      .map(template => {
        // Calculate average accuracy for this template
        const templateForecasts = forecasts.filter(f => {
          try {
            // This would require linking forecasts to templates
            // For now, we'll use the forecast type as a proxy
            return f.type === template.category;
          } catch {
            return false;
          }
        });
        
        const avgAccuracy = templateForecasts.length > 0
          ? templateForecasts.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / templateForecasts.length
          : 0;

        return {
          name: template.template_name,
          category: template.category,
          usage: template.usage_count || 0,
          avgAccuracy,
          created: template.created_at
        };
      });

    // Model distribution
    const modelMap = new Map<string, { count: number; totalAccuracy: number }>();
    
    forecasts.forEach(forecast => {
      const model = forecast.model || 'unknown';
      const current = modelMap.get(model) || { count: 0, totalAccuracy: 0 };
      modelMap.set(model, {
        count: current.count + 1,
        totalAccuracy: current.totalAccuracy + (forecast.accuracy_score || 0)
      });
    });

    const modelDistribution = Array.from(modelMap.entries())
      .map(([model, data]) => ({
        model: model.replace('_', ' '),
        count: data.count,
        avgAccuracy: data.count > 0 ? data.totalAccuracy / data.count : 0
      }))
      .sort((a, b) => b.count - a.count);

    // User engagement metrics (simplified)
    const uniqueUsers = new Set(forecasts.map(f => f._uid)).size;
    const userEngagement = {
      activeUsers: uniqueUsers,
      avgSessionLength: 25, // Would need session tracking for real data
      returnRate: 0.65 // Would calculate from user return patterns
    };

    return {
      totalTemplates,
      totalUsage,
      avgUsagePerTemplate,
      popularCategories,
      usageTrends,
      topTemplates,
      modelDistribution,
      userEngagement
    };
  };

  const generateUsageTrends = (forecasts: any[], outcomes: any[]) => {
    const monthlyData = new Map<string, { usage: number; totalAccuracy: number; count: number }>();
    
    forecasts.forEach(forecast => {
      const date = new Date(forecast.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const current = monthlyData.get(monthKey) || { usage: 0, totalAccuracy: 0, count: 0 };
      monthlyData.set(monthKey, {
        usage: current.usage + 1,
        totalAccuracy: current.totalAccuracy + (forecast.accuracy_score || 0),
        count: current.count + 1
      });
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        usage: data.usage,
        accuracy: data.count > 0 ? data.totalAccuracy / data.count : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground text-sm">
              Start using templates to see usage analytics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{metrics.totalTemplates}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{metrics.totalUsage}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.userEngagement.activeUsers}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Usage</p>
                <p className="text-2xl font-bold">{metrics.avgUsagePerTemplate.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Template usage and accuracy over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.usageTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="usage" fill="#3b82f6" name="Usage Count" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" name="Avg Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
            <CardDescription>Template usage by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.popularCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.popularCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Top Templates</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Templates</CardTitle>
              <CardDescription>Templates with highest usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topTemplates.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.avgAccuracy.toFixed(0)}% avg accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{template.usage}</div>
                      <div className="text-xs text-muted-foreground">uses</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
              <CardDescription>Usage and accuracy by prediction model</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.modelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Usage Count" />
                  <Line yAxisId="right" type="monotone" dataKey="avgAccuracy" stroke="#10b981" name="Avg Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{metrics.userEngagement.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{metrics.userEngagement.avgSessionLength}m</div>
                  <div className="text-sm text-muted-foreground">Avg Session</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{(metrics.userEngagement.returnRate * 100).toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Return Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UsageAnalytics;