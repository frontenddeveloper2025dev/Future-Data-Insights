import { table } from '@devvai/devv-code-backend';

const FORECAST_MODELS_TABLE_ID = 'evn1jewwqy9s';

export interface ForecastModel {
  _id: string;
  name: string;
  category: 'statistical' | 'machine_learning' | 'ai_powered';
  description: string;
  parameters: string;
  is_active: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  best_for: string;
  created_at: string;
  _uid?: string;
  _tid?: string;
}

export const defaultModels = [
  {
    name: 'Linear Regression',
    category: 'statistical',
    description: 'Simple linear trend analysis perfect for data with clear upward or downward trends',
    parameters: JSON.stringify({
      method: 'least_squares',
      confidence_interval: 95,
      seasonality: false,
      polynomial_degree: 1
    }),
    is_active: 'true',
    complexity: 'beginner',
    best_for: 'Clear trends, simple forecasting, historical sales data',
    created_at: new Date().toISOString()
  },
  {
    name: 'Exponential Smoothing',
    category: 'statistical',
    description: 'Advanced statistical model that gives more weight to recent observations with trend and seasonal components',
    parameters: JSON.stringify({
      alpha: 0.3,
      beta: 0.1,
      gamma: 0.1,
      seasonal_periods: 12,
      trend: 'additive',
      seasonal: 'multiplicative'
    }),
    is_active: 'true',
    complexity: 'intermediate',
    best_for: 'Seasonal data, inventory forecasting, demand planning',
    created_at: new Date().toISOString()
  },
  {
    name: 'Moving Average',
    category: 'statistical',
    description: 'Simple moving average that smooths out fluctuations to identify trends',
    parameters: JSON.stringify({
      window_size: 3,
      weighted: false,
      center: false
    }),
    is_active: 'true',
    complexity: 'beginner',
    best_for: 'Noisy data, short-term trends, basic smoothing',
    created_at: new Date().toISOString()
  },
  {
    name: 'Polynomial Regression',
    category: 'statistical',
    description: 'Captures non-linear patterns using polynomial curves for complex trend analysis',
    parameters: JSON.stringify({
      degree: 2,
      regularization: 'ridge',
      alpha: 0.1
    }),
    is_active: 'true',
    complexity: 'intermediate',
    best_for: 'Non-linear trends, curved patterns, growth acceleration',
    created_at: new Date().toISOString()
  },
  {
    name: 'AI Neural Network',
    category: 'ai_powered',
    description: 'Deep learning model that can capture complex patterns and non-linear relationships',
    parameters: JSON.stringify({
      layers: [64, 32, 16, 1],
      epochs: 150,
      learning_rate: 0.001,
      dropout: 0.2,
      activation: 'relu',
      optimizer: 'adam'
    }),
    is_active: 'true',
    complexity: 'advanced',
    best_for: 'Complex patterns, large datasets, multi-variable forecasting',
    created_at: new Date().toISOString()
  },
  {
    name: 'ARIMA Model',
    category: 'statistical',
    description: 'AutoRegressive Integrated Moving Average for time series with trends and seasonality',
    parameters: JSON.stringify({
      p: 2,
      d: 1,
      q: 2,
      seasonal: true,
      seasonal_periods: 12,
      information_criterion: 'aic'
    }),
    is_active: 'true',
    complexity: 'advanced',
    best_for: 'Financial forecasting, economic indicators, weather prediction',
    created_at: new Date().toISOString()
  },
  {
    name: 'Random Forest',
    category: 'machine_learning',
    description: 'Ensemble method using multiple decision trees for robust predictions',
    parameters: JSON.stringify({
      n_estimators: 100,
      max_depth: 10,
      min_samples_split: 2,
      random_state: 42
    }),
    is_active: 'true',
    complexity: 'advanced',
    best_for: 'Mixed data types, feature interactions, robust predictions',
    created_at: new Date().toISOString()
  },
  {
    name: 'Seasonal Decompose',
    category: 'statistical',
    description: 'Separates trend, seasonal, and residual components for detailed analysis',
    parameters: JSON.stringify({
      model: 'additive',
      period: 12,
      two_sided: true,
      extrapolate_trend: 'freq'
    }),
    is_active: 'true',
    complexity: 'intermediate',
    best_for: 'Seasonal patterns, component analysis, cyclical data',
    created_at: new Date().toISOString()
  }
];

export async function initializeDefaultModels() {
  try {
    // Check if models already exist
    const existing = await table.getItems(FORECAST_MODELS_TABLE_ID, { limit: 1 });
    if (existing.items.length > 0) {
      return; // Models already initialized
    }

    // Add default models
    for (const model of defaultModels) {
      await table.addItem(FORECAST_MODELS_TABLE_ID, model);
    }
    
    console.log('Default forecast models initialized successfully');
  } catch (error) {
    console.error('Failed to initialize default models:', error);
  }
}

export async function getForecastModels() {
  try {
    const response = await table.getItems(FORECAST_MODELS_TABLE_ID);
    return response.items;
  } catch (error) {
    console.error('Failed to fetch forecast models:', error);
    return [];
  }
}