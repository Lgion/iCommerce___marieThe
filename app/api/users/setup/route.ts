import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const {
      clerkId,
      email,
      appType,
      firstName,
      lastName,
      pseudo,
      slogan,
      description,
      category,
      videoUrl,
      imageUrl
    } = await request.json();

    if (!clerkId || !email || !appType) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Transaction pour créer/mettre à jour l'utilisateur et ses détails
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer ou mettre à jour l'utilisateur
      const user = await tx.user.upsert({
        where: { clerkId },
        update: {
          appType,
          isSetup: true,
          isOwner: true // Le premier utilisateur est le propriétaire
        },
        create: {
          clerkId,
          email,
          appType,
          isSetup: true,
          isOwner: true
        }
      });

      // 2. Créer ou récupérer la catégorie
      const serviceCategory = await tx.serviceCategory.upsert({
        where: { name: category },
        update: {},
        create: {
          name: category,
          description: `Catégorie ${category}`
        }
      });

      // 3. Créer les ServiceDetails (obligatoire pour tous les types)
      const serviceDetails = await tx.serviceDetails.upsert({
        where: { userId: user.id },
        update: {
          firstName,
          lastName,
          pseudo,
          slogan: slogan || '',
          description: description || '',
          videoUrl: videoUrl || null,
          imageUrl: imageUrl || null,
          categoryId: serviceCategory.id
        },
        create: {
          userId: user.id,
          firstName,
          lastName,
          pseudo,
          slogan: slogan || '',
          description: description || '',
          videoUrl: videoUrl || null,
          imageUrl: imageUrl || null,
          categoryId: serviceCategory.id
        }
      });

      const shopTypeMap: Record<string, number> = {
        ECOMMERCE: 0,
        SERVICES: 1,
        BOTH: 2
      };

      const shopId = `shop-${user.id}`;
      await tx.shop.upsert({
        where: {
          id: shopId
        },
        update: {
          name: `Boutique de ${pseudo}`,
          description: `Boutique en ligne de ${firstName} ${lastName}`,
          type: shopTypeMap[appType] ?? 0
        },
        create: {
          id: shopId,
          name: `Boutique de ${pseudo}`,
          description: `Boutique en ligne de ${firstName} ${lastName}`,
          ownerId: user.id,
          type: shopTypeMap[appType] ?? 0
        }
      });

      return { user, serviceDetails };
    });

    console.log(`[SETUP] Utilisateur configuré: ${email} (${appType})`);

    return NextResponse.json({
      message: 'Configuration réussie',
      user: result.user,
      serviceDetails: result.serviceDetails
    });

  } catch (error) {
    console.error('Erreur lors du setup:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la configuration' },
      { status: 500 }
    );
  }
}

// GET pour vérifier si un utilisateur existe déjà
export async function GET() {
  try {
    const ownerUser = await prisma.user.findFirst({
      where: { isOwner: true },
      include: {
        serviceDetails: true,
        shops: true,
        services: true
      }
    });

    if (!ownerUser) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      user: ownerUser,
      appType: ownerUser.appType,
      isOwner: ownerUser.isOwner
    });

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
