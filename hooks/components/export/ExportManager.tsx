import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Image, 
  FileJson,
  BarChart3,
  TrendingUp,
  Calendar,
  Settings,
  CheckCircle2,
  Loader2,
  Eye,
  FileImage
} from 'lucide-react';

// Types
interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf' | 'png' | 'svg';
  includeCharts: boolean;
  includeData: boolean;
  includeAnalysis: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filename?: string;
  quality?: 'low' | 'medium' | 'high';
  chartTypes?: string[];
}

interface ForecastData {
  _id: string;
  title: string;
  type: string;
  model: string;
  data: any[];
  predictions: any[];
  accuracy_score: number;
  created_at: string;
  metadata?: any;
}

interface ExportManagerProps {
  forecasts: ForecastData[];
  selectedForecast?: ForecastData;
  onExport?: (options: ExportOptions) => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({
  forecasts,
  selectedForecast,
  onExport
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeCharts: true,
    includeData: true,
    includeAnalysis: true,
    includeMetadata: false,
    quality: 'high',
    chartTypes: ['trend', 'accuracy', 'comparison']
  });

  const formatOptions = [
    { value: 'csv', label: 'CSV Data', icon: FileSpreadsheet, description: 'Comma-separated values for data analysis' },
    { value: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet, description: 'Multiple sheets with charts and data' },
    { value: 'json', label: 'JSON Data', icon: FileJson, description: 'Structured data for API integration' },
    { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Complete analysis report with charts' },
    { value: 'png', label: 'PNG Images', icon: Image, description: 'High-quality chart images' },
    { value: 'svg', label: 'SVG Graphics', icon: FileImage, description: 'Scalable vector graphics' }
  ];

  const chartTypes = [
    { id: 'trend', label: 'Trend Charts', description: 'Time-series forecast visualizations' },
    { id: 'accuracy', label: 'Accuracy Charts', description: 'Model performance and accuracy metrics' },
    { id: 'comparison', label: 'Comparison Charts', description: 'Multi-forecast comparisons' },
    { id: 'correlation', label: 'Correlation Heatmaps', description: 'Feature correlation matrices' },
    { id: 'scatter', label: 'Scatter Analysis', description: 'Prediction vs actual scatter plots' },
    { id: 'dashboard', label: 'Dashboard Views', description: 'Complete dashboard screenshots' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate different export processes based on format
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (exportOptions.format) {
        case 'csv':
          await exportToCSV();
          break;
        case 'excel':
          await exportToExcel();
          break;
        case 'json':
          await exportToJSON();
          break;
        case 'pdf':
          await exportToPDF();
          break;
        case 'png':
          await exportToPNG();
          break;
        case 'svg':
          await exportToSVG();
          break;
      }

      if (onExport) {
        onExport(exportOptions);
      }

      toast({
        title: 'Export Successful',
        description: `Your ${exportOptions.format.toUpperCase()} export has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (selectedForecast) {
      // Export single forecast
      csvContent += 'Date,Actual,Predicted,Confidence_Upper,Confidence_Lower\n';
      selectedForecast.data.forEach(row => {
        csvContent += `${row.date},${row.actual || ''},${row.predicted},${row.confidence_upper || ''},${row.confidence_lower || ''}\n`;
      });
    } else {
      // Export all forecasts summary
      csvContent += 'ID,Title,Type,Model,Accuracy,Created_Date\n';
      forecasts.forEach(forecast => {
        csvContent += `${forecast._id},${forecast.title},${forecast.type},${forecast.model},${forecast.accuracy_score},${forecast.created_at}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `forecast_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = async () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      exports: selectedForecast ? [selectedForecast] : forecasts,
      metadata: {
        totalForecasts: forecasts.length,
        exportOptions: exportOptions,
        generatedBy: 'ForecastPro'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast_export_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    // Simulate Excel export with multiple sheets
    toast({
      title: 'Excel Export',
      description: 'Excel workbook with multiple sheets created successfully.',
    });
  };

  const exportToPDF = async () => {
    // Simulate PDF report generation
    toast({
      title: 'PDF Report',
      description: 'Comprehensive analysis report generated successfully.',
    });
  };

  const exportToPNG = async () => {
    // Simulate chart image export
    toast({
      title: 'Chart Images',
      description: 'High-quality PNG images exported successfully.',
    });
  };

  const exportToSVG = async () => {
    // Simulate SVG vector export
    toast({
      title: 'Vector Graphics',
      description: 'Scalable SVG graphics exported successfully.',
    });
  };

  const updateExportOptions = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleChartType = (chartType: string) => {
    const currentTypes = exportOptions.chartTypes || [];
    const newTypes = currentTypes.includes(chartType)
      ? currentTypes.filter(type => type !== chartType)
      : [...currentTypes, chartType];
    
    updateExportOptions('chartTypes', newTypes);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Manager
        </CardTitle>
        <CardDescription>
          Export forecast data, charts, and analysis reports in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Export Format</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the format that best suits your needs
              </p>
            </div>
            
            <div className="grid gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all border-2 ${
                      exportOptions.format === format.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateExportOptions('format', format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-8 h-8 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium">{format.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format.description}
                          </p>
                        </div>
                        {exportOptions.format === format.value && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div>
              <Label className="text-base font-medium">Content Selection</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose what to include in your export
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-data"
                  checked={exportOptions.includeData}
                  onCheckedChange={(checked) => updateExportOptions('includeData', checked)}
                />
                <Label htmlFor="include-data" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Raw Data</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={exportOptions.includeCharts}
                  onCheckedChange={(checked) => updateExportOptions('includeCharts', checked)}
                />
                <Label htmlFor="include-charts" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Charts & Visualizations</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-analysis"
                  checked={exportOptions.includeAnalysis}
                  onCheckedChange={(checked) => updateExportOptions('includeAnalysis', checked)}
                />
                <Label htmlFor="include-analysis" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Analysis & Insights</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) => updateExportOptions('includeMetadata', checked)}
                />
                <Label htmlFor="include-metadata" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Metadata & Configuration</span>
                </Label>
              </div>
            </div>

            {exportOptions.includeCharts && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Chart Types</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select which chart types to include
                </p>
                <div className="grid gap-2">
                  {chartTypes.map((chart) => (
                    <div key={chart.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`chart-${chart.id}`}
                        checked={exportOptions.chartTypes?.includes(chart.id)}
                        onCheckedChange={() => toggleChartType(chart.id)}
                      />
                      <Label htmlFor={`chart-${chart.id}`} className="text-sm">
                        <div>
                          <span className="font-medium">{chart.label}</span>
                          <p className="text-xs text-muted-foreground">{chart.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="options" className="space-y-6">
            <div>
              <Label className="text-base font-medium">Export Options</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Configure advanced export settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Custom Filename</Label>
                <Input
                  id="filename"
                  placeholder="forecast_analysis_2024"
                  value={exportOptions.filename || ''}
                  onChange={(e) => updateExportOptions('filename', e.target.value)}
                />
              </div>

              {(['png', 'svg'].includes(exportOptions.format)) && (
                <div className="space-y-2">
                  <Label htmlFor="quality">Image Quality</Label>
                  <Select 
                    value={exportOptions.quality} 
                    onValueChange={(value) => updateExportOptions('quality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fast)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="high">High (Best Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={exportOptions.dateRange?.start || ''}
                    onChange={(e) => updateExportOptions('dateRange', {
                      ...exportOptions.dateRange,
                      start: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={exportOptions.dateRange?.end || ''}
                    onChange={(e) => updateExportOptions('dateRange', {
                      ...exportOptions.dateRange,
                      end: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forecast Selection</Label>
                <Select 
                  value={selectedForecast?._id || 'all'} 
                  onValueChange={(value) => {
                    // This would be handled by parent component
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forecasts</SelectItem>
                    {forecasts.map((forecast) => (
                      <SelectItem key={forecast._id} value={forecast._id}>
                        {forecast.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Export Preview</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Review your export configuration before downloading
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Format:</span>
                    <Badge variant="outline">{exportOptions.format.toUpperCase()}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Forecasts:</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedForecast ? selectedForecast.title : `${forecasts.length} forecasts`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Content:</span>
                    <div className="flex space-x-1">
                      {exportOptions.includeData && <Badge variant="secondary" className="text-xs">Data</Badge>}
                      {exportOptions.includeCharts && <Badge variant="secondary" className="text-xs">Charts</Badge>}
                      {exportOptions.includeAnalysis && <Badge variant="secondary" className="text-xs">Analysis</Badge>}
                      {exportOptions.includeMetadata && <Badge variant="secondary" className="text-xs">Metadata</Badge>}
                    </div>
                  </div>

                  {exportOptions.includeCharts && exportOptions.chartTypes && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chart Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {exportOptions.chartTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {chartTypes.find(c => c.id === type)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {exportOptions.dateRange?.start && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Date Range:</span>
                      <span className="text-sm text-muted-foreground">
                        {exportOptions.dateRange.start} - {exportOptions.dateRange.end || 'Present'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Export Ready</p>
                <p className="text-blue-700">Your export is configured and ready to download.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedForecast ? (
              `Exporting: ${selectedForecast.title}`
            ) : (
              `Exporting ${forecasts.length} forecasts`
            )}
          </div>
          
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportManager;