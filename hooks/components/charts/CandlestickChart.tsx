import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Volume2,
  BarChart3,
  ZoomIn,
  ZoomOut,
  RotateCcw 
} from 'lucide-react';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  predicted?: boolean;
}

interface CandlestickChartProps {
  data: CandleData[];
  title?: string;
  width?: number;
  height?: number;
  showVolume?: boolean;
  showMovingAverage?: boolean;
}

export function CandlestickChart({
  data,
  title = 'Price Movement Analysis',
  width = 800,
  height = 400,
  showVolume = true,
  showMovingAverage = true,
}: CandlestickChartProps) {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | 'all'>('30d');
  const [showMA, setShowMA] = useState(showMovingAverage);
  const [showVol, setShowVol] = useState(showVolume);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCandle, setSelectedCandle] = useState<CandleData | null>(null);
  const [maLength, setMaLength] = useState<5 | 10 | 20 | 50>(20);

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (timeframe === 'all') return data;
    
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return data.filter(d => new Date(d.date) >= cutoffDate);
  }, [data, timeframe]);

  // Calculate moving averages
  const dataWithMA = useMemo(() => {
    return filteredData.map((item, index) => {
      if (index < maLength - 1) {
        return { ...item, ma: null };
      }
      
      const sum = filteredData
        .slice(index - maLength + 1, index + 1)
        .reduce((acc, d) => acc + d.close, 0);
      
      return { ...item, ma: sum / maLength };
    });
  }, [filteredData, maLength]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const prices = filteredData.map(d => d.close);
    const volumes = filteredData.map(d => d.volume || 0);
    
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2] || currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    const high24h = Math.max(...filteredData.map(d => d.high));
    const low24h = Math.min(...filteredData.map(d => d.low));
    const volume24h = volumes.reduce((a, b) => a + b, 0);
    
    const bullishCandles = filteredData.filter(d => d.close > d.open).length;
    const bearishCandles = filteredData.filter(d => d.close < d.open).length;
    
    // Calculate volatility
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility
    
    return {
      currentPrice,
      change,
      changePercent,
      high24h,
      low24h,
      volume24h,
      bullishCandles,
      bearishCandles,
      volatility,
      trend: change >= 0 ? 'up' : 'down',
    };
  }, [filteredData]);

  // Chart dimensions
  const chartWidth = width - 80;
  const chartHeight = showVol ? height * 0.7 : height - 60;
  const volumeHeight = showVol ? height * 0.25 : 0;
  const padding = 20;

  // Data scaling
  const allPrices = filteredData.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices) * 0.99;
  const maxPrice = Math.max(...allPrices) * 1.01;
  const priceRange = maxPrice - minPrice;
  
  const maxVolume = Math.max(...filteredData.map(d => d.volume || 0));

  const getPriceY = (price: number) => {
    return chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - padding * 2);
  };

  const getVolumeY = (volume: number) => {
    const volumeRatio = volume / (maxVolume || 1);
    return volumeHeight - (volumeRatio * (volumeHeight - 10));
  };

  const candleWidth = Math.max(2, (chartWidth - padding * 2) / filteredData.length * 0.8);
  const candleSpacing = (chartWidth - padding * 2) / filteredData.length;

  const resetZoom = () => {
    setZoomLevel(1);
    setSelectedCandle(null);
  };

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available for the selected timeframe
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
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
                {stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Volume2 className="w-3 h-3" />
                Vol: {(stats.volume24h / 1000).toFixed(1)}K
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1D</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={maLength.toString()} onValueChange={(value) => setMaLength(Number(value) as any)}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">MA5</SelectItem>
                  <SelectItem value="10">MA10</SelectItem>
                  <SelectItem value="20">MA20</SelectItem>
                  <SelectItem value="50">MA50</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 5))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 0.5))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Price Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Current Price</div>
              <div className="font-semibold text-lg">${stats.currentPrice.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">24h High</div>
              <div className="font-semibold text-green-600">${stats.high24h.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">24h Low</div>
              <div className="font-semibold text-red-600">${stats.low24h.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Volatility</div>
              <div className="font-semibold text-orange-600">{stats.volatility.toFixed(1)}%</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Bullish/Bearish</div>
              <div className="font-semibold text-sm">{stats.bullishCandles}/{stats.bearishCandles}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Candles</div>
              <div className="font-semibold text-sm">{filteredData.length}</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Controls */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                id="ma"
                checked={showMA}
                onCheckedChange={setShowMA}
              />
              <Label htmlFor="ma" className="text-sm">Moving Average</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="volume"
                checked={showVol}
                onCheckedChange={setShowVol}
              />
              <Label htmlFor="volume" className="text-sm">Volume Bars</Label>
            </div>
            
            {selectedCandle && (
              <div className="text-sm bg-background p-2 rounded border">
                <strong>{selectedCandle.date}:</strong> O:{selectedCandle.open.toFixed(2)} H:{selectedCandle.high.toFixed(2)} L:{selectedCandle.low.toFixed(2)} C:{selectedCandle.close.toFixed(2)}
                {selectedCandle.predicted && <Badge className="ml-2" variant="outline">Predicted</Badge>}
              </div>
            )}
          </div>

          {/* Chart Container */}
          <div className="w-full overflow-auto border rounded-lg bg-background">
            <svg 
              width={Math.max(width, filteredData.length * 10)} 
              height={height + 40}
              className="bg-gradient-to-br from-slate-50 to-blue-50"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="candleGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#candleGrid)" />
              
              {/* Price chart area */}
              <g transform={`translate(40, 20)`}>
                {/* Moving Average Line */}
                {showMA && (
                  <path
                    d={dataWithMA
                      .map((d, i) => {
                        if (!d.ma) return '';
                        const x = padding + i * candleSpacing + candleSpacing / 2;
                        const y = getPriceY(d.ma);
                        return `${i === 0 || !dataWithMA[i-1].ma ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                )}
                
                {/* Candlesticks */}
                {filteredData.map((candle, index) => {
                  const x = padding + index * candleSpacing;
                  const centerX = x + candleSpacing / 2;
                  
                  const openY = getPriceY(candle.open);
                  const highY = getPriceY(candle.high);
                  const lowY = getPriceY(candle.low);
                  const closeY = getPriceY(candle.close);
                  
                  const isBullish = candle.close > candle.open;
                  const bodyTop = isBullish ? closeY : openY;
                  const bodyBottom = isBullish ? openY : closeY;
                  const bodyHeight = Math.max(1, Math.abs(bodyBottom - bodyTop));
                  
                  const strokeColor = candle.predicted ? '#9333ea' : (isBullish ? '#22c55e' : '#ef4444');
                  const fillColor = isBullish ? '#22c55e' : '#ef4444';
                  const opacity = candle.predicted ? 0.7 : 1;

                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <g 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedCandle(candle)}
                        >
                          {/* High-Low line (wick) */}
                          <line
                            x1={centerX}
                            y1={highY}
                            x2={centerX}
                            y2={lowY}
                            stroke={strokeColor}
                            strokeWidth="1"
                            opacity={opacity}
                          />
                          
                          {/* Body */}
                          <rect
                            x={centerX - candleWidth / 2}
                            y={bodyTop}
                            width={candleWidth}
                            height={bodyHeight}
                            fill={isBullish ? 'white' : fillColor}
                            stroke={strokeColor}
                            strokeWidth="1"
                            opacity={opacity}
                          />
                          
                          {/* Predicted indicator */}
                          {candle.predicted && (
                            <circle
                              cx={centerX}
                              cy={bodyTop - 8}
                              r="2"
                              fill="#9333ea"
                            />
                          )}
                        </g>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div><strong>Date:</strong> {candle.date}</div>
                          <div><strong>Open:</strong> ${candle.open.toFixed(2)}</div>
                          <div><strong>High:</strong> ${candle.high.toFixed(2)}</div>
                          <div><strong>Low:</strong> ${candle.low.toFixed(2)}</div>
                          <div><strong>Close:</strong> ${candle.close.toFixed(2)}</div>
                          {candle.volume && <div><strong>Volume:</strong> {candle.volume.toLocaleString()}</div>}
                          {candle.predicted && <div><Badge className="mt-1" variant="outline">Predicted Data</Badge></div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Price levels */}
                <text x="10" y={getPriceY(maxPrice) + 5} fontSize="10" fill="#6b7280">
                  ${maxPrice.toFixed(2)}
                </text>
                <text x="10" y={getPriceY(minPrice) + 5} fontSize="10" fill="#6b7280">
                  ${minPrice.toFixed(2)}
                </text>
                <text x="10" y={getPriceY((maxPrice + minPrice) / 2) + 5} fontSize="10" fill="#6b7280">
                  ${((maxPrice + minPrice) / 2).toFixed(2)}
                </text>
              </g>
              
              {/* Volume bars */}
              {showVol && (
                <g transform={`translate(40, ${chartHeight + 40})`}>
                  {filteredData.map((candle, index) => {
                    if (!candle.volume) return null;
                    
                    const x = padding + index * candleSpacing;
                    const centerX = x + candleSpacing / 2;
                    const barHeight = getVolumeY(0) - getVolumeY(candle.volume);
                    const isBullish = candle.close > candle.open;
                    
                    return (
                      <rect
                        key={index}
                        x={centerX - candleWidth / 2}
                        y={getVolumeY(candle.volume)}
                        width={candleWidth}
                        height={barHeight}
                        fill={isBullish ? '#22c55e' : '#ef4444'}
                        opacity="0.6"
                      />
                    );
                  })}
                  
                  <text x="10" y="15" fontSize="10" fill="#6b7280">
                    Volume
                  </text>
                </g>
              )}
              
              {/* Legend */}
              <g transform={`translate(60, ${height + 10})`}>
                <rect x="0" y="0" width="12" height="8" fill="white" stroke="#22c55e" strokeWidth="1" />
                <text x="18" y="8" fontSize="10" fill="#374151">Bullish</text>
                
                <rect x="70" y="0" width="12" height="8" fill="#ef4444" stroke="#ef4444" strokeWidth="1" />
                <text x="88" y="8" fontSize="10" fill="#374151">Bearish</text>
                
                {showMA && (
                  <>
                    <line x1="140" y1="4" x2="152" y2="4" stroke="#f59e0b" strokeWidth="2" />
                    <text x="158" y="8" fontSize="10" fill="#374151">MA{maLength}</text>
                  </>
                )}
                
                <circle cx="220" cy="4" r="2" fill="#9333ea" />
                <text x="228" y="8" fontSize="10" fill="#374151">Predicted</text>
              </g>
            </svg>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Interactive features: Click candles for details • Zoom controls • Timeframe selection • Moving averages</p>
            <p>Zoom: {(zoomLevel * 100).toFixed(0)}% • Timeframe: {timeframe} • MA Period: {maLength} days</p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}