'use client';

import { useState, useEffect } from 'react';
import { NetworkDevices } from '@/components/network-devices';
import { TrafficMonitor } from '@/components/traffic-monitor';
import { PacketAnalyzer } from '@/components/packet-analyzer';
import { AlertsPanel } from '@/components/alerts-panel';
import { NetworkStats } from '@/components/network-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, Activity, Network, AlertTriangle } from 'lucide-react';

export default function NetMonitorDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [deviceCount, setDeviceCount] = useState(0);
  const [totalTraffic, setTotalTraffic] = useState({ download: 0, upload: 0 });

  const handleRefresh = async () => {
    setIsScanning(true);
    try {
      // Simulate network scan
      await fetch('/api/network/scan', { method: 'POST' });
      setLastScan(new Date());
    } catch (error) {
      console.error('Failed to scan network:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    // Initial scan
    handleRefresh();

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Shield className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NetMonitor
            </h1>
            <p className="text-slate-400 mt-2">Network Monitoring & Analysis Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(networkStatus)}`} />
              <span className="text-sm text-slate-300">
                Network {networkStatus}
              </span>
            </div>
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {deviceCount} devices
            </Badge>
            <Button 
              onClick={handleRefresh}
              disabled={isScanning}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Network Stats Overview */}
        <NetworkStats 
          deviceCount={deviceCount}
          totalTraffic={totalTraffic}
          networkStatus={networkStatus}
        />

        {/* Main Dashboard */}
        <Tabs defaultValue="devices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="devices" className="data-[state=active]:bg-slate-700">
              <Network className="h-4 w-4 mr-2" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="traffic" className="data-[state=active]:bg-slate-700">
              <Activity className="h-4 w-4 mr-2" />
              Traffic
            </TabsTrigger>
            <TabsTrigger value="packets" className="data-[state=active]:bg-slate-700">
              <Shield className="h-4 w-4 mr-2" />
              Packets
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-6">
            <NetworkDevices onDeviceCountChange={setDeviceCount} />
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <TrafficMonitor onTrafficChange={setTotalTraffic} />
          </TabsContent>

          <TabsContent value="packets" className="space-y-6">
            <PacketAnalyzer />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel onStatusChange={setNetworkStatus} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          {lastScan && (
            <p>Last scan: {lastScan.toLocaleTimeString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}