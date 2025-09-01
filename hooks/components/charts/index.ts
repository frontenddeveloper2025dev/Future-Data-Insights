export { InteractiveLineChart } from './InteractiveLineChart';
export { InteractiveScatterPlot } from './InteractiveScatterPlot';
export { Surface3DChart } from './Surface3DChart';
export { RadarChart } from './RadarChart';
export { AnimatedGauge } from './AnimatedGauge';

// Types
export type {
  InteractiveLineChartProps,
  InteractiveScatterPlotProps,
  Surface3DChartProps,
  RadarChartProps,
  AnimatedGaugeProps,
} from './types';

// Helper types for better TypeScript support
export interface ChartDataPoint {
  [key: string]: string | number | boolean | undefined;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color: string;
  visible?: boolean;
  opacity?: number;
}

export interface ChartTheme {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  background: string;
  foreground: string;
}