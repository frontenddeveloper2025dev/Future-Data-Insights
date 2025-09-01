import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, Palette, Download, RotateCcw } from 'lucide-react';

interface HeatmapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  title?: string;
  width?: number;
  height?: number;
  colorScheme?: 'blue' | 'red' | 'green' | 'purple' | 'gradient';
  showValues?: boolean;
  interactive?: boolean;
}

export function HeatmapChart({
  data,
  title = 'Data Heatmap',
  width = 800,
  height = 400,
  colorScheme = 'blue',
  showValues = true,
  interactive = true,
}: HeatmapChartProps) {
  const [selectedScheme, setSelectedScheme] = useState(colorScheme);
  const [showLabels, setShowLabels] = useState(showValues);
  const [selectedCell, setSelectedCell] = useState<HeatmapDataPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Process data into grid format
  const processedData = useMemo(() => {
    const xValues = Array.from(new Set(data.map(d => d.x))).sort();
    const yValues = Array.from(new Set(data.map(d => d.y))).sort();
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    const grid: (HeatmapDataPoint & { intensity: number })[][] = [];
    
    yValues.forEach((y, yIndex) => {
      grid[yIndex] = [];
      xValues.forEach((x, xIndex) => {
        const point = data.find(d => d.x === x && d.y === y);
        const value = point?.value || 0;
        const intensity = (value - minValue) / valueRange;
        
        grid[yIndex][xIndex] = {
          x,
          y,
          value,
          label: point?.label,
          intensity,
        };
      });
    });

    return { grid, xValues, yValues, minValue, maxValue, valueRange };
  }, [data]);

  // Color schemes
  const colorSchemes = {
    blue: {
      low: '#f0f9ff',
      medium: '#3b82f6',
      high: '#1e40af',
      gradient: 'linear-gradient(to right, #f0f9ff, #3b82f6, #1e40af)',
    },
    red: {
      low: '#fef2f2',
      medium: '#ef4444',
      high: '#dc2626',
      gradient: 'linear-gradient(to right, #fef2f2, #ef4444, #dc2626)',
    },
    green: {
      low: '#f0fdf4',
      medium: '#22c55e',
      high: '#16a34a',
      gradient: 'linear-gradient(to right, #f0fdf4, #22c55e, #16a34a)',
    },
    purple: {
      low: '#faf5ff',
      medium: '#a855f7',
      high: '#7c3aed',
      gradient: 'linear-gradient(to right, #faf5ff, #a855f7, #7c3aed)',
    },
    gradient: {
      low: '#fef3c7',
      medium: '#f59e0b',
      high: '#dc2626',
      gradient: 'linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #dc2626)',
    },
  };

  const getColor = (intensity: number) => {
    const scheme = colorSchemes[selectedScheme];
    if (intensity < 0.33) {
      return scheme.low;
    } else if (intensity < 0.66) {
      return scheme.medium;
    } else {
      return scheme.high;
    }
  };

  const getRGBColor = (intensity: number) => {
    const scheme = colorSchemes[selectedScheme];
    
    if (selectedScheme === 'gradient') {
      // Multi-color gradient
      if (intensity < 0.25) {
        return `rgb(${Math.floor(59 + (16 * intensity * 4))}, ${Math.floor(130 + (51 * intensity * 4))}, 246)`;
      } else if (intensity < 0.5) {
        const t = (intensity - 0.25) * 4;
        return `rgb(${Math.floor(75 - (59 * t))}, ${Math.floor(181 + (64 * t))}, ${Math.floor(246 - (127 * t))})`; 
      } else if (intensity < 0.75) {
        const t = (intensity - 0.5) * 4;
        return `rgb(${Math.floor(16 + (229 * t))}, ${Math.floor(185 - (31 * t))}, ${Math.floor(129 - (118 * t))})`;
      } else {
        const t = (intensity - 0.75) * 4;
        return `rgb(${Math.floor(245 - (25 * t))}, ${Math.floor(158 - (124 * t))}, ${Math.floor(11 + (27 * t))})`;
      }
    }
    
    // Single color schemes
    const baseColors = {
      blue: [59, 130, 246],
      red: [239, 68, 68],
      green: [34, 197, 94],
      purple: [168, 85, 247],
    };
    
    const [r, g, b] = baseColors[selectedScheme as keyof typeof baseColors];
    const alpha = 0.1 + (intensity * 0.9);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const cellSize = Math.min(
    (width - 120) / processedData.xValues.length,
    (height - 100) / processedData.yValues.length
  ) * zoomLevel;

  const stats = useMemo(() => {
    const values = data.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      count: values.length,
      average: avg,
      stdDev,
      min: processedData.minValue,
      max: processedData.maxValue,
      range: processedData.valueRange,
    };
  }, [data, processedData]);

  const resetView = () => {
    setZoomLevel(1);
    setSelectedCell(null);
  };

  const exportData = () => {
    const csv = [
      ['X', 'Y', 'Value', 'Label'].join(','),
      ...data.map(d => [d.x, d.y, d.value, d.label || ''].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heatmap-data.csv';
    a.click();
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {title}
              </CardTitle>
              <Badge variant="outline">
                {processedData.xValues.length} × {processedData.yValues.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedScheme} onValueChange={(value: any) => setSelectedScheme(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}>
                +
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.5))}>
                -
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Data Points</div>
              <div className="font-semibold text-sm">{stats.count}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Average</div>
              <div className="font-semibold text-sm">{stats.average.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Std Dev</div>
              <div className="font-semibold text-sm">{stats.stdDev.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Range</div>
              <div className="font-semibold text-sm">{stats.min.toFixed(1)} - {stats.max.toFixed(1)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Zoom</div>
              <div className="font-semibold text-sm">{(zoomLevel * 100).toFixed(0)}%</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Controls */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                id="labels"
                checked={showLabels}
                onCheckedChange={setShowLabels}
              />
              <Label htmlFor="labels" className="text-sm">Show Values</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Color:</span>
              <div 
                className="w-16 h-4 rounded border"
                style={{ background: colorSchemes[selectedScheme].gradient }}
              />
            </div>
            
            {selectedCell && (
              <div className="text-sm bg-background p-2 rounded border">
                <strong>Selected:</strong> ({selectedCell.x}, {selectedCell.y}) = {selectedCell.value.toFixed(2)}
                {selectedCell.label && <span className="text-muted-foreground ml-2">({selectedCell.label})</span>}
              </div>
            )}
          </div>

          {/* Heatmap */}
          <div className="overflow-auto border rounded-lg bg-background">
            <div 
              className="relative bg-grid-pattern"
              style={{ 
                width: processedData.xValues.length * cellSize + 100,
                height: processedData.yValues.length * cellSize + 80,
                minWidth: width,
                minHeight: height,
              }}
            >
              {/* Y-axis labels */}
              <div className="absolute left-0 top-12">
                {processedData.yValues.map((label, index) => (
                  <div
                    key={label}
                    className="text-xs text-muted-foreground font-medium flex items-center justify-end pr-2"
                    style={{
                      height: cellSize,
                      marginTop: index * cellSize,
                    }}
                  >
                    {String(label).length > 10 ? String(label).substring(0, 8) + '...' : label}
                  </div>
                ))}
              </div>
              
              {/* X-axis labels */}
              <div className="absolute top-0 left-20">
                {processedData.xValues.map((label, index) => (
                  <div
                    key={label}
                    className="text-xs text-muted-foreground font-medium absolute flex items-center justify-center"
                    style={{
                      width: cellSize,
                      left: index * cellSize,
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'center',
                      height: '40px',
                    }}
                  >
                    {String(label).length > 8 ? String(label).substring(0, 6) + '...' : label}
                  </div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              <div className="absolute left-20 top-12">
                {processedData.grid.map((row, yIndex) =>
                  row.map((cell, xIndex) => (
                    <Tooltip key={`${xIndex}-${yIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute border border-border/20 cursor-pointer transition-all duration-200 hover:border-border hover:scale-105 ${
                            selectedCell === cell ? 'ring-2 ring-primary' : ''
                          }`}
                          style={{
                            left: xIndex * cellSize,
                            top: yIndex * cellSize,
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: getRGBColor(cell.intensity),
                          }}
                          onClick={() => interactive && setSelectedCell(cell)}
                        >
                          {showLabels && cellSize > 30 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span 
                                className="text-xs font-medium"
                                style={{
                                  color: cell.intensity > 0.5 ? 'white' : '#374151',
                                }}
                              >
                                {cell.value.toFixed(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div><strong>Position:</strong> ({cell.x}, {cell.y})</div>
                          <div><strong>Value:</strong> {cell.value.toFixed(3)}</div>
                          <div><strong>Intensity:</strong> {(cell.intensity * 100).toFixed(1)}%</div>
                          {cell.label && <div><strong>Label:</strong> {cell.label}</div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))
                )}
              </div>
              
              {/* Color scale legend */}
              <div className="absolute bottom-2 right-4">
                <div className="bg-background/90 p-3 rounded border">
                  <div className="text-xs text-muted-foreground mb-2">Value Scale</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{processedData.minValue.toFixed(1)}</span>
                    <div 
                      className="w-16 h-3 rounded border"
                      style={{ background: colorSchemes[selectedScheme].gradient }}
                    />
                    <span className="text-xs">{processedData.maxValue.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive Features Info */}
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Interactive features: Click cells to select • Zoom in/out • Hover for details • Export data</p>
            <p>Color scheme: {selectedScheme} • Cell size: {Math.round(cellSize)}px • Total cells: {processedData.grid.length * (processedData.grid[0]?.length || 0)}</p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}