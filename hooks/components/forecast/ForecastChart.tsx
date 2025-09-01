import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, LineChart, Eye, EyeOff } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface ForecastChartProps {
  historical: DataPoint[];
  predictions?: DataPoint[];
  title?: string;
}

export function ForecastChart({ historical, predictions = [], title = 'Forecast Chart' }: ForecastChartProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  
  // Calculate dimensions and scaling
  const allData = [...historical, ...predictions];
  const minValue = Math.min(...allData.map(d => d.value));
  const maxValue = Math.max(...allData.map(d => d.value));
  const valueRange = maxValue - minValue || 1; // Prevent division by zero
  const chartHeight = 250;
  const chartWidth = 600;
  const padding = 40;
  
  // Calculate statistics
  const lastHistorical = historical[historical.length - 1];
  const firstPrediction = predictions[0];
  const trend = firstPrediction && lastHistorical 
    ? firstPrediction.value > lastHistorical.value ? 'up' : 'down'
    : null;
    
  // Calculate percentage change
  const percentChange = firstPrediction && lastHistorical
    ? ((firstPrediction.value - lastHistorical.value) / lastHistorical.value * 100)
    : 0;
    
  // Calculate confidence interval (mock)
  const confidence = 85 + Math.random() * 10;

  // Generate SVG paths with proper scaling
  const getX = (index: number, total: number, section: 'historical' | 'prediction') => {
    if (section === 'historical') {
      return padding + (index / Math.max(total - 1, 1)) * (chartWidth * 0.6 - padding * 2);
    } else {
      return (chartWidth * 0.6) + ((index / Math.max(total - 1, 1)) * (chartWidth * 0.4 - padding));
    }
  };
  
  const getY = (value: number) => {
    return chartHeight - padding - ((value - minValue) / valueRange) * (chartHeight - padding * 2);
  };
  
  // Generate SVG path for historical data
  const historicalPath = historical.length > 1 ? historical.map((point, index) => {
    const x = getX(index, historical.length, 'historical');
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : '';

  // Generate SVG path for predictions
  const predictionPath = predictions.length > 1 ? predictions.map((point, index) => {
    const x = getX(index, predictions.length, 'prediction');
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : '';
  
  // Generate area paths for filled charts
  const historicalAreaPath = chartType === 'area' && historical.length > 1 ? 
    historicalPath + ` L ${getX(historical.length - 1, historical.length, 'historical')} ${chartHeight - padding} L ${getX(0, historical.length, 'historical')} ${chartHeight - padding} Z`
    : '';
    
  const predictionAreaPath = chartType === 'area' && predictions.length > 1 ? 
    predictionPath + ` L ${getX(predictions.length - 1, predictions.length, 'prediction')} ${chartHeight - padding} L ${getX(0, predictions.length, 'prediction')} ${chartHeight - padding} Z`
    : '';

  // Connect historical to predictions
  const connectionPath = historical.length > 0 && predictions.length > 0 ? 
    `M ${getX(historical.length - 1, historical.length, 'historical')} ${getY(historical[historical.length - 1].value)} 
     L ${getX(0, predictions.length, 'prediction')} ${getY(predictions[0].value)}` : '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            {trend && (
              <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="gap-1">
                {trend === 'up' ? 
                  <TrendingUp className="w-3 h-3" /> : 
                  <TrendingDown className="w-3 h-3" />
                }
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              {chartType === 'line' ? <BarChart3 className="w-4 h-4" /> : <LineChart className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {showDetails && (
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-muted-foreground">Confidence</div>
              <div className="font-semibold text-green-600">{confidence.toFixed(1)}%</div>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-muted-foreground">Range</div>
              <div className="font-semibold">{minValue.toFixed(0)} - {maxValue.toFixed(0)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <div className="text-muted-foreground">Volatility</div>
              <div className="font-semibold">{(valueRange / ((maxValue + minValue) / 2) * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg width={chartWidth} height={chartHeight + 60} className="border rounded bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Grid lines and gradients */}
            <defs>
              <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id="historicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.3}} />
                <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.05}} />
              </linearGradient>
              <linearGradient id="predictionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#ef4444', stopOpacity: 0.3}} />
                <stop offset="100%" style={{stopColor: '#ef4444', stopOpacity: 0.05}} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Area fills */}
            {chartType === 'area' && historicalAreaPath && (
              <path
                d={historicalAreaPath}
                fill="url(#historicalGradient)"
                stroke="none"
              />
            )}
            {chartType === 'area' && predictionAreaPath && (
              <path
                d={predictionAreaPath}
                fill="url(#predictionGradient)"
                stroke="none"
              />
            )}
            
            {/* Historical data line */}
            {historical.length > 1 && (
              <path
                d={historicalPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
            )}
            
            {/* Connection line */}
            {connectionPath && (
              <path
                d={connectionPath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            )}
            
            {/* Prediction line */}
            {predictions.length > 1 && (
              <path
                d={predictionPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="8,4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
            )}
            
            {/* Historical data points */}
            {historical.map((point, index) => {
              const x = getX(index, historical.length, 'historical');
              const y = getY(point.value);
              return (
                <g key={`hist-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="white"
                    stroke="#2563eb"
                    strokeWidth="3"
                    className="drop-shadow-sm"
                  />
                  {showDetails && (
                    <text
                      x={x}
                      y={y - 12}
                      fontSize="10"
                      fill="#374151"
                      textAnchor="middle"
                      className="font-medium"
                    >
                      {point.value.toFixed(0)}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Prediction points */}
            {predictions.map((point, index) => {
              const x = getX(index, predictions.length, 'prediction');
              const y = getY(point.value);
              return (
                <g key={`pred-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="white"
                    stroke="#ef4444"
                    strokeWidth="3"
                    className="drop-shadow-sm"
                  />
                  {showDetails && (
                    <text
                      x={x}
                      y={y - 12}
                      fontSize="10"
                      fill="#374151"
                      textAnchor="middle"
                      className="font-medium"
                    >
                      {point.value.toFixed(0)}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Y-axis labels */}
            <text x="15" y="25" fontSize="11" fill="#6b7280" fontWeight="500">{maxValue.toFixed(0)}</text>
            <text x="15" y={chartHeight - 15} fontSize="11" fill="#6b7280" fontWeight="500">{minValue.toFixed(0)}</text>
            <text x="15" y={chartHeight / 2} fontSize="11" fill="#6b7280" fontWeight="500">{((maxValue + minValue) / 2).toFixed(0)}</text>
            
            {/* Vertical separator */}
            <line
              x1={chartWidth * 0.6}
              y1={padding}
              x2={chartWidth * 0.6}
              y2={chartHeight - padding}
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="3,3"
              opacity="0.5"
            />
            
            {/* Section labels */}
            <text x={chartWidth * 0.3} y={chartHeight + 25} fontSize="12" fill="#6b7280" textAnchor="middle" fontWeight="500">Historical Data</text>
            <text x={chartWidth * 0.8} y={chartHeight + 25} fontSize="12" fill="#6b7280" textAnchor="middle" fontWeight="500">Predictions</text>
            
            {/* Legend */}
            <g transform={`translate(20, ${chartHeight + 35})`}>
              <circle cx="8" cy="8" r="5" fill="white" stroke="#2563eb" strokeWidth="3" />
              <text x="20" y="12" fontSize="12" fill="#374151" fontWeight="500">Historical</text>
              
              <circle cx="110" cy="8" r="5" fill="white" stroke="#ef4444" strokeWidth="3" />
              <text x="122" y="12" fontSize="12" fill="#374151" fontWeight="500">Forecast</text>
              
              <circle cx="200" cy="8" r="3" fill="#94a3b8" />
              <text x="210" y="12" fontSize="12" fill="#374151" fontWeight="500">Connection</text>
            </g>
          </svg>
        </div>
        
        {!showDetails && (
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data Points:</span>
              <span className="ml-2 font-medium">{historical.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Predictions:</span>
              <span className="ml-2 font-medium">{predictions.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Trend:</span>
              <span className={`ml-2 font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? 'Increasing' : 'Decreasing'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Chart Type:</span>
              <span className="ml-2 font-medium capitalize">{chartType}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}