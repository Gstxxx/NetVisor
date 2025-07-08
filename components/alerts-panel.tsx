'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Shield, 
  Bell, 
  Settings,
  X,
  CheckCircle,
  Clock,
  Zap,
  Wifi,
  Lock
} from 'lucide-react';

interface NetworkAlert {
  id: string;
  timestamp: Date;
  type: 'security' | 'performance' | 'connectivity' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
  actionTaken?: string;
}

interface AlertsPanelProps {
  onStatusChange: (status: 'healthy' | 'warning' | 'critical') => void;
}

export function AlertsPanel({ onStatusChange }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<NetworkAlert[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Mock alerts data
  const mockAlerts: NetworkAlert[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      type: 'security',
      severity: 'critical',
      title: 'Suspicious Network Activity',
      description: 'Multiple failed login attempts detected from IP 192.168.1.200',
      source: '192.168.1.200',
      status: 'active'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000),
      type: 'performance',
      severity: 'high',
      title: 'High Network Latency',
      description: 'Network latency increased to 250ms, affecting user experience',
      source: 'Gateway',
      status: 'acknowledged'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 900000),
      type: 'connectivity',
      severity: 'medium',
      title: 'Device Disconnected',
      description: 'NAS-Server has disconnected from the network',
      source: '192.168.1.200',
      status: 'resolved',
      actionTaken: 'Device reconnected automatically'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1800000),
      type: 'system',
      severity: 'low',
      title: 'Bandwidth Threshold Exceeded',
      description: 'Monthly bandwidth usage exceeded 80% threshold',
      source: 'Monitoring System',
      status: 'active'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 3600000),
      type: 'security',
      severity: 'medium',
      title: 'New Device Detected',
      description: 'Unknown device connected to network: AC:DE:48:00:11:22',
      source: '192.168.1.175',
      status: 'acknowledged'
    }
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
    
    // Determine overall network status
    const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'active');
    const highAlerts = mockAlerts.filter(a => a.severity === 'high' && a.status === 'active');
    
    if (criticalAlerts.length > 0) {
      onStatusChange('critical');
    } else if (highAlerts.length > 0) {
      onStatusChange('warning');
    } else {
      onStatusChange('healthy');
    }
  }, [onStatusChange]);

  useEffect(() => {
    let filtered = alerts;
    
    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        filtered = alerts.filter(alert => alert.status === 'active');
      } else {
        filtered = alerts.filter(alert => alert.type === activeTab);
      }
    }
    
    setFilteredAlerts(filtered);
  }, [alerts, activeTab]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'acknowledged': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Lock className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'connectivity': return <Wifi className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4" />;
      case 'acknowledged': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged' as const } : alert
    ));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const getAlertStats = () => {
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      security: alerts.filter(a => a.type === 'security').length
    };
    return stats;
  };

  const stats = getAlertStats();

  return (
    <div className="space-y-6">
      {/* Alert Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Alerts</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Bell className="h-6 w-6 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-2xl font-bold text-red-400">{stats.active}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Critical</p>
                <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              </div>
              <Shield className="h-6 w-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Security</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.security}</p>
              </div>
              <Lock className="h-6 w-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Network Alerts</CardTitle>
          <CardDescription className="text-slate-400">
            Monitor and manage network security and performance alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <Alert key={alert.id} className="bg-slate-900/50 border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-white">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {getStatusIcon(alert.status)}
                                <span className="ml-1 capitalize">{alert.status}</span>
                              </Badge>
                            </div>
                            <AlertDescription className="text-slate-300 mb-2">
                              {alert.description}
                            </AlertDescription>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span>Source: {alert.source}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(alert.timestamp)}</span>
                            </div>
                            {alert.actionTaken && (
                              <div className="mt-2 text-sm text-green-400">
                                Action taken: {alert.actionTaken}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                            >
                              Acknowledge
                            </Button>
                          )}
                          {alert.status === 'acknowledged' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                            >
                              Resolve
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}