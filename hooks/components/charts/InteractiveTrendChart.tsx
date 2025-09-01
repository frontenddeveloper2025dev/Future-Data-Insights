import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Eye,
  EyeOff 
} from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
  actual?: number;
  confidence?: number;
}

interface InteractiveTrendChartProps {
  data: DataPoint[];
  title?: string;
  showConfidenceInterval?: boolean;
  showActualValues?: boolean;
  height?: number;
}

export function InteractiveTrendChart({
  data,
  title = 'Interactive Trend Analysis',
  showConfidenceInterval = true,
  showActualValues = true,
  height = 400,
}: InteractiveTrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showBrush, setShowBrush] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [smoothing, setSmoothing] = useState([0.3]);
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState({
    value: true,
    predicted: true,
    actual: showActualValues,
    confidence: showConfidenceInterval,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const values = data.map(d => d.value);
    const predicted = data.map(d => d.predicted).filter(Boolean) as number[];
    
    const currentValue = values[values.length - 1];
    const previousValue = values[values.length - 2];
    const trend = currentValue > previousValue ? 'up' : 'down';
    const changePercent = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    const volatility = values.length > 1 ? 
      Math.sqrt(values.reduce((sum, val, i) => {
        if (i === 0) return 0;
        const change = (val - values[i - 1]) / values[i - 1];
        return sum + Math.pow(change, 2);
      }, 0) / (values.length - 1)) * 100 : 0;

    const accuracy = predicted.length > 0 && showActualValues ? 
      data.reduce((sum, point) => {
        if (point.predicted && point.actual) {
          const error = Math.abs(point.predicted - point.actual) / point.actual;
          return sum + (1 - error);
        }
        return sum;
      }, 0) / predicted.length * 100 : null;

    return {
      trend,
      changePercent,
      volatility,
      accuracy,
      currentValue,
      avgValue: values.reduce((a, b) => a + b, 0) / values.length,
      maxValue: Math.max(...values),
      minValue: Math.min(...values),
    };
  }, [data, showActualValues]);

  // Apply smoothing to data
  const smoothedData = useMemo(() => {
    const alpha = smoothing[0];
    if (alpha === 0) return data;

    return data.map((point, index) => {
      if (index === 0) return point;
      
      const prevSmoothed = data[index - 1];
      return {
        ...point,
        value: alpha * point.value + (1 - alpha) * prevSmoothed.value,
        predicted: point.predicted ? alpha * point.predicted + (1 - alpha) * (prevSmoothed.predicted || point.predicted) : point.predicted,
      };
    });
  }, [data, smoothing]);

  const resetZoom = () => {
    setZoomDomain(null);
  };

  const handleZoomIn = () => {
    const dataLength = data.length;
    const start = Math.floor(dataLength * 0.2);
    const end = Math.floor(dataLength * 0.8);
    setZoomDomain([start, end]);
  };

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.dataKey}:</span> {entry.value?.toFixed(2)}
              {entry.dataKey === 'confidence' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {title}
            </CardTitle>
            <Badge variant={stats.trend === 'up' ? 'default' : 'destructive'} className="gap-1">
              {stats.trend === 'up' ? 
                <TrendingUp className="w-3 h-3" /> : 
                <TrendingDown className="w-3 h-3" />
              }
              {stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              {chartType === 'line' ? 'Area' : 'Line'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Value</div>
            <div className="font-semibold text-lg">{stats.currentValue.toFixed(2)}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Volatility</div>
            <div className="font-semibold text-lg text-orange-600">{stats.volatility.toFixed(1)}%</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Range</div>
            <div className="font-semibold text-lg">{stats.minValue.toFixed(1)} - {stats.maxValue.toFixed(1)}</div>
          </div>
          {stats.accuracy && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="font-semibold text-lg text-green-600">{stats.accuracy.toFixed(1)}%</div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Label htmlFor="smoothing" className="text-sm font-medium">Smoothing</Label>
            <div className="w-24">
              <Slider
                id="smoothing"
                value={smoothing}
                onValueChange={setSmoothing}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{smoothing[0].toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="brush"
              checked={showBrush}
              onCheckedChange={setShowBrush}
            />
            <Label htmlFor="brush" className="text-sm">Time Brush</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="grid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
            />
            <Label htmlFor="grid" className="text-sm">Grid</Label>
          </div>
        </div>

        {/* Metric Toggles */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <span className="text-sm font-medium">Show:</span>
          {Object.entries(selectedMetrics).map(([key, value]) => (
            <Button
              key={key}
              variant={value ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMetric(key as keyof typeof selectedMetrics)}
              className="capitalize"
            >
              {value ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              {key === 'predicted' ? 'Forecast' : key}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full" style={{ height: height + 'px' }}>
          <ResponsiveContainer>
            <ChartComponent data={smoothedData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fill: '#666' }}
                domain={zoomDomain}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Confidence Interval */}
              {selectedMetrics.confidence && chartType === 'area' && (
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  connectNulls
                />
              )}
              
              {selectedMetrics.confidence && chartType === 'area' && (
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  connectNulls
                />
              )}
              
              {/* Main Data Lines/Areas */}
              {selectedMetrics.value && (
                chartType === 'area' ? (
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: '#2563eb' }}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: '#2563eb' }}
                  />
                )
              )}
              
              {selectedMetrics.predicted && (
                chartType === 'area' ? (
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    connectNulls
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    connectNulls
                  />
                )
              )}
              
              {selectedMetrics.actual && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                  connectNulls
                />
              )}
              
              {/* Reference Lines */}
              <ReferenceLine y={stats.avgValue} stroke="#666" strokeDasharray="2 2" opacity={0.5} />
              
              {showBrush && (
                <Brush 
                  dataKey="date" 
                  height={30}
                  stroke="#2563eb"
                  fill="#f8fafc"
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Info */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Interactive features: Zoom, pan, metric toggles, and time brush navigation</p>
          <p>Smoothing factor: {smoothing[0].toFixed(1)} • Data points: {data.length} • Chart type: {chartType}</p>
        </div>
      </CardContent>
    </Card>
  );
}