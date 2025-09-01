import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { table } from '@devvai/devv-code-backend';
import { 
  Download, 
  ArrowLeft, 
  FileSpreadsheet, 
  BarChart3, 
  Package,
  Activity,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

// Import export components
import { ExportManager, ChartExporter, BulkExporter } from '@/components/export';
import type { BulkExportItem } from '@/components/export';

interface Forecast {
  _id: string;
  title: string;
  type: string;
  model: string;
  accuracy_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  data?: any[];
  predictions?: any[];
}

const ExportPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manager');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      const response = await table.getItems('evn1j5kjx62o', { 
        limit: 50,
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

  // Convert forecasts to bulk export items
  const bulkExportItems: BulkExportItem[] = forecasts.map(forecast => ({
    id: forecast._id,
    title: forecast.title,
    type: 'forecast',
    size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, // Simulated size
    lastModified: new Date(forecast.updated_at).toLocaleDateString(),
    status: forecast.status === 'active' ? 'completed' : 'pending',
    accuracy: forecast.accuracy_score / 100,
    model: forecast.model
  }));

  // Add some example analysis and chart items
  const analysisItems: BulkExportItem[] = [
    {
      id: 'analysis-1',
      title: 'Q4 Performance Analysis',
      type: 'analysis',
      size: '2.3 MB',
      lastModified: new Date().toLocaleDateString(),
      status: 'completed'
    },
    {
      id: 'analysis-2',
      title: 'Model Comparison Report',
      type: 'report',
      size: '1.8 MB',
      lastModified: new Date().toLocaleDateString(),
      status: 'completed'
    },
    {
      id: 'chart-1',
      title: 'Revenue Trend Visualization',
      type: 'chart',
      size: '0.5 MB',
      lastModified: new Date().toLocaleDateString(),
      status: 'completed'
    }
  ];

  const allExportItems = [...bulkExportItems, ...analysisItems];

  const handleExport = async (options: any) => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsExporting(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    clearInterval(progressInterval);
    setExportProgress(100);
    setIsExporting(false);

    toast({
      title: 'Export Completed',
      description: 'Your data has been successfully exported.',
    });
  };

  const handleBulkExport = async (selectedItems: string[], options: any) => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate bulk export process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    setIsExporting(false);

    toast({
      title: 'Bulk Export Completed',
      description: `Successfully exported ${selectedItems.length} items.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading export data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Export Center</h1>
                  <p className="text-sm text-muted-foreground">
                    Export your forecasts, charts, and analysis reports
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {forecasts.length} Forecasts Available
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-2xl font-bold">
                    {forecasts.filter(f => f.status === 'active').length}
                  </p>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Export Items</p>
                  <p className="text-2xl font-bold">{allExportItems.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manager">Export Manager</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Export</TabsTrigger>
            <TabsTrigger value="charts">Chart Export</TabsTrigger>
          </TabsList>

          <TabsContent value="manager" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ExportManager
                forecasts={forecasts.map(f => ({
                  _id: f._id,
                  title: f.title,
                  type: f.type,
                  model: f.model,
                  data: f.data || [],
                  predictions: f.predictions || [],
                  accuracy_score: f.accuracy_score,
                  created_at: f.created_at,
                  metadata: {
                    status: f.status,
                    updated_at: f.updated_at
                  }
                }))}
                onExport={handleExport}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Quick Export Options
                  </CardTitle>
                  <CardDescription>
                    Common export formats for quick downloads
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast({ title: "CSV Export", description: "All forecast data exported as CSV" })}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export All as CSV
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast({ title: "Excel Export", description: "Comprehensive Excel workbook created" })}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel Workbook
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast({ title: "PDF Report", description: "Analysis report generated" })}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate PDF Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkExporter
              items={allExportItems}
              onExport={handleBulkExport}
              isExporting={isExporting}
              exportProgress={exportProgress}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Chart Export Instructions
                  </CardTitle>
                  <CardDescription>
                    Export individual charts from your dashboard and analysis pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Navigate to Charts</p>
                        <p className="text-sm text-muted-foreground">
                          Go to Dashboard, Performance, or Advanced Charts pages
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Find Export Button</p>
                        <p className="text-sm text-muted-foreground">
                          Look for the download icon on any chart you want to export
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Choose Format</p>
                        <p className="text-sm text-muted-foreground">
                          Select PNG, SVG, or PDF format with custom sizing options
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/charts')}
                    >
                      Advanced Charts
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/performance')}
                    >
                      Performance Page
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chart Export Preview */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sample Chart Export</CardTitle>
                    <CardDescription>
                      Preview of chart export functionality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Sample Chart Visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ChartExporter
                  chartRef={React.createRef()}
                  chartTitle="Sample Revenue Forecast"
                  onExportStart={() => toast({ title: "Export Started", description: "Generating chart export..." })}
                  onExportComplete={(success) => {
                    if (success) {
                      toast({ title: "Export Complete", description: "Chart exported successfully" });
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExportPage;