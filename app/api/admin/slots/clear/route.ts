import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Fonction pour vérifier si l'utilisateur est admin
async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const { user } = await auth();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_USER;
    return user?.emailAddresses?.[0]?.emailAddress === adminEmail;
  } catch (error) {
    console.error('Erreur lors de la vérification admin:', error);
    return false;
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Supprimer tous les créneaux non réservés
    const result = await prisma.serviceSlot.deleteMany({
      where: {
        isBooked: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `${result.count} créneaux supprimés` 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression des créneaux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des créneaux' },
      { status: 500 }
    );
  }
}
