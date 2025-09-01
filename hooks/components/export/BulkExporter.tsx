import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  PackageOpen, 
  FileSpreadsheet, 
  FileText, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Archive
} from 'lucide-react';

export interface BulkExportItem {
  id: string;
  title: string;
  type: 'forecast' | 'analysis' | 'chart' | 'report';
  size: string;
  lastModified: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  accuracy?: number;
  model?: string;
}

export interface BulkExportOptions {
  format: 'zip' | 'tar' | 'folder';
  includeImages: boolean;
  includeRawData: boolean;
  includeReports: boolean;
  compressionLevel: 'none' | 'standard' | 'maximum';
}

export interface BulkExporterProps {
  items: BulkExportItem[];
  onExport?: (selectedItems: string[], options: BulkExportOptions) => void;
  isExporting?: boolean;
  exportProgress?: number;
}

const BulkExporter: React.FC<BulkExporterProps> = ({
  items,
  onExport,
  isExporting = false,
  exportProgress = 0
}) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [exportOptions, setExportOptions] = useState<BulkExportOptions>({
    format: 'zip',
    includeImages: true,
    includeRawData: true,
    includeReports: true,
    compressionLevel: 'standard'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'forecast': return BarChart3;
      case 'analysis': return FileText;
      case 'chart': return BarChart3;
      case 'report': return FileText;
      default: return FileSpreadsheet;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'error': return AlertCircle;
      case 'processing': return Loader2;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    const availableItems = items.filter(item => item.status !== 'error');
    setSelectedItems(prev => 
      prev.length === availableItems.length 
        ? [] 
        : availableItems.map(item => item.id)
    );
  };

  const handleBulkExport = () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one item to export.',
        variant: 'destructive',
      });
      return;
    }

    onExport?.(selectedItems, exportOptions);
  };

  const getTotalSize = () => {
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    return selectedItemsData.reduce((total, item) => {
      const size = parseFloat(item.size.replace(/[^\d.]/g, ''));
      return total + size;
    }, 0).toFixed(1);
  };

  const formatCompressionLevel = (level: string) => {
    switch (level) {
      case 'none': return 'No Compression (Faster)';
      case 'standard': return 'Standard Compression (Balanced)';
      case 'maximum': return 'Maximum Compression (Smaller)';
      default: return 'Standard Compression';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PackageOpen className="w-5 h-5 mr-2" />
          Bulk Export
        </CardTitle>
        <CardDescription>
          Export multiple forecasts, analyses, and reports in a single package
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Export Configuration</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Package Format</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md"
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  format: e.target.value as any
                }))}
              >
                <option value="zip">ZIP Archive</option>
                <option value="tar">TAR Archive</option>
                <option value="folder">Folder Structure</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Compression</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md"
                value={exportOptions.compressionLevel}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  compressionLevel: e.target.value as any
                }))}
              >
                <option value="none">No Compression</option>
                <option value="standard">Standard</option>
                <option value="maximum">Maximum</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-images"
                checked={exportOptions.includeImages}
                onCheckedChange={(checked) => setExportOptions(prev => ({
                  ...prev,
                  includeImages: !!checked
                }))}
              />
              <label htmlFor="include-images" className="text-sm">
                Include chart images and visualizations
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-data"
                checked={exportOptions.includeRawData}
                onCheckedChange={(checked) => setExportOptions(prev => ({
                  ...prev,
                  includeRawData: !!checked
                }))}
              />
              <label htmlFor="include-data" className="text-sm">
                Include raw data files (CSV/JSON)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-reports"
                checked={exportOptions.includeReports}
                onCheckedChange={(checked) => setExportOptions(prev => ({
                  ...prev,
                  includeReports: !!checked
                }))}
              />
              <label htmlFor="include-reports" className="text-sm">
                Include analysis reports and summaries
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Item Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Select Items to Export</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedItems.length === items.filter(i => i.status !== 'error').length 
                ? 'Deselect All' 
                : 'Select All'
              }
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              const StatusIcon = getStatusIcon(item.status);
              const isDisabled = item.status === 'error';
              const isSelected = selectedItems.includes(item.id);

              return (
                <Card 
                  key={item.id}
                  className={`transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : isDisabled 
                        ? 'border-border bg-muted/50 opacity-60' 
                        : 'border-border hover:border-primary/50'
                  } ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => !isDisabled && toggleItemSelection(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => {}} // Handled by card click
                      />
                      
                      <TypeIcon className="w-5 h-5 text-primary" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium truncate">{item.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          {item.accuracy && (
                            <Badge variant="secondary" className="text-xs">
                              {(item.accuracy * 100).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{item.size}</span>
                          <span>{item.lastModified}</span>
                          {item.model && <span>Model: {item.model}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(item.status)} ${
                          item.status === 'processing' ? 'animate-spin' : ''
                        }`} />
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Export Progress</span>
              <span className="text-sm text-muted-foreground">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              Processing {selectedItems.length} items...
            </p>
          </div>
        )}

        {/* Export Summary */}
        {selectedItems.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Selected Items:</span>
                  <Badge variant="outline">{selectedItems.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Size:</span>
                  <span className="text-sm text-muted-foreground">~{getTotalSize()} MB</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Format:</span>
                  <span className="text-sm text-muted-foreground">
                    {exportOptions.format.toUpperCase()} - {formatCompressionLevel(exportOptions.compressionLevel)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length === 0 
              ? 'No items selected'
              : `${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} selected`
            }
          </div>
          
          <Button
            onClick={handleBulkExport}
            disabled={selectedItems.length === 0 || isExporting}
            className="min-w-[140px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Export Package
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkExporter;