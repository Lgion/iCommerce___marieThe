import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
        imagePublicId: data.imagePublicId || null,
        imageFolder: data.imageFolder || null,
        firstName: data.firstName,
        lastName: data.lastName,
        pseudo: data.pseudo,
        slogan: data.slogan,
        description: data.description,
        ecommerceTitle: data.ecommerceTitle,
        ecommerceSubtitle: data.ecommerceSubtitle,
        ecommerceDescription: data.ecommerceDescription,
        servicesSubtitle: data.servicesSubtitle,
        serviceTitleFont: data.serviceTitleFont,
        serviceSubtitleFont: data.serviceSubtitleFont,
        serviceTitleColor: data.serviceTitleColor,
        serviceSubtitleColor: data.serviceSubtitleColor,
        serviceBgColor: data.serviceBgColor,
        serviceBgOpacity: data.serviceBgOpacity ? parseFloat(data.serviceBgOpacity) : null,
        serviceBgImage: data.serviceBgImage,
        ecommerceTitleFont: data.ecommerceTitleFont,
        ecommerceSubtitleFont: data.ecommerceSubtitleFont,
        ecommerceTitleColor: data.ecommerceTitleColor,
        ecommerceSubtitleColor: data.ecommerceSubtitleColor,
        ecommerceBgColor: data.ecommerceBgColor,
        ecommerceBgOpacity: data.ecommerceBgOpacity ? parseFloat(data.ecommerceBgOpacity) : null,
        ecommerceBgImage: data.ecommerceBgImage,
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
        imagePublicId: data.imagePublicId || null,
        imageFolder: data.imageFolder || null,
        firstName: data.firstName,
        lastName: data.lastName,
        pseudo: data.pseudo,
        slogan: data.slogan,
        description: data.description,
        ecommerceTitle: data.ecommerceTitle,
        ecommerceSubtitle: data.ecommerceSubtitle,
        ecommerceDescription: data.ecommerceDescription,
        servicesSubtitle: data.servicesSubtitle,
        serviceTitleFont: data.serviceTitleFont,
        serviceSubtitleFont: data.serviceSubtitleFont,
        serviceTitleColor: data.serviceTitleColor,
        serviceSubtitleColor: data.serviceSubtitleColor,
        serviceBgColor: data.serviceBgColor,
        serviceBgOpacity: data.serviceBgOpacity ? parseFloat(data.serviceBgOpacity) : null,
        serviceBgImage: data.serviceBgImage,
        ecommerceTitleFont: data.ecommerceTitleFont,
        ecommerceSubtitleFont: data.ecommerceSubtitleFont,
        ecommerceTitleColor: data.ecommerceTitleColor,
        ecommerceSubtitleColor: data.ecommerceSubtitleColor,
        ecommerceBgColor: data.ecommerceBgColor,
        ecommerceBgOpacity: data.ecommerceBgOpacity ? parseFloat(data.ecommerceBgOpacity) : null,
        ecommerceBgImage: data.ecommerceBgImage,
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
