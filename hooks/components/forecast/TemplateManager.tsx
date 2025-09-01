import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Download, Upload, Settings, Tag, Eye, Edit, Trash2, Copy, Filter, X, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { table } from '@devvai/devv-code-backend';

interface ForecastTemplate {
  _id: string;
  _uid: string;
  template_name: string;
  category: string;
  description: string;
  configuration: string;
  data_schema: string;
  is_public: string;
  usage_count: number;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface TemplateConfiguration {
  model: string;
  parameters: Record<string, any>;
  data_requirements: {
    minimum_points: number;
    time_series: boolean;
    required_fields: string[];
  };
  default_settings: {
    time_horizon: string;
    confidence_level: number;
    seasonality: boolean;
  };
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<ForecastTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ForecastTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    category: 'sales',
    description: '',
    model: 'linear_regression',
    parameters: {},
    data_requirements: {
      minimum_points: 10,
      time_series: true,
      required_fields: ['date', 'value']
    },
    default_settings: {
      time_horizon: 'monthly',
      confidence_level: 95,
      seasonality: false
    },
    tags: '',
    is_public: 'false'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await table.getItems('ew2w7lb1sa9s', {
        limit: 50,
        sort: '_id',
        order: 'desc'
      });
      setTemplates(response.items as ForecastTemplate[]);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      const configuration: TemplateConfiguration = {
        model: newTemplate.model,
        parameters: newTemplate.parameters,
        data_requirements: newTemplate.data_requirements,
        default_settings: newTemplate.default_settings
      };

      await table.addItem('ew2w7lb1sa9s', {
        template_name: newTemplate.template_name,
        category: newTemplate.category,
        description: newTemplate.description,
        configuration: JSON.stringify(configuration),
        data_schema: JSON.stringify(newTemplate.data_requirements),
        is_public: newTemplate.is_public,
        usage_count: 0,
        tags: newTemplate.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Template saved successfully"
      });

      setIsCreateDialogOpen(false);
      loadTemplates();
      
      // Reset form
      setNewTemplate({
        template_name: '',
        category: 'sales',
        description: '',
        model: 'linear_regression',
        parameters: {},
        data_requirements: {
          minimum_points: 10,
          time_series: true,
          required_fields: ['date', 'value']
        },
        default_settings: {
          time_horizon: 'monthly',
          confidence_level: 95,
          seasonality: false
        },
        tags: '',
        is_public: 'false'
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const useTemplate = async (template: ForecastTemplate) => {
    try {
      // Update usage count
      await table.updateItem('ew2w7lb1sa9s', {
        _uid: template._uid,
        _id: template._id,
        usage_count: template.usage_count + 1,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Template Applied",
        description: `Using template: ${template.template_name}`
      });

      // Here you would apply the template configuration to your forecast creation form
      const config = JSON.parse(template.configuration) as TemplateConfiguration;
      
      // You can emit an event or call a callback to apply the template
      window.dispatchEvent(new CustomEvent('applyForecastTemplate', { 
        detail: { template, config } 
      }));

      loadTemplates(); // Refresh to show updated usage count
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = (template: ForecastTemplate) => {
    const config = JSON.parse(template.configuration) as TemplateConfiguration;
    setNewTemplate({
      template_name: `${template.template_name} (Copy)`,
      category: template.category,
      description: template.description,
      model: config.model,
      parameters: config.parameters,
      data_requirements: config.data_requirements,
      default_settings: config.default_settings,
      tags: template.tags,
      is_public: 'false'
    });
    setIsCreateDialogOpen(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'sales', 'financial', 'marketing', 'operations', 'custom'];

  const CreateTemplateDialog = ({ children }: { children: React.ReactNode }) => {
    const DialogComponent = isMobile ? Sheet : Dialog;
    const TriggerComponent = isMobile ? SheetTrigger : DialogTrigger;
    const ContentComponent = isMobile ? SheetContent : DialogContent;
    const HeaderComponent = isMobile ? SheetHeader : DialogHeader;
    const TitleComponent = isMobile ? SheetTitle : DialogTitle;
    const DescriptionComponent = isMobile ? SheetDescription : DialogDescription;

    return (
      <DialogComponent open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <TriggerComponent asChild>
          {children}
        </TriggerComponent>
        <ContentComponent className={isMobile ? "h-[95vh] overflow-y-auto" : "max-w-2xl max-h-[80vh] overflow-y-auto"}>
          <HeaderComponent>
            <TitleComponent>Create Forecast Template</TitleComponent>
            <DescriptionComponent>
              Create a reusable template with predefined settings and configurations
            </DescriptionComponent>
          </HeaderComponent>
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto p-1 space-y-1' : 'grid-cols-3'}`}>
              <TabsTrigger 
                value="basic" 
                className={isMobile ? 'justify-start py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
              >
                <Settings className="h-4 w-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger 
                value="model" 
                className={isMobile ? 'justify-start py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
              >
                <FileText className="h-4 w-4 mr-2" />
                Model Config
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className={isMobile ? 'justify-start py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
              >
                <Upload className="h-4 w-4 mr-2" />
                Data Schema
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className={`space-y-4 ${isMobile ? 'mt-4' : ''}`}>
              <div>
                <Label htmlFor="template_name" className={isMobile ? 'text-sm font-medium' : ''}>
                  Template Name
                </Label>
                <Input
                  id="template_name"
                  value={newTemplate.template_name}
                  onChange={(e) => setNewTemplate({...newTemplate, template_name: e.target.value})}
                  placeholder="e.g., Sales Forecast - Quarterly"
                  className={isMobile ? 'mt-1 h-12 text-base' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="category" className={isMobile ? 'text-sm font-medium' : ''}>
                  Category
                </Label>
                <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                  <SelectTrigger className={isMobile ? 'mt-1 h-12' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">📈 Sales</SelectItem>
                    <SelectItem value="financial">💰 Financial</SelectItem>
                    <SelectItem value="marketing">📊 Marketing</SelectItem>
                    <SelectItem value="operations">⚙️ Operations</SelectItem>
                    <SelectItem value="custom">🔧 Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description" className={isMobile ? 'text-sm font-medium' : ''}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Describe when and how to use this template..."
                  rows={isMobile ? 4 : 3}
                  className={isMobile ? 'mt-1 text-base' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="tags" className={isMobile ? 'text-sm font-medium' : ''}>
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate({...newTemplate, tags: e.target.value})}
                  placeholder="e.g., quarterly, revenue, growth"
                  className={isMobile ? 'mt-1 h-12 text-base' : ''}
                />
              </div>
              
              {isMobile && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">💡 Tips for Mobile</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use descriptive names for easy identification</li>
                    <li>• Add relevant tags for better searchability</li>
                    <li>• Choose the most appropriate category</li>
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="model" className="space-y-4">
              <div>
                <Label htmlFor="model">Prediction Model</Label>
                <Select value={newTemplate.model} onValueChange={(value) => setNewTemplate({...newTemplate, model: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear_regression">Linear Regression</SelectItem>
                    <SelectItem value="exponential_smoothing">Exponential Smoothing</SelectItem>
                    <SelectItem value="arima">ARIMA</SelectItem>
                    <SelectItem value="seasonal_decomposition">Seasonal Decomposition</SelectItem>
                    <SelectItem value="prophet">Prophet (Facebook)</SelectItem>
                    <SelectItem value="neural_network">Neural Network</SelectItem>
                    <SelectItem value="ensemble">Ensemble Method</SelectItem>
                    <SelectItem value="ai_powered">AI-Powered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time_horizon">Default Time Horizon</Label>
                <Select 
                  value={newTemplate.default_settings.time_horizon} 
                  onValueChange={(value) => setNewTemplate({
                    ...newTemplate, 
                    default_settings: {...newTemplate.default_settings, time_horizon: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="confidence_level">Confidence Level (%)</Label>
                <Input
                  id="confidence_level"
                  type="number"
                  min="50"
                  max="99"
                  value={newTemplate.default_settings.confidence_level}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    default_settings: {...newTemplate.default_settings, confidence_level: parseInt(e.target.value)}
                  })}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <div>
                <Label htmlFor="minimum_points">Minimum Data Points Required</Label>
                <Input
                  id="minimum_points"
                  type="number"
                  min="1"
                  value={newTemplate.data_requirements.minimum_points}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    data_requirements: {...newTemplate.data_requirements, minimum_points: parseInt(e.target.value)}
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="required_fields">Required Fields (comma-separated)</Label>
                <Input
                  id="required_fields"
                  value={newTemplate.data_requirements.required_fields.join(', ')}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    data_requirements: {
                      ...newTemplate.data_requirements, 
                      required_fields: e.target.value.split(',').map(f => f.trim())
                    }
                  })}
                  placeholder="e.g., date, value, category"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className={`flex gap-2 pt-4 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className={isMobile ? 'w-full' : ''}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveTemplate} 
              disabled={!newTemplate.template_name}
              className={isMobile ? 'w-full' : ''}
            >
              Save Template
            </Button>
          </div>
        </ContentComponent>
      </DialogComponent>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`flex items-start justify-between ${isMobile ? 'flex-col gap-4' : 'items-center'}`}>
        <div className={isMobile ? 'w-full' : ''}>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Forecast Templates</h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm mt-1' : ''}`}>Save and reuse forecast configurations</p>
        </div>
        <CreateTemplateDialog>
          <Button className={isMobile ? 'w-full' : ''}>
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? 'Create New Template' : 'Create Template'}
          </Button>
        </CreateTemplateDialog>
      </div>


      {/* Search and Filter */}
      <div className={`space-y-3 ${isMobile ? '' : 'flex gap-4 space-y-0'}`}>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isMobile ? "Search..." : "Search templates..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {isMobile ? (
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {/* Mobile Filter Panel */}
        {isMobile && showFilters && (
          <Card className="p-4 border-dashed">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Filters</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Category</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(category => (
                    <Badge 
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {[...Array(isMobile ? 3 : 6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className={isMobile ? 'pb-3' : ''}>
                <div className={`h-4 bg-muted rounded ${isMobile ? 'w-4/5' : 'w-3/4'}`}></div>
                <div className={`h-3 bg-muted rounded ${isMobile ? 'w-3/5' : 'w-1/2'}`}></div>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
          <CardContent>
            <Settings className={`mx-auto text-muted-foreground mb-4 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No Templates Found</h3>
            <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first forecast template to get started'}
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className={isMobile ? 'w-full' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredTemplates.map((template) => {
            const config = JSON.parse(template.configuration) as TemplateConfiguration;
            const tags = template.tags ? template.tags.split(',').map(t => t.trim()) : [];
            
            return (
              <Card key={template._id} className="hover:shadow-md transition-shadow">
                <CardHeader className={isMobile ? 'pb-3' : ''}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} leading-tight`}>
                        {template.template_name}
                      </CardTitle>
                      <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1 line-clamp-2`}>
                        {template.description}
                      </CardDescription>
                    </div>
                    {template.is_public === 'true' && (
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className={isMobile ? 'text-xs' : ''}>
                      {config.model.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className={isMobile ? 'pt-0' : ''}>
                  <div className="space-y-3">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, isMobile ? 2 : 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > (isMobile ? 2 : 3) && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - (isMobile ? 2 : 3)} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Used {template.usage_count} times • {config.default_settings.time_horizon}
                    </div>
                    
                    <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                      <Button
                        onClick={() => useTemplate(template)}
                        className="flex-1"
                        size={isMobile ? 'default' : 'sm'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isMobile ? 'Use Template' : 'Use'}
                      </Button>
                      <Button
                        variant="outline"
                        size={isMobile ? 'default' : 'sm'}
                        onClick={() => duplicateTemplate(template)}
                        className={isMobile ? 'w-full' : ''}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {isMobile ? 'Duplicate' : ''}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TemplateManager;