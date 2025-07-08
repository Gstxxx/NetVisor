'use client';

import { useState, useEffect } from 'react';
import { useNetworkDashboard } from '@/hooks/use-network-dashboard';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Smartphone, Laptop, Router, Server, HardDrive, Monitor,
  Search, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

export function NetworkDevices() {
  const { isScanning, refreshAll, devices } = useNetworkDashboard();

  const [filteredDevices, setFilteredDevices] = useState(devices);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = devices.filter(device =>
      device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm) ||
      device.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDevices(filtered);
  }, [searchTerm, devices]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="h-5 w-5" />;
      case 'laptop': return <Laptop className="h-5 w-5" />;
      case 'router': return <Router className="h-5 w-5" />;
      case 'server': return <Server className="h-5 w-5" />;
      case 'storage': return <HardDrive className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'online' ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Network Devices</CardTitle>
            <CardDescription className="text-slate-400">
              Discovered devices on your network
            </CardDescription>
          </div>
          <Button
            onClick={refreshAll}
            disabled={isScanning}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 hover:bg-slate-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Network'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-700/30">
                <TableHead className="text-slate-300">Device</TableHead>
                <TableHead className="text-slate-300">IP Address</TableHead>
                <TableHead className="text-slate-300">MAC Address</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Last Seen</TableHead>
                <TableHead className="text-slate-300">Ports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id} className="border-slate-700 hover:bg-slate-700/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="text-slate-400">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{device.hostname}</div>
                        <div className="text-sm text-slate-400">{device.vendor}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 font-mono">{device.ip}</TableCell>
                  <TableCell className="text-slate-300 font-mono text-sm">{device.mac}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell className="text-slate-300">{formatLastSeen(device.lastSeen)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {device.openPorts.slice(0, 3).map((port) => (
                        <Badge key={port} variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {port}
                        </Badge>
                      ))}
                      {device.openPorts.length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          +{device.openPorts.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
