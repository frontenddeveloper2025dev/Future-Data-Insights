import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  Plus, 
  Trash2, 
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  type: 'deviation' | 'accuracy' | 'performance' | 'threshold';
  condition: 'above' | 'below' | 'equals';
  value: number;
  enabled: boolean;
  forecasts: string[]; // 'all' or specific forecast IDs
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  cooldown: number; // minutes between alerts
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    address: string;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  push: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
  };
}

interface AlertManagerProps {
  forecasts?: Array<{
    id: string;
    name: string;
    model: string;
  }>;
}

export const AlertManager: React.FC<AlertManagerProps> = ({ forecasts = [] }) => {
  const { toast } = useToast();
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      address: 'user@example.com',
      frequency: 'immediate'
    },
    push: {
      enabled: true,
      frequency: 'immediate'
    },
    inApp: {
      enabled: true,
      sound: true
    }
  });
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    type: 'deviation',
    condition: 'above',
    value: 15,
    severity: 'medium',
    notifications: {
      email: true,
      push: true,
      inApp: true
    },
    cooldown: 60,
    enabled: true
  });
  const [editingRule, setEditingRule] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with default alert rules
    const defaultRules: AlertRule[] = [
      {
        id: '1',
        name: 'High Deviation Alert',
        type: 'deviation',
        condition: 'above',
        value: 20,
        enabled: true,
        forecasts: ['all'],
        notifications: {
          email: true,
          push: true,
          inApp: true
        },
        cooldown: 30,
        severity: 'high'
      },
      {
        id: '2',
        name: 'Low Accuracy Warning',
        type: 'accuracy',
        condition: 'below',
        value: 85,
        enabled: true,
        forecasts: ['all'],
        notifications: {
          email: true,
          push: false,
          inApp: true
        },
        cooldown: 120,
        severity: 'medium'
      },
      {
        id: '3',
        name: 'Performance Drop Alert',
        type: 'performance',
        condition: 'below',
        value: 80,
        enabled: false,
        forecasts: ['all'],
        notifications: {
          email: false,
          push: true,
          inApp: true
        },
        cooldown: 60,
        severity: 'medium'
      }
    ];
    
    setAlertRules(defaultRules);
  }, []);

  const addAlertRule = () => {
    if (!newRule.name || newRule.value === undefined) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      type: newRule.type!,
      condition: newRule.condition!,
      value: newRule.value!,
      enabled: newRule.enabled!,
      forecasts: ['all'],
      notifications: newRule.notifications!,
      cooldown: newRule.cooldown!,
      severity: newRule.severity!
    };

    setAlertRules(prev => [...prev, rule]);
    setNewRule({
      type: 'deviation',
      condition: 'above',
      value: 15,
      severity: 'medium',
      notifications: {
        email: true,
        push: true,
        inApp: true
      },
      cooldown: 60,
      enabled: true
    });

    toast({
      title: "Alert Rule Added",
      description: `"${rule.name}" has been created successfully.`
    });
  };

  const deleteAlertRule = (ruleId: string) => {
    const rule = alertRules.find(r => r.id === ruleId);
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
    
    toast({
      title: "Alert Rule Deleted",
      description: `"${rule?.name}" has been removed.`
    });
  };

  const toggleRuleEnabled = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({
      ...prev,
      ...settings
    }));
    
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved."
    });
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'deviation': return <TrendingUp className="h-4 w-4" />;
      case 'accuracy': return <Activity className="h-4 w-4" />;
      case 'performance': return <TrendingDown className="h-4 w-4" />;
      case 'threshold': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Alert Management</h2>
        <p className="text-muted-foreground">
          Configure alert rules and notification settings for forecast monitoring
        </p>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Alert Rule</span>
              </CardTitle>
              <CardDescription>
                Define conditions that will trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., High Deviation Alert"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule-type">Alert Type</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deviation">Deviation</SelectItem>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="threshold">Threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule-condition">Condition</Label>
                  <Select
                    value={newRule.condition}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, condition: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule-value">Value</Label>
                  <Input
                    id="rule-value"
                    type="number"
                    value={newRule.value || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-severity">Severity</Label>
                  <Select
                    value={newRule.severity}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, severity: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule-cooldown">Cooldown (minutes)</Label>
                  <Input
                    id="rule-cooldown"
                    type="number"
                    value={newRule.cooldown || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, cooldown: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notifications</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newRule.notifications?.email}
                        onCheckedChange={(checked) => 
                          setNewRule(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications!, email: checked }
                          }))
                        }
                      />
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newRule.notifications?.push}
                        onCheckedChange={(checked) => 
                          setNewRule(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications!, push: checked }
                          }))
                        }
                      />
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newRule.notifications?.inApp}
                        onCheckedChange={(checked) => 
                          setNewRule(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications!, inApp: checked }
                          }))
                        }
                      />
                      <Bell className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={addAlertRule} className="w-full md:w-auto">
                Create Alert Rule
              </Button>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Rules ({alertRules.filter(r => r.enabled).length})</h3>
            {alertRules.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No alert rules configured</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alertRules.map((rule) => (
                <Card key={rule.id} className={rule.enabled ? '' : 'opacity-60'}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRuleIcon(rule.type)}
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <CardDescription>
                            {rule.type} {rule.condition} {rule.value}
                            {rule.type === 'deviation' || rule.type === 'accuracy' ? '%' : ''}
                          </CardDescription>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(rule.severity)}`} />
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRuleEnabled(rule.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingRule(rule.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlertRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Cooldown: {rule.cooldown}min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Forecasts: {rule.forecasts[0] === 'all' ? 'All' : rule.forecasts.length}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>
                          {[
                            rule.notifications.email && 'Email',
                            rule.notifications.push && 'Push',
                            rule.notifications.inApp && 'In-App'
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email.enabled}
                  onCheckedChange={(checked) => 
                    updateNotificationSettings({
                      email: { ...notificationSettings.email, enabled: checked }
                    })
                  }
                />
              </div>
              
              {notificationSettings.email.enabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      value={notificationSettings.email.address}
                      onChange={(e) => 
                        updateNotificationSettings({
                          email: { ...notificationSettings.email, address: e.target.value }
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-frequency">Frequency</Label>
                    <Select
                      value={notificationSettings.email.frequency}
                      onValueChange={(value) => 
                        updateNotificationSettings({
                          email: { ...notificationSettings.email, frequency: value as any }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Push Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts on your mobile device
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.push.enabled}
                  onCheckedChange={(checked) => 
                    updateNotificationSettings({
                      push: { ...notificationSettings.push, enabled: checked }
                    })
                  }
                />
              </div>
              
              {notificationSettings.push.enabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="push-frequency">Frequency</Label>
                    <Select
                      value={notificationSettings.push.frequency}
                      onValueChange={(value) => 
                        updateNotificationSettings({
                          push: { ...notificationSettings.push, frequency: value as any }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>In-App Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications within the application
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.inApp.enabled}
                  onCheckedChange={(checked) => 
                    updateNotificationSettings({
                      inApp: { ...notificationSettings.inApp, enabled: checked }
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when notifications appear
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.inApp.sound}
                  onCheckedChange={(checked) => 
                    updateNotificationSettings({
                      inApp: { ...notificationSettings.inApp, sound: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alert History Retention</Label>
                    <p className="text-sm text-muted-foreground">
                      How long to keep alert history
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-acknowledge Low Severity</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically acknowledge low severity alerts after 24 hours
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Batch Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Group similar alerts together to reduce noise
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};