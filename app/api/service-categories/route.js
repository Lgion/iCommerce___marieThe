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

export async function POST(request) {
  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

    const category = await prisma.serviceCategory.create({
      data: { name, description }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    // Vérifier si des services utilisent cette catégorie
    const serviceCount = await prisma.service.count({
      where: { categoryId: id }
    });

    if (serviceCount > 0) {
      return NextResponse.json({ 
        error: `Impossible de supprimer : cette catégorie est utilisée par ${serviceCount} service(s). Veuillez les réassigner avant.` 
      }, { status: 400 });
    }

    await prisma.serviceCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression. Elle est probablement liée à d\'autres éléments.' }, { status: 500 });
  }
}
