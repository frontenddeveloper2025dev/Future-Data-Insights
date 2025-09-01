import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface GaugeThreshold {
  value: number;
  color: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnimatedGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  subtitle?: string;
  unit?: string;
  thresholds?: GaugeThreshold[];
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  animationDuration?: number;
  showTrend?: boolean;
  trendValue?: number;
  showTarget?: boolean;
  targetValue?: number;
}

export const AnimatedGauge: React.FC<AnimatedGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  title = "KPI Gauge",
  subtitle,
  unit = "%",
  thresholds = [
    { value: 30, color: "#ef4444", label: "Poor", icon: <AlertTriangle className="w-3 h-3" /> },
    { value: 70, color: "#f59e0b", label: "Fair", icon: <Target className="w-3 h-3" /> },
    { value: 90, color: "#10b981", label: "Good", icon: <CheckCircle className="w-3 h-3" /> },
    { value: 100, color: "#059669", label: "Excellent", icon: <Zap className="w-3 h-3" /> },
  ],
  size = 'md',
  showProgress = true,
  animationDuration = 2000,
  showTrend = false,
  trendValue = 0,
  showTarget = false,
  targetValue = 80,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Normalize value
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Size configurations
  const sizes = {
    sm: { radius: 60, strokeWidth: 8, fontSize: '1.5rem', height: 160 },
    md: { radius: 80, strokeWidth: 12, fontSize: '2rem', height: 200 },
    lg: { radius: 100, strokeWidth: 16, fontSize: '2.5rem', height: 240 },
  };
  
  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDasharray = circumference;
  
  // Motion values for smooth animation
  const motionValue = useMotionValue(0);
  const animatedValue = useSpring(motionValue, { 
    duration: animationDuration,
    bounce: 0.1 
  });
  
  const strokeDashoffset = useTransform(
    animatedValue,
    [0, 100],
    [circumference, circumference * 0.25] // 75% of circle (270 degrees)
  );
  
  const displayValue = useTransform(animatedValue, (v) => Math.round(v));
  
  // Determine current status based on thresholds
  const currentStatus = useMemo(() => {
    const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
    return sortedThresholds.find(threshold => percentage <= threshold.value) || sortedThresholds[sortedThresholds.length - 1];
  }, [percentage, thresholds]);
  
  // Calculate trend
  const trend = showTrend && trendValue !== 0 ? (trendValue > 0 ? 'up' : 'down') : null;
  
  // Animate to target value on mount
  useEffect(() => {
    if (isAnimating) {
      motionValue.set(percentage);
    }
  }, [percentage, motionValue, isAnimating]);
  
  // Target indicator position
  const targetPercentage = showTarget ? ((targetValue - min) / (max - min)) * 100 : 0;
  const targetAngle = (targetPercentage / 100) * 270 - 135; // Convert to SVG rotation
  
  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      
      <div className="relative inline-block" style={{ height: config.height }}>
        {/* Main Gauge */}
        <svg
          width={config.radius * 2 + config.strokeWidth * 2}
          height={config.radius * 2 + config.strokeWidth * 2}
          className="transform -rotate-45"
        >
          {/* Background Arc */}
          <circle
            cx={config.radius + config.strokeWidth}
            cy={config.radius + config.strokeWidth}
            r={config.radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          
          {/* Threshold Arcs */}
          {thresholds.map((threshold, index) => {
            const prevThreshold = index > 0 ? thresholds[index - 1].value : 0;
            const arcLength = ((threshold.value - prevThreshold) / 100) * circumference * 0.75;
            const startOffset = circumference * 0.25 + ((prevThreshold / 100) * circumference * 0.75);
            
            return (
              <circle
                key={index}
                cx={config.radius + config.strokeWidth}
                cy={config.radius + config.strokeWidth}
                r={config.radius}
                fill="none"
                stroke={threshold.color}
                strokeWidth={config.strokeWidth * 0.3}
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                strokeDashoffset={circumference - startOffset}
                opacity={0.6}
              />
            );
          })}
          
          {/* Value Arc */}
          <motion.circle
            cx={config.radius + config.strokeWidth}
            cy={config.radius + config.strokeWidth}
            r={config.radius}
            fill="none"
            stroke={currentStatus.color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.3))',
            }}
          />
          
          {/* Target Indicator */}
          {showTarget && (
            <g transform={`translate(${config.radius + config.strokeWidth}, ${config.radius + config.strokeWidth})`}>
              <line
                x1={0}
                y1={-config.radius - config.strokeWidth * 0.5}
                x2={0}
                y2={-config.radius + config.strokeWidth * 0.5}
                stroke="hsl(var(--destructive))"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${targetAngle})`}
                opacity={0.8}
              />
              <circle
                r="4"
                fill="hsl(var(--destructive))"
                transform={`translate(0, ${-config.radius}) rotate(${targetAngle})`}
              />
            </g>
          )}
        </svg>
        
        {/* Center Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="font-bold"
            style={{ 
              fontSize: config.fontSize,
              color: currentStatus.color,
            }}
          >
            <motion.span>{displayValue}</motion.span>{unit}
          </motion.div>
          
          <div className="flex items-center gap-2 mt-1">
            {currentStatus.icon}
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ borderColor: currentStatus.color }}
            >
              {currentStatus.label}
            </Badge>
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trendValue).toFixed(1)}{unit}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar Alternative */}
      {showProgress && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
          />
        </div>
      )}
      
      {/* Target Information */}
      {showTarget && (
        <div className="mt-4 text-xs text-muted-foreground">
          Target: {targetValue}{unit} 
          {percentage >= targetPercentage ? (
            <CheckCircle className="inline w-3 h-3 ml-1 text-green-600" />
          ) : (
            <Target className="inline w-3 h-3 ml-1" />
          )}
        </div>
      )}
      
      {/* Threshold Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {thresholds.map((threshold, index) => {
          const prevValue = index > 0 ? thresholds[index - 1].value : min;
          const isActive = percentage > prevValue && percentage <= threshold.value;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                isActive ? 'bg-muted' : 'opacity-60'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: threshold.color }}
              />
              <span className="flex-1">{threshold.label}</span>
              <span>{prevValue === min ? `${min}-` : `${prevValue}-`}{threshold.value}{unit}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};