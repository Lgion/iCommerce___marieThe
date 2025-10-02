import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de services:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories de services' },
      { status: 500 }
    );
  }
}
