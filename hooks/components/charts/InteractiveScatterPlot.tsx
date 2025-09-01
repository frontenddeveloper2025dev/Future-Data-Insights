import React, { useState, useMemo, useRef } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Filter,
  Layers,
  Target,
  Maximize2,
  GitBranch,
  Palette,
} from 'lucide-react';

interface ScatterDataPoint {
  x: number;
  y: number;
  z?: number;
  category?: string;
  label?: string;
  accuracy?: number;
  model?: string;
  [key: string]: any;
}

interface InteractiveScatterPlotProps {
  data: ScatterDataPoint[];
  title?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  enableClustering?: boolean;
  showRegression?: boolean;
  colorByCategory?: boolean;
}

export const InteractiveScatterPlot: React.FC<InteractiveScatterPlotProps> = ({
  data,
  title = "Interactive Scatter Plot",
  height = 400,
  xLabel = "X Value",
  yLabel = "Y Value",
  enableClustering = true,
  showRegression = true,
  colorByCategory = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showClusters, setShowClusters] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<ScatterDataPoint[]>([]);
  const [brushArea, setBrushArea] = useState<any>(null);
  const [showRegressionLine, setShowRegressionLine] = useState(showRegression);
  const chartRef = useRef<any>(null);

  // Process data for categories and clustering
  const processedData = useMemo(() => {
    const categories = [...new Set(data.map(d => d.category).filter(Boolean))];
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))', 
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];

    let filteredData = selectedCategory === 'all' 
      ? data 
      : data.filter(d => d.category === selectedCategory);

    // Simple k-means clustering simulation
    if (showClusters && enableClustering) {
      const clusters = performKMeansClustering(filteredData, 3);
      filteredData = filteredData.map((point, index) => ({
        ...point,
        cluster: clusters[index],
        fill: colors[clusters[index] % colors.length],
      }));
    } else if (colorByCategory) {
      filteredData = filteredData.map(point => ({
        ...point,
        fill: point.category 
          ? colors[categories.indexOf(point.category) % colors.length]
          : 'hsl(var(--primary))',
      }));
    }

    return { filteredData, categories, colors };
  }, [data, selectedCategory, showClusters, enableClustering, colorByCategory]);

  // Simple k-means clustering implementation
  const performKMeansClustering = (points: ScatterDataPoint[], k: number): number[] => {
    if (points.length === 0) return [];
    
    // Initialize centroids randomly
    const centroids = Array.from({ length: k }, () => ({
      x: Math.random() * (Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x))) + Math.min(...points.map(p => p.x)),
      y: Math.random() * (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y))) + Math.min(...points.map(p => p.y)),
    }));

    let assignments = new Array(points.length).fill(0);
    
    // Run a few iterations
    for (let iter = 0; iter < 10; iter++) {
      // Assign points to nearest centroid
      points.forEach((point, i) => {
        let minDistance = Infinity;
        let nearestCentroid = 0;
        
        centroids.forEach((centroid, j) => {
          const distance = Math.sqrt(
            Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestCentroid = j;
          }
        });
        
        assignments[i] = nearestCentroid;
      });

      // Update centroids
      centroids.forEach((centroid, j) => {
        const clusterPoints = points.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length > 0) {
          centroid.x = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
          centroid.y = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
        }
      });
    }

    return assignments;
  };

  // Calculate regression line
  const regressionData = useMemo(() => {
    if (!showRegressionLine || processedData.filteredData.length < 2) return [];
    
    const points = processedData.filteredData;
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept },
    ];
  }, [processedData.filteredData, showRegressionLine]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs"
        >
          <div className="space-y-1 text-sm">
            {data.label && <div className="font-medium">{data.label}</div>}
            <div>X: {data.x?.toFixed(2)}</div>
            <div>Y: {data.y?.toFixed(2)}</div>
            {data.z && <div>Z: {data.z.toFixed(2)}</div>}
            {data.category && (
              <Badge variant="secondary" className="text-xs">{data.category}</Badge>
            )}
            {data.accuracy && (
              <div className="text-xs text-muted-foreground">
                Accuracy: {(data.accuracy * 100).toFixed(1)}%
              </div>
            )}
            {data.model && (
              <div className="text-xs text-muted-foreground">
                Model: {data.model}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const handlePointClick = (data: any) => {
    setSelectedPoints(prev => {
      const exists = prev.find(p => p.x === data.x && p.y === data.y);
      if (exists) {
        return prev.filter(p => !(p.x === data.x && p.y === data.y));
      } else {
        return [...prev, data];
      }
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline">{processedData.filteredData.length} points</Badge>
            {selectedPoints.length > 0 && (
              <Badge variant="secondary">{selectedPoints.length} selected</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {enableClustering && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="clusters"
                checked={showClusters}
                onCheckedChange={(checked) => setShowClusters(!!checked)}
              />
              <label htmlFor="clusters" className="text-sm flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                Clusters
              </label>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="regression"
              checked={showRegressionLine}
              onCheckedChange={(checked) => setShowRegressionLine(!!checked)}
            />
            <label htmlFor="regression" className="text-sm flex items-center gap-1">
              <Target className="w-3 h-3" />
              Regression
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {processedData.categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPoints.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPoints([])}
          >
            Clear Selection ({selectedPoints.length})
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            ref={chartRef}
            data={processedData.filteredData}
            onClick={handlePointClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {showRegressionLine && regressionData.length > 0 && (
              <Scatter
                data={regressionData}
                line={{ stroke: 'hsl(var(--destructive))', strokeWidth: 2 }}
                shape={() => null}
              />
            )}
            
            <Scatter
              data={processedData.filteredData}
              animationDuration={800}
            >
              {processedData.filteredData.map((entry, index) => {
                const isSelected = selectedPoints.some(p => p.x === entry.x && p.y === entry.y);
                const size = entry.z ? Math.max(4, Math.min(12, entry.z * 2)) : 6;
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || 'hsl(var(--primary))'}
                    stroke={isSelected ? 'hsl(var(--ring))' : 'transparent'}
                    strokeWidth={isSelected ? 3 : 0}
                    r={isSelected ? size + 2 : size}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      <AnimatePresence>
        {selectedPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-muted rounded-lg"
          >
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Selected Points Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Count</div>
                <div className="font-medium">{selectedPoints.length}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg X</div>
                <div className="font-medium">
                  {(selectedPoints.reduce((sum, p) => sum + p.x, 0) / selectedPoints.length).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Y</div>
                <div className="font-medium">
                  {(selectedPoints.reduce((sum, p) => sum + p.y, 0) / selectedPoints.length).toFixed(2)}
                </div>
              </div>
              {selectedPoints.some(p => p.accuracy) && (
                <div>
                  <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                  <div className="font-medium">
                    {(selectedPoints.filter(p => p.accuracy).reduce((sum, p) => sum + (p.accuracy || 0), 0) / selectedPoints.filter(p => p.accuracy).length * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};