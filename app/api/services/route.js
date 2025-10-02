import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const services = await prisma.service.findMany({
      include: {
        durations: true,
        category: true,
        provider: {
          select: { email: true, serviceDetails: true }
        },
        comments: {
          include: { user: { select: { email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, imageUrl, imagePublicId, imageFolder, type, prixHoraire, categoryId } = body || {};

    if (!id) {
      return NextResponse.json(
        { error: 'ID du service manquant' },
        { status: 400 }
      );
    }

    const data = {};
    if (typeof name === 'string') data.name = name;
    if (typeof description === 'string') data.description = description;
    if (typeof imageUrl !== 'undefined') data.imageUrl = imageUrl || null;
    if (typeof imagePublicId !== 'undefined') data.imagePublicId = imagePublicId || null;
    if (typeof imageFolder !== 'undefined') data.imageFolder = imageFolder || null;
    if (typeof type === 'string') data.type = type;
    if (typeof prixHoraire !== 'undefined') data.prixHoraire = Number(prixHoraire);
    if (typeof categoryId === 'string') data.categoryId = categoryId;

    const updated = await prisma.service.update({
      where: { id },
      data,
      include: { durations: true, category: true }
    });

    return NextResponse.json(updated, { status: 200 });
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
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json(
        { error: 'ID du service manquant' },
        { status: 400 }
      );
    }

    await prisma.serviceDuration.deleteMany({ where: { serviceId: id } });
    await prisma.serviceSlot.deleteMany({ where: { serviceId: id } });
    await prisma.comment.deleteMany({ where: { serviceId: id } });

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du service' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      imageUrl,
      imagePublicId,
      imageFolder,
      type,
      prixHoraire,
      categoryId,
      providerId,
      durations
    } = body;

    if (!name || !description || prixHoraire === undefined || !categoryId || !providerId) {
      return NextResponse.json(
        { error: 'Les champs nom, description, prix horaire, catégorie et prestataire sont obligatoires.' },
        { status: 400 }
      );
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        imageFolder: imageFolder || null,
        type: type || 'SERVICE',
        prixHoraire: Number(prixHoraire),
        categoryId,
        providerId,
        durations: {
          create: Array.isArray(durations)
            ? durations
                .filter((duration) => Number(duration?.minutes) > 0)
                .map((duration) => ({ minutes: Number(duration.minutes) }))
            : []
        }
      },
      include: {
        durations: true,
        category: true
      }
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du service' },
      { status: 500 }
    );
  }
}