import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!owner) {
      return NextResponse.json([], { status: 200 });
    }

    const shops = await prisma.shop.findMany({
      where: { ownerId: owner.id },
      orderBy: { name: 'asc' },
      include: {
        products: {
          orderBy: { title: 'asc' },
          include: {
            variations: {
              orderBy: { name: 'asc' },
              include: { options: { orderBy: { value: 'asc' } } }
            }
          }
        },
        services: {
          orderBy: { name: 'asc' },
          include: {
            durations: { orderBy: { minutes: 'asc' } },
            category: true
          }
        }
      }
    });

    return NextResponse.json(shops, { status: 200 });
  } catch (error) {
    console.error('[API][shops][GET] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des boutiques' },
      { status: 500 }
    );
  }
}
