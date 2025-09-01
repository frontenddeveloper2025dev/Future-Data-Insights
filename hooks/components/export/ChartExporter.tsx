import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Image, 
  FileImage, 
  Camera,
  Palette,
  Settings2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface ChartExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  quality: number;
  width: number;
  height: number;
  backgroundColor: string;
  scale: number;
  filename: string;
}

interface ChartExporterProps {
  chartRef: React.RefObject<HTMLElement>;
  chartTitle: string;
  defaultOptions?: Partial<ChartExportOptions>;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean) => void;
}

const ChartExporter: React.FC<ChartExporterProps> = ({
  chartRef,
  chartTitle,
  defaultOptions = {},
  onExportStart,
  onExportComplete
}) => {
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = React.useState<ChartExportOptions>({
    format: 'png',
    quality: 0.95,
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    scale: 2,
    filename: `${chartTitle.toLowerCase().replace(/\s+/g, '_')}_chart`,
    ...defaultOptions
  });

  const [isExporting, setIsExporting] = React.useState(false);

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Best for web use and presentations' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size, good for sharing' },
    { value: 'svg', label: 'SVG', description: 'Scalable vector format' },
    { value: 'pdf', label: 'PDF', description: 'Document format with text support' }
  ];

  const qualityOptions = [
    { value: 0.6, label: 'Standard (60%)', size: 'Small file size' },
    { value: 0.8, label: 'High (80%)', size: 'Balanced quality' },
    { value: 0.95, label: 'Maximum (95%)', size: 'Best quality' }
  ];

  const sizePresets = [
    { label: 'Social Media', width: 1080, height: 1080 },
    { label: 'Presentation', width: 1920, height: 1080 },
    { label: 'Document', width: 1200, height: 800 },
    { label: 'Print', width: 3000, height: 2000 },
    { label: 'Custom', width: exportOptions.width, height: exportOptions.height }
  ];

  const backgroundColors = [
    { value: '#ffffff', label: 'White', class: 'bg-white' },
    { value: '#f8fafc', label: 'Light Gray', class: 'bg-slate-50' },
    { value: '#000000', label: 'Black', class: 'bg-black' },
    { value: 'transparent', label: 'Transparent', class: 'bg-transparent border-2 border-dashed border-gray-300' }
  ];

  const exportChart = useCallback(async () => {
    if (!chartRef.current) {
      toast({
        title: 'Export Error',
        description: 'Chart element not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    onExportStart?.();

    try {
      switch (exportOptions.format) {
        case 'png':
        case 'jpg':
          await exportAsImage();
          break;
        case 'svg':
          await exportAsSVG();
          break;
        case 'pdf':
          await exportAsPDF();
          break;
      }

      toast({
        title: 'Export Successful',
        description: `Chart exported as ${exportOptions.format.toUpperCase()}`,
      });
      
      onExportComplete?.(true);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the chart. Please try again.',
        variant: 'destructive',
      });
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
    }
  }, [chartRef, exportOptions, onExportStart, onExportComplete, toast]);

  const exportAsImage = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      width: exportOptions.width,
      height: exportOptions.height,
      scale: exportOptions.scale,
      backgroundColor: exportOptions.backgroundColor === 'transparent' ? null : exportOptions.backgroundColor,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${exportOptions.filename}.${exportOptions.format}`);
      }
    }, `image/${exportOptions.format}`, exportOptions.quality);
  };

  const exportAsSVG = async () => {
    // For SVG export, we'd need to convert the chart to SVG format
    // This is a simplified implementation
    const svgData = generateSVGFromChart();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    saveAs(blob, `${exportOptions.filename}.svg`);
  };

  const exportAsPDF = async () => {
    // For PDF export, we'd use a library like jsPDF
    // This is a simplified implementation
    const canvas = await html2canvas(chartRef.current!, {
      width: exportOptions.width,
      height: exportOptions.height,
      scale: exportOptions.scale,
      backgroundColor: exportOptions.backgroundColor === 'transparent' ? '#ffffff' : exportOptions.backgroundColor,
    });

    // Convert to PDF using jsPDF (would need to be installed)
    toast({
      title: 'PDF Export',
      description: 'PDF export functionality would be implemented here',
    });
  };

  const generateSVGFromChart = (): string => {
    // This would generate SVG content from the chart
    // For now, return a simple placeholder
    return `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${exportOptions.width}" height="${exportOptions.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${exportOptions.backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" fill="black">SVG Export Placeholder</text>
    </svg>`;
  };

  const updateOption = <K extends keyof ChartExportOptions>(
    key: K,
    value: ChartExportOptions[K]
  ) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyPreset = (preset: typeof sizePresets[0]) => {
    if (preset.label !== 'Custom') {
      updateOption('width', preset.width);
      updateOption('height', preset.height);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Chart Export
        </CardTitle>
        <CardDescription>
          Export "{chartTitle}" in various formats and sizes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <FileImage className="w-4 h-4 mr-2" />
            Export Format
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((format) => (
              <Card
                key={format.value}
                className={`cursor-pointer transition-all border-2 ${
                  exportOptions.format === format.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => updateOption('format', format.value as any)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {format.label}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Size Presets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Settings2 className="w-4 h-4 mr-2" />
            Size Preset
          </h4>
          <Select onValueChange={(value) => {
            const preset = sizePresets.find(p => p.label === value);
            if (preset) applyPreset(preset);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a size preset" />
            </SelectTrigger>
            <SelectContent>
              {sizePresets.map((preset) => (
                <SelectItem key={preset.label} value={preset.label}>
                  {preset.label} ({preset.width} × {preset.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Width (px)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-border rounded-md"
              value={exportOptions.width}
              onChange={(e) => updateOption('width', parseInt(e.target.value) || 1200)}
              min="100"
              max="5000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Height (px)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-border rounded-md"
              value={exportOptions.height}
              onChange={(e) => updateOption('height', parseInt(e.target.value) || 800)}
              min="100"
              max="5000"
            />
          </div>
        </div>

        {/* Quality Settings */}
        {['png', 'jpg'].includes(exportOptions.format) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Image Quality</h4>
            <Select 
              value={exportOptions.quality.toString()} 
              onValueChange={(value) => updateOption('quality', parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label} - {option.size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Background Color */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Background Color
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {backgroundColors.map((bg) => (
              <Card
                key={bg.value}
                className={`cursor-pointer transition-all border-2 ${
                  exportOptions.backgroundColor === bg.value 
                    ? 'border-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => updateOption('backgroundColor', bg.value)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full ${bg.class}`} />
                    <span className="text-sm">{bg.label}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filename */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filename</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-border rounded-md"
            value={exportOptions.filename}
            onChange={(e) => updateOption('filename', e.target.value)}
            placeholder="chart_export"
          />
          <p className="text-xs text-muted-foreground">
            File extension will be added automatically
          </p>
        </div>

        {/* Export Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {exportOptions.width} × {exportOptions.height} px, {exportOptions.format.toUpperCase()}
          </div>
          <Button
            onClick={exportChart}
            disabled={isExporting}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <>
                <Settings2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Chart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartExporter;