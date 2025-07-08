import { NextResponse } from 'next/server';

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function POST() {
  try {
    // Lê a tabela ARP do sistema para obter dispositivos conectados
    const arpTable = await readArpTable();
    // Opcional: você pode tentar um ping sweep para popular a tabela ARP antes
    // mas aqui só lemos o que já está na tabela

    const devices = arpTable.map(entry => ({
      ip: entry.ip,
      mac: entry.mac,
      hostname: entry.ip, // Para simplificar, hostname = ip
      vendor: '', // Vendor pode ser preenchido com lookup externo se desejar
      status: 'online'
    }));

    return NextResponse.json({
      success: true,
      devices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to scan network', details: String(error) },
      { status: 500 }
    );
  }
}

// Função para ler /proc/net/arp (Linux)
async function readArpTable() {
  const fs = await import('fs/promises');
  const content = await fs.readFile('/proc/net/arp', 'utf-8');
  const lines = content.trim().split('\n');
  // Remove o cabeçalho
  lines.shift();
  const entries = lines.map(line => {
    const parts = line.split(/\s+/);
    return {
      ip: parts[0],
      mac: parts[3]
    };
  }).filter(e => e.mac && e.mac !== '00:00:00:00:00:00');
  return entries;
}