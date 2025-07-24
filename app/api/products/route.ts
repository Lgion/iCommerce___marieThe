import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let whereClause = {};
    
    if (type === 'service') {
      whereClause = { type: 'SERVICE' };
    } else if (type === 'physical') {
      whereClause = { type: 'PHYSICAL' };
    } else if (type === 'digital') {
      whereClause = { type: 'DIGITAL' };
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        price: true,
        type: true,
        description: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
