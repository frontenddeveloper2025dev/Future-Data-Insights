import React, { useState } from 'react';
import { Settings, Layout, FileText, Save, Menu, Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { TemplateManager } from '@/components/forecast/TemplateManager';
import { ConfigurationManager } from '@/components/forecast/ConfigurationManager';
import { TemplateSuggestions } from '@/components/forecast/TemplateSuggestions';
import { UsageAnalytics } from '@/components/forecast/UsageAnalytics';

export function TemplatesPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('suggestions');

  return (
    <div className={`container mx-auto ${isMobile ? 'px-4 py-4' : 'py-8'}`}>
      <div className={isMobile ? 'mb-6' : 'mb-8'}>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Templates & Configurations</h1>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm mt-1' : 'mt-2'}`}>
          Manage forecast templates, saved configurations, and default settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`${isMobile ? 'grid w-full grid-cols-1 h-auto p-1' : 'grid w-full grid-cols-5'}`}>
          <TabsTrigger 
            value="suggestions" 
            className={`${isMobile ? 'w-full justify-start p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : 'flex items-center gap-2'}`}
          >
            <Brain className="h-4 w-4" />
            <span className={isMobile ? 'ml-2' : ''}>Smart Suggestions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className={`${isMobile ? 'w-full justify-start p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : 'flex items-center gap-2'}`}
          >
            <Layout className="h-4 w-4" />
            <span className={isMobile ? 'ml-2' : ''}>Templates</span>
          </TabsTrigger>
          <TabsTrigger 
            value="configurations" 
            className={`${isMobile ? 'w-full justify-start p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : 'flex items-center gap-2'}`}
          >
            <Settings className="h-4 w-4" />
            <span className={isMobile ? 'ml-2' : ''}>Configurations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="quick-start" 
            className={`${isMobile ? 'w-full justify-start p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : 'flex items-center gap-2'}`}
          >
            <FileText className="h-4 w-4" />
            <span className={isMobile ? 'ml-2' : ''}>Quick Start</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className={`${isMobile ? 'w-full justify-start p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : 'flex items-center gap-2'}`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className={isMobile ? 'ml-2' : ''}>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-6">
          <TemplateSuggestions />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="configurations" className="mt-6">
          <ConfigurationManager />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <UsageAnalytics />
        </TabsContent>

        <TabsContent value="quick-start" className="mt-6">
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Layout className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="line-clamp-2">Sales Forecast Template</span>
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm line-clamp-3' : ''}>
                  Pre-configured template for monthly sales forecasting with seasonality
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-3">
                  <div className={isMobile ? 'text-sm' : 'text-sm'}>
                    <div className="grid grid-cols-1 gap-1">
                      <div><strong>Model:</strong> Seasonal Decomposition</div>
                      <div><strong>Time Horizon:</strong> Monthly</div>
                      <div><strong>Data Required:</strong> 12+ months of sales data</div>
                    </div>
                  </div>
                  <Button className="w-full" variant="default">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Layout className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="line-clamp-2">Financial Planning</span>
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm line-clamp-3' : ''}>
                  Quarterly revenue and expense forecasting with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-3">
                  <div className={isMobile ? 'text-sm' : 'text-sm'}>
                    <div className="grid grid-cols-1 gap-1">
                      <div><strong>Model:</strong> ARIMA</div>
                      <div><strong>Time Horizon:</strong> Quarterly</div>
                      <div><strong>Data Required:</strong> 8+ quarters of financial data</div>
                    </div>
                  </div>
                  <Button className="w-full" style={{backgroundColor: '#10b981'}} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Layout className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span className="line-clamp-2">Marketing ROI Forecast</span>
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm line-clamp-3' : ''}>
                  Campaign performance prediction with A/B testing integration
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-3">
                  <div className={isMobile ? 'text-sm' : 'text-sm'}>
                    <div className="grid grid-cols-1 gap-1">
                      <div><strong>Model:</strong> Neural Network</div>
                      <div><strong>Time Horizon:</strong> Weekly</div>
                      <div><strong>Data Required:</strong> Campaign and conversion data</div>
                    </div>
                  </div>
                  <Button className="w-full" style={{backgroundColor: '#8b5cf6'}} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Settings className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <span className="line-clamp-2">Team Configuration</span>
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm line-clamp-3' : ''}>
                  Default settings optimized for collaborative forecasting
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-3">
                  <div className={isMobile ? 'text-sm' : 'text-sm'}>
                    <div className="grid grid-cols-1 gap-1">
                      <div><strong>Features:</strong> Auto-save, notifications</div>
                      <div><strong>Charts:</strong> Confidence intervals enabled</div>
                      <div><strong>Data:</strong> Outlier detection active</div>
                    </div>
                  </div>
                  <Button className="w-full" style={{backgroundColor: '#f97316'}} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ea580c'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f97316'}>
                    Apply Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Settings className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="line-clamp-2">Executive Dashboard</span>
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm line-clamp-3' : ''}>
                  High-level view configuration for executive reporting
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-3">
                  <div className={isMobile ? 'text-sm' : 'text-sm'}>
                    <div className="grid grid-cols-1 gap-1">
                      <div><strong>Charts:</strong> Simplified view</div>
                      <div><strong>Time Frame:</strong> Quarterly/Yearly</div>
                      <div><strong>Alerts:</strong> Critical changes only</div>
                    </div>
                  </div>
                  <Button className="w-full" style={{backgroundColor: '#ef4444'}} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}>
                    Apply Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className={isMobile ? 'pb-4' : ''}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Save className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <span className="line-clamp-2">Quick Setup Guide</span>
                </CardTitle>
                <CardDescription className={isMobile ? 'text-sm line-clamp-3' : ''}>
                  Step-by-step guide to create your first forecast template
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pt-0' : ''}>
                <div className="space-y-3">
                  <div className={isMobile ? 'text-sm' : 'text-sm'}>
                    <div><strong>Steps:</strong></div>
                    <div className="ml-2 space-y-1">
                      <div>1. Choose your data source</div>
                      <div>2. Select prediction model</div>
                      <div>3. Configure settings</div>
                      <div>4. Save as template</div>
                    </div>
                  </div>
                  <Button className="w-full" style={{backgroundColor: '#14b8a6'}} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0f766e'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}>
                    Start Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Getting Started with Templates</CardTitle>
              <CardDescription className={isMobile ? 'text-sm' : ''}>Best practices for using forecast templates effectively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div>
                  <h4 className={`font-semibold mb-2 ${isMobile ? 'text-base' : ''}`}>Creating Templates</h4>
                  <ul className={`text-muted-foreground space-y-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Start with a successful forecast configuration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Include clear descriptions and use cases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Set appropriate data requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Test with different datasets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Add relevant tags for easy discovery</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isMobile ? 'text-base' : ''}`}>Using Templates</h4>
                  <ul className={`text-muted-foreground space-y-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Choose templates that match your data type</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Review configuration before applying</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Customize parameters as needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Save modifications as new templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Share successful templates with your team</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TemplatesPage;