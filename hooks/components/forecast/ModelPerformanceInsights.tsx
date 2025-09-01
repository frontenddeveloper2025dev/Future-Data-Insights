import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Activity,
  Brain,
  Lightbulb,
  Zap,
  Award,
  Gauge,
  LineChart,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface ModelPerformanceInsightsProps {
  modelName: string;
  accuracy: number;
  dataPoints: number;
  forecastHorizon: number;
  volatility: number;
  trend: number;
  onModelRecommendation?: (recommendations: string[]) => void;
}

interface ModelBenchmark {
  model: string;
  accuracy: number;
  bestFor: string[];
  complexity: 'Low' | 'Medium' | 'High';
  dataRequirement: number;
  interpretability: number;
}

interface PerformanceInsight {
  type: 'strength' | 'weakness' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
}

export function ModelPerformanceInsights({
  modelName,
  accuracy,
  dataPoints,
  forecastHorizon,
  volatility,
  trend,
  onModelRecommendation
}: ModelPerformanceInsightsProps) {
  const { toast } = useToast();
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [benchmarks, setBenchmarks] = useState<ModelBenchmark[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    generateBenchmarks();
    analyzeModelPerformance();
  }, [modelName, accuracy, dataPoints, volatility, trend]);

  const generateBenchmarks = () => {
    const modelBenchmarks: ModelBenchmark[] = [
      {
        model: 'Linear Regression',
        accuracy: 78,
        bestFor: ['Linear trends', 'Simple patterns', 'Limited data'],
        complexity: 'Low',
        dataRequirement: 10,
        interpretability: 95
      },
      {
        model: 'Moving Average',
        accuracy: 72,
        bestFor: ['Stable patterns', 'Noise reduction', 'Short-term'],
        complexity: 'Low',
        dataRequirement: 6,
        interpretability: 90
      },
      {
        model: 'Exponential Smoothing',
        accuracy: 80,
        bestFor: ['Trending data', 'Seasonal patterns', 'Weighted history'],
        complexity: 'Medium',
        dataRequirement: 12,
        interpretability: 85
      },
      {
        model: 'ARIMA Model',
        accuracy: 85,
        bestFor: ['Time series', 'Autocorrelation', 'Complex patterns'],
        complexity: 'High',
        dataRequirement: 24,
        interpretability: 70
      },
      {
        model: 'AI Neural Network',
        accuracy: 88,
        bestFor: ['Non-linear patterns', 'Large datasets', 'Complex relationships'],
        complexity: 'High',
        dataRequirement: 50,
        interpretability: 40
      },
      {
        model: 'Random Forest',
        accuracy: 83,
        bestFor: ['Robust predictions', 'Mixed data types', 'Outlier resistance'],
        complexity: 'Medium',
        dataRequirement: 30,
        interpretability: 60
      },
      {
        model: 'Seasonal Decompose',
        accuracy: 82,
        bestFor: ['Seasonal data', 'Business cycles', 'Periodic patterns'],
        complexity: 'Medium',
        dataRequirement: 24,
        interpretability: 80
      },
      {
        model: 'Polynomial Regression',
        accuracy: 75,
        bestFor: ['Curved relationships', 'Growth models', 'Mathematical patterns'],
        complexity: 'Medium',
        dataRequirement: 15,
        interpretability: 85
      }
    ];

    setBenchmarks(modelBenchmarks);
  };

  const analyzeModelPerformance = () => {
    const currentModel = benchmarks.find(b => b.model === modelName);
    const analysisInsights: PerformanceInsight[] = [];

    // Accuracy analysis
    if (accuracy > 85) {
      analysisInsights.push({
        type: 'strength',
        title: 'Excellent Accuracy',
        description: `${accuracy.toFixed(1)}% accuracy exceeds industry benchmarks for most forecasting applications.`,
        priority: 'high',
        icon: Award
      });
    } else if (accuracy < 70) {
      analysisInsights.push({
        type: 'weakness',
        title: 'Below Average Accuracy',
        description: `${accuracy.toFixed(1)}% accuracy is below recommended threshold. Consider alternative models.`,
        priority: 'high',
        icon: AlertTriangle
      });
      
      analysisInsights.push({
        type: 'recommendation',
        title: 'Model Optimization',
        description: 'Try ensemble methods or collect more training data to improve accuracy.',
        priority: 'high',
        icon: Zap
      });
    }

    // Data sufficiency analysis
    if (currentModel && dataPoints < currentModel.dataRequirement) {
      analysisInsights.push({
        type: 'weakness',
        title: 'Insufficient Data',
        description: `${modelName} typically requires ${currentModel.dataRequirement}+ data points. You have ${dataPoints}.`,
        priority: 'medium',
        icon: AlertTriangle
      });
    } else if (dataPoints > 50) {
      analysisInsights.push({
        type: 'strength',
        title: 'Rich Dataset',
        description: `${dataPoints} data points provide excellent foundation for accurate predictions.`,
        priority: 'medium',
        icon: CheckCircle
      });
    }

    // Volatility analysis
    if (volatility > 30) {
      analysisInsights.push({
        type: 'weakness',
        title: 'High Volatility',
        description: `${volatility.toFixed(1)}% volatility indicates unpredictable patterns. Consider robust models.`,
        priority: 'medium',
        icon: Activity
      });
      
      if (modelName === 'Linear Regression' || modelName === 'Moving Average') {
        analysisInsights.push({
          type: 'recommendation',
          title: 'Consider Advanced Models',
          description: 'Random Forest or Neural Networks handle volatility better than linear models.',
          priority: 'high',
          icon: Brain
        });
      }
    }

    // Trend analysis
    if (Math.abs(trend) > 20) {
      if (modelName === 'Linear Regression' || modelName === 'ARIMA Model') {
        analysisInsights.push({
          type: 'strength',
          title: 'Trend Detection',
          description: `Strong ${trend > 0 ? 'upward' : 'downward'} trend (${Math.abs(trend).toFixed(1)}%) is well-suited for ${modelName}.`,
          priority: 'medium',
          icon: TrendingUp
        });
      }
    }

    // Model-specific insights
    switch (modelName) {
      case 'AI Neural Network':
        if (dataPoints < 30) {
          analysisInsights.push({
            type: 'recommendation',
            title: 'Neural Network Optimization',
            description: 'Consider simpler models for small datasets or collect more data.',
            priority: 'medium',
            icon: Brain
          });
        } else {
          analysisInsights.push({
            type: 'strength',
            title: 'Complex Pattern Recognition',
            description: 'Neural networks excel at capturing non-linear relationships in your data.',
            priority: 'high',
            icon: Brain
          });
        }
        break;
        
      case 'Random Forest':
        analysisInsights.push({
          type: 'strength',
          title: 'Outlier Resistance',
          description: 'Random Forest provides robust predictions even with noisy or incomplete data.',
          priority: 'medium',
          icon: CheckCircle
        });
        break;
        
      case 'ARIMA Model':
        if (dataPoints >= 24) {
          analysisInsights.push({
            type: 'strength',
            title: 'Time Series Expertise',
            description: 'ARIMA models excel with sufficient historical data for pattern recognition.',
            priority: 'high',
            icon: LineChart
          });
        }
        break;
    }

    // Forecast horizon analysis
    if (forecastHorizon > 12) {
      analysisInsights.push({
        type: 'recommendation',
        title: 'Long-term Forecast Caution',
        description: 'Prediction confidence decreases significantly beyond 12 periods. Consider shorter horizons.',
        priority: 'medium',
        icon: AlertTriangle
      });
    }

    setInsights(analysisInsights);
  };

  const handleAdvancedAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate advanced analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recommendations = insights
      .filter(insight => insight.type === 'recommendation')
      .map(insight => insight.title);
    
    if (onModelRecommendation) {
      onModelRecommendation(recommendations);
    }
    
    toast({
      title: 'Advanced Analysis Complete',
      description: `Generated ${insights.length} insights for ${modelName}`,
    });
    
    setIsAnalyzing(false);
  };

  const currentModelBenchmark = benchmarks.find(b => b.model === modelName);
  const strengthsCount = insights.filter(i => i.type === 'strength').length;
  const weaknessesCount = insights.filter(i => i.type === 'weakness').length;
  const recommendationsCount = insights.filter(i => i.type === 'recommendation').length;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Model Performance Insights
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAdvancedAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Deep Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{strengthsCount}</div>
              <div className="text-sm text-muted-foreground">Strengths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{weaknessesCount}</div>
              <div className="text-sm text-muted-foreground">Areas to Improve</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recommendationsCount}</div>
              <div className="text-sm text-muted-foreground">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{accuracy.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>

          {currentModelBenchmark && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Benchmark</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {currentModelBenchmark.accuracy}% avg
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your model: {accuracy > currentModelBenchmark.accuracy ? '+' : ''}
                    {(accuracy - currentModelBenchmark.accuracy).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Complexity</span>
                  </div>
                  <Badge 
                    className={
                      currentModelBenchmark.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                      currentModelBenchmark.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {currentModelBenchmark.complexity}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentModelBenchmark.dataRequirement}+ data points needed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Interpretability</span>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {currentModelBenchmark.interpretability}%
                  </div>
                  <Progress value={currentModelBenchmark.interpretability} className="mt-1 h-1.5" />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              const colorClasses = {
                strength: 'text-green-700 bg-green-50 border-green-200',
                weakness: 'text-red-700 bg-red-50 border-red-200',
                recommendation: 'text-blue-700 bg-blue-50 border-blue-200'
              };

              return (
                <div key={index} className={`p-4 rounded-lg border ${colorClasses[insight.type]}`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge 
                          variant="outline"
                          className={
                            insight.priority === 'high' ? 'border-red-300 text-red-700' :
                            insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-gray-300 text-gray-700'
                          }
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {insights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analysis in progress... Insights will appear here.</p>
              </div>
            )}
          </div>

          {currentModelBenchmark && (
            <>
              <Separator className="my-6" />
              <div>
                <h4 className="font-medium mb-3">Best Suited For:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentModelBenchmark.bestFor.map((use, index) => (
                    <Badge key={index} variant="secondary">{use}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}