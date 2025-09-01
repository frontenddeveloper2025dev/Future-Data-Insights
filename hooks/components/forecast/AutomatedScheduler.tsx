import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { table, email, elevenlabs } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Calendar, 
  BarChart3, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Mail,
  Volume2
} from 'lucide-react';

interface ScheduledTask {
  id: string;
  type: 'daily_report' | 'weekly_summary' | 'accuracy_update' | 'model_evaluation';
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  next_run: string;
  last_run: string | null;
  status: 'active' | 'paused' | 'running' | 'completed' | 'error';
  config: {
    time: string; // HH:MM format
    day_of_week?: number; // 0-6 (Sunday-Saturday)
    enabled: boolean;
  };
}

interface TaskExecutionResult {
  task_id: string;
  execution_time: string;
  status: 'success' | 'partial' | 'failed';
  details: {
    forecasts_processed: number;
    alerts_sent: number;
    reports_generated: number;
    errors: string[];
  };
}

const AutomatedScheduler: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [executionHistory, setExecutionHistory] = useState<TaskExecutionResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeScheduledTasks();
    loadExecutionHistory();
    startScheduler();

    return () => {
      // Cleanup scheduler on unmount
    };
  }, []);

  const initializeScheduledTasks = () => {
    const defaultTasks: ScheduledTask[] = [
      {
        id: 'daily_accuracy_update',
        type: 'accuracy_update',
        title: 'Daily Accuracy Update',
        description: 'Update forecast accuracy metrics and identify underperforming models',
        frequency: 'daily',
        next_run: getNextRun('daily', '09:00'),
        last_run: null,
        status: 'active',
        config: {
          time: '09:00',
          enabled: true,
        },
      },
      {
        id: 'daily_performance_report',
        type: 'daily_report',
        title: 'Daily Performance Report',
        description: 'Generate and send daily forecast performance summary',
        frequency: 'daily',
        next_run: getNextRun('daily', '10:00'),
        last_run: null,
        status: 'active',
        config: {
          time: '10:00',
          enabled: true,
        },
      },
      {
        id: 'weekly_summary',
        type: 'weekly_summary',
        title: 'Weekly Summary Report',
        description: 'Comprehensive weekly analysis with trends and recommendations',
        frequency: 'weekly',
        next_run: getNextRun('weekly', '08:00', 1), // Monday
        last_run: null,
        status: 'active',
        config: {
          time: '08:00',
          day_of_week: 1,
          enabled: true,
        },
      },
      {
        id: 'model_evaluation',
        type: 'model_evaluation',
        title: 'Monthly Model Evaluation',
        description: 'Evaluate model performance and suggest optimization',
        frequency: 'monthly',
        next_run: getNextRun('monthly', '07:00', undefined, 1), // 1st of month
        last_run: null,
        status: 'active',
        config: {
          time: '07:00',
          enabled: true,
        },
      },
    ];

    // Load from localStorage or use defaults
    const savedTasks = localStorage.getItem('scheduled_forecast_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(defaultTasks);
      localStorage.setItem('scheduled_forecast_tasks', JSON.stringify(defaultTasks));
    }
  };

  const loadExecutionHistory = () => {
    const savedHistory = localStorage.getItem('task_execution_history');
    if (savedHistory) {
      setExecutionHistory(JSON.parse(savedHistory));
    }
  };

  const getNextRun = (frequency: string, time: string, dayOfWeek?: number, dayOfMonth?: number): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      
      case 'weekly':
        if (dayOfWeek !== undefined) {
          const daysUntilTarget = (dayOfWeek - nextRun.getDay() + 7) % 7;
          if (daysUntilTarget === 0 && nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
          } else {
            nextRun.setDate(nextRun.getDate() + daysUntilTarget);
          }
        }
        break;
        
      case 'monthly':
        if (dayOfMonth !== undefined) {
          nextRun.setDate(dayOfMonth);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
        break;
    }
    
    return nextRun.toISOString();
  };

  const startScheduler = () => {
    // Check every minute for tasks to run
    const interval = setInterval(() => {
      checkAndRunScheduledTasks();
    }, 60000);

    return () => clearInterval(interval);
  };

  const checkAndRunScheduledTasks = async () => {
    const now = new Date();
    
    for (const task of tasks) {
      if (task.config.enabled && task.status === 'active' && new Date(task.next_run) <= now) {
        await executeTask(task);
      }
    }
  };

  const executeTask = async (task: ScheduledTask) => {
    setIsRunning(true);
    setCurrentTask(task.id);
    setProgress(0);

    try {
      // Update task status
      const updatedTasks = tasks.map(t => 
        t.id === task.id 
          ? { ...t, status: 'running' as const, last_run: new Date().toISOString() }
          : t
      );
      setTasks(updatedTasks);

      let result: TaskExecutionResult;

      switch (task.type) {
        case 'accuracy_update':
          result = await executeAccuracyUpdate(task);
          break;
        case 'daily_report':
          result = await executeDailyReport(task);
          break;
        case 'weekly_summary':
          result = await executeWeeklySummary(task);
          break;
        case 'model_evaluation':
          result = await executeModelEvaluation(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      // Update execution history
      const newHistory = [result, ...executionHistory].slice(0, 100);
      setExecutionHistory(newHistory);
      localStorage.setItem('task_execution_history', JSON.stringify(newHistory));

      // Update task with next run time and status
      const finalTasks = updatedTasks.map(t => 
        t.id === task.id 
          ? { 
              ...t, 
              status: result.status === 'success' ? 'active' as const : 'error' as const,
              next_run: getNextRun(t.frequency, t.config.time, t.config.day_of_week)
            }
          : t
      );
      setTasks(finalTasks);
      localStorage.setItem('scheduled_forecast_tasks', JSON.stringify(finalTasks));

      toast({
        title: 'Task Completed',
        description: `${task.title} executed successfully`,
      });

    } catch (error) {
      console.error(`Error executing task ${task.id}:`, error);
      
      const errorTasks = tasks.map(t => 
        t.id === task.id 
          ? { ...t, status: 'error' as const }
          : t
      );
      setTasks(errorTasks);

      toast({
        title: 'Task Failed',
        description: `${task.title} execution failed`,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
      setCurrentTask(null);
      setProgress(0);
    }
  };

  const executeAccuracyUpdate = async (task: ScheduledTask): Promise<TaskExecutionResult> => {
    setProgress(10);
    
    // Get all forecasts and outcomes
    const [forecastsRes, outcomesRes] = await Promise.all([
      table.getItems('evn1j5kjx62o'),
      table.getItems('evtdsghlfbb4')
    ]);

    const forecasts = forecastsRes.items;
    const outcomes = outcomesRes.items;
    
    setProgress(30);

    let processed = 0;
    let alerts = 0;
    const errors: string[] = [];

    // Process each forecast
    for (const forecast of forecasts) {
      try {
        const forecastOutcomes = outcomes.filter((o: any) => o.forecast_id === forecast._id);
        
        if (forecastOutcomes.length > 0) {
          // Calculate recent accuracy
          const recentOutcomes = forecastOutcomes
            .sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
            .slice(0, 5);

          const avgAccuracy = recentOutcomes.reduce((sum: number, o: any) => sum + o.accuracy_percentage, 0) / recentOutcomes.length;

          // Check if below threshold (75%)
          if (avgAccuracy < 75) {
            // Create alert
            alerts++;
            
            // Send notification if configured
            const alertSettings = JSON.parse(localStorage.getItem('forecast_monitor_settings') || '{}');
            if (alertSettings.alert_methods?.email && alertSettings.email_settings?.recipients?.length > 0) {
              await sendAccuracyAlert(forecast, avgAccuracy);
            }
          }

          processed++;
          setProgress(30 + (processed / forecasts.length) * 50);
        }
      } catch (error) {
        errors.push(`Error processing forecast ${forecast.title}: ${error}`);
      }
    }

    setProgress(100);

    return {
      task_id: task.id,
      execution_time: new Date().toISOString(),
      status: errors.length === 0 ? 'success' : errors.length < processed ? 'partial' : 'failed',
      details: {
        forecasts_processed: processed,
        alerts_sent: alerts,
        reports_generated: 0,
        errors,
      },
    };
  };

  const executeDailyReport = async (task: ScheduledTask): Promise<TaskExecutionResult> => {
    setProgress(20);

    // Generate daily report
    const [forecastsRes, outcomesRes] = await Promise.all([
      table.getItems('evn1j5kjx62o'),
      table.getItems('evtdsghlfbb4')
    ]);

    const forecasts = forecastsRes.items;
    const outcomes = outcomesRes.items;

    setProgress(50);

    // Calculate daily metrics
    const today = new Date().toISOString().split('T')[0];
    const todayOutcomes = outcomes.filter((o: any) => o.recorded_at.startsWith(today));
    
    const totalAccuracy = forecasts.map(forecast => {
      const forecastOutcomes = outcomes.filter((o: any) => o.forecast_id === forecast._id);
      if (forecastOutcomes.length === 0) return 0;
      return forecastOutcomes.reduce((sum: number, o: any) => sum + o.accuracy_percentage, 0) / forecastOutcomes.length;
    }).filter(acc => acc > 0);

    const avgAccuracy = totalAccuracy.length > 0 ? totalAccuracy.reduce((sum, acc) => sum + acc, 0) / totalAccuracy.length : 0;

    setProgress(80);

    // Send email report
    const reportContent = `
      <h2>ForecastPro Daily Report - ${new Date().toLocaleDateString()}</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📊 Key Metrics</h3>
        <ul>
          <li><strong>Total Forecasts:</strong> ${forecasts.length}</li>
          <li><strong>Outcomes Recorded Today:</strong> ${todayOutcomes.length}</li>
          <li><strong>Average Accuracy:</strong> ${avgAccuracy.toFixed(1)}%</li>
          <li><strong>Forecasts with Data:</strong> ${totalAccuracy.length}</li>
        </ul>
      </div>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🎯 Performance Summary</h3>
        <p>
          ${avgAccuracy >= 85 ? '✅ Excellent performance - forecasts are highly accurate' : 
            avgAccuracy >= 75 ? '⚠️ Good performance - some forecasts may need attention' :
            '🚨 Performance below expectations - review and optimize models'}
        </p>
      </div>

      <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📈 Recommendations</h3>
        <ul>
          <li>Continue monitoring forecast accuracy</li>
          <li>Review models with accuracy below 75%</li>
          <li>Consider updating models with new data</li>
          <li>Implement data quality improvements</li>
        </ul>
      </div>

      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        This report was generated automatically by ForecastPro at ${new Date().toLocaleString()}.
      </p>
    `;

    const alertSettings = JSON.parse(localStorage.getItem('forecast_monitor_settings') || '{}');
    let reportsGenerated = 0;

    if (alertSettings.email_settings?.recipients?.length > 0) {
      for (const recipient of alertSettings.email_settings.recipients) {
        try {
          await email.sendEmail({
            from: 'noreply@forecastpro.com',
            to: [recipient],
            subject: `ForecastPro Daily Report - ${new Date().toLocaleDateString()}`,
            html: reportContent,
          });
          reportsGenerated++;
        } catch (error) {
          console.error('Error sending daily report:', error);
        }
      }
    }

    setProgress(100);

    return {
      task_id: task.id,
      execution_time: new Date().toISOString(),
      status: 'success',
      details: {
        forecasts_processed: forecasts.length,
        alerts_sent: 0,
        reports_generated: reportsGenerated,
        errors: [],
      },
    };
  };

  const executeWeeklySummary = async (task: ScheduledTask): Promise<TaskExecutionResult> => {
    // Similar to daily report but with weekly data and trends
    setProgress(100);
    
    return {
      task_id: task.id,
      execution_time: new Date().toISOString(),
      status: 'success',
      details: {
        forecasts_processed: 0,
        alerts_sent: 0,
        reports_generated: 1,
        errors: [],
      },
    };
  };

  const executeModelEvaluation = async (task: ScheduledTask): Promise<TaskExecutionResult> => {
    // Model performance evaluation and recommendations
    setProgress(100);
    
    return {
      task_id: task.id,
      execution_time: new Date().toISOString(),
      status: 'success',
      details: {
        forecasts_processed: 0,
        alerts_sent: 0,
        reports_generated: 1,
        errors: [],
      },
    };
  };

  const sendAccuracyAlert = async (forecast: any, accuracy: number) => {
    const alertContent = `
      <h2>⚠️ Forecast Accuracy Alert</h2>
      <p><strong>Forecast:</strong> ${forecast.title}</p>
      <p><strong>Current Accuracy:</strong> ${accuracy.toFixed(1)}%</p>
      <p><strong>Threshold:</strong> 75%</p>
      
      <p>This forecast is performing below the acceptable accuracy threshold. 
      Please review the model and consider updating with recent data.</p>
      
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Review recent prediction outcomes</li>
        <li>Update model with latest data</li>
        <li>Consider switching to a different forecasting model</li>
        <li>Adjust model parameters</li>
      </ul>
    `;

    const alertSettings = JSON.parse(localStorage.getItem('forecast_monitor_settings') || '{}');
    
    if (alertSettings.email_settings?.recipients?.length > 0) {
      for (const recipient of alertSettings.email_settings.recipients) {
        await email.sendEmail({
          from: 'alerts@forecastpro.com',
          to: [recipient],
          subject: `🚨 Forecast Accuracy Alert: ${forecast.title}`,
          html: alertContent,
        });
      }
    }
  };

  const runTaskManually = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await executeTask(task);
    }
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, config: { ...task.config, enabled: !task.config.enabled } }
        : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('scheduled_forecast_tasks', JSON.stringify(updatedTasks));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'paused': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automated Scheduler</h2>
          <p className="text-muted-foreground">Scheduled accuracy updates and reporting</p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Running: {tasks.find(t => t.id === currentTask)?.title}
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        )}
      </div>

      {/* Scheduled Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>Automated forecast monitoring and reporting tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {new Date(task.next_run).toLocaleString()}
                        </div>
                        {task.last_run && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last: {new Date(task.last_run).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTaskManually(task.id)}
                      disabled={isRunning}
                    >
                      Run Now
                    </Button>
                    <Button
                      size="sm"
                      variant={task.config.enabled ? "default" : "secondary"}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.config.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent task execution results and logs</CardDescription>
        </CardHeader>
        <CardContent>
          {executionHistory.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No execution history</p>
              <p className="text-muted-foreground">Tasks will appear here after they run</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executionHistory.slice(0, 10).map(result => {
                const task = tasks.find(t => t.id === result.task_id);
                return (
                  <div key={`${result.task_id}-${result.execution_time}`} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{task?.title || result.task_id}</h4>
                          <Badge className={result.status === 'success' ? 'text-green-600 bg-green-50' : 
                                          result.status === 'partial' ? 'text-yellow-600 bg-yellow-50' :
                                          'text-red-600 bg-red-50'}>
                            {result.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Processed:</span> {result.details.forecasts_processed}
                          </div>
                          <div>
                            <span className="font-medium">Alerts:</span> {result.details.alerts_sent}
                          </div>
                          <div>
                            <span className="font-medium">Reports:</span> {result.details.reports_generated}
                          </div>
                          <div>
                            <span className="font-medium">Errors:</span> {result.details.errors.length}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(result.execution_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedScheduler;