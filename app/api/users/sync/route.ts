import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { clerkId, email, firstName, lastName } = await request.json();

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: 'clerkId et email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (existingUser) {
      // Mettre à jour les informations si nécessaire
      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          // Optionnel : mettre à jour d'autres champs si votre schéma les inclut
          // firstName,
          // lastName
        }
      });
      
      return NextResponse.json({ 
        message: 'Utilisateur mis à jour',
        user: updatedUser,
        created: false
      });
    } else {
      // Créer un nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          email
          // firstName et lastName peuvent être ajoutés si besoin dans le futur
        }
      });

      console.log(`[SYNC] Nouvel utilisateur créé: ${newUser.email} (Clerk: ${clerkId})`);
      
      return NextResponse.json({ 
        message: 'Utilisateur créé',
        user: newUser,
        created: true
      });
    }

  } catch (error) {
    console.error('Erreur lors de la synchronisation utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET pour récupérer un utilisateur par clerkId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json(
        { error: 'clerkId requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        orders: true,
        bookedSlots: {
          include: {
            service: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Erreur lors de la récupération utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
