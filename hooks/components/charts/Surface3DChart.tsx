import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface Surface3DDataPoint {
  x: number;
  y: number;
  z: number;
  category?: string;
}

interface Surface3DChartProps {
  data: Surface3DDataPoint[];
  title?: string;
  height?: number;
  gridSize?: number;
  colorScheme?: 'viridis' | 'plasma' | 'magma' | 'thermal';
  showContours?: boolean;
  interactive?: boolean;
}

export const Surface3DChart: React.FC<Surface3DChartProps> = ({
  data,
  title = "3D Surface Chart",
  height = 500,
  gridSize = 20,
  colorScheme = 'viridis',
  showContours = true,
  interactive = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rotationX, setRotationX] = useState(45);
  const [rotationY, setRotationY] = useState(45);
  const [scale, setScale] = useState(1);
  const [perspective, setPerspective] = useState(500);
  const [lightAngle, setLightAngle] = useState(45);
  const [isAnimating, setIsAnimating] = useState(false);

  // Color schemes
  const colorSchemes = {
    viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],
    plasma: ['#0c0787', '#40039c', '#6a00a7', '#8f0da4', '#b83289', '#db5c68', '#f48849', '#fec287', '#fcffa4'],
    magma: ['#000003', '#1c1044', '#4f127b', '#812581', '#b5367a', '#e55964', '#fb8861', '#fec287', '#fcffa4'],
    thermal: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#ffffff', '#ffaa00', '#ff6600', '#ff0000', '#800000'],
  };

  // Create interpolated grid from scattered data
  const gridData = useMemo(() => {
    if (data.length === 0) return [];

    const xMin = Math.min(...data.map(d => d.x));
    const xMax = Math.max(...data.map(d => d.x));
    const yMin = Math.min(...data.map(d => d.y));
    const yMax = Math.max(...data.map(d => d.y));
    const zMin = Math.min(...data.map(d => d.z));
    const zMax = Math.max(...data.map(d => d.z));

    const grid: Array<Array<{ x: number; y: number; z: number; color: string }>> = [];

    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      const x = xMin + (xMax - xMin) * (i / (gridSize - 1));
      
      for (let j = 0; j < gridSize; j++) {
        const y = yMin + (yMax - yMin) * (j / (gridSize - 1));
        
        // Inverse distance weighting for interpolation
        let numerator = 0;
        let denominator = 0;
        
        data.forEach(point => {
          const distance = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          );
          const weight = distance === 0 ? 1e10 : 1 / Math.pow(distance, 2);
          numerator += point.z * weight;
          denominator += weight;
        });
        
        const z = numerator / denominator;
        const normalizedZ = (z - zMin) / (zMax - zMin);
        const colorIndex = Math.floor(normalizedZ * (colorSchemes[colorScheme].length - 1));
        const color = colorSchemes[colorScheme][colorIndex] || colorSchemes[colorScheme][0];
        
        grid[i][j] = { x, y, z, color };
      }
    }

    return grid;
  }, [data, gridSize, colorScheme]);

  // 3D projection functions
  const project3D = (x: number, y: number, z: number) => {
    // Apply rotations
    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180;
    
    // Rotate around Y axis
    const x1 = x * Math.cos(radY) - z * Math.sin(radY);
    const z1 = x * Math.sin(radY) + z * Math.cos(radY);
    
    // Rotate around X axis
    const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);
    
    // Apply perspective projection
    const screenX = (x1 * perspective) / (perspective + z2) * scale + 250;
    const screenY = (y1 * perspective) / (perspective + z2) * scale + 200;
    
    return { x: screenX, y: screenY, z: z2 };
  };

  // Calculate lighting
  const calculateShading = (x: number, y: number, z: number) => {
    const lightX = Math.cos((lightAngle * Math.PI) / 180);
    const lightY = Math.sin((lightAngle * Math.PI) / 180);
    const lightZ = 0.5;
    
    // Simple normal calculation (this is simplified)
    const normal = { x: 0, y: 0, z: 1 };
    const dotProduct = normal.x * lightX + normal.y * lightY + normal.z * lightZ;
    return Math.max(0.3, Math.min(1, dotProduct));
  };

  // Generate surface mesh
  const generateSurface = () => {
    const faces = [];
    const wireframe = [];
    
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const p1 = gridData[i][j];
        const p2 = gridData[i + 1][j];
        const p3 = gridData[i + 1][j + 1];
        const p4 = gridData[i][j + 1];
        
        const proj1 = project3D(p1.x, p1.y, p1.z);
        const proj2 = project3D(p2.x, p2.y, p2.z);
        const proj3 = project3D(p3.x, p3.y, p3.z);
        const proj4 = project3D(p4.x, p4.y, p4.z);
        
        const avgZ = (proj1.z + proj2.z + proj3.z + proj4.z) / 4;
        const shading = calculateShading(p1.x, p1.y, p1.z);
        
        // Create two triangular faces
        faces.push({
          points: `${proj1.x},${proj1.y} ${proj2.x},${proj2.y} ${proj3.x},${proj3.y}`,
          color: p1.color,
          z: avgZ,
          shading,
        });
        
        faces.push({
          points: `${proj1.x},${proj1.y} ${proj3.x},${proj3.y} ${proj4.x},${proj4.y}`,
          color: p1.color,
          z: avgZ,
          shading,
        });
        
        // Wireframe
        if (showContours) {
          wireframe.push({
            x1: proj1.x, y1: proj1.y,
            x2: proj2.x, y2: proj2.y,
            z: avgZ,
          });
          wireframe.push({
            x1: proj1.x, y1: proj1.y,
            x2: proj4.x, y2: proj4.y,
            z: avgZ,
          });
        }
      }
    }
    
    // Sort faces by z-depth for proper rendering
    faces.sort((a, b) => b.z - a.z);
    wireframe.sort((a, b) => b.z - a.z);
    
    return { faces, wireframe };
  };

  const { faces, wireframe } = generateSurface();

  const handleAutoRotate = () => {
    setIsAnimating(true);
    const interval = setInterval(() => {
      setRotationY(prev => (prev + 2) % 360);
    }, 50);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
    }, 5000);
  };

  const resetView = () => {
    setRotationX(45);
    setRotationY(45);
    setScale(1);
    setPerspective(500);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Interactive 3D surface visualization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(prev * 1.2, 3))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(prev / 1.2, 0.3))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleAutoRotate} disabled={isAnimating}>
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800"
            style={{ height }}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 500 400"
              className="cursor-move"
            >
              {/* Render surface faces */}
              {faces.map((face, index) => (
                <polygon
                  key={`face-${index}`}
                  points={face.points}
                  fill={face.color}
                  fillOpacity={face.shading}
                  stroke="none"
                />
              ))}
              
              {/* Render wireframe */}
              {showContours && wireframe.map((line, index) => (
                <line
                  key={`wire-${index}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.5"
                />
              ))}
            </svg>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rotation X</label>
            <Slider
              value={[rotationX]}
              onValueChange={([value]) => setRotationX(value)}
              max={180}
              min={-180}
              step={1}
            />
            <div className="text-xs text-muted-foreground mt-1">{rotationX}°</div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Rotation Y</label>
            <Slider
              value={[rotationY]}
              onValueChange={([value]) => setRotationY(value)}
              max={360}
              min={0}
              step={1}
            />
            <div className="text-xs text-muted-foreground mt-1">{rotationY}°</div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Scale</label>
            <Slider
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
              max={3}
              min={0.1}
              step={0.1}
            />
            <div className="text-xs text-muted-foreground mt-1">{scale.toFixed(1)}x</div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Lighting</label>
            <Slider
              value={[lightAngle]}
              onValueChange={([value]) => setLightAngle(value)}
              max={360}
              min={0}
              step={5}
            />
            <div className="text-xs text-muted-foreground mt-1">{lightAngle}°</div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Color Scheme</label>
            <Select value={colorScheme} onValueChange={(value: any) => {}}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viridis">Viridis</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="magma">Magma</SelectItem>
                <SelectItem value="thermal">Thermal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Grid: {gridSize}×{gridSize}</span>
          <span>Points: {data.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>Interactive 3D Surface</span>
        </div>
      </div>
    </Card>
  );
};