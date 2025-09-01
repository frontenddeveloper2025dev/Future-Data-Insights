import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Activity,
  ChevronRight,
  Brain
} from 'lucide-react';
import { PostGenerationAnalysis } from './PostGenerationAnalysis';

interface DataPoint {
  date: string;
  value: number;
}

interface ForecastAnalyticsProps {
  historical: DataPoint[];
  predictions: DataPoint[];
  modelName: string;
  accuracy: number;
  forecastTitle?: string;
  forecastType?: string;
}

export function ForecastAnalytics({ 
  historical, 
  predictions, 
  modelName, 
  accuracy,
  forecastTitle = 'Untitled Forecast',
  forecastType = 'general'
}: ForecastAnalyticsProps) {
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  // Calculate metrics
  const historicalValues = historical.map(d => d.value);
  const predictionValues = predictions.map(d => d.value);
  
  const historicalMean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  const historicalStdDev = Math.sqrt(
    historicalValues.reduce((sum, val) => sum + Math.pow(val - historicalMean, 2), 0) / historicalValues.length
  );
  
  const predictionMean = predictionValues.reduce((sum, val) => sum + val, 0) / predictionValues.length;
  
  // Calculate trend
  const historicalTrend = historicalValues.length > 1 
    ? ((historicalValues[historicalValues.length - 1] - historicalValues[0]) / historicalValues[0]) * 100
    : 0;
    
  const predictionTrend = predictions.length > 1
    ? ((predictionValues[predictionValues.length - 1] - predictionValues[0]) / predictionValues[0]) * 100
    : 0;
  
  // Calculate volatility
  const volatility = (historicalStdDev / historicalMean) * 100;
  
  // Risk assessment
  const getRiskLevel = (volatility: number, accuracy: number) => {
    if (volatility > 30 || accuracy < 70) return 'high';
    if (volatility > 15 || accuracy < 85) return 'medium';
    return 'low';
  };
  
  const riskLevel = getRiskLevel(volatility, accuracy);
  const riskColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50', 
    high: 'text-red-600 bg-red-50'
  };
  
  const riskIcons = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertTriangle
  };
  
  const RiskIcon = riskIcons[riskLevel];
  
  return (
    <div className="space-y-6">
      {/* Toggle for Advanced Analysis */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-medium">Enhanced Analysis Available</span>
            </div>
            <Button 
              variant={showAdvancedAnalysis ? "default" : "outline"}
              onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
              className="gap-2"
            >
              {showAdvancedAnalysis ? 'Hide' : 'Show'} Advanced Analysis
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedAnalysis ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Main Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className="text-xl font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
              </div>
            </div>
            <Progress value={accuracy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">Volatility</div>
                <div className="text-xl font-bold text-purple-600">{volatility.toFixed(1)}%</div>
              </div>
            </div>
            <Progress value={Math.min(volatility, 100)} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {historicalTrend >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <div>
                <div className="text-sm text-muted-foreground">Historical Trend</div>
                <div className={`text-xl font-bold ${historicalTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {historicalTrend >= 0 ? '+' : ''}{historicalTrend.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RiskIcon className={`w-5 h-5 ${riskLevel === 'low' ? 'text-green-600' : riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}`} />
              <div>
                <div className="text-sm text-muted-foreground">Risk Level</div>
                <Badge className={`${riskColors[riskLevel]} capitalize`}>
                  {riskLevel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Forecast Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Performance */}
          <div>
            <h4 className="font-semibold mb-3">Model Performance</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model Used:</span>
                  <span className="font-medium">{modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Points:</span>
                  <span className="font-medium">{historical.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forecast Horizon:</span>
                  <span className="font-medium">{predictions.length} periods</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Historical Mean:</span>
                  <span className="font-medium">{historicalMean.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Predicted Mean:</span>
                  <span className="font-medium">{predictionMean.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Change:</span>
                  <span className={`font-medium ${predictionTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {predictionTrend >= 0 ? '+' : ''}{predictionTrend.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Insights */}
          <div>
            <h4 className="font-semibold mb-3">Key Insights</h4>
            <div className="space-y-2 text-sm">
              {accuracy > 85 && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  <span>High model accuracy indicates reliable predictions</span>
                </div>
              )}
              
              {volatility > 25 && (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span>High volatility detected - predictions may vary significantly</span>
                </div>
              )}
              
              {Math.abs(predictionTrend - historicalTrend) > 20 && (
                <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded">
                  <TrendingUp className="w-4 h-4" />
                  <span>Predicted trend differs significantly from historical pattern</span>
                </div>
              )}
              
              {predictions.length >= 6 && (
                <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2 rounded">
                  <BarChart3 className="w-4 h-4" />
                  <span>Long-term forecast - confidence may decrease over time</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-3">Recommendations</h4>
            <div className="space-y-2 text-sm">
              {riskLevel === 'high' && (
                <div className="text-red-700 bg-red-50 p-3 rounded">
                  <strong>High Risk:</strong> Consider using additional models for comparison and implementing regular forecast updates.
                </div>
              )}
              
              {riskLevel === 'medium' && (
                <div className="text-yellow-700 bg-yellow-50 p-3 rounded">
                  <strong>Medium Risk:</strong> Monitor actual vs predicted values and adjust forecasts as needed.
                </div>
              )}
              
              {riskLevel === 'low' && (
                <div className="text-green-700 bg-green-50 p-3 rounded">
                  <strong>Low Risk:</strong> Model appears stable and reliable for decision making.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Advanced Analysis Section */}
      {showAdvancedAnalysis && (
        <PostGenerationAnalysis
          historical={historical}
          predictions={predictions}
          modelName={modelName}
          accuracy={accuracy}
          forecastTitle={forecastTitle}
          forecastType={forecastType}
        />
      )}
    </div>
  );
}