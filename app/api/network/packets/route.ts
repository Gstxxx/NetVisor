import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, this would capture actual network packets
    // For now, we'll generate mock packet data
    
    const protocols = ['HTTP', 'HTTPS', 'DNS', 'TCP', 'UDP', 'ICMP'];
    const sources = ['192.168.1.100', '192.168.1.150', '8.8.8.8'];
    const destinations = ['192.168.1.1', '216.58.194.174', '142.250.185.46'];
    
    const generatePacket = () => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        source: sources[Math.floor(Math.random() * sources.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        size: Math.floor(Math.random() * 1500) + 64,
        info: 'Sample packet information'
      };
    };

    const packets = Array.from({ length: 10 }, generatePacket);

    return NextResponse.json({
      success: true,
      packets
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to capture packets' },
      { status: 500 }
    );
  }
}