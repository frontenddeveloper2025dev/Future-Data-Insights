import React, { useState, useMemo } from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Eye,
  EyeOff,
  RotateCw,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';

interface RadarDataPoint {
  [key: string]: number | string;
}

interface RadarSeries {
  name: string;
  data: RadarDataPoint[];
  color: string;
  visible: boolean;
  opacity: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  series?: RadarSeries[];
  title?: string;
  height?: number;
  axes?: string[];
  maxValue?: number;
  showGrid?: boolean;
  gridLevels?: number;
  animate?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  series = [],
  title = "Multi-Dimensional Analysis",
  height = 400,
  axes = [],
  maxValue,
  showGrid = true,
  gridLevels = 5,
  animate = true,
}) => {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(series.map(s => s.name))
  );
  const [isAnimating, setIsAnimating] = useState(animate);
  const [highlightedSeries, setHighlightedSeries] = useState<string | null>(null);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [showGridLines, setShowGridLines] = useState(showGrid);

  // Extract axes from data if not provided
  const radarAxes = useMemo(() => {
    if (axes.length > 0) return axes;
    
    const firstDataPoint = data[0] || {};
    return Object.keys(firstDataPoint).filter(key => 
      typeof firstDataPoint[key] === 'number'
    );
  }, [data, axes]);

  // Calculate max values for normalization
  const calculatedMaxValue = useMemo(() => {
    if (maxValue) return maxValue;
    
    const allValues = [];
    data.forEach(point => {
      radarAxes.forEach(axis => {
        if (typeof point[axis] === 'number') {
          allValues.push(point[axis] as number);
        }
      });
    });
    
    series.forEach(seriesItem => {
      seriesItem.data.forEach(point => {
        radarAxes.forEach(axis => {
          if (typeof point[axis] === 'number') {
            allValues.push(point[axis] as number);
          }
        });
      });
    });
    
    return Math.max(...allValues, 100);
  }, [data, series, radarAxes, maxValue]);

  // Prepare data for Recharts
  const chartData = useMemo(() => {
    const result = radarAxes.map(axis => {
      const point: any = { axis };
      
      // Add main data series
      if (data.length > 0) {
        const avgValue = data.reduce((sum, item) => {
          return sum + ((item[axis] as number) || 0);
        }, 0) / data.length;
        point.main = avgValue;
      }
      
      // Add additional series
      series.forEach(seriesItem => {
        if (visibleSeries.has(seriesItem.name)) {
          const avgValue = seriesItem.data.reduce((sum, item) => {
            return sum + ((item[axis] as number) || 0);
          }, 0) / seriesItem.data.length;
          point[seriesItem.name] = avgValue;
        }
      });
      
      return point;
    });
    
    return result;
  }, [data, series, radarAxes, visibleSeries]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats: { [key: string]: { mean: number; max: number; min: number } } = {};
    
    radarAxes.forEach(axis => {
      const values = data.map(d => (d[axis] as number) || 0);
      stats[axis] = {
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        max: Math.max(...values),
        min: Math.min(...values),
      };
    });
    
    return stats;
  }, [data, radarAxes]);

  const toggleSeries = (seriesName: string) => {
    setVisibleSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesName)) {
        newSet.delete(seriesName);
      } else {
        newSet.add(seriesName);
      }
      return newSet;
    });
  };

  const handleSeriesHover = (seriesName: string | null) => {
    setHighlightedSeries(seriesName);
  };

  const CustomTick = ({ payload, x, y, textAnchor, ...props }: any) => {
    const adjustedAngle = (payload.coordinate + rotationOffset) % 360;
    
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text
          {...props}
          x={x}
          y={y}
          textAnchor={textAnchor}
          className="fill-current text-sm font-medium"
          transform={`rotate(${adjustedAngle > 90 && adjustedAngle < 270 ? adjustedAngle + 180 : adjustedAngle}, ${x}, ${y})`}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {radarAxes.length} dimensions
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.length} data points
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
          >
            <Zap className={`w-4 h-4 ${isAnimating ? 'animate-pulse' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRotationOffset(prev => (prev + 45) % 360)}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ height }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadar
                data={chartData}
                startAngle={90 + rotationOffset}
                endAngle={450 + rotationOffset}
              >
                {showGridLines && (
                  <PolarGrid
                    stroke="hsl(var(--border))"
                    radialLines={true}
                    gridType="polygon"
                  />
                )}
                
                <PolarAngleAxis
                  dataKey="axis"
                  tick={<CustomTick />}
                  className="text-sm"
                />
                
                <PolarRadiusAxis
                  angle={90 + rotationOffset}
                  domain={[0, calculatedMaxValue]}
                  tickCount={gridLevels + 1}
                  tick={{
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />

                {/* Main data series */}
                {data.length > 0 && (
                  <Radar
                    name="Main"
                    dataKey="main"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={highlightedSeries === null || highlightedSeries === 'Main' ? 0.3 : 0.1}
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: "hsl(var(--primary))",
                      strokeWidth: 2,
                    }}
                    animationDuration={isAnimating ? 1000 : 0}
                  />
                )}

                {/* Additional series */}
                {series.map((seriesItem, index) => (
                  visibleSeries.has(seriesItem.name) && (
                    <Radar
                      key={seriesItem.name}
                      name={seriesItem.name}
                      dataKey={seriesItem.name}
                      stroke={seriesItem.color}
                      fill={seriesItem.color}
                      fillOpacity={
                        highlightedSeries === null || highlightedSeries === seriesItem.name 
                          ? seriesItem.opacity || 0.3 
                          : 0.1
                      }
                      strokeWidth={2}
                      dot={{
                        r: 3,
                        fill: seriesItem.color,
                        strokeWidth: 1,
                      }}
                      animationDuration={isAnimating ? 1000 + index * 200 : 0}
                    />
                  )
                ))}
                
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                  }}
                />
              </RechartsRadar>
            </ResponsiveContainer>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          {/* Series Controls */}
          {series.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Series Visibility
              </h4>
              <div className="space-y-2">
                {series.map((seriesItem) => (
                  <div
                    key={seriesItem.name}
                    className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                    onMouseEnter={() => handleSeriesHover(seriesItem.name)}
                    onMouseLeave={() => handleSeriesHover(null)}
                  >
                    <Checkbox
                      checked={visibleSeries.has(seriesItem.name)}
                      onCheckedChange={() => toggleSeries(seriesItem.name)}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: seriesItem.color }}
                    />
                    <span className="text-sm flex-1">{seriesItem.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Statistics */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Statistics
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {radarAxes.slice(0, 6).map((axis) => (
                <div key={axis} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium truncate">{axis}</span>
                    <Badge variant="outline" className="text-xs">
                      {statistics[axis]?.mean.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-muted-foreground">
                    <span>Min: {statistics[axis]?.min.toFixed(1)}</span>
                    <span>Max: {statistics[axis]?.max.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              {radarAxes.length > 6 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  ... and {radarAxes.length - 6} more dimensions
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Controls
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Rotation: {rotationOffset}°
                </label>
                <Slider
                  value={[rotationOffset]}
                  onValueChange={([value]) => setRotationOffset(value)}
                  max={360}
                  min={0}
                  step={15}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="grid"
                  checked={showGridLines}
                  onCheckedChange={(checked) => setShowGridLines(!!checked)}
                />
                <label htmlFor="grid" className="text-sm">Show Grid</label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="animate"
                  checked={isAnimating}
                  onCheckedChange={(checked) => setIsAnimating(!!checked)}
                />
                <label htmlFor="animate" className="text-sm">Animation</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {highlightedSeries && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-muted rounded-lg"
          >
            <div className="text-sm">
              <span className="font-medium">Focused on:</span> {highlightedSeries}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};