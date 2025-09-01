import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
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
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
  forecast?: number;
  confidence_upper?: number;
  confidence_lower?: number;
  [key: string]: any;
}

interface InteractiveLineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  showBrush?: boolean;
  showConfidence?: boolean;
  animationDuration?: number;
  onPointClick?: (data: DataPoint) => void;
}

export const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  data,
  title = "Interactive Chart",
  height = 400,
  showBrush = true,
  showConfidence = true,
  animationDuration = 1000,
  onPointClick,
}) => {
  const [brushRange, setBrushRange] = useState<[number, number]>([0, data.length - 1]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // Calculate statistics
  const statistics = useMemo(() => {
    const values = data.map(d => d.value).filter(v => v !== undefined);
    const forecasts = data.map(d => d.forecast).filter(v => v !== undefined);
    
    return {
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      trend: values[values.length - 1] - values[0],
      forecastAccuracy: forecasts.length > 0 ? 
        forecasts.reduce((acc, f, i) => acc + Math.abs(f - values[i]), 0) / forecasts.length : 0,
    };
  }, [data]);

  const handleBrushChange = (range: any) => {
    if (range?.startIndex !== undefined && range?.endIndex !== undefined) {
      setBrushRange([range.startIndex, range.endIndex]);
    }
  };

  const handlePointClick = (data: any) => {
    setSelectedPoint(data);
    onPointClick?.(data);
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 5));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const resetZoom = () => {
    setZoomLevel(1);
    setBrushRange([0, data.length - 1]);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background border border-border rounded-lg p-3 shadow-lg"
        >
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-medium">{entry.value?.toFixed(2)}</span>
            </div>
          ))}
          {showConfidence && payload[0]?.payload?.confidence_upper && (
            <div className="mt-2 text-xs text-muted-foreground">
              Confidence: {payload[0].payload.confidence_lower?.toFixed(2)} - {payload[0].payload.confidence_upper?.toFixed(2)}
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Avg: {statistics.mean.toFixed(2)}
            </Badge>
            <Badge variant={statistics.trend > 0 ? "default" : "destructive"} className="text-xs">
              {statistics.trend > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {statistics.trend > 0 ? '+' : ''}{statistics.trend.toFixed(2)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetZoom}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onClick={handlePointClick}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Confidence area */}
            {showConfidence && (
              <ReferenceArea
                y1="confidence_lower"
                y2="confidence_upper"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
              />
            )}
            
            {/* Main data line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              animationDuration={isAnimating ? animationDuration : 0}
            />
            
            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
              animationDuration={isAnimating ? animationDuration + 200 : 0}
            />
            
            {/* Confidence bounds */}
            {showConfidence && (
              <>
                <Line
                  type="monotone"
                  dataKey="confidence_upper"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  dot={false}
                  animationDuration={isAnimating ? animationDuration + 400 : 0}
                />
                <Line
                  type="monotone"
                  dataKey="confidence_lower"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  dot={false}
                  animationDuration={isAnimating ? animationDuration + 400 : 0}
                />
              </>
            )}
            
            {showBrush && (
              <Brush
                dataKey="date"
                height={30}
                stroke="hsl(var(--primary))"
                onChange={handleBrushChange}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {selectedPoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-muted rounded-lg"
        >
          <h4 className="font-medium text-sm mb-2">Selected Point Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>Date: {selectedPoint.date}</div>
            <div>Value: {selectedPoint.value?.toFixed(2)}</div>
            {selectedPoint.forecast && <div>Forecast: {selectedPoint.forecast.toFixed(2)}</div>}
            {selectedPoint.confidence_upper && (
              <div>Confidence: ±{((selectedPoint.confidence_upper - selectedPoint.confidence_lower) / 2).toFixed(2)}</div>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div>Animation Duration:</div>
        <Slider
          value={[animationDuration]}
          onValueChange={([value]) => setIsAnimating(false)}
          max={2000}
          min={100}
          step={100}
          className="w-24"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAnimating(true)}
        >
          Animate
        </Button>
      </div>
    </Card>
  );
};