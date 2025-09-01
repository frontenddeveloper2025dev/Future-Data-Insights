import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  InteractiveLineChart,
  InteractiveScatterPlot,
  Surface3DChart,
  RadarChart,
  AnimatedGauge,
} from '@/components/charts';
import {
  BarChart3,
  LineChart as LineChartIcon,
  Boxes,
  Radar as RadarIcon,
  Gauge,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

export const AdvancedChartsPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('line');

  // Generate sample data for demonstrations
  const sampleLineData = useMemo(() => {
    const data = [];
    const baseValue = 100;
    let currentValue = baseValue;
    
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (50 - i));
      
      // Add some realistic variation
      const change = (Math.random() - 0.5) * 10;
      currentValue += change;
      
      // Add forecast data for last 10 points
      const forecast = i >= 40 ? currentValue + (Math.random() - 0.5) * 5 : undefined;
      const confidence_upper = forecast ? forecast + Math.random() * 10 : undefined;
      const confidence_lower = forecast ? forecast - Math.random() * 10 : undefined;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, currentValue),
        forecast,
        confidence_upper,
        confidence_lower,
      });
    }
    
    return data;
  }, []);

  const sampleScatterData = useMemo(() => {
    const categories = ['Model A', 'Model B', 'Model C', 'Model D'];
    const data = [];
    
    for (let i = 0; i < 100; i++) {
      data.push({
        x: Math.random() * 100,
        y: Math.random() * 100 + (Math.random() - 0.5) * 20,
        z: Math.random() * 10 + 5,
        category: categories[Math.floor(Math.random() * categories.length)],
        accuracy: 0.7 + Math.random() * 0.3,
        model: `Model-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
        label: `Point ${i + 1}`,
      });
    }
    
    return data;
  }, []);

  const sample3DData = useMemo(() => {
    const data = [];
    
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = Math.sin(x / 10) * Math.cos(y / 10) * 20 + Math.random() * 10;
      
      data.push({ x, y, z });
    }
    
    return data;
  }, []);

  const sampleRadarData = useMemo(() => {
    return [
      {
        accuracy: 85,
        speed: 92,
        reliability: 78,
        efficiency: 88,
        scalability: 75,
        usability: 90,
      },
      {
        accuracy: 72,
        speed: 85,
        reliability: 95,
        efficiency: 70,
        scalability: 88,
        usability: 80,
      },
    ];
  }, []);

  const radarSeries = [
    {
      name: 'Current Model',
      data: sampleRadarData.slice(0, 1),
      color: 'hsl(var(--chart-1))',
      visible: true,
      opacity: 0.3,
    },
    {
      name: 'Baseline Model',
      data: sampleRadarData.slice(1, 2),
      color: 'hsl(var(--chart-2))',
      visible: true,
      opacity: 0.3,
    },
  ];

  const gaugeData = [
    { title: 'Accuracy Score', value: 87.5, target: 85, trend: 2.3 },
    { title: 'Processing Speed', value: 94.2, target: 90, trend: -1.1 },
    { title: 'Resource Usage', value: 67.8, target: 70, trend: 4.5 },
    { title: 'User Satisfaction', value: 91.3, target: 88, trend: 0.8 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Advanced Interactive Charts</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore cutting-edge data visualization components with interactive features,
          real-time animations, and advanced analytical capabilities.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Interactive
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Animated
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            3D Capable
          </Badge>
        </div>
      </motion.div>

      {/* Chart Showcase */}
      <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="line" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            Interactive Line
          </TabsTrigger>
          <TabsTrigger value="scatter" className="flex items-center gap-2">
            <Boxes className="w-4 h-4" />
            Scatter Plot
          </TabsTrigger>
          <TabsTrigger value="surface" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            3D Surface
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center gap-2">
            <RadarIcon className="w-4 h-4" />
            Radar Chart
          </TabsTrigger>
          <TabsTrigger value="gauges" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Gauges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="line" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Interactive Line Chart</h3>
              <p className="text-muted-foreground">
                Advanced line chart with zooming, brushing, confidence intervals, and interactive tooltips.
                Features real-time data updates and smooth animations.
              </p>
            </div>
            <InteractiveLineChart
              data={sampleLineData}
              title="Forecast Performance Over Time"
              height={400}
              showBrush={true}
              showConfidence={true}
              animationDuration={1200}
              onPointClick={(data) => console.log('Point clicked:', data)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Interactive Scatter Plot</h3>
              <p className="text-muted-foreground">
                Multi-dimensional scatter plot with clustering analysis, regression lines,
                and category-based coloring. Supports point selection and statistical analysis.
              </p>
            </div>
            <InteractiveScatterPlot
              data={sampleScatterData}
              title="Model Performance Analysis"
              height={400}
              xLabel="Prediction Accuracy (%)"
              yLabel="Processing Speed (ops/sec)"
              enableClustering={true}
              showRegression={true}
              colorByCategory={true}
            />
          </Card>
        </TabsContent>

        <TabsContent value="surface" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">3D Surface Visualization</h3>
              <p className="text-muted-foreground">
                Interactive 3D surface plot with rotation controls, multiple color schemes,
                and lighting effects. Perfect for visualizing complex multi-dimensional relationships.
              </p>
            </div>
            <Surface3DChart
              data={sample3DData}
              title="Performance Landscape"
              height={500}
              gridSize={25}
              colorScheme="viridis"
              showContours={true}
              interactive={true}
            />
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Multi-Series Radar Chart</h3>
              <p className="text-muted-foreground">
                Advanced radar chart for comparing multiple models across various metrics.
                Features series toggling, rotation controls, and statistical analysis.
              </p>
            </div>
            <RadarChart
              data={sampleRadarData}
              series={radarSeries}
              title="Model Performance Comparison"
              height={400}
              axes={['accuracy', 'speed', 'reliability', 'efficiency', 'scalability', 'usability']}
              maxValue={100}
              showGrid={true}
              gridLevels={5}
              animate={true}
            />
          </Card>
        </TabsContent>

        <TabsContent value="gauges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gaugeData.map((gauge, index) => (
              <motion.div
                key={gauge.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedGauge
                  value={gauge.value}
                  title={gauge.title}
                  subtitle="Real-time KPI tracking"
                  unit="%"
                  size="md"
                  showProgress={true}
                  animationDuration={2000 + index * 200}
                  showTrend={true}
                  trendValue={gauge.trend}
                  showTarget={true}
                  targetValue={gauge.target}
                />
              </motion.div>
            ))}
          </div>
          
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Animated Performance Gauges</h3>
              <p className="text-muted-foreground">
                Real-time KPI tracking with animated gauges, trend indicators, target lines,
                and threshold-based color coding. Perfect for dashboards and monitoring systems.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="p-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Interactive Controls</h3>
          <p className="text-sm text-muted-foreground">
            Zoom, pan, rotate, and filter data with intuitive interactive controls
            and real-time responsiveness.
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Built-in clustering, regression analysis, statistical calculations,
            and trend detection capabilities.
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Cutting-Edge Design</h3>
          <p className="text-sm text-muted-foreground">
            Modern design with smooth animations, multiple themes,
            and responsive layouts for all devices.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};