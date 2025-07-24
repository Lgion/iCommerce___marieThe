import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: true,
        durations: true,
        provider: {
          select: {
            id: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des services' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        type: data.type,
        prixHoraire: data.prixHoraire,
        categoryId: data.categoryId,
        providerId: data.providerId,
        durations: {
          create: data.durations?.map(duration => ({
            minutes: duration.minutes
          })) || []
        }
      },
      include: {
        category: true,
        durations: true,
        provider: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du service' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // Supprimer les anciennes durées et créer les nouvelles
    await prisma.serviceDuration.deleteMany({
      where: { serviceId: data.id }
    });

    const service = await prisma.service.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        type: data.type,
        prixHoraire: data.prixHoraire,
        categoryId: data.categoryId,
        durations: {
          create: data.durations?.map(duration => ({
            minutes: duration.minutes
          })) || []
        }
      },
      include: {
        category: true,
        durations: true,
        provider: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du service requis' },
        { status: 400 }
      );
    }

    // Supprimer les durées associées d'abord
    await prisma.serviceDuration.deleteMany({
      where: { serviceId: id }
    });

    // Supprimer les commentaires associés
    await prisma.comment.deleteMany({
      where: { serviceId: id }
    });

    // Supprimer le service
    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du service' },
      { status: 500 }
    );
  }
}
