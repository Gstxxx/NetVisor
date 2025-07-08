import { useState, useEffect, useCallback } from 'react';

export interface NetworkAlert {
  id: string;
  timestamp: string;
  type: 'security' | 'performance' | 'connectivity' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  status: 'active' | 'acknowledged' | 'resolved';
  actionTaken?: string;
}

export interface Device {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  deviceType: 'router' | 'server' | 'storage' | 'laptop' | 'smartphone' | 'unknown';
  status: 'online' | 'offline';
  lastSeen: Date;
  vendor: string;
  openPorts: number[];
}

export function useNetworkDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [totalTraffic, setTotalTraffic] = useState({ download: 0, upload: 0 });
  const [networkStatus, setNetworkStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  const guessDeviceType = (hostname: string, vendor: string): Device['deviceType'] => {
    const fingerprint = (hostname + vendor).toLowerCase();
    if (/router|gateway/.test(hostname) || /cisco|tp-link|d-link|mikrotik/.test(vendor)) return 'router';
    if (/nas|storage|synology|qnap/.test(fingerprint)) return 'storage';
    if (/server/.test(hostname)) return 'server';
    if (/iphone|android|phone|tablet/.test(fingerprint)) return 'smartphone';
    if (/macbook|laptop|notebook|dell|lenovo|hp|asus|acer/.test(fingerprint)) return 'laptop';
    return 'unknown';
  };

  const fetchScan = async () => {
    try {
      const res = await fetch('/api/network/scan', { method: 'POST' });
      const data = await res.json();
      if (Array.isArray(data.devices)) {
        const now = new Date();
        const parsedDevices: Device[] = data.devices.map((d: any, idx: number) => ({
          id: d.mac || d.ip || String(idx),
          ip: d.ip,
          mac: d.mac || '',
          hostname: d.hostname || d.ip,
          deviceType: guessDeviceType(d.hostname || '', d.vendor || ''),
          status: d.status === 'online' ? 'online' : 'offline',
          lastSeen: now,
          vendor: d.vendor || '',
          openPorts: d.openPorts || []
        }));
        setDevices(parsedDevices);
        setDeviceCount(parsedDevices.length);
        setLastScan(now);
      } else {
        setDevices([]);
        setDeviceCount(0);
      }
    } catch {
      setDevices([]);
      setDeviceCount(0);
    }
  };

  const fetchTraffic = async () => {
    try {
      const res = await fetch('/api/network/traffic');
      const data = await res.json();
      if (data?.traffic) {
        setTotalTraffic({ download: data.traffic.download, upload: data.traffic.upload });
      }
    } catch {
      setTotalTraffic({ download: 0, upload: 0 });
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/network/alerts');
      const data = await res.json();
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
        const hasCritical = data.alerts.some((a: any) => a.severity === 'critical' && a.status === 'active');
        const hasHigh = data.alerts.some((a: any) => a.severity === 'high' && a.status === 'active');
        if (hasCritical) setNetworkStatus('critical');
        else if (hasHigh) setNetworkStatus('warning');
        else setNetworkStatus('healthy');
      } else {
        setAlerts([]);
        setNetworkStatus('healthy');
      }
    } catch {
      setAlerts([]);
      setNetworkStatus('healthy');
    }
  };

  const refreshAll = useCallback(async () => {
    setIsScanning(true);
    await Promise.allSettled([
      fetchScan(),
      fetchTraffic(),
      fetchAlerts()
    ]);
    setIsScanning(false);
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return {
    isScanning,
    devices,
    lastScan,
    deviceCount,
    totalTraffic,
    networkStatus,
    alerts,
    refreshAll,
    setDeviceCount,
    setTotalTraffic,
    setNetworkStatus,
  };
}
