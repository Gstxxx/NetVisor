import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function GET() {
  try {
    // IP do gateway padrão (ajuste se necessário)
    const gateway = 'google.com';
    // Executa o comando ping (1 pacote, timeout 1s)
    const { stdout } = await execAsync(`ping -c 1 -W 1 ${gateway}`);
    // Procura o tempo de resposta no output
    const match = stdout.match(/time=([\d.]+)\s*ms/);
    const responseTime = match ? parseFloat(match[1]) : null;
    return NextResponse.json({
      success: true,
      responseTime,
      gateway,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to ping gateway', details: String(error) },
      { status: 500 }
    );
  }
}
