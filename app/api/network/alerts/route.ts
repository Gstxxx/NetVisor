import { NextResponse } from 'next/server';

// Exemplo: busca alertas do sistema (aqui apenas simulação, pois não há backend real)
export async function GET() {
  try {
    // Aqui você pode integrar com logs reais, banco de dados, etc.
    // Por enquanto, retorna um array vazio para não quebrar o painel
    return NextResponse.json({
      success: true,
      alerts: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get alerts', details: String(error) },
      { status: 500 }
    );
  }
}
