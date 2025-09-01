import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getForecastModels } from '@/lib/forecast-models';
import { Brain, TrendingUp, BarChart3, Zap, Activity, Cpu, Target, Star, CheckCircle } from 'lucide-react';

interface Model {
  _id: string;
  name: string;
  category: string;
  description: string;
  complexity: string;
  best_for: string;
  parameters: string;
}

interface DataPoint {
  date: string;
  value: number;
}

interface ModelSelectorProps {
  onModelSelect: (model: Model) => void;
  selectedModel: Model | null;
  dataPoints?: DataPoint[];
  forecastType?: string;
}

const categoryIcons = {
  statistical: TrendingUp,
  machine_learning: BarChart3,
  ai_powered: Brain
};

const categoryColors = {
  statistical: 'bg-blue-100 text-blue-800',
  machine_learning: 'bg-purple-100 text-purple-800',
  ai_powered: 'bg-emerald-100 text-emerald-800'
};

const categoryDescriptions = {
  statistical: 'Traditional mathematical models',
  machine_learning: 'Algorithm-based learning models',
  ai_powered: 'Advanced neural network models'
};

const complexityColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export function ModelSelector({ onModelSelect, selectedModel, dataPoints, forecastType }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const modelData = await getForecastModels();
      setModels(modelData as Model[]);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate model compatibility score based on data characteristics
  const calculateModelScore = (model: Model): number => {
    if (!dataPoints || dataPoints.length < 3) return 70; // Default score
    
    const values = dataPoints.map(d => d.value);
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const volatility = (stdDev / mean) * 100;
    
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(n/2));
    const secondHalf = values.slice(Math.ceil(n/2));
    const firstMean = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trendStrength = Math.abs((secondMean - firstMean) / firstMean) * 100;
    
    let score = 70; // Base score
    
    // Model-specific scoring logic
    switch (model.name) {
      case 'Linear Regression':
        score += trendStrength > 10 ? 20 : 0; // Good for trending data
        score += volatility < 20 ? 10 : -10; // Better for stable data
        break;
        
      case 'Random Forest':
      case 'AI Neural Network':
        score += volatility > 20 ? 15 : 0; // Better for volatile data
        score += n > 20 ? 10 : -5; // Needs more data
        break;
        
      case 'Moving Average':
        score += volatility < 30 ? 15 : -10; // Good for moderate volatility
        score += trendStrength < 15 ? 10 : 0; // Better for stable trends
        break;
        
      case 'ARIMA Model':
        score += n > 12 ? 15 : -10; // Needs sufficient data
        score += trendStrength > 5 ? 10 : 0; // Good for trending data
        break;
        
      case 'Seasonal Decompose':
        score += forecastType === 'sales' || forecastType === 'revenue' ? 15 : 0;
        score += n > 24 ? 10 : -5; // Needs seasonal data
        break;
        
      case 'Exponential Smoothing':
        score += trendStrength > 5 && trendStrength < 25 ? 15 : 0;
        score += volatility < 25 ? 10 : 0;
        break;
    }
    
    return Math.min(95, Math.max(40, score));
  };
  
  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(model => model.category === selectedCategory);
    
  const categories = ['all', ...Array.from(new Set(models.map(m => m.category)))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Models...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Choose Forecasting Model
        </CardTitle>
        <div className="space-y-3">
          {dataPoints && dataPoints.length >= 3 && (
            <div className="text-sm text-muted-foreground">
              🔍 Models are ranked by compatibility with your data patterns
            </div>
          )}
          <div className="flex gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Models' : category.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredModels.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No models found for this category
          </div>
        )}
        {filteredModels.map((model) => {
          const IconComponent = categoryIcons[model.category as keyof typeof categoryIcons] || Zap;
          const isSelected = selectedModel?._id === model._id;
          const compatibilityScore = calculateModelScore(model);
          const isRecommended = compatibilityScore >= 85;
          
          return (
            <Card 
              key={model._id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary shadow-md' : ''
              } ${isRecommended ? 'bg-gradient-to-r from-green-50 to-emerald-50' : ''}`}
              onClick={() => onModelSelect(model)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold flex items-center gap-1">
                        {model.name}
                        {isRecommended && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </h3>
                      <Badge 
                        variant="secondary"
                        className={complexityColors[model.complexity as keyof typeof complexityColors]}
                      >
                        {model.complexity}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={categoryColors[model.category as keyof typeof categoryColors]}
                      >
                        {model.category.replace('_', ' ')}
                      </Badge>
                      {isRecommended && (
                        <Badge variant="default" className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {model.description}
                    </p>
                    
                    {/* Compatibility Score */}
                    {dataPoints && dataPoints.length >= 3 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Data Compatibility</span>
                          <span className={`font-medium ${
                            compatibilityScore >= 80 ? 'text-green-600' :
                            compatibilityScore >= 65 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {compatibilityScore}%
                          </span>
                        </div>
                        <Progress 
                          value={compatibilityScore} 
                          className="h-1.5"
                        />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      <strong>Best for:</strong> {model.best_for}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}