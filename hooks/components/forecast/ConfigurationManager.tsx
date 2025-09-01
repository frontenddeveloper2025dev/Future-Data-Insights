import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Settings, FileText, Trash2, Edit, Copy, Share2, Menu, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { table } from '@devvai/devv-code-backend';

interface SavedConfiguration {
  _id: string;
  config_name: string;
  config_type: string;
  settings: string;
  metadata: string;
  is_default: string;
  created_at: string;
  updated_at: string;
}

interface ForecastSettings {
  general: {
    auto_save: boolean;
    default_confidence: number;
    default_time_horizon: string;
    default_model: string;
  };
  visualization: {
    default_chart_type: string;
    show_confidence_intervals: boolean;
    color_scheme: string;
    animation_enabled: boolean;
  };
  data: {
    auto_validate: boolean;
    outlier_detection: boolean;
    missing_data_strategy: string;
    date_format: string;
  };
  notifications: {
    forecast_complete: boolean;
    accuracy_alerts: boolean;
    data_quality_warnings: boolean;
  };
}

export function ConfigurationManager() {
  const [configurations, setConfigurations] = useState<SavedConfiguration[]>([]);
  const [currentSettings, setCurrentSettings] = useState<ForecastSettings>({
    general: {
      auto_save: true,
      default_confidence: 95,
      default_time_horizon: 'monthly',
      default_model: 'linear_regression'
    },
    visualization: {
      default_chart_type: 'line',
      show_confidence_intervals: true,
      color_scheme: 'default',
      animation_enabled: true
    },
    data: {
      auto_validate: true,
      outlier_detection: true,
      missing_data_strategy: 'interpolation',
      date_format: 'YYYY-MM-DD'
    },
    notifications: {
      forecast_complete: true,
      accuracy_alerts: true,
      data_quality_warnings: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadConfigurations();
    loadCurrentSettings();
  }, []);

  const loadConfigurations = async () => {
    try {
      // Since we don't have a dedicated configurations table, we'll use the forecast_models table
      // to store configuration data with a special category
      const response = await table.getItems('evn1jewwqy9s', {
        limit: 50,
        query: { category: 'configuration' }
      });
      setConfigurations(response.items as SavedConfiguration[]);
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSettings = () => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('forecast_settings');
    if (savedSettings) {
      try {
        setCurrentSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  };

  const saveCurrentSettings = () => {
    localStorage.setItem('forecast_settings', JSON.stringify(currentSettings));
    toast({
      title: "Settings Saved",
      description: "Your configuration has been saved locally"
    });
  };

  const saveConfiguration = async () => {
    try {
      const metadata = {
        name: configName,
        description: configDescription,
        created_by: 'user',
        version: '1.0'
      };

      await table.addItem('evn1jewwqy9s', {
        name: configName,
        category: 'configuration',
        description: configDescription,
        parameters: JSON.stringify(currentSettings),
        is_active: 'true',
        complexity: 'beginner',
        best_for: 'General forecast configuration',
        created_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Configuration saved successfully"
      });

      setIsSaveDialogOpen(false);
      setConfigName('');
      setConfigDescription('');
      loadConfigurations();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const loadConfiguration = async (config: SavedConfiguration) => {
    try {
      const settings = JSON.parse(config.settings || '{}') as ForecastSettings;
      setCurrentSettings(settings);
      localStorage.setItem('forecast_settings', JSON.stringify(settings));
      
      toast({
        title: "Configuration Loaded",
        description: `Applied configuration: ${config.config_name}`
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive"
      });
    }
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(currentSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'forecast_configuration.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Configuration Exported",
      description: "Configuration file downloaded successfully"
    });
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string) as ForecastSettings;
        setCurrentSettings(importedSettings);
        localStorage.setItem('forecast_settings', JSON.stringify(importedSettings));
        
        toast({
          title: "Configuration Imported",
          description: "Configuration loaded successfully"
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Invalid configuration file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const resetToDefaults = () => {
    const defaultSettings: ForecastSettings = {
      general: {
        auto_save: true,
        default_confidence: 95,
        default_time_horizon: 'monthly',
        default_model: 'linear_regression'
      },
      visualization: {
        default_chart_type: 'line',
        show_confidence_intervals: true,
        color_scheme: 'default',
        animation_enabled: true
      },
      data: {
        auto_validate: true,
        outlier_detection: true,
        missing_data_strategy: 'interpolation',
        date_format: 'YYYY-MM-DD'
      },
      notifications: {
        forecast_complete: true,
        accuracy_alerts: true,
        data_quality_warnings: true
      }
    };
    
    setCurrentSettings(defaultSettings);
    localStorage.setItem('forecast_settings', JSON.stringify(defaultSettings));
    
    toast({
      title: "Settings Reset",
      description: "Configuration reset to defaults"
    });
  };

  const SaveConfigDialog = ({ children }: { children: React.ReactNode }) => {
    const DialogComponent = isMobile ? Sheet : Dialog;
    const TriggerComponent = isMobile ? SheetTrigger : DialogTrigger;
    const ContentComponent = isMobile ? SheetContent : DialogContent;
    const HeaderComponent = isMobile ? SheetHeader : DialogHeader;
    const TitleComponent = isMobile ? SheetTitle : DialogTitle;
    const DescriptionComponent = isMobile ? SheetDescription : DialogDescription;

    return (
      <DialogComponent open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <TriggerComponent asChild>
          {children}
        </TriggerComponent>
        <ContentComponent className={isMobile ? "h-[80vh] overflow-y-auto" : ""}>
          <HeaderComponent>
            <TitleComponent>Save Configuration</TitleComponent>
            <DescriptionComponent>
              Save your current settings as a reusable configuration
            </DescriptionComponent>
          </HeaderComponent>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="config_name">Configuration Name</Label>
              <Input
                id="config_name"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., Sales Team Default"
              />
            </div>
            <div>
              <Label htmlFor="config_description">Description</Label>
              <Textarea
                id="config_description"
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                placeholder="Describe when to use this configuration..."
                rows={isMobile ? 4 : 3}
              />
            </div>
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'justify-end'}`}>
              <Button 
                variant="outline" 
                onClick={() => setIsSaveDialogOpen(false)}
                className={isMobile ? 'w-full' : ''}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveConfiguration} 
                disabled={!configName}
                className={isMobile ? 'w-full' : ''}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </ContentComponent>
      </DialogComponent>
    );
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'px-1' : ''}`}>
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
        <div className={isMobile ? 'w-full' : ''}>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Configuration Manager</h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm mt-1' : ''}`}>Manage your forecast settings and configurations</p>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'flex-col sm:flex-row w-full' : ''}`}>
          <input
            type="file"
            accept=".json"
            onChange={importConfiguration}
            className="hidden"
            id="import-config"
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('import-config')?.click()}
            className={isMobile ? 'w-full justify-start' : ''}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isMobile ? 'Import Configuration' : 'Import'}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportConfiguration}
            className={isMobile ? 'w-full justify-start' : ''}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? 'Export Configuration' : 'Export'}
          </Button>
          <SaveConfigDialog>
            <Button className={isMobile ? 'w-full justify-start' : ''}>
              <Save className="h-4 w-4 mr-2" />
              {isMobile ? 'Save Configuration' : 'Save Config'}
            </Button>
          </SaveConfigDialog>
        </div>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Current Settings */}
        <div className={isMobile ? 'order-1' : 'lg:col-span-2'}>
          <Card>
            <CardHeader className={isMobile ? 'pb-4' : ''}>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Current Settings</CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>Configure your default forecast preferences</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? 'px-4' : ''}>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-auto p-1' : 'grid-cols-4'}`}>
                  <TabsTrigger 
                    value="general" 
                    className={isMobile ? 'justify-start px-3 py-2' : ''}
                  >
                    <Settings className={`h-4 w-4 ${isMobile ? 'mr-2' : 'mr-1'}`} />
                    General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="visualization" 
                    className={isMobile ? 'justify-start px-3 py-2' : ''}
                  >
                    <FileText className={`h-4 w-4 ${isMobile ? 'mr-2' : 'mr-1'}`} />
                    {isMobile ? 'Charts' : 'Charts'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="data" 
                    className={isMobile ? 'justify-start px-3 py-2' : ''}
                  >
                    <Upload className={`h-4 w-4 ${isMobile ? 'mr-2' : 'mr-1'}`} />
                    Data
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className={isMobile ? 'justify-start px-3 py-2' : ''}
                  >
                    Alerts
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className={`space-y-4 ${isMobile ? 'mt-4' : ''}`}>
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div>
                      <Label htmlFor="default_confidence" className={isMobile ? 'text-sm font-medium' : ''}>
                        Default Confidence Level (%)
                      </Label>
                      <Input
                        id="default_confidence"
                        type="number"
                        min="50"
                        max="99"
                        value={currentSettings.general.default_confidence}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          general: { ...currentSettings.general, default_confidence: parseInt(e.target.value) }
                        })}
                        className={isMobile ? 'mt-1 h-12' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="default_time_horizon" className={isMobile ? 'text-sm font-medium' : ''}>
                        Default Time Horizon
                      </Label>
                      <select
                        id="default_time_horizon"
                        value={currentSettings.general.default_time_horizon}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          general: { ...currentSettings.general, default_time_horizon: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border border-input rounded-md ${isMobile ? 'mt-1 h-12 text-base' : ''}`}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                    <Switch
                      id="auto_save"
                      checked={currentSettings.general.auto_save}
                      onCheckedChange={(checked) => setCurrentSettings({
                        ...currentSettings,
                        general: { ...currentSettings.general, auto_save: checked }
                      })}
                      className={isMobile ? 'scale-110' : ''}
                    />
                    <Label htmlFor="auto_save" className={isMobile ? 'text-sm font-medium' : ''}>
                      Auto-save forecasts
                    </Label>
                  </div>
                </TabsContent>
                
                <TabsContent value="visualization" className={`space-y-4 ${isMobile ? 'mt-4' : ''}`}>
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div>
                      <Label htmlFor="default_chart_type" className={isMobile ? 'text-sm font-medium' : ''}>
                        Default Chart Type
                      </Label>
                      <select
                        id="default_chart_type"
                        value={currentSettings.visualization.default_chart_type}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          visualization: { ...currentSettings.visualization, default_chart_type: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border border-input rounded-md ${isMobile ? 'mt-1 h-12 text-base' : ''}`}
                      >
                        <option value="line">Line Chart</option>
                        <option value="area">Area Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="candlestick">Candlestick</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="color_scheme" className={isMobile ? 'text-sm font-medium' : ''}>
                        Color Scheme
                      </Label>
                      <select
                        id="color_scheme"
                        value={currentSettings.visualization.color_scheme}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          visualization: { ...currentSettings.visualization, color_scheme: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border border-input rounded-md ${isMobile ? 'mt-1 h-12 text-base' : ''}`}
                      >
                        <option value="default">Default</option>
                        <option value="blue">Blue Theme</option>
                        <option value="green">Green Theme</option>
                        <option value="purple">Purple Theme</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={`space-y-3 ${isMobile ? 'mt-4' : ''}`}>
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="show_confidence_intervals"
                        checked={currentSettings.visualization.show_confidence_intervals}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          visualization: { ...currentSettings.visualization, show_confidence_intervals: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <Label htmlFor="show_confidence_intervals" className={isMobile ? 'text-sm font-medium' : ''}>
                        Show confidence intervals
                      </Label>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="animation_enabled"
                        checked={currentSettings.visualization.animation_enabled}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          visualization: { ...currentSettings.visualization, animation_enabled: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <Label htmlFor="animation_enabled" className={isMobile ? 'text-sm font-medium' : ''}>
                        Enable animations
                      </Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="data" className={`space-y-4 ${isMobile ? 'mt-4' : ''}`}>
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div>
                      <Label htmlFor="missing_data_strategy" className={isMobile ? 'text-sm font-medium' : ''}>
                        Missing Data Strategy
                      </Label>
                      <select
                        id="missing_data_strategy"
                        value={currentSettings.data.missing_data_strategy}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          data: { ...currentSettings.data, missing_data_strategy: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border border-input rounded-md ${isMobile ? 'mt-1 h-12 text-base' : ''}`}
                      >
                        <option value="interpolation">Linear Interpolation</option>
                        <option value="forward_fill">Forward Fill</option>
                        <option value="backward_fill">Backward Fill</option>
                        <option value="mean_fill">Mean Fill</option>
                        <option value="remove">Remove Missing</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="date_format" className={isMobile ? 'text-sm font-medium' : ''}>
                        Date Format
                      </Label>
                      <select
                        id="date_format"
                        value={currentSettings.data.date_format}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          data: { ...currentSettings.data, date_format: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border border-input rounded-md ${isMobile ? 'mt-1 h-12 text-base' : ''}`}
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={`space-y-3 ${isMobile ? 'mt-4' : ''}`}>
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="auto_validate"
                        checked={currentSettings.data.auto_validate}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          data: { ...currentSettings.data, auto_validate: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <Label htmlFor="auto_validate" className={isMobile ? 'text-sm font-medium' : ''}>
                        Auto-validate data on import
                      </Label>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="outlier_detection"
                        checked={currentSettings.data.outlier_detection}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          data: { ...currentSettings.data, outlier_detection: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <Label htmlFor="outlier_detection" className={isMobile ? 'text-sm font-medium' : ''}>
                        Enable outlier detection
                      </Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className={`space-y-4 ${isMobile ? 'mt-4' : ''}`}>
                  <div className="space-y-3">
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="forecast_complete"
                        checked={currentSettings.notifications.forecast_complete}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          notifications: { ...currentSettings.notifications, forecast_complete: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <div className="flex-1">
                        <Label htmlFor="forecast_complete" className={isMobile ? 'text-sm font-medium block' : ''}>
                          Notify when forecast completes
                        </Label>
                        {isMobile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Get notified when your forecasts are ready
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="accuracy_alerts"
                        checked={currentSettings.notifications.accuracy_alerts}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          notifications: { ...currentSettings.notifications, accuracy_alerts: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <div className="flex-1">
                        <Label htmlFor="accuracy_alerts" className={isMobile ? 'text-sm font-medium block' : ''}>
                          Accuracy alert notifications
                        </Label>
                        {isMobile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Alerts when forecast accuracy drops below threshold
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'space-x-3 p-3 bg-muted/30 rounded-lg' : 'space-x-2'}`}>
                      <Switch
                        id="data_quality_warnings"
                        checked={currentSettings.notifications.data_quality_warnings}
                        onCheckedChange={(checked) => setCurrentSettings({
                          ...currentSettings,
                          notifications: { ...currentSettings.notifications, data_quality_warnings: checked }
                        })}
                        className={isMobile ? 'scale-110' : ''}
                      />
                      <div className="flex-1">
                        <Label htmlFor="data_quality_warnings" className={isMobile ? 'text-sm font-medium block' : ''}>
                          Data quality warnings
                        </Label>
                        {isMobile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Warnings about missing or invalid data
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className={`flex gap-2 mt-6 ${isMobile ? 'flex-col' : 'justify-end'}`}>
                <Button 
                  variant="outline" 
                  onClick={resetToDefaults}
                  className={isMobile ? 'w-full justify-start' : ''}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isMobile ? 'Reset to Defaults' : 'Reset to Defaults'}
                </Button>
                <Button 
                  onClick={saveCurrentSettings}
                  className={isMobile ? 'w-full justify-start' : ''}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isMobile ? 'Save Settings' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Configurations */}
        <div className={isMobile ? 'order-2' : ''}>
          <Card>
            <CardHeader className={isMobile ? 'pb-4' : ''}>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Saved Configurations</CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>Quick access to your saved settings</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? 'px-4' : ''}>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(isMobile ? 2 : 3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className={`h-4 bg-muted rounded mb-2 ${isMobile ? 'w-4/5' : 'w-3/4'}`}></div>
                      <div className={`h-3 bg-muted rounded ${isMobile ? 'w-3/5' : 'w-1/2'}`}></div>
                    </div>
                  ))}
                </div>
              ) : configurations.length === 0 ? (
                <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
                  <Settings className={`mx-auto text-muted-foreground mb-4 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                    No saved configurations
                  </p>
                  {isMobile && (
                    <Button 
                      onClick={() => setIsSaveDialogOpen(true)} 
                      className="mt-4 w-full"
                      variant="outline"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Current Settings
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {configurations.map((config) => (
                    <Card key={config._id} className={`${isMobile ? 'p-3 border-dashed' : 'p-3'}`}>
                      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
                        <div className="flex-1">
                          <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                            {config.config_name}
                          </h4>
                          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {new Date(config.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size={isMobile ? 'default' : 'sm'}
                          variant={isMobile ? 'default' : 'ghost'}
                          onClick={() => loadConfiguration(config)}
                          className={isMobile ? 'w-full justify-start' : ''}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isMobile ? 'Load Configuration' : ''}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationManager;