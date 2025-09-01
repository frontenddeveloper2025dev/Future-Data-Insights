import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ForecastMonitor } from '@/components/forecast/ForecastMonitor';
import { AlertManager } from '@/components/forecast/AlertManager';
import { PerformanceTracker } from '@/components/forecast/PerformanceTracker';
import { useAuthStore } from '@/store/auth-store';
import { 
  Activity, 
  Bell, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Import table operations (would use SDK in real implementation)
interface Forecast {
  id: string;
  name: string;
  model: string;
  accuracy: number;
  status: 'active' | 'paused' | 'completed';
  lastUpdated: Date;
}

export const MonitoringPage: React.FC = () => {
  const { user } = useAuthStore();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [monitoringStats, setMonitoringStats] = useState({
    activeForecasts: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    averageAccuracy: 0,
    systemHealth: 'good' as 'good' | 'warning' | 'critical'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMonitoringData();
    }
  }, [user]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading forecasts data (would use table operations in real implementation)
      const mockForecasts: Forecast[] = [
        {
          id: '1',
          name: 'Q4 Sales Forecast',
          model: 'Neural Network',
          accuracy: 89.5,
          status: 'active',
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Demand Planning Model',
          model: 'ARIMA',
          accuracy: 87.2,
          status: 'active',
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: '3',
          name: 'Revenue Projection',
          model: 'Linear Regression',
          accuracy: 91.8,
          status: 'active',
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
          id: '4',
          name: 'Market Analysis',
          model: 'Random Forest',
          accuracy: 85.1,
          status: 'paused',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '5',
          name: 'Customer Churn Prediction',
          model: 'LSTM',
          accuracy: 92.3,
          status: 'active',
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ];

      setForecasts(mockForecasts);

      // Calculate monitoring stats
      const activeForecasts = mockForecasts.filter(f => f.status === 'active').length;
      const averageAccuracy = mockForecasts.reduce((sum, f) => sum + f.accuracy, 0) / mockForecasts.length;
      
      setMonitoringStats({
        activeForecasts,
        totalAlerts: 3,
        criticalAlerts: 1,
        averageAccuracy,
        systemHealth: averageAccuracy > 90 ? 'good' : averageAccuracy > 80 ? 'warning' : 'critical'
      });

    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Forecast Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time monitoring, performance tracking, and automated alerts for your forecasting models
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Forecasts</p>
                <p className="text-2xl font-bold">{monitoringStats.activeForecasts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Total Alerts</p>
                <p className="text-2xl font-bold">{monitoringStats.totalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Critical Alerts</p>
                <p className="text-2xl font-bold">{monitoringStats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Avg Accuracy</p>
                <p className="text-2xl font-bold">{monitoringStats.averageAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getHealthIcon(monitoringStats.systemHealth)}
              <div>
                <p className="text-sm font-medium">System Health</p>
                <Badge className={getHealthBadgeColor(monitoringStats.systemHealth)}>
                  {monitoringStats.systemHealth.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Monitoring Interface */}
      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Real-time Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alert Management</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <ForecastMonitor forecasts={forecasts} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTracker forecasts={forecasts} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertManager forecasts={forecasts} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Configuration</CardTitle>
                <CardDescription>
                  Configure global monitoring settings and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">Auto-refresh Interval</p>
                      <p className="text-sm text-muted-foreground">
                        How often to refresh monitoring data
                      </p>
                    </div>
                    <Badge variant="outline">1 minute</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">Default Accuracy Threshold</p>
                      <p className="text-sm text-muted-foreground">
                        Minimum accuracy before triggering alerts
                      </p>
                    </div>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">Deviation Tolerance</p>
                      <p className="text-sm text-muted-foreground">
                        Maximum allowed deviation percentage
                      </p>
                    </div>
                    <Badge variant="outline">20%</Badge>
                  </div>
                </div>
                
                <Button className="w-full">Update Configuration</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current status of monitoring systems and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Forecast Monitoring</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Alert System</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Performance Tracking</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>Data Synchronization</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Syncing</Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Last system check: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};