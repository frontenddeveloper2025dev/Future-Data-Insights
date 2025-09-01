import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  BarChart3,
  Award,
  Clock,
  Database,
  Brain,
  Download,
  Share,
  RefreshCw,
  Eye
} from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface ResultsSummaryProps {
  forecastData: {
    title: string;
    type: string;
    timeHorizon: string;
    dataPoints: DataPoint[];
  };
  selectedModel: {
    name: string;
    category: string;
    description: string;
  };
  predictions: DataPoint[];
  accuracy: number;
}

export function ResultsSummary({ 
  forecastData, 
  selectedModel, 
  predictions, 
  accuracy 
}: ResultsSummaryProps) {
  const navigate = useNavigate();

  // Calculate forecast insights
  const historicalValues = forecastData.dataPoints.map(d => d.value);
  const predictionValues = predictions.map(d => d.value);
  
  const historicalMean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  const predictionMean = predictionValues.reduce((sum, val) => sum + val, 0) / predictionValues.length;
  
  const growth = ((predictionMean - historicalMean) / historicalMean) * 100;
  const minPrediction = Math.min(...predictionValues);
  const maxPrediction = Math.max(...predictionValues);
  
  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-green-600 bg-green-50';
    if (growth < -10) return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600 bg-green-50';
    if (accuracy >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Forecast Results Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Key Metrics */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">{forecastData.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="secondary">{forecastData.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Model:</span>
                    <Badge>{selectedModel.name}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Horizon:</span>
                    <span className="font-medium">{predictions.length} periods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Data Points:</span>
                    <span className="font-medium">{forecastData.dataPoints.length}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Key Predictions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predicted Range:</span>
                    <span className="font-medium">
                      {formatValue(minPrediction)} - {formatValue(maxPrediction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Forecast:</span>
                    <span className="font-medium">{formatValue(predictionMean)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Period:</span>
                    <span className="font-medium">
                      {formatValue(predictionValues[predictionValues.length - 1])}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Performance Indicators */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 mx-auto text-primary mb-2" />
                    <div className={`text-xl font-bold px-2 py-1 rounded ${getAccuracyColor(accuracy)}`}>
                      {accuracy.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Model Accuracy</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    {growth >= 0 ? (
                      <TrendingUp className="w-6 h-6 mx-auto text-green-600 mb-2" />
                    ) : (
                      <TrendingDown className="w-6 h-6 mx-auto text-red-600 mb-2" />
                    )}
                    <div className={`text-xl font-bold px-2 py-1 rounded ${getGrowthColor(growth)}`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Expected Growth</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Forecast Timeline</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>Start: {predictions[0]?.date}</div>
                    <div>End: {predictions[predictions.length - 1]?.date}</div>
                    <div>Generated: {new Date().toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Model Insights</span>
                  </div>
                  <div className="text-xs text-purple-700">
                    {selectedModel.description}
                  </div>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">
                    {selectedModel.category} Model
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full gap-2"
              >
                <Eye className="w-4 h-4" />
                View in Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/performance')}
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Performance Analysis
              </Button>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Create Another Forecast
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share className="w-3 h-3" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Forecast Quality Assessment</span>
            </div>
            <p className="text-sm text-blue-700">
              {accuracy >= 85 
                ? "Excellent forecast quality! This model shows strong predictive capability for your data pattern."
                : accuracy >= 70
                ? "Good forecast quality. Consider monitoring actual vs predicted values to validate accuracy."
                : "Moderate forecast quality. Consider trying alternative models or collecting more data for better accuracy."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}