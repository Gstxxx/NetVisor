'use client';

import { useEffect, useState } from 'react';
import { useNetworkDashboard } from '@/hooks/use-network-dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Wifi,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';

export function NetworkStats() {
  const { deviceCount, totalTraffic, networkStatus } = useNetworkDashboard();

  const [uptime, setUptime] = useState<number>(0);
  const [responseTime, setResponseTime] = useState<number>(0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSpeed = (speed: number) => {
    return formatBytes(speed * 1024) + '/s';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const bandwidthUtilization = Math.min(
    ((totalTraffic.download + totalTraffic.upload) / 1000) * 100,
    100
  );

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const res = await fetch('/api/network/uptime');
        const data = await res.json();
        if (data && typeof data.uptimePercent === 'number') {
          setUptime(data.uptimePercent);
        }
      } catch {
        setUptime(0);
      }
    };
    fetchUptime();
  }, []);

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const res = await fetch('/api/network/ping');
        const data = await res.json();
        if (data && typeof data.responseTime === 'number') {
          setResponseTime(data.responseTime);
        }
      } catch {
        setResponseTime(0);
      }
    };
    fetchPing();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Network Status */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
            <Wifi className="h-4 w-4 mr-2 text-blue-400" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge className={getStatusColor(networkStatus)}>
              <Shield className="h-3 w-3 mr-1" />
              {networkStatus.charAt(0).toUpperCase() + networkStatus.slice(1)}
            </Badge>
            <div className="text-2xl font-bold text-white">{deviceCount}</div>
            <p className="text-sm text-slate-400">Connected Devices</p>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Overview */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-green-400" />
            Traffic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-slate-400">
                <TrendingDown className="h-3 w-3 mr-1 text-blue-400" />
                Download
              </div>
              <span className="text-white font-medium">
                {formatSpeed(totalTraffic.download)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-slate-400">
                <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                Upload
              </div>
              <span className="text-white font-medium">
                {formatSpeed(totalTraffic.upload)}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Bandwidth Usage</span>
                <span className="text-xs text-slate-300">
                  {bandwidthUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress value={bandwidthUtilization} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-white">{responseTime}ms</div>
              <p className="text-sm text-slate-400">Response Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-purple-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-white">{uptime}%</div>
              <p className="text-sm text-slate-400">Uptime</p>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Uptime Meter</span>
                <span className="text-xs text-slate-300">{uptime}%</span>
              </div>
              <Progress value={uptime} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
