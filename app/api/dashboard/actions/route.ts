import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Logger une action dans le dashboard
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, isOwner: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, action, entityType, entityId, details } = body;

    if (!sessionId || !action || !entityType) {
      return NextResponse.json(
        { error: 'Champs requis: sessionId, action, entityType' },
        { status: 400 }
      );
    }

    // Vérifier que la session appartient à l'utilisateur
    const session = await prisma.dashboardSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 404 }
      );
    }

    const dashboardAction = await prisma.dashboardAction.create({
      data: {
        sessionId,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
      },
    });

    return NextResponse.json({ action: dashboardAction }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'action:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les actions
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, isOwner: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const entityType = searchParams.get('entityType');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      session: {
        userId: user.id,
      },
    };

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const actions = await prisma.dashboardAction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        session: {
          select: {
            loginAt: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ actions });
  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
