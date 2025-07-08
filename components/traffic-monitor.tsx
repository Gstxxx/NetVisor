'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Download, Upload, Activity, TrendingUp, Pause, Play
} from 'lucide-react';

interface TrafficData {
  timestamp: string;
  download: number;
  upload: number;
  total: number;
}

interface DeviceTraffic {
  ip: string;
  hostname: string;
  download: number;
  upload: number;
  total: number;
  percentage: number;
}

interface TrafficMonitorProps {
  onTrafficChange: (traffic: { download: number; upload: number }) => void;
}

export function TrafficMonitor({ onTrafficChange }: TrafficMonitorProps) {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [deviceTraffic, setDeviceTraffic] = useState<DeviceTraffic[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState({ download: 0, upload: 0 });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchTraffic = async () => {
      try {
        const res = await fetch('/api/network/traffic');
        const data = await res.json();
        if (data?.traffic) {
          const { download, upload, timestamp } = data.traffic;
          const entry = {
            timestamp: new Date(timestamp).toLocaleTimeString(),
            download,
            upload,
            total: download + upload,
          };
          setTrafficData(prev => [...prev.slice(-29), entry]);
          setCurrentSpeed({ download, upload });
          onTrafficChange({ download, upload });
        }
      } catch {
        setCurrentSpeed({ download: 0, upload: 0 });
      }
    };

    fetchTraffic();
    interval = setInterval(() => {
      if (isMonitoring) fetchTraffic();
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, onTrafficChange]);

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatSpeed = (speed: number) => `${formatBytes(speed * 1024)}/s`;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Download */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <Download className="h-4 w-4 mr-2 text-blue-400" /> Download Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatSpeed(currentSpeed.download)}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">+12% from last hour</span>
            </div>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <Upload className="h-4 w-4 mr-2 text-green-400" /> Upload Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatSpeed(currentSpeed.upload)}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">+5% from last hour</span>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Toggle */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-purple-400" /> Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge
                className={`${isMonitoring
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
              >
                {isMonitoring ? 'Active' : 'Paused'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Network Traffic</CardTitle>
          <CardDescription className="text-slate-400">
            Real-time network traffic monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatSpeed} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F3F4F6' }}
                formatter={(value: number, name: string) => [
                  formatSpeed(value),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Line type="monotone" dataKey="download" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="upload" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Traffic Distribution (Mocked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Top Devices by Traffic</CardTitle>
            <CardDescription className="text-slate-400">
              Bandwidth usage by device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceTraffic.map((device) => (
                <div key={device.ip} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{device.hostname}</div>
                      <div className="text-sm text-slate-400">{device.ip}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {formatSpeed(device.total)}
                      </div>
                      <div className="text-xs text-slate-400">
                        ↓{formatSpeed(device.download)} ↑{formatSpeed(device.upload)}
                      </div>
                    </div>
                  </div>
                  <Progress value={device.percentage} className="h-2" style={{ backgroundColor: '#374151' }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Traffic Distribution</CardTitle>
            <CardDescription className="text-slate-400">Bandwidth usage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceTraffic}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ hostname, percentage }) => `${hostname} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {deviceTraffic.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatSpeed(value), 'Traffic']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
