import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const comment = await prisma.comment.create({
      data: {
        text: data.text,
        rating: data.rating,
        userId: data.userId,
        serviceId: data.serviceId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    const comment = await prisma.comment.update({
      where: { id: data.id },
      data: {
        text: data.text,
        rating: data.rating
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du commentaire' },
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
        { error: 'ID du commentaire requis' },
        { status: 400 }
      );
    }

    await prisma.comment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    );
  }
}
