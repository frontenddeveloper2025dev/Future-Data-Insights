import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Plus, Trash2, FileSpreadsheet, TrendingUp, Activity, BarChart3, AlertCircle, Brain, Lightbulb } from 'lucide-react';
import { ForecastAnalyzer } from './ForecastAnalyzer';

interface DataPoint {
  date: string;
  value: number;
}

interface DataInputFormProps {
  onDataSubmit: (data: {
    title: string;
    type: string;
    timeHorizon: string;
    dataPoints: DataPoint[];
  }) => void;
}

export function DataInputForm({ onDataSubmit }: DataInputFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { date: '', value: 0 }
  ]);
  const [csvData, setCsvData] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [dataQualityInsights, setDataQualityInsights] = useState<string[]>([]);

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { date: '', value: 0 }]);
  };

  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 1) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: string | number) => {
    const updated = dataPoints.map((point, i) => 
      i === index ? { ...point, [field]: value } : point
    );
    setDataPoints(updated);
  };

  const parseCsvData = () => {
    if (!csvData.trim()) return;
    
    const lines = csvData.trim().split('\n');
    const parsed: DataPoint[] = [];
    let hasHeader = false;
    
    lines.forEach((line, index) => {
      const [date, value] = line.split(',');
      
      // Skip header row if it contains non-date/non-number data
      if (index === 0 && (isNaN(Date.parse(date?.trim())) || isNaN(parseFloat(value?.trim())))) {
        hasHeader = true;
        return;
      }
      
      if (date && value) {
        const trimmedDate = date.trim();
        const trimmedValue = value.trim();
        const parsedValue = parseFloat(trimmedValue);
        
        if (!isNaN(Date.parse(trimmedDate)) && !isNaN(parsedValue)) {
          parsed.push({
            date: new Date(trimmedDate).toISOString().split('T')[0],
            value: parsedValue
          });
        }
      }
    });
    
    if (parsed.length > 0) {
      // Sort by date
      parsed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDataPoints(parsed);
      setCsvData('');
      alert(`Successfully imported ${parsed.length} data points${hasHeader ? ' (header row detected and skipped)' : ''}`);
    } else {
      alert('No valid data points found. Please check your CSV format.');
    }
  };

  const handleSubmit = () => {
    const validDataPoints = dataPoints.filter(point => point.date && point.value);
    
    if (!title.trim()) {
      alert('Please enter a forecast title');
      return;
    }
    if (!type) {
      alert('Please select a forecast type');
      return;
    }
    if (!timeHorizon) {
      alert('Please select a time horizon');
      return;
    }
    if (validDataPoints.length < 3) {
      alert('Please provide at least 3 valid data points for accurate forecasting');
      return;
    }
    
    onDataSubmit({
      title: title.trim(),
      type,
      timeHorizon,
      dataPoints: validDataPoints
    });
    
    // Show preview if we have valid data
    if (validDataPoints.length >= 3) {
      setShowPreview(true);
    }
  };

  // Calculate basic statistics for preview
  const calculatePreviewStats = () => {
    const validPoints = dataPoints.filter(p => p.date && p.value > 0);
    if (validPoints.length < 2) return null;
    
    const values = validPoints.map(p => p.value);
    const sortedPoints = validPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate trend
    const firstValue = sortedPoints[0].value;
    const lastValue = sortedPoints[sortedPoints.length - 1].value;
    const trendPercent = ((lastValue - firstValue) / firstValue) * 100;
    
    // Data quality assessment
    const volatility = (stdDev / mean) * 100;
    const quality = volatility < 20 ? 'High' : volatility < 50 ? 'Medium' : 'Low';
    
    return {
      count: validPoints.length,
      mean: Math.round(mean * 100) / 100,
      trend: trendPercent,
      quality,
      volatility: Math.round(volatility * 100) / 100
    };
  };

  const previewStats = calculatePreviewStats();

  // Real-time data analysis insights
  useEffect(() => {
    if (previewStats && previewStats.count >= 3) {
      const insights: string[] = [];
      
      // Trend insights
      if (Math.abs(previewStats.trend) > 20) {
        insights.push(`Strong ${previewStats.trend > 0 ? 'upward' : 'downward'} trend detected`);
      } else if (Math.abs(previewStats.trend) > 10) {
        insights.push(`Moderate ${previewStats.trend > 0 ? 'growth' : 'decline'} pattern`);
      } else {
        insights.push('Relatively stable data pattern');
      }
      
      // Volatility insights
      if (previewStats.volatility < 15) {
        insights.push('Low volatility - ideal for most forecasting models');
      } else if (previewStats.volatility < 30) {
        insights.push('Moderate volatility - suitable for robust models');
      } else {
        insights.push('High volatility - recommend ensemble or neural network models');
      }
      
      // Data size insights
      if (previewStats.count < 12) {
        insights.push('Consider gathering more historical data for improved accuracy');
      } else if (previewStats.count > 50) {
        insights.push('Excellent data volume for complex model training');
      }
      
      setDataQualityInsights(insights);
      setShowAnalyzer(true); // Auto-show analyzer when we have good data
    }
  }, [previewStats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Historical Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Forecast Title</Label>
            <Input
              id="title"
              placeholder="Q4 Sales Forecast"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Forecast Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">📈 Sales</SelectItem>
                <SelectItem value="revenue">💰 Revenue</SelectItem>
                <SelectItem value="demand">📦 Demand</SelectItem>
                <SelectItem value="stock">📊 Stock Price</SelectItem>
                <SelectItem value="weather">🌤️ Weather</SelectItem>
                <SelectItem value="traffic">🚗 Traffic</SelectItem>
                <SelectItem value="inventory">📋 Inventory</SelectItem>
                <SelectItem value="energy">⚡ Energy Usage</SelectItem>
                <SelectItem value="custom">🔧 Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Time Horizon</Label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger>
                <SelectValue placeholder="Select horizon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CSV Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <Label>Quick CSV Import</Label>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Paste CSV data (date,value format):\nDate,Value\n2024-01-01,100\n2024-02-01,150\n2024-03-01,175"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="flex-1 font-mono text-sm"
              rows={4}
            />
            <Button onClick={parseCsvData} className="mt-auto" disabled={!csvData.trim()}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports CSV format with header row. Dates will be automatically sorted.
          </p>
        </div>

        {/* Manual Data Points */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Historical Data Points</Label>
            <Button onClick={addDataPoint} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Point
            </Button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {dataPoints.map((point, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={point.date}
                  onChange={(e) => updateDataPoint(index, 'date', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={point.value || ''}
                  onChange={(e) => updateDataPoint(index, 'value', parseFloat(e.target.value) || 0)}
                  className="flex-1"
                />
                {dataPoints.length > 1 && (
                  <Button
                    onClick={() => removeDataPoint(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Data Analysis */}
        {previewStats && previewStats.count >= 3 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="font-medium">Live Data Analysis</span>
                <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'} Stats
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAnalyzer(!showAnalyzer)}
                >
                  {showAnalyzer ? 'Hide' : 'Show'} AI Insights
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{previewStats.count}</div>
                <div className="text-xs text-muted-foreground">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{previewStats.mean}</div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  previewStats.trend > 5 ? 'text-green-600' : 
                  previewStats.trend < -5 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {previewStats.trend > 0 ? '+' : ''}{Math.round(previewStats.trend)}%
                </div>
                <div className="text-xs text-muted-foreground">Trend</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  previewStats.quality === 'High' ? 'text-green-600' : 
                  previewStats.quality === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {previewStats.quality}
                </div>
                <div className="text-xs text-muted-foreground">Quality</div>
              </div>
            </div>
            
            {showPreview && (
              <div className="pt-2 border-t border-white/50">
                <div className="flex items-start gap-2">
                  {previewStats.quality === 'High' ? (
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Excellent data quality - perfect for accurate forecasting</span>
                    </div>
                  ) : previewStats.quality === 'Medium' ? (
                    <div className="flex items-center gap-2 text-yellow-700 text-sm">
                      <BarChart3 className="w-4 h-4" />
                      <span>Good data quality - suitable for most forecasting models</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>High volatility detected - consider data smoothing or robust models</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Real-time AI Insights */}
            {showAnalyzer && dataQualityInsights.length > 0 && (
              <div className="pt-3 border-t border-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">AI Insights</span>
                </div>
                <div className="space-y-1">
                  {dataQualityInsights.map((insight, index) => (
                    <div key={index} className="text-xs text-slate-600 flex items-center gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Full ForecastAnalyzer Integration */}
            {showAnalyzer && dataPoints.filter(p => p.date && p.value).length >= 3 && (
              <div className="pt-3 border-t border-white/50">
                <ForecastAnalyzer 
                  dataPoints={dataPoints.filter(p => p.date && p.value)}
                  forecastType={type || 'custom'}
                  onSuggestTemplate={(templateId) => {
                    // Handle template suggestion
                    console.log('Template suggested:', templateId);
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {dataPoints.filter(p => p.date && p.value).length > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{dataPoints.filter(p => p.date && p.value).length} valid data points</span>
              </div>
            )}
          </div>
          <Button onClick={handleSubmit} size="lg" disabled={!title.trim() || !type || !timeHorizon}>
            Continue to Model Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}