'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Filter, 
  Search,
  Shield,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';

interface Packet {
  id: string;
  timestamp: Date;
  source: string;
  destination: string;
  protocol: string;
  size: number;
  info: string;
  severity: 'info' | 'warning' | 'critical';
}

export function PacketAnalyzer() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [filteredPackets, setFilteredPackets] = useState<Packet[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);

  // Mock packet data generator
  const generateMockPacket = (): Packet => {
    const protocols = ['HTTP', 'HTTPS', 'DNS', 'TCP', 'UDP', 'ICMP', 'ARP'];
    const sources = ['192.168.1.100', '192.168.1.150', '192.168.1.200', '8.8.8.8', '1.1.1.1'];
    const destinations = ['192.168.1.1', '192.168.1.100', '216.58.194.174', '142.250.185.46'];
    
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    
    let info = '';
    let severity: 'info' | 'warning' | 'critical' = 'info';
    
    switch (protocol) {
      case 'HTTP':
        info = `GET /api/data HTTP/1.1`;
        break;
      case 'HTTPS':
        info = `TLS handshake`;
        break;
      case 'DNS':
        info = `Standard query A google.com`;
        break;
      case 'TCP':
        info = `${Math.floor(Math.random() * 65536)} → ${Math.floor(Math.random() * 65536)} [SYN]`;
        if (Math.random() < 0.1) {
          severity = 'warning';
          info += ' [Suspicious port]';
        }
        break;
      case 'UDP':
        info = `${Math.floor(Math.random() * 65536)} → ${Math.floor(Math.random() * 65536)} Len=${Math.floor(Math.random() * 1000)}`;
        break;
      case 'ICMP':
        info = `Echo (ping) request`;
        if (Math.random() < 0.05) {
          severity = 'critical';
          info = 'Ping flood detected';
        }
        break;
      case 'ARP':
        info = `Who has ${destination}? Tell ${source}`;
        break;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      source,
      destination,
      protocol,
      size: Math.floor(Math.random() * 1500) + 64,
      info,
      severity
    };
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCapturing) {
      interval = setInterval(() => {
        const newPacket = generateMockPacket();
        setPackets(prev => [newPacket, ...prev.slice(0, 999)]); // Keep last 1000 packets
      }, 500 + Math.random() * 1500); // Random interval between 0.5-2 seconds
    }

    return () => clearInterval(interval);
  }, [isCapturing]);

  useEffect(() => {
    let filtered = packets;
    
    if (searchTerm) {
      filtered = filtered.filter(packet =>
        packet.source.includes(searchTerm) ||
        packet.destination.includes(searchTerm) ||
        packet.info.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (protocolFilter !== 'all') {
      filtered = filtered.filter(packet => packet.protocol === protocolFilter);
    }
    
    setFilteredPackets(filtered);
  }, [packets, searchTerm, protocolFilter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Info</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Shield className="h-4 w-4 text-blue-400" />;
    }
  };

  const getProtocolColor = (protocol: string) => {
    const colors: { [key: string]: string } = {
      'HTTP': 'text-blue-400',
      'HTTPS': 'text-green-400',
      'DNS': 'text-purple-400',
      'TCP': 'text-orange-400',
      'UDP': 'text-cyan-400',
      'ICMP': 'text-red-400',
      'ARP': 'text-yellow-400'
    };
    return colors[protocol] || 'text-gray-400';
  };

  const exportPackets = () => {
    const data = JSON.stringify(filteredPackets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-packets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Packet Analyzer</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time network packet capture and analysis
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportPackets}
                className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant={isCapturing ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsCapturing(!isCapturing)}
                className={isCapturing ? "" : "bg-green-600 hover:bg-green-700"}
              >
                {isCapturing ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isCapturing ? 'Stop Capture' : 'Start Capture'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search packets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <Select value={protocolFilter} onValueChange={setProtocolFilter}>
              <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="HTTP">HTTP</SelectItem>
                <SelectItem value="HTTPS">HTTPS</SelectItem>
                <SelectItem value="DNS">DNS</SelectItem>
                <SelectItem value="TCP">TCP</SelectItem>
                <SelectItem value="UDP">UDP</SelectItem>
                <SelectItem value="ICMP">ICMP</SelectItem>
                <SelectItem value="ARP">ARP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Packet List */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Captured Packets ({filteredPackets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/30">
                  <TableHead className="text-slate-300">Time</TableHead>
                  <TableHead className="text-slate-300">Source</TableHead>
                  <TableHead className="text-slate-300">Destination</TableHead>
                  <TableHead className="text-slate-300">Protocol</TableHead>
                  <TableHead className="text-slate-300">Size</TableHead>
                  <TableHead className="text-slate-300">Severity</TableHead>
                  <TableHead className="text-slate-300">Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackets.map((packet) => (
                  <TableRow 
                    key={packet.id} 
                    className="border-slate-700 hover:bg-slate-700/30 cursor-pointer"
                    onClick={() => setSelectedPacket(packet)}
                  >
                    <TableCell className="text-slate-300 font-mono text-sm">
                      {packet.timestamp.toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono">{packet.source}</TableCell>
                    <TableCell className="text-slate-300 font-mono">{packet.destination}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getProtocolColor(packet.protocol)} border-slate-600`}
                      >
                        {packet.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{packet.size}B</TableCell>
                    <TableCell>{getSeverityBadge(packet.severity)}</TableCell>
                    <TableCell className="text-slate-300 max-w-md truncate">{packet.info}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Packet Details */}
      {selectedPacket && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Packet Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-slate-400">Timestamp:</label>
                <p className="text-white font-mono">{selectedPacket.timestamp.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-slate-400">Protocol:</label>
                <p className={`font-mono ${getProtocolColor(selectedPacket.protocol)}`}>
                  {selectedPacket.protocol}
                </p>
              </div>
              <div>
                <label className="text-slate-400">Source:</label>
                <p className="text-white font-mono">{selectedPacket.source}</p>
              </div>
              <div>
                <label className="text-slate-400">Destination:</label>
                <p className="text-white font-mono">{selectedPacket.destination}</p>
              </div>
              <div>
                <label className="text-slate-400">Size:</label>
                <p className="text-white">{selectedPacket.size} bytes</p>
              </div>
              <div>
                <label className="text-slate-400">Severity:</label>
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(selectedPacket.severity)}
                  {getSeverityBadge(selectedPacket.severity)}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-slate-400">Information:</label>
                <p className="text-white mt-1">{selectedPacket.info}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}