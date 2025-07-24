import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const slots = await prisma.serviceSlot.findMany({
      where: { isBooked: false },
      include: {
        product: {
          select: {
            title: true,
            price: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
    
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
