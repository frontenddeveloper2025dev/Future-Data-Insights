import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, CheckCircle, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PatternAnalyzer, UserBehaviorPattern, DataPattern } from '@/lib/patternAnalyzer';
import { table } from '@devvai/devv-code-backend';

interface ForecastAnalyzerProps {
  onSuggestTemplate?: (templateId: string) => void;
  dataPoints?: any[];
  forecastType?: string;
}

interface AnalysisInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

export function ForecastAnalyzer({ onSuggestTemplate, dataPoints = [], forecastType }: ForecastAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userPattern, setUserPattern] = useState<UserBehaviorPattern | null>(null);
  const [dataPattern, setDataPattern] = useState<DataPattern | null>(null);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analysisScore, setAnalysisScore] = useState(0);

  useEffect(() => {
    if (dataPoints.length > 0) {
      analyzeData();
    }
  }, [dataPoints, forecastType]);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    
    try {
      // Load user's historical data
      const [forecastsRes, outcomesRes, templatesRes] = await Promise.all([
        table.getItems('evn1j5kjx62o', { limit: 50, sort: 'created_at', order: 'desc' }),
        table.getItems('evtdsghlfbb4', { limit: 50, sort: 'recorded_at', order: 'desc' }),
        table.getItems('ew2w7lb1sa9s', { limit: 30, sort: 'usage_count', order: 'desc' })
      ]);

      const forecasts = forecastsRes.items;
      const outcomes = outcomesRes.items;
      const templates = templatesRes.items;

      // Analyze user behavior patterns
      const userBehaviorPattern = PatternAnalyzer.analyzeUserBehavior(forecasts, outcomes, templates);
      setUserPattern(userBehaviorPattern);

      // Analyze current data patterns
      const currentDataPattern = PatternAnalyzer.analyzeDataPatterns(dataPoints);
      setDataPattern(currentDataPattern);

      // Generate insights
      const analysisInsights = generateDataInsights(currentDataPattern, userBehaviorPattern, forecastType);
      setInsights(analysisInsights);

      // Generate recommendations
      const smartRecommendations = PatternAnalyzer.generateSmartRecommendations(
        templates,
        userBehaviorPattern,
        currentDataPattern,
        {
          urgency: 'medium',
          accuracy_requirement: 'high'
        }
      );
      setRecommendations(smartRecommendations.slice(0, 3));

      // Calculate overall analysis score
      const score = calculateAnalysisScore(currentDataPattern, userBehaviorPattern, analysisInsights);
      setAnalysisScore(score);

    } catch (error) {
      console.error('Analysis error:', error);
      setInsights([{
        type: 'error',
        title: 'Analysis Failed',
        description: 'Unable to analyze data patterns. Please try again.',
        confidence: 0
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDataInsights = (
    dataPattern: DataPattern, 
    userPattern: UserBehaviorPattern, 
    type?: string
  ): AnalysisInsight[] => {
    const insights: AnalysisInsight[] = [];

    // Data quality insights
    if (dataPattern.consistency >= 0.8) {
      insights.push({
        type: 'success',
        title: 'High Data Quality',
        description: 'Your data shows excellent consistency and structure for forecasting.',
        confidence: 0.9
      });
    } else if (dataPattern.consistency < 0.5) {
      insights.push({
        type: 'warning',
        title: 'Data Quality Issues',
        description: 'Consider cleaning your data or handling outliers for better accuracy.',
        action: 'Review data preprocessing',
        confidence: 0.8
      });
    }

    // Seasonality insights
    if (dataPattern.seasonality?.detected) {
      insights.push({
        type: 'info',
        title: 'Seasonal Pattern Detected',
        description: `Found ${dataPattern.seasonality.type} seasonality with ${(dataPattern.seasonality.strength * 100).toFixed(0)}% strength.`,
        action: 'Use seasonal models',
        confidence: dataPattern.seasonality.strength
      });
    }

    // Trend insights
    if (dataPattern.trend !== 'stable') {
      const trendIcon = dataPattern.trend === 'upward' ? '📈' : dataPattern.trend === 'downward' ? '📉' : '🔄';
      insights.push({
        type: 'info',
        title: `${dataPattern.trend.charAt(0).toUpperCase() + dataPattern.trend.slice(1)} Trend`,
        description: `Data shows a clear ${dataPattern.trend} trend pattern.`,
        confidence: 0.7
      });
    }

    // Volatility insights
    if (dataPattern.volatility === 'high') {
      insights.push({
        type: 'warning',
        title: 'High Volatility',
        description: 'Data shows high volatility. Consider ensemble methods or confidence intervals.',
        action: 'Use robust models',
        confidence: 0.8
      });
    }

    // Model recommendations based on user history
    if (userPattern.experienceLevel === 'beginner' && dataPattern.size === 'small') {
      insights.push({
        type: 'info',
        title: 'Simple Model Recommended',
        description: 'For your experience level and data size, start with linear regression or exponential smoothing.',
        action: 'Try simple models first',
        confidence: 0.9
      });
    } else if (userPattern.experienceLevel === 'expert' && dataPattern.size === 'large') {
      insights.push({
        type: 'success',
        title: 'Advanced Models Available',
        description: 'Your expertise and data size allow for sophisticated AI-powered models.',
        action: 'Explore neural networks',
        confidence: 0.85
      });
    }

    // Accuracy improvement suggestions
    if (userPattern.accuracyTrends.length > 0) {
      const latestAccuracy = userPattern.accuracyTrends[userPattern.accuracyTrends.length - 1];
      if (latestAccuracy.accuracy < 70) {
        insights.push({
          type: 'warning',
          title: 'Accuracy Below Target',
          description: `Recent forecasts show ${latestAccuracy.accuracy.toFixed(0)}% accuracy. Consider model tuning.`,
          action: 'Optimize parameters',
          confidence: 0.8
        });
      } else if (latestAccuracy.improvement > 5) {
        insights.push({
          type: 'success',
          title: 'Improving Performance',
          description: `Great progress! Accuracy improved by ${latestAccuracy.improvement.toFixed(1)}% recently.`,
          confidence: 0.9
        });
      }
    }

    // Domain-specific insights
    if (type && userPattern.domainExpertise.includes(type)) {
      insights.push({
        type: 'success',
        title: 'Domain Expertise Match',
        description: `Your experience with ${type} forecasting will help achieve higher accuracy.`,
        confidence: 0.8
      });
    }

    return insights;
  };

  const calculateAnalysisScore = (
    dataPattern: DataPattern,
    userPattern: UserBehaviorPattern,
    insights: AnalysisInsight[]
  ): number => {
    let score = 50; // Base score

    // Data quality factors
    score += dataPattern.consistency * 20;
    score += (dataPattern.size === 'large' ? 10 : dataPattern.size === 'medium' ? 5 : 0);
    score += (dataPattern.volatility === 'low' ? 10 : dataPattern.volatility === 'medium' ? 5 : 0);

    // User experience factors
    score += (userPattern.experienceLevel === 'expert' ? 15 : userPattern.experienceLevel === 'intermediate' ? 10 : 5);
    score += userPattern.dataQualityScore * 10;

    // Insights quality
    const positiveInsights = insights.filter(i => i.type === 'success').length;
    const warningInsights = insights.filter(i => i.type === 'warning').length;
    score += positiveInsights * 5;
    score -= warningInsights * 2;

    return Math.min(100, Math.max(0, score));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Ready to Analyze</h3>
            <p className="text-muted-foreground text-sm">
              Add data points to receive intelligent insights and recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Score */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Analysis Score</CardTitle>
            </div>
            <Badge variant={analysisScore >= 80 ? 'default' : analysisScore >= 60 ? 'secondary' : 'destructive'}>
              {analysisScore}/100
            </Badge>
          </div>
          <CardDescription>
            Data quality and forecasting readiness assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={analysisScore} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 animate-pulse" />
                <span>Analyzing patterns...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Pattern Summary */}
      {dataPattern && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Data Pattern Analysis</CardTitle>
            <CardDescription>Key characteristics of your dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataPattern.size}</div>
                <div className="text-sm text-muted-foreground">Data Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(dataPattern.consistency * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataPattern.volatility}</div>
                <div className="text-sm text-muted-foreground">Volatility</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataPattern.trend}</div>
                <div className="text-sm text-muted-foreground">Trend</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Analysis Insights</CardTitle>
            <CardDescription>Key findings and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                const iconColor = getInsightColor(insight.type);
                
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <IconComponent className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {(insight.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            {insight.action}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recommended Templates</CardTitle>
            <CardDescription>Based on your data patterns and history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{rec.template.template_name}</h4>
                    <p className="text-sm text-muted-foreground">{rec.reasons[0]}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {rec.template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(rec.confidence * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onSuggestTemplate?.(rec.template._id)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {insights.some(i => i.action && i.type === 'warning') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommended Actions:</strong> {' '}
            {insights
              .filter(i => i.action && i.type === 'warning')
              .map(i => i.action)
              .join(', ')
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default ForecastAnalyzer;