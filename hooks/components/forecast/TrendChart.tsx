import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export interface DataPoint {
  date: string;
  actual?: number;
  predicted: number;
  confidence_upper?: number;
  confidence_lower?: number;
  label?: string;
}

interface TrendChartProps {
  data: DataPoint[];
  title: string;
  description?: string;
  metric: string;
  accuracy?: number;
  showConfidenceInterval?: boolean;
  forecastStartIndex?: number;
  height?: number;
  onExport?: () => void;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  description,
  metric,
  accuracy,
  showConfidenceInterval = true,
  forecastStartIndex,
  height = 400,
  onExport
}) => {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'actual' ? 'Actual' : 
                entry.dataKey === 'predicted' ? 'Predicted' :
                entry.dataKey === 'confidence_upper' ? 'Upper Bound' :
                'Lower Bound'}: ${formatValue(entry.value)} ${metric}`}
            </p>
          ))}
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
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {accuracy && (
              <Badge variant="outline" className="text-xs">
                {(accuracy * 100).toFixed(1)}% Accuracy
              </Badge>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {showConfidenceInterval ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Confidence Interval */}
              <Area
                type="monotone"
                dataKey="confidence_upper"
                stroke="none"
                fill="url(#confidenceGradient)"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="confidence_lower"
                stroke="none"
                fill="hsl(var(--background))"
                fillOpacity={1}
              />
              
              {/* Actual Data Line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                connectNulls={false}
              />
              
              {/* Predicted Data Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              />
              
              {/* Forecast Start Line */}
              {forecastStartIndex && (
                <ReferenceLine 
                  x={data[forecastStartIndex]?.date} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="2 2"
                  label={{ value: "Forecast Start", position: "top" }}
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Actual Data Line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                connectNulls={false}
              />
              
              {/* Predicted Data Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              />
              
              {/* Forecast Start Line */}
              {forecastStartIndex && (
                <ReferenceLine 
                  x={data[forecastStartIndex]?.date} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="2 2"
                  label={{ value: "Forecast Start", position: "top" }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-chart-1"></div>
            <span className="text-muted-foreground">Actual Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-chart-2 border-dashed border-t-2 border-chart-2"></div>
            <span className="text-muted-foreground">Forecast</span>
          </div>
          {showConfidenceInterval && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-chart-2 opacity-30 rounded-sm"></div>
              <span className="text-muted-foreground">Confidence Interval</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;