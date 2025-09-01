// Interactive Line Chart Types
export interface InteractiveLineChartProps {
  data: Array<{
    date: string;
    value: number;
    forecast?: number;
    confidence_upper?: number;
    confidence_lower?: number;
    [key: string]: any;
  }>;
  title?: string;
  height?: number;
  showBrush?: boolean;
  showConfidence?: boolean;
  animationDuration?: number;
  onPointClick?: (data: any) => void;
}

// Interactive Scatter Plot Types
export interface InteractiveScatterPlotProps {
  data: Array<{
    x: number;
    y: number;
    z?: number;
    category?: string;
    label?: string;
    accuracy?: number;
    model?: string;
    [key: string]: any;
  }>;
  title?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  enableClustering?: boolean;
  showRegression?: boolean;
  colorByCategory?: boolean;
}

// Surface 3D Chart Types
export interface Surface3DChartProps {
  data: Array<{
    x: number;
    y: number;
    z: number;
    category?: string;
  }>;
  title?: string;
  height?: number;
  gridSize?: number;
  colorScheme?: 'viridis' | 'plasma' | 'magma' | 'thermal';
  showContours?: boolean;
  interactive?: boolean;
}

// Radar Chart Types
export interface RadarChartProps {
  data: Array<{
    [key: string]: number | string;
  }>;
  series?: Array<{
    name: string;
    data: Array<{ [key: string]: number | string }>;
    color: string;
    visible: boolean;
    opacity: number;
  }>;
  title?: string;
  height?: number;
  axes?: string[];
  maxValue?: number;
  showGrid?: boolean;
  gridLevels?: number;
  animate?: boolean;
}

// Animated Gauge Types
export interface AnimatedGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  subtitle?: string;
  unit?: string;
  thresholds?: Array<{
    value: number;
    color: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  animationDuration?: number;
  showTrend?: boolean;
  trendValue?: number;
  showTarget?: boolean;
  targetValue?: number;
}