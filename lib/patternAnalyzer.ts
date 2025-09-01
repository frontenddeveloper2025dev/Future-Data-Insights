// Advanced pattern analysis for intelligent template suggestions
export interface UserBehaviorPattern {
  forecastingStyle: 'conservative' | 'aggressive' | 'balanced';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  domainExpertise: string[];
  modelPreferences: ModelPreference[];
  accuracyTrends: AccuracyTrend[];
  usagePatterns: UsagePattern;
  seasonalityAwareness: boolean;
  dataQualityScore: number;
}

export interface ModelPreference {
  model: string;
  successRate: number;
  avgAccuracy: number;
  usageCount: number;
  confidence: number;
}

export interface AccuracyTrend {
  period: string;
  accuracy: number;
  improvement: number;
  forecasts: number;
}

export interface UsagePattern {
  peakHours: number[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'sporadic';
  averageSessionLength: number;
  preferredTimeHorizon: string[];
  complexityPreference: 'simple' | 'moderate' | 'advanced';
}

export interface DataPattern {
  size: 'small' | 'medium' | 'large';
  consistency: number; // 0-1 score
  volatility: 'low' | 'medium' | 'high';
  seasonality: SeasonalityPattern | null;
  trend: 'upward' | 'downward' | 'stable' | 'cyclical';
  outlierFrequency: number;
}

export interface SeasonalityPattern {
  type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  strength: number; // 0-1 score
  detected: boolean;
}

export class PatternAnalyzer {
  
  /**
   * Analyzes user behavior patterns from historical data
   */
  static analyzeUserBehavior(
    forecasts: any[], 
    outcomes: any[], 
    templates: any[]
  ): UserBehaviorPattern {
    
    const modelPreferences = this.analyzeModelPreferences(forecasts, outcomes);
    const accuracyTrends = this.analyzeAccuracyTrends(forecasts, outcomes);
    const usagePatterns = this.analyzeUsagePatterns(forecasts);
    const experienceLevel = this.determineExperienceLevel(forecasts, modelPreferences);
    const forecastingStyle = this.determineForecastingStyle(forecasts, outcomes);
    const domainExpertise = this.identifyDomainExpertise(forecasts);
    const seasonalityAwareness = this.assessSeasonalityAwareness(forecasts);
    const dataQualityScore = this.calculateDataQualityScore(forecasts);

    return {
      forecastingStyle,
      experienceLevel,
      domainExpertise,
      modelPreferences,
      accuracyTrends,
      usagePatterns,
      seasonalityAwareness,
      dataQualityScore
    };
  }

  /**
   * Analyzes data patterns from input datasets
   */
  static analyzeDataPatterns(dataPoints: any[]): DataPattern {
    if (!dataPoints || dataPoints.length === 0) {
      return {
        size: 'small',
        consistency: 0,
        volatility: 'low',
        seasonality: null,
        trend: 'stable',
        outlierFrequency: 0
      };
    }

    const size = dataPoints.length < 20 ? 'small' : 
                 dataPoints.length < 100 ? 'medium' : 'large';
    
    const values = dataPoints.map(p => p.value || p.y || p).filter(v => typeof v === 'number');
    const consistency = this.calculateConsistency(values);
    const volatility = this.calculateVolatility(values);
    const seasonality = this.detectSeasonality(values);
    const trend = this.detectTrend(values);
    const outlierFrequency = this.calculateOutlierFrequency(values);

    return {
      size,
      consistency,
      volatility,
      seasonality,
      trend,
      outlierFrequency
    };
  }

  /**
   * Generates context-aware template recommendations
   */
  static generateSmartRecommendations(
    templates: any[],
    userPattern: UserBehaviorPattern,
    dataPattern: DataPattern,
    context: {
      urgency?: 'low' | 'medium' | 'high';
      accuracy_requirement?: 'standard' | 'high' | 'critical';
      resource_constraints?: 'none' | 'limited' | 'strict';
    } = {}
  ): any[] {
    const recommendations = templates.map(template => {
      const score = this.calculateRecommendationScore(
        template, 
        userPattern, 
        dataPattern, 
        context
      );
      
      return {
        template,
        score: score.total,
        reasons: score.reasons,
        confidence: score.confidence,
        expectedAccuracy: score.expectedAccuracy,
        adaptationSuggestions: score.adaptations
      };
    });

    return recommendations
      .filter(r => r.score > 0.3) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 recommendations
  }

  // Private helper methods

  private static analyzeModelPreferences(forecasts: any[], outcomes: any[]): ModelPreference[] {
    const modelStats = new Map<string, {
      total: number;
      totalAccuracy: number;
      successes: number;
    }>();

    forecasts.forEach(forecast => {
      const model = forecast.model;
      const accuracy = forecast.accuracy_score || 0;
      const isSuccess = accuracy >= 70; // Define success threshold

      if (!modelStats.has(model)) {
        modelStats.set(model, { total: 0, totalAccuracy: 0, successes: 0 });
      }

      const stats = modelStats.get(model)!;
      stats.total++;
      stats.totalAccuracy += accuracy;
      if (isSuccess) stats.successes++;
    });

    return Array.from(modelStats.entries()).map(([model, stats]) => ({
      model,
      successRate: stats.total > 0 ? stats.successes / stats.total : 0,
      avgAccuracy: stats.total > 0 ? stats.totalAccuracy / stats.total : 0,
      usageCount: stats.total,
      confidence: Math.min(1, stats.total / 10) // Confidence based on usage volume
    }));
  }

  private static analyzeAccuracyTrends(forecasts: any[], outcomes: any[]): AccuracyTrend[] {
    // Group forecasts by time periods
    const monthlyGroups = new Map<string, { accuracies: number[]; count: number }>();
    
    forecasts.forEach(forecast => {
      const date = new Date(forecast.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, { accuracies: [], count: 0 });
      }
      
      const group = monthlyGroups.get(monthKey)!;
      group.accuracies.push(forecast.accuracy_score || 0);
      group.count++;
    });

    const trends = Array.from(monthlyGroups.entries()).map(([period, data]) => ({
      period,
      accuracy: data.accuracies.reduce((sum, acc) => sum + acc, 0) / data.accuracies.length,
      improvement: 0, // Will be calculated below
      forecasts: data.count
    }));

    // Calculate improvement trends
    for (let i = 1; i < trends.length; i++) {
      trends[i].improvement = trends[i].accuracy - trends[i - 1].accuracy;
    }

    return trends;
  }

  private static analyzeUsagePatterns(forecasts: any[]): UsagePattern {
    const hours = forecasts.map(f => new Date(f.created_at).getHours());
    const peakHours = this.findPeakHours(hours);
    
    const dates = forecasts.map(f => new Date(f.created_at).toDateString());
    const uniqueDates = new Set(dates);
    const frequency = this.determineFrequency(forecasts.length, uniqueDates.size);
    
    const horizons = forecasts.map(f => f.time_horizon).filter(Boolean);
    const preferredTimeHorizon = this.findMostCommon(horizons);
    
    const complexity = this.assessComplexityPreference(forecasts);

    return {
      peakHours,
      frequency,
      averageSessionLength: 30, // Placeholder - would need session tracking
      preferredTimeHorizon,
      complexityPreference: complexity
    };
  }

  private static determineExperienceLevel(
    forecasts: any[], 
    modelPreferences: ModelPreference[]
  ): 'beginner' | 'intermediate' | 'expert' {
    const totalForecasts = forecasts.length;
    const avgAccuracy = forecasts.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / totalForecasts;
    const modelDiversity = modelPreferences.length;
    const advancedModelsUsed = modelPreferences.filter(mp => 
      ['ai_powered', 'ensemble', 'neural_network', 'prophet'].includes(mp.model)
    ).length;

    if (totalForecasts < 5 || avgAccuracy < 60) return 'beginner';
    if (totalForecasts >= 20 && avgAccuracy >= 75 && advancedModelsUsed >= 2) return 'expert';
    return 'intermediate';
  }

  private static determineForecastingStyle(
    forecasts: any[], 
    outcomes: any[]
  ): 'conservative' | 'aggressive' | 'balanced' {
    // Analyze prediction ranges and confidence intervals
    // This is a simplified heuristic
    const avgAccuracy = forecasts.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / forecasts.length;
    const modelVariety = new Set(forecasts.map(f => f.model)).size;
    
    if (avgAccuracy >= 80 && modelVariety <= 2) return 'conservative';
    if (avgAccuracy < 70 && modelVariety >= 4) return 'aggressive';
    return 'balanced';
  }

  private static identifyDomainExpertise(forecasts: any[]): string[] {
    const types = forecasts.map(f => f.type).filter(Boolean);
    const typeFrequency = new Map<string, number>();
    
    types.forEach(type => {
      typeFrequency.set(type, (typeFrequency.get(type) || 0) + 1);
    });
    
    return Array.from(typeFrequency.entries())
      .filter(([, count]) => count >= 3) // Minimum 3 forecasts to be considered expertise
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  private static assessSeasonalityAwareness(forecasts: any[]): boolean {
    // Check if user has created forecasts that handle seasonality
    return forecasts.some(forecast => {
      try {
        const dataPoints = JSON.parse(forecast.data_points || '[]');
        return dataPoints.length >= 12; // Assume seasonal awareness if using 12+ data points
      } catch {
        return false;
      }
    });
  }

  private static calculateDataQualityScore(forecasts: any[]): number {
    if (forecasts.length === 0) return 0;
    
    let qualitySum = 0;
    let validForecasts = 0;
    
    forecasts.forEach(forecast => {
      try {
        const dataPoints = JSON.parse(forecast.data_points || '[]');
        if (Array.isArray(dataPoints) && dataPoints.length > 0) {
          // Simple quality heuristics
          const hasEnoughData = dataPoints.length >= 10;
          const hasConsistentStructure = dataPoints.every(p => 
            p && (typeof p.value === 'number' || typeof p.y === 'number')
          );
          
          const quality = (hasEnoughData ? 0.6 : 0.3) + (hasConsistentStructure ? 0.4 : 0);
          qualitySum += quality;
          validForecasts++;
        }
      } catch (error) {
        // Invalid data structure
        qualitySum += 0.1;
        validForecasts++;
      }
    });
    
    return validForecasts > 0 ? qualitySum / validForecasts : 0;
  }

  private static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 1;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? stdDev / Math.abs(mean) : 0;
    
    return Math.max(0, 1 - cv); // Inverse of coefficient of variation
  }

  private static calculateVolatility(values: number[]): 'low' | 'medium' | 'high' {
    if (values.length < 2) return 'low';
    
    const consistency = this.calculateConsistency(values);
    
    if (consistency >= 0.8) return 'low';
    if (consistency >= 0.5) return 'medium';
    return 'high';
  }

  private static detectSeasonality(values: number[]): SeasonalityPattern | null {
    if (values.length < 12) return null;
    
    // Simple seasonality detection using autocorrelation
    const periods = [7, 12, 24, 52]; // Weekly, monthly, biannual, yearly patterns
    let bestPattern: SeasonalityPattern | null = null;
    let maxCorrelation = 0;
    
    periods.forEach(period => {
      if (values.length >= period * 2) {
        const correlation = this.calculateAutocorrelation(values, period);
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation;
          const typeMap: Record<number, SeasonalityPattern['type']> = {
            7: 'weekly',
            12: 'monthly',
            24: 'quarterly',
            52: 'yearly'
          };
          
          bestPattern = {
            type: typeMap[period] || 'monthly',
            strength: correlation,
            detected: correlation > 0.3
          };
        }
      }
    });
    
    return bestPattern;
  }

  private static calculateAutocorrelation(values: number[], lag: number): number {
    if (values.length <= lag) return 0;
    
    const n = values.length - lag;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }
    
    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    return denominator !== 0 ? numerator / denominator : 0;
  }

  private static detectTrend(values: number[]): 'upward' | 'downward' | 'stable' | 'cyclical' {
    if (values.length < 3) return 'stable';
    
    // Simple linear regression for trend detection
    const n = values.length;
    const xSum = n * (n - 1) / 2;
    const ySum = values.reduce((sum, v) => sum + v, 0);
    const xySum = values.reduce((sum, v, i) => sum + i * v, 0);
    const x2Sum = n * (n - 1) * (2 * n - 1) / 6;
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    
    const absSlope = Math.abs(slope);
    const mean = ySum / n;
    const relativeSlope = mean !== 0 ? absSlope / Math.abs(mean) : 0;
    
    if (relativeSlope < 0.05) return 'stable';
    if (slope > 0) return 'upward';
    if (slope < 0) return 'downward';
    
    return 'stable';
  }

  private static calculateOutlierFrequency(values: number[]): number {
    if (values.length < 4) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers = values.filter(v => v < lowerBound || v > upperBound);
    return outliers.length / values.length;
  }

  private static calculateRecommendationScore(
    template: any,
    userPattern: UserBehaviorPattern,
    dataPattern: DataPattern,
    context: any
  ): {
    total: number;
    confidence: number;
    expectedAccuracy: number;
    reasons: string[];
    adaptations: string[];
  } {
    let score = 0;
    const reasons: string[] = [];
    const adaptations: string[] = [];
    
    try {
      const config = JSON.parse(template.configuration);
      
      // Model preference matching (0-0.3)
      const modelPref = userPattern.modelPreferences.find(mp => mp.model === config.model);
      if (modelPref) {
        const modelScore = 0.3 * modelPref.confidence * modelPref.successRate;
        score += modelScore;
        if (modelPref.successRate > 0.7) {
          reasons.push(`Excellent track record with ${config.model.replace('_', ' ')}`);
        }
      }
      
      // Experience level compatibility (0-0.2)
      const modelComplexity = this.getModelComplexity(config.model);
      const experienceMatch = this.matchExperienceToComplexity(userPattern.experienceLevel, modelComplexity);
      score += 0.2 * experienceMatch;
      
      if (experienceMatch < 0.5 && userPattern.experienceLevel === 'beginner') {
        adaptations.push('Consider starting with simpler models');
      }
      
      // Data pattern compatibility (0-0.25)
      const dataCompatibility = this.assessDataCompatibility(config, dataPattern);
      score += 0.25 * dataCompatibility;
      
      if (dataPattern.seasonality?.detected && template.tags.includes('seasonal')) {
        reasons.push('Handles seasonal patterns in your data');
        score += 0.1;
      }
      
      // Context matching (0-0.15)
      if (context.accuracy_requirement === 'critical' && 
          ['ai_powered', 'ensemble', 'prophet'].includes(config.model)) {
        score += 0.15;
        reasons.push('High-accuracy model for critical requirements');
      }
      
      // Usage popularity bonus (0-0.1)
      if (template.usage_count > 5) {
        score += Math.min(0.1, template.usage_count / 100);
        reasons.push('Popular choice among users');
      }
      
      const confidence = Math.min(0.95, score + 0.1);
      const expectedAccuracy = this.estimateExpectedAccuracy(template, userPattern, dataPattern);
      
      return {
        total: Math.min(1, score),
        confidence,
        expectedAccuracy,
        reasons,
        adaptations
      };
      
    } catch (error) {
      return {
        total: 0,
        confidence: 0,
        expectedAccuracy: 0,
        reasons: ['Template configuration error'],
        adaptations: []
      };
    }
  }

  // Additional helper methods
  private static findPeakHours(hours: number[]): number[] {
    const hourCounts = new Array(24).fill(0);
    hours.forEach(hour => hourCounts[hour]++);
    
    const maxCount = Math.max(...hourCounts);
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count >= maxCount * 0.8)
      .map(({ hour }) => hour);
  }

  private static determineFrequency(totalForecasts: number, uniqueDays: number): UsagePattern['frequency'] {
    const avgPerDay = totalForecasts / uniqueDays;
    
    if (avgPerDay >= 1) return 'daily';
    if (avgPerDay >= 0.3) return 'weekly';
    if (avgPerDay >= 0.1) return 'monthly';
    return 'sporadic';
  }

  private static findMostCommon<T>(items: T[]): T[] {
    const frequency = new Map<T, number>();
    items.forEach(item => frequency.set(item, (frequency.get(item) || 0) + 1));
    
    const maxCount = Math.max(...frequency.values());
    return Array.from(frequency.entries())
      .filter(([, count]) => count >= maxCount * 0.8)
      .map(([item]) => item);
  }

  private static assessComplexityPreference(forecasts: any[]): UsagePattern['complexityPreference'] {
    const models = forecasts.map(f => f.model);
    const advancedModels = models.filter(m => 
      ['ai_powered', 'ensemble', 'neural_network', 'prophet'].includes(m)
    ).length;
    const simpleModels = models.filter(m => 
      ['linear_regression', 'exponential_smoothing'].includes(m)
    ).length;
    
    if (advancedModels > simpleModels) return 'advanced';
    if (simpleModels > advancedModels * 2) return 'simple';
    return 'moderate';
  }

  private static getModelComplexity(model: string): number {
    const complexityMap: Record<string, number> = {
      'linear_regression': 0.2,
      'exponential_smoothing': 0.3,
      'seasonal_decomposition': 0.4,
      'arima': 0.6,
      'prophet': 0.7,
      'neural_network': 0.8,
      'ensemble': 0.9,
      'ai_powered': 1.0
    };
    
    return complexityMap[model] || 0.5;
  }

  private static matchExperienceToComplexity(experience: string, complexity: number): number {
    const experienceScores = {
      'beginner': { optimal: 0.3, tolerance: 0.3 },
      'intermediate': { optimal: 0.6, tolerance: 0.4 },
      'expert': { optimal: 0.8, tolerance: 0.5 }
    };
    
    const userLevel = experienceScores[experience as keyof typeof experienceScores];
    const distance = Math.abs(complexity - userLevel.optimal);
    
    return Math.max(0, 1 - distance / userLevel.tolerance);
  }

  private static assessDataCompatibility(config: any, dataPattern: DataPattern): number {
    let compatibility = 0.5; // Base score
    
    // Size compatibility
    const minPoints = config.data_requirements?.minimum_points || 10;
    if (dataPattern.size === 'small' && minPoints <= 20) compatibility += 0.2;
    else if (dataPattern.size === 'large' && minPoints >= 30) compatibility += 0.2;
    else if (dataPattern.size === 'medium') compatibility += 0.1;
    
    // Volatility compatibility
    if (dataPattern.volatility === 'high' && 
        ['ensemble', 'ai_powered', 'neural_network'].includes(config.model)) {
      compatibility += 0.2;
    } else if (dataPattern.volatility === 'low' && 
               ['linear_regression', 'exponential_smoothing'].includes(config.model)) {
      compatibility += 0.1;
    }
    
    return Math.min(1, compatibility);
  }

  private static estimateExpectedAccuracy(
    template: any, 
    userPattern: UserBehaviorPattern, 
    dataPattern: DataPattern
  ): number {
    // Base accuracy from model preference
    let baseAccuracy = 70; // Default baseline
    
    try {
      const config = JSON.parse(template.configuration);
      const modelPref = userPattern.modelPreferences.find(mp => mp.model === config.model);
      if (modelPref) {
        baseAccuracy = modelPref.avgAccuracy;
      }
      
      // Adjust based on data quality
      const qualityMultiplier = 0.8 + (userPattern.dataQualityScore * 0.4);
      
      // Adjust based on experience
      const experienceMultiplier = userPattern.experienceLevel === 'expert' ? 1.1 :
                                  userPattern.experienceLevel === 'intermediate' ? 1.0 : 0.9;
      
      return Math.min(95, baseAccuracy * qualityMultiplier * experienceMultiplier);
    } catch {
      return baseAccuracy;
    }
  }
}