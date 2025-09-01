import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { DataInputForm } from '@/components/forecast/DataInputForm';
import { ModelSelector } from '@/components/forecast/ModelSelector';
import { ForecastChart } from '@/components/forecast/ForecastChart';
import { ForecastAnalytics } from '@/components/forecast/ForecastAnalytics';
import { ForecastAnalyzer } from '@/components/forecast/ForecastAnalyzer';
import { ModelPerformanceInsights } from '@/components/forecast/ModelPerformanceInsights';
import { ResultsSummary } from '@/components/forecast/ResultsSummary';
import OutcomeTracker from '@/components/forecast/OutcomeTracker';
import { initializeDefaultModels } from '@/lib/forecast-models';
import { table } from '@devvai/devv-code-backend';

interface DataPoint {
  date: string;
  value: number;
}

interface Model {
  _id: string;
  name: string;
  category: string;
  description: string;
  complexity: string;
  best_for: string;
  parameters: string;
}

export default function ForecastPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'data' | 'model' | 'results'>('data');
  const [forecastData, setForecastData] = useState<{
    title: string;
    type: string;
    timeHorizon: string;
    dataPoints: DataPoint[];
  } | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [predictions, setPredictions] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedAccuracy, setSavedAccuracy] = useState<number>(0);
  const [savedForecastId, setSavedForecastId] = useState<string>('');
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  useEffect(() => {
    // Initialize default models on component mount
    initializeDefaultModels();
  }, []);

  const handleDataSubmit = (data: typeof forecastData) => {
    setForecastData(data);
    setShowAnalyzer(true); // Show analyzer after data input
    
    toast({
      title: 'Data Analysis Complete!',
      description: `Processed ${data.dataPoints.length} data points. AI insights are now available.`,
    });
    
    setStep('model');
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
  };

  const calculateBasicStats = (data: DataPoint[]) => {
    const values = data.map(d => d.value);
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Calculate trend
    let trend = 0;
    if (n > 1) {
      const firstHalf = values.slice(0, Math.floor(n/2));
      const secondHalf = values.slice(Math.ceil(n/2));
      const firstMean = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondMean = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      trend = (secondMean - firstMean) / firstMean;
    }
    
    return { mean, stdDev, trend, n };
  };

  const generateMockPredictions = (historicalData: DataPoint[], model: Model) => {
    const stats = calculateBasicStats(historicalData);
    const lastPoint = historicalData[historicalData.length - 1];
    const predictions: DataPoint[] = [];
    const baseDate = new Date(lastPoint.date);
    const forecastPeriods = 6;
    
    for (let i = 1; i <= forecastPeriods; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      let predictedValue = lastPoint.value;
      
      switch (model.name) {
        case 'Linear Regression':
          predictedValue = lastPoint.value + (stats.trend * stats.mean * i);
          break;
          
        case 'Moving Average':
          const windowSize = 3;
          const recentValues = historicalData.slice(-windowSize).map(d => d.value);
          const movingAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
          predictedValue = movingAvg * (1 + stats.trend * i * 0.5);
          break;
          
        case 'Exponential Smoothing':
          const alpha = 0.3;
          const smoothed = lastPoint.value;
          predictedValue = smoothed * Math.pow(1 + stats.trend, i) * (0.85 + Math.random() * 0.3);
          break;
          
        case 'Polynomial Regression':
          // Quadratic polynomial
          const a = stats.trend * 0.001;
          const b = stats.trend;
          const c = lastPoint.value;
          predictedValue = a * Math.pow(i, 2) + b * i + c;
          break;
          
        case 'AI Neural Network':
          // Simulate neural network with non-linear activation
          const input = stats.trend + i * 0.1;
          const hidden1 = Math.tanh(input * 0.5);
          const hidden2 = 1 / (1 + Math.exp(-(hidden1 + stats.trend))); // sigmoid function
          predictedValue = lastPoint.value * (1 + hidden2 * stats.trend * i + Math.sin(i * 0.3) * 0.1);
          break;
          
        case 'ARIMA Model':
          // Autoregressive component
          const ar = 0.7;
          const ma = 0.3;
          predictedValue = lastPoint.value * ar + stats.mean * ma + stats.trend * stats.mean * i * 0.8;
          break;
          
        case 'Random Forest':
          // Ensemble of decision trees simulation
          const trees = 5;
          let ensemble = 0;
          for (let t = 0; t < trees; t++) {
            const treePredict = lastPoint.value * (1 + stats.trend * i + (Math.random() - 0.5) * 0.2);
            ensemble += treePredict;
          }
          predictedValue = ensemble / trees;
          break;
          
        case 'Seasonal Decompose':
          // Seasonal component (assuming monthly seasonality)
          const seasonalFactor = 1 + 0.1 * Math.sin((i * 2 * Math.PI) / 12);
          predictedValue = (lastPoint.value + stats.trend * stats.mean * i) * seasonalFactor;
          break;
          
        default:
          predictedValue = lastPoint.value * (1 + stats.trend * i);
      }
      
      // Add some realistic noise based on historical volatility
      const noise = (Math.random() - 0.5) * stats.stdDev * 0.1;
      predictedValue = Math.max(0, predictedValue + noise);
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        value: Math.round(predictedValue * 100) / 100 // Round to 2 decimal places
      });
    }
    
    return predictions;
  };
  
  // Helper function for sigmoid activation
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  const handleGenerateForecast = async () => {
    if (!forecastData || !selectedModel) return;
    
    setLoading(true);
    try {
      // Generate predictions
      const mockPredictions = generateMockPredictions(forecastData.dataPoints, selectedModel);
      setPredictions(mockPredictions);
      
      // Save forecast to database
      const accuracyScore = Math.round((75 + Math.random() * 20) * 100) / 100;
      setSavedAccuracy(accuracyScore);
      
      const forecastRecord = {
        title: forecastData.title,
        type: forecastData.type,
        model: selectedModel.name,
        data_points: JSON.stringify(forecastData.dataPoints),
        predictions: JSON.stringify(mockPredictions),
        accuracy_score: accuracyScore, // Mock accuracy 75-95%
        time_horizon: forecastData.timeHorizon,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const result = await table.addItem('evn1j5kjx62o', forecastRecord);
      setSavedForecastId(result.item._id);
      
      setStep('results');
      
      toast({
        title: 'Forecast Generated Successfully!',
        description: `Created ${forecastData.title} using ${selectedModel.name}`,
      });
      
    } catch (error) {
      toast({
        title: 'Forecast Generation Failed',
        description: 'Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'data':
        return (
          <div className="space-y-6">
            <DataInputForm onDataSubmit={handleDataSubmit} />
          </div>
        );
      
      case 'model':
        return (
          <div className="space-y-6">
            {/* Contextual Analysis Panel for Model Selection */}
            {forecastData && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Model Recommendations
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAnalyzer(!showAnalyzer)}
                  >
                    {showAnalyzer ? 'Hide' : 'Show'} Insights
                  </Button>
                </div>
                
                {showAnalyzer && (
                  <div className="space-y-4">
                    <ForecastAnalyzer 
                      dataPoints={forecastData.dataPoints}
                      forecastType={forecastData.type}
                      onSuggestTemplate={(templateId) => {
                        toast({
                          title: 'Smart Template Suggested',
                          description: 'AI has identified an optimal template configuration for your data pattern.',
                        });
                      }}
                    />
                    
                    {/* Model Selection Guidance */}
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Model Selection Guidance</span>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        {(() => {
                          const stats = calculateBasicStats(forecastData.dataPoints);
                          const volatility = (stats.stdDev / stats.mean) * 100;
                          const suggestions = [];
                          
                          if (Math.abs(stats.trend) > 0.2) {
                            suggestions.push('Strong trend detected - Linear Regression or ARIMA recommended');
                          }
                          if (volatility > 30) {
                            suggestions.push('High volatility - Consider Random Forest or Neural Network');
                          }
                          if (forecastData.dataPoints.length > 24) {
                            suggestions.push('Rich dataset - Complex models like Neural Networks will perform well');
                          }
                          if (forecastData.type === 'sales' || forecastData.type === 'revenue') {
                            suggestions.push('Business data - Seasonal Decompose may capture periodic patterns');
                          }
                          
                          return suggestions.length > 0 ? suggestions : ['Select any model - your data is suitable for most forecasting approaches'];
                        })().map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-600 rounded-full" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <ModelSelector 
              onModelSelect={handleModelSelect}
              selectedModel={selectedModel}
              dataPoints={forecastData.dataPoints}
              forecastType={forecastData.type}
            />
            
            {forecastData && (
              <ForecastChart 
                historical={forecastData.dataPoints}
                title={`${forecastData.title} - Historical Data`}
              />
            )}
            
            {selectedModel && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleGenerateForecast} 
                  disabled={loading}
                  size="lg"
                  className="gap-2"
                >
                  {loading ? (
                    <>Generating Forecast...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      
      case 'results':
        return (
          <div className="space-y-6">
            {/* Enhanced Results Summary */}
            {forecastData && selectedModel && (
              <ResultsSummary
                forecastData={forecastData}
                selectedModel={selectedModel}
                predictions={predictions}
                accuracy={savedAccuracy}
              />
            )}
            {forecastData && (
              <ForecastChart 
                historical={forecastData.dataPoints}
                predictions={predictions}
                title={`${forecastData.title} - Complete Forecast`}
              />
            )}
            
            {/* Model Performance Insights */}
            {forecastData && selectedModel && (
              <ModelPerformanceInsights
                modelName={selectedModel.name}
                accuracy={savedAccuracy}
                dataPoints={forecastData.dataPoints.length}
                forecastHorizon={predictions.length}
                volatility={(() => {
                  const values = forecastData.dataPoints.map(d => d.value);
                  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                  const stdDev = Math.sqrt(
                    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
                  );
                  return (stdDev / mean) * 100;
                })()}
                trend={(() => {
                  const values = forecastData.dataPoints.map(d => d.value);
                  return values.length > 1 
                    ? ((values[values.length - 1] - values[0]) / values[0]) * 100
                    : 0;
                })()}
                onModelRecommendation={(recommendations) => {
                  toast({
                    title: 'Smart Recommendations Available',
                    description: `Generated ${recommendations.length} optimization suggestions`,
                  });
                }}
              />
            )}

            {/* Comprehensive Forecast Analytics */}
            {forecastData && selectedModel && (
              <ForecastAnalytics
                historical={forecastData.dataPoints}
                predictions={predictions}
                modelName={selectedModel.name}
                accuracy={savedAccuracy}
                forecastTitle={forecastData.title}
                forecastType={forecastData.type}
              />
            )}
            
            {/* Outcome Tracking System */}
            {forecastData && selectedModel && savedForecastId && (
              <OutcomeTracker
                forecastId={savedForecastId}
                predictions={predictions}
                forecastTitle={forecastData.title}
                modelName={selectedModel.name}
              />
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Create New Forecast
                </h1>
                <p className="text-slate-600">
                  Step {step === 'data' ? '1' : step === 'model' ? '2' : '3'} of 3: {
                    step === 'data' ? 'Input Data' : 
                    step === 'model' ? 'Select Model' : 'Review Results'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}