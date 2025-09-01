import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CorrelationData {
  variables: string[];
  correlationMatrix: number[][];
}

interface CorrelationHeatmapProps {
  data: CorrelationData;
  title?: string;
  description?: string;
  showLabels?: boolean;
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  data,
  title = "Feature Correlation Analysis",
  description = "Correlation coefficients between different variables",
  showLabels = true
}) => {
  const { variables, correlationMatrix } = data;

  // Generate color intensity based on correlation value
  const getColor = (value: number) => {
    const intensity = Math.abs(value);
    const hue = value >= 0 ? '142' : '0'; // Green for positive, Red for negative
    const saturation = '70%';
    const lightness = `${65 - (intensity * 30)}%`; // Darker for stronger correlation
    
    return `hsl(${hue}, ${saturation}, ${lightness})`;
  };

  const getTextColor = (value: number) => {
    const intensity = Math.abs(value);
    return intensity > 0.5 ? 'white' : 'hsl(var(--foreground))';
  };

  const formatCorrelation = (value: number) => {
    return value.toFixed(3);
  };

  const getCorrelationStrength = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const cellSize = Math.max(40, Math.min(80, 400 / variables.length));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {variables.length} Variables
            </Badge>
          </div>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: getColor(-1) }}
              ></div>
              <span>Strong Negative (-1)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border" 
                style={{ backgroundColor: getColor(0) }}
              ></div>
              <span>No Correlation (0)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: getColor(1) }}
              ></div>
              <span>Strong Positive (+1)</span>
            </div>
          </div>

          {/* Heatmap */}
          <div className="overflow-auto">
            <TooltipProvider>
              <div className="inline-block">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1"></th>
                      {variables.map((variable, index) => (
                        <th 
                          key={index}
                          className="p-1 text-xs font-medium text-muted-foreground text-center"
                          style={{ 
                            width: `${cellSize}px`,
                            minWidth: `${cellSize}px`,
                            maxWidth: `${cellSize}px`
                          }}
                        >
                          <div 
                            className="truncate"
                            title={variable}
                            style={{ 
                              writingMode: 'vertical-rl',
                              textOrientation: 'mixed',
                              height: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {variable}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variables.map((rowVariable, rowIndex) => (
                      <tr key={rowIndex}>
                        <td 
                          className="p-1 text-xs font-medium text-muted-foreground text-right pr-2"
                          style={{ 
                            width: '100px',
                            minWidth: '100px'
                          }}
                        >
                          <div className="truncate" title={rowVariable}>
                            {rowVariable}
                          </div>
                        </td>
                        {variables.map((colVariable, colIndex) => {
                          const correlation = correlationMatrix[rowIndex][colIndex];
                          
                          return (
                            <Tooltip key={colIndex}>
                              <TooltipTrigger asChild>
                                <td
                                  className="border border-border cursor-pointer transition-all hover:opacity-80"
                                  style={{
                                    backgroundColor: getColor(correlation),
                                    width: `${cellSize}px`,
                                    height: `${cellSize}px`,
                                    minWidth: `${cellSize}px`,
                                    minHeight: `${cellSize}px`
                                  }}
                                >
                                  <div 
                                    className="flex items-center justify-center h-full w-full text-xs font-medium"
                                    style={{ color: getTextColor(correlation) }}
                                  >
                                    {showLabels && formatCorrelation(correlation)}
                                  </div>
                                </td>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {rowVariable} ↔ {colVariable}
                                  </p>
                                  <p>
                                    Correlation: <span className="font-mono">{formatCorrelation(correlation)}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Strength: {getCorrelationStrength(correlation)}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TooltipProvider>
          </div>

          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Strongest Positive</p>
                  {(() => {
                    let maxCorr = -1;
                    let maxPair = ['', ''];
                    
                    for (let i = 0; i < variables.length; i++) {
                      for (let j = i + 1; j < variables.length; j++) {
                        const corr = correlationMatrix[i][j];
                        if (corr > maxCorr && corr < 1) { // Exclude self-correlation
                          maxCorr = corr;
                          maxPair = [variables[i], variables[j]];
                        }
                      }
                    }
                    
                    return (
                      <>
                        <p className="font-mono text-lg font-bold text-green-600">
                          {formatCorrelation(maxCorr)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {maxPair[0]} ↔ {maxPair[1]}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Strongest Negative</p>
                  {(() => {
                    let minCorr = 1;
                    let minPair = ['', ''];
                    
                    for (let i = 0; i < variables.length; i++) {
                      for (let j = i + 1; j < variables.length; j++) {
                        const corr = correlationMatrix[i][j];
                        if (corr < minCorr) {
                          minCorr = corr;
                          minPair = [variables[i], variables[j]];
                        }
                      }
                    }
                    
                    return (
                      <>
                        <p className="font-mono text-lg font-bold text-red-600">
                          {formatCorrelation(minCorr)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {minPair[0]} ↔ {minPair[1]}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Average Correlation</p>
                  {(() => {
                    let sum = 0;
                    let count = 0;
                    
                    for (let i = 0; i < variables.length; i++) {
                      for (let j = i + 1; j < variables.length; j++) {
                        sum += Math.abs(correlationMatrix[i][j]);
                        count++;
                      }
                    }
                    
                    const avg = count > 0 ? sum / count : 0;
                    
                    return (
                      <p className="font-mono text-lg font-bold">
                        {formatCorrelation(avg)}
                      </p>
                    );
                  })()}
                  <p className="text-xs text-muted-foreground">
                    Mean absolute correlation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationHeatmap;