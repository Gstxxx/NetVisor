import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lê estatísticas de tráfego de /proc/net/dev
    const getInterfaceStats = async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile('/proc/net/dev', 'utf-8');
      const lines = content.trim().split('\n').slice(2); // ignora cabeçalho
      let mainIface = null;
      let maxBytes = 0;
      let stats = null;
      for (const line of lines) {
        const [iface, ...rest] = line.replace(/\s+/g, ' ').trim().split(' ');
        const rxBytes = parseInt(rest[0], 10);
        const txBytes = parseInt(rest[8], 10);
        // Seleciona a interface com mais tráfego (ignora lo)
        if (iface !== 'lo:' && rxBytes + txBytes > maxBytes) {
          mainIface = iface.replace(':', '');
          maxBytes = rxBytes + txBytes;
          stats = { rxBytes, txBytes };
        }
      }
      return { iface: mainIface, ...stats };
    };

    // Faz duas leituras rápidas para estimar KB/s
    const first = await getInterfaceStats();
    await new Promise(r => setTimeout(r, 1000));
    const second = await getInterfaceStats();
    const download = (typeof second.rxBytes === 'number' && typeof first.rxBytes === 'number')
      ? (second.rxBytes - first.rxBytes) / 1024
      : 0; // KB/s
    const upload = (typeof second.txBytes === 'number' && typeof first.txBytes === 'number')
      ? (second.txBytes - first.txBytes) / 1024
      : 0; // KB/s

    const trafficData = {
      download: Math.max(download, 0),
      upload: Math.max(upload, 0),
      iface: second.iface,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      traffic: trafficData
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get traffic data', details: String(error) },
      { status: 500 }
    );
  }
}