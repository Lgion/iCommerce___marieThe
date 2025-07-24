import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const serviceDetails = await prisma.serviceDetails.findFirst({
      include: {
        category: true,
        cvCertificates: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!serviceDetails) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(serviceDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails du service' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const serviceDetails = await prisma.serviceDetails.create({
      data: {
        videoUrl: data.videoUrl,
        imageUrl: data.imageUrl,
        firstName: data.firstName,
        lastName: data.lastName,
        pseudo: data.pseudo,
        slogan: data.slogan,
        description: data.description,
        categoryId: data.categoryId,
        userId: data.userId
      },
      include: {
        category: true,
        cvCertificates: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(serviceDetails);
  } catch (error) {
    console.error('Erreur lors de la création des détails du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des détails du service' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    const serviceDetails = await prisma.serviceDetails.update({
      where: { id: data.id },
      data: {
        videoUrl: data.videoUrl,
        imageUrl: data.imageUrl,
        firstName: data.firstName,
        lastName: data.lastName,
        pseudo: data.pseudo,
        slogan: data.slogan,
        description: data.description,
        categoryId: data.categoryId
      },
      include: {
        category: true,
        cvCertificates: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(serviceDetails);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des détails du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des détails du service' },
      { status: 500 }
    );
  }
}
