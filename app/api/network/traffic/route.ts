import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, this would monitor actual network traffic
    // For now, we'll generate mock traffic data
    
    const generateTrafficData = () => {
      return {
        download: Math.random() * 100 + 20, // KB/s
        upload: Math.random() * 50 + 10, // KB/s
        timestamp: new Date().toISOString()
      };
    };

    const trafficData = generateTrafficData();

    return NextResponse.json({
      success: true,
      traffic: trafficData
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get traffic data' },
      { status: 500 }
    );
  }
}