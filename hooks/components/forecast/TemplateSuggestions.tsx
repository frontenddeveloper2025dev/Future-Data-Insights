import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Clock, Target, Zap, ChevronRight, Star, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { table } from '@devvai/devv-code-backend';

interface ForecastTemplate {
  _id: string;
  _uid: string;
  template_name: string;
  category: string;
  description: string;
  configuration: string;
  data_schema: string;
  is_public: string;
  usage_count: number;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface Forecast {
  _id: string;
  _uid: string;
  title: string;
  type: string;
  model: string;
  data_points: string;
  predictions: string;
  accuracy_score: number;
  time_horizon: string;
  status: string;
  created_at: string;
}

interface ForecastOutcome {
  _id: string;
  _uid: string;
  forecast_id: string;
  actual_value: number;
  predicted_value: number;
  variance: number;
  accuracy_percentage: number;
  outcome_date: string;
  recorded_at: string;
}

interface TemplateSuggestion {
  template: ForecastTemplate;
  confidence: number;
  reason: string;
  matchScore: number;
  tags: string[];
  benefits: string[];
}

interface DataPattern {
  commonTypes: string[];
  preferredModels: string[];
  avgAccuracy: number;
  mostUsedHorizon: string;
  seasonalityDetected: boolean;
  dataVolume: 'low' | 'medium' | 'high';
}

export function TemplateSuggestions() {
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPatterns, setUserPatterns] = useState<DataPattern | null>(null);
  const [templates, setTemplates] = useState<ForecastTemplate[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [outcomes, setOutcomes] = useState<ForecastOutcome[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDataAndGenerateSuggestions();
  }, []);

  const loadDataAndGenerateSuggestions = async () => {
    try {
      setLoading(true);
      
      // Load all necessary data
      const [templatesRes, forecastsRes, outcomesRes] = await Promise.all([
        table.getItems('ew2w7lb1sa9s', { limit: 50, sort: 'usage_count', order: 'desc' }),
        table.getItems('evn1j5kjx62o', { limit: 100, sort: 'created_at', order: 'desc' }),
        table.getItems('evtdsghlfbb4', { limit: 100, sort: 'recorded_at', order: 'desc' })
      ]);

      const loadedTemplates = templatesRes.items as ForecastTemplate[];
      const loadedForecasts = forecastsRes.items as Forecast[];
      const loadedOutcomes = outcomesRes.items as ForecastOutcome[];

      setTemplates(loadedTemplates);
      setForecasts(loadedForecasts);
      setOutcomes(loadedOutcomes);

      // Analyze user patterns
      const patterns = analyzeUserPatterns(loadedForecasts, loadedOutcomes);
      setUserPatterns(patterns);

      // Generate intelligent suggestions
      const intelligentSuggestions = generateIntelligentSuggestions(
        loadedTemplates, 
        loadedForecasts, 
        loadedOutcomes, 
        patterns
      );
      
      setSuggestions(intelligentSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate template suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeUserPatterns = (forecasts: Forecast[], outcomes: ForecastOutcome[]): DataPattern => {
    // Analyze forecast types
    const typeFrequency = forecasts.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonTypes = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Analyze model preferences
    const modelFrequency = forecasts.reduce((acc, f) => {
      acc[f.model] = (acc[f.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const preferredModels = Object.entries(modelFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([model]) => model);

    // Calculate average accuracy
    const avgAccuracy = forecasts.length > 0 
      ? forecasts.reduce((sum, f) => sum + f.accuracy_score, 0) / forecasts.length 
      : 0;

    // Analyze time horizons
    const horizonFrequency = forecasts.reduce((acc, f) => {
      acc[f.time_horizon] = (acc[f.time_horizon] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedHorizon = Object.entries(horizonFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'monthly';

    // Detect seasonality (simplified analysis)
    const seasonalityDetected = forecasts.some(f => {
      try {
        const dataPoints = JSON.parse(f.data_points);
        return Array.isArray(dataPoints) && dataPoints.length >= 12; // Assume seasonal if 12+ points
      } catch {
        return false;
      }
    });

    // Determine data volume
    const totalDataPoints = forecasts.reduce((sum, f) => {
      try {
        const points = JSON.parse(f.data_points);
        return sum + (Array.isArray(points) ? points.length : 0);
      } catch {
        return sum;
      }
    }, 0);
    
    const avgDataPoints = forecasts.length > 0 ? totalDataPoints / forecasts.length : 0;
    const dataVolume: 'low' | 'medium' | 'high' = 
      avgDataPoints < 20 ? 'low' : avgDataPoints < 50 ? 'medium' : 'high';

    return {
      commonTypes,
      preferredModels,
      avgAccuracy,
      mostUsedHorizon,
      seasonalityDetected,
      dataVolume
    };
  };

  const generateIntelligentSuggestions = (
    templates: ForecastTemplate[], 
    forecasts: Forecast[], 
    outcomes: ForecastOutcome[], 
    patterns: DataPattern
  ): TemplateSuggestion[] => {
    const suggestions: TemplateSuggestion[] = [];

    // Strategy 1: Pattern-based recommendations
    templates.forEach(template => {
      let matchScore = 0;
      const benefits: string[] = [];
      let reason = '';

      try {
        const config = JSON.parse(template.configuration);
        
        // Check category match with user's common types
        if (patterns.commonTypes.includes(template.category)) {
          matchScore += 30;
          benefits.push(`Matches your ${template.category} forecasting needs`);
        }

        // Check model preference
        if (patterns.preferredModels.includes(config.model)) {
          matchScore += 25;
          benefits.push(`Uses your preferred ${config.model.replace('_', ' ')} model`);
        }

        // Check time horizon preference
        if (config.default_settings?.time_horizon === patterns.mostUsedHorizon) {
          matchScore += 20;
          benefits.push(`Optimized for ${patterns.mostUsedHorizon} forecasting`);
        }

        // Check data volume compatibility
        const minPoints = config.data_requirements?.minimum_points || 10;
        if (patterns.dataVolume === 'low' && minPoints <= 20) {
          matchScore += 15;
          benefits.push('Works well with smaller datasets');
        } else if (patterns.dataVolume === 'high' && minPoints >= 30) {
          matchScore += 15;
          benefits.push('Optimized for large datasets');
        }

        // Seasonality bonus
        if (patterns.seasonalityDetected && template.tags.includes('seasonal')) {
          matchScore += 20;
          benefits.push('Handles seasonal patterns effectively');
        }

        // Usage popularity bonus
        if (template.usage_count > 5) {
          matchScore += 10;
          benefits.push('Proven popular with other users');
        }

        // Public template bonus
        if (template.is_public === 'true') {
          matchScore += 5;
          benefits.push('Community validated template');
        }

        // Generate reason based on highest scoring factors
        if (matchScore >= 30) {
          if (patterns.commonTypes.includes(template.category)) {
            reason = `Perfect for ${template.category} forecasting based on your history`;
          } else if (patterns.preferredModels.includes(config.model)) {
            reason = `Uses your preferred ${config.model.replace('_', ' ')} approach`;
          } else {
            reason = `Highly compatible with your forecasting patterns`;
          }
        }

        if (matchScore > 20) {
          const confidence = Math.min(95, matchScore + 5);
          suggestions.push({
            template,
            confidence,
            reason,
            matchScore,
            tags: template.tags ? template.tags.split(',').map(t => t.trim()) : [],
            benefits
          });
        }
      } catch (error) {
        // Skip invalid templates
        console.warn('Invalid template configuration:', template._id);
      }
    });

    // Strategy 2: Accuracy-based recommendations for underperforming areas
    if (patterns.avgAccuracy < 70) {
      const highAccuracyTemplates = templates.filter(t => {
        try {
          const config = JSON.parse(t.configuration);
          return ['arima', 'prophet', 'ensemble', 'ai_powered'].includes(config.model);
        } catch {
          return false;
        }
      });

      highAccuracyTemplates.forEach(template => {
        if (!suggestions.find(s => s.template._id === template._id)) {
          suggestions.push({
            template,
            confidence: 80,
            reason: 'Advanced model to improve forecast accuracy',
            matchScore: 75,
            tags: template.tags ? template.tags.split(',').map(t => t.trim()) : [],
            benefits: ['Higher accuracy potential', 'Advanced modeling techniques', 'Better for complex patterns']
          });
        }
      });
    }

    // Strategy 3: Trending and popular templates
    const trendingTemplates = templates
      .filter(t => t.usage_count > 0)
      .sort((a, b) => {
        const aRecent = new Date(a.updated_at).getTime();
        const bRecent = new Date(b.updated_at).getTime();
        const aPopularity = a.usage_count;
        const bPopularity = b.usage_count;
        
        // Weighted score: 70% popularity, 30% recency
        const aScore = (aPopularity * 0.7) + (aRecent * 0.3 / 1000000000000);
        const bScore = (bPopularity * 0.7) + (bRecent * 0.3 / 1000000000000);
        
        return bScore - aScore;
      })
      .slice(0, 2);

    trendingTemplates.forEach(template => {
      if (!suggestions.find(s => s.template._id === template._id)) {
        suggestions.push({
          template,
          confidence: 65,
          reason: 'Popular and recently used by the community',
          matchScore: 60,
          tags: template.tags ? template.tags.split(',').map(t => t.trim()) : [],
          benefits: ['Community favorite', 'Recently updated', 'Proven results']
        });
      }
    });

    // Sort by confidence and match score
    return suggestions
      .sort((a, b) => b.confidence - a.confidence || b.matchScore - a.matchScore)
      .slice(0, 6); // Limit to top 6 suggestions
  };

  const useTemplate = async (template: ForecastTemplate) => {
    try {
      // Update usage count
      await table.updateItem('ew2w7lb1sa9s', {
        _uid: template._uid,
        _id: template._id,
        usage_count: template.usage_count + 1,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Template Applied",
        description: `Using template: ${template.template_name}`
      });

      // Apply template configuration
      const config = JSON.parse(template.configuration);
      window.dispatchEvent(new CustomEvent('applyForecastTemplate', { 
        detail: { template, config } 
      }));

      // Refresh suggestions
      loadDataAndGenerateSuggestions();
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive"
      });
    }
  };

  const getSuggestionIcon = (reason: string) => {
    if (reason.includes('accuracy')) return Target;
    if (reason.includes('popular') || reason.includes('community')) return Users;
    if (reason.includes('pattern') || reason.includes('history')) return Brain;
    if (reason.includes('advanced') || reason.includes('model')) return Zap;
    return TrendingUp;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold">Analyzing your patterns...</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with user insights */}
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Smart Template Suggestions</h3>
          <p className="text-muted-foreground text-sm">
            Based on your forecasting patterns and success metrics
          </p>
          {userPatterns && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {userPatterns.avgAccuracy.toFixed(0)}% avg accuracy
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Prefers {userPatterns.mostUsedHorizon}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Most used: {userPatterns.commonTypes[0] || 'N/A'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Grid */}
      {suggestions.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Building Your Profile</h3>
            <p className="text-muted-foreground">
              Create a few forecasts to get personalized template suggestions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestion, index) => {
            const IconComponent = getSuggestionIcon(suggestion.reason);
            const config = JSON.parse(suggestion.template.configuration);
            
            return (
              <Card key={suggestion.template._id} className="hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Confidence indicator */}
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-500 to-yellow-500" 
                     style={{
                       background: `linear-gradient(to bottom, 
                         ${suggestion.confidence >= 80 ? '#22c55e' : 
                           suggestion.confidence >= 60 ? '#eab308' : '#f97316'} 0%, 
                         transparent 100%)`
                     }} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <IconComponent className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base leading-tight">
                          {suggestion.template.template_name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {suggestion.reason}
                        </CardDescription>
                      </div>
                    </div>
                    {index < 3 && (
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {config.model.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      Match confidence
                    </span>
                    <span className="text-xs font-medium">
                      {suggestion.confidence}%
                    </span>
                  </div>
                  <Progress value={suggestion.confidence} className="h-1.5" />
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Benefits */}
                    <div className="space-y-1">
                      {suggestion.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3 text-green-600" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Usage stats */}
                    <div className="text-xs text-muted-foreground">
                      Used {suggestion.template.usage_count} times • {config.default_settings?.time_horizon || 'flexible'}
                    </div>
                    
                    {/* Action */}
                    <Button
                      onClick={() => useTemplate(suggestion.template)}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TemplateSuggestions;