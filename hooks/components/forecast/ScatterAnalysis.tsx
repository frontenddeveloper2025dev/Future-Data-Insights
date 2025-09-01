import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, Target, Layers, Filter } from 'lucide-react';

interface ScatterDataPoint {
  x: number;
  y: number;
  size?: number;
  category?: string;
  label?: string;
  actual?: number;
  predicted?: number;
  error?: number;
}

interface ScatterAnalysisProps {
  data: ScatterDataPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
  title?: string;
  description?: string;
  showTrendLine?: boolean;
  showErrorBars?: boolean;
  colorByCategory?: boolean;
  sizeByValue?: boolean;
  categories?: string[];
}

const CATEGORY_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const ScatterAnalysis: React.FC<ScatterAnalysisProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
  title = "Scatter Plot Analysis",
  description,
  showTrendLine = false,
  showErrorBars = false,
  colorByCategory = false,
  sizeByValue = false,
  categories = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTrend, setShowTrend] = useState(showTrendLine);
  const [showErrors, setShowErrors] = useState(showErrorBars);
  const [colorMode, setColorMode] = useState(colorByCategory);
  const [sizeMode, setSizeMode] = useState(sizeByValue);

  // Filter data by selected category
  const filteredData = selectedCategory === 'all' 
    ? data 
    : data.filter(point => point.category === selectedCategory);

  // Calculate trend line (simple linear regression)
  const calculateTrendLine = (points: ScatterDataPoint[]) => {
    const n = points.length;
    if (n < 2) return null;

    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));

    return {
      slope,
      intercept,
      startPoint: { x: minX, y: slope * minX + intercept },
      endPoint: { x: maxX, y: slope * maxX + intercept }
    };
  };

  const trendLine = showTrend ? calculateTrendLine(filteredData) : null;

  // Calculate correlation coefficient
  const calculateCorrelation = (points: ScatterDataPoint[]) => {
    const n = points.length;
    if (n < 2) return 0;

    const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
    const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;

    const numerator = points.reduce((sum, point) => 
      sum + (point.x - meanX) * (point.y - meanY), 0);
    
    const denomX = Math.sqrt(points.reduce((sum, point) => 
      sum + Math.pow(point.x - meanX, 2), 0));
    
    const denomY = Math.sqrt(points.reduce((sum, point) => 
      sum + Math.pow(point.y - meanY, 2), 0));

    return denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);
  };

  const correlation = calculateCorrelation(filteredData);

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const getPointColor = (point: ScatterDataPoint, index: number) => {
    if (colorMode && point.category) {
      const categoryIndex = categories.indexOf(point.category);
      return CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
    }
    return 'hsl(var(--chart-1))';
  };

  const getPointSize = (point: ScatterDataPoint) => {
    if (sizeMode && point.size !== undefined) {
      return Math.max(20, Math.min(200, point.size * 2));
    }
    return 50;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="space-y-1">
            {data.label && (
              <p className="font-medium text-foreground">{data.label}</p>
            )}
            <p className="text-sm">
              <span className="text-muted-foreground">{xAxisLabel}:</span> {formatValue(data.x)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">{yAxisLabel}:</span> {formatValue(data.y)}
            </p>
            {data.category && (
              <p className="text-sm">
                <span className="text-muted-foreground">Category:</span> {data.category}
              </p>
            )}
            {data.actual !== undefined && (
              <p className="text-sm">
                <span className="text-muted-foreground">Actual:</span> {formatValue(data.actual)}
              </p>
            )}
            {data.predicted !== undefined && (
              <p className="text-sm">
                <span className="text-muted-foreground">Predicted:</span> {formatValue(data.predicted)}
              </p>
            )}
            {data.error !== undefined && (
              <p className="text-sm">
                <span className="text-muted-foreground">Error:</span> {formatValue(data.error)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-chart-1" />
              {title}
            </CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {filteredData.length} Points
            </Badge>
            <Badge variant="outline" className="text-xs">
              R² = {(correlation ** 2).toFixed(3)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-4">
            {categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="trend-line"
                checked={showTrend}
                onCheckedChange={setShowTrend}
              />
              <Label htmlFor="trend-line" className="text-sm">Trend Line</Label>
            </div>

            {colorByCategory && categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="color-mode"
                  checked={colorMode}
                  onCheckedChange={setColorMode}
                />
                <Label htmlFor="color-mode" className="text-sm">Color by Category</Label>
              </div>
            )}

            {sizeByValue && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="size-mode"
                  checked={sizeMode}
                  onCheckedChange={setSizeMode}
                />
                <Label htmlFor="size-mode" className="text-sm">Size by Value</Label>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            data={filteredData}
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis
              type="number"
              dataKey="x"
              name={xAxisLabel}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
              label={{ 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -10,
                style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '500' }
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yAxisLabel}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '500' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Scatter dataKey="y" fill="hsl(var(--chart-1))">
              {filteredData.map((point, index) => (
                <Cell
                  key={index}
                  fill={getPointColor(point, index)}
                />
              ))}
            </Scatter>

            {/* Trend Line */}
            {showTrend && trendLine && (
              <>
                <ReferenceLine
                  segment={[
                    { x: trendLine.startPoint.x, y: trendLine.startPoint.y },
                    { x: trendLine.endPoint.x, y: trendLine.endPoint.y }
                  ]}
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </>
            )}

            {/* Perfect correlation line (y = x) for prediction vs actual plots */}
            {xAxisLabel.toLowerCase().includes('actual') && yAxisLabel.toLowerCase().includes('predicted') && (
              <ReferenceLine
                segment={[
                  { x: Math.min(...filteredData.map(p => p.x)), y: Math.min(...filteredData.map(p => p.x)) },
                  { x: Math.max(...filteredData.map(p => p.x)), y: Math.max(...filteredData.map(p => p.x)) }
                ]}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Correlation</p>
                <p className="text-lg font-bold font-mono">
                  {correlation.toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.abs(correlation) > 0.8 ? 'Very Strong' :
                   Math.abs(correlation) > 0.6 ? 'Strong' :
                   Math.abs(correlation) > 0.4 ? 'Moderate' :
                   Math.abs(correlation) > 0.2 ? 'Weak' : 'Very Weak'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">R-Squared</p>
                <p className="text-lg font-bold font-mono">
                  {(correlation ** 2).toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Variance Explained
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-lg font-bold">
                  {filteredData.length.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                </p>
              </div>
            </CardContent>
          </Card>

          {trendLine && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Slope</p>
                  <p className="text-lg font-bold font-mono">
                    {trendLine.slope.toFixed(3)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trend Direction
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Legend */}
        {colorMode && categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScatterAnalysis;