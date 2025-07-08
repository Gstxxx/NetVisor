import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lê o uptime do sistema em segundos
    const fs = await import('fs/promises');
    const content = await fs.readFile('/proc/uptime', 'utf-8');
    const [uptimeSecondsStr] = content.trim().split(' ');
    const uptimeSeconds = parseFloat(uptimeSecondsStr);

    // Calcula o percentual de uptime do mês (aproximação)
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const secondsInMonth = daysInMonth * 24 * 60 * 60;
    const uptimePercent = Math.min((uptimeSeconds / secondsInMonth) * 100, 100);

    return NextResponse.json({
      success: true,
      uptimeSeconds,
      uptimePercent: Number(uptimePercent.toFixed(2)),
      timestamp: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get uptime', details: String(error) },
      { status: 500 }
    );
  }
}
