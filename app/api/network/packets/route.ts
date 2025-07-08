import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lê conexões reais de /proc/net/tcp e /proc/net/udp
    const fs = await import('fs/promises');
    type Proto = 'TCP' | 'UDP';
    interface Packet {
      id: string;
      timestamp: string;
      source: string;
      destination: string;
      protocol: Proto;
      size: number | null;
      info: string;
    }
    const parseConnections = (content: string, proto: Proto): Packet[] => {
      const lines = content.trim().split('\n').slice(1); // ignora cabeçalho
      return lines.map((line, idx) => {
        const parts = line.trim().split(/\s+/);
        const local = parts[1];
        const remote = parts[2];
        const hexToIpPort = (hex: string) => {
          const [ipHex, portHex] = hex.split(':');
          const ip = ipHex.match(/../g)?.reverse().map(h => parseInt(h, 16)).join('.') ?? '';
          const port = parseInt(portHex, 16);
          return { ip, port };
        };
        const localAddr = hexToIpPort(local);
        const remoteAddr = hexToIpPort(remote);
        return {
          id: proto + '-' + idx,
          timestamp: new Date().toISOString(),
          source: localAddr.ip + ':' + localAddr.port,
          destination: remoteAddr.ip + ':' + remoteAddr.port,
          protocol: proto,
          size: null,
          info: ''
        };
      });
    };

    const [tcpContent, udpContent]: [string, string] = await Promise.all([
      fs.readFile('/proc/net/tcp', 'utf-8'),
      fs.readFile('/proc/net/udp', 'utf-8')
    ]);
    const tcpPackets = parseConnections(tcpContent, 'TCP');
    const udpPackets = parseConnections(udpContent, 'UDP');
    const packets: Packet[] = [...tcpPackets, ...udpPackets].slice(0, 20); // limita a 20

    return NextResponse.json({
      success: true,
      packets
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to capture packets', details: String(error) },
      { status: 500 }
    );
  }
}