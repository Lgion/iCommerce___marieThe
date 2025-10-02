import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { slotId, duration, userId } = await request.json();

    if (!slotId || !duration) {
      return NextResponse.json(
        { error: 'ID du créneau et durée requis' },
        { status: 400 }
      );
    }

    // Gérer l'utilisateur Clerk ou créer un utilisateur de test
    let actualUserId = userId;
    if (!userId) {
      console.log('[DEBUG] Pas d\'userId fourni, création d\'un utilisateur de test...');
      // Pour les tests sans Clerk, utiliser un utilisateur de seed
      const testUser = await prisma.user.findFirst({
        where: { clerkId: 'seed_marie_dubois' }
      });
      
      if (!testUser) {
        return NextResponse.json(
          { error: 'Aucun utilisateur de test disponible. Veuillez vous connecter avec Clerk.' },
          { status: 401 }
        );
      }
      actualUserId = testUser.id;
      console.log(`[DEBUG] Utilisateur de test créé/trouvé: ${actualUserId}`);
    } else {
      console.log(`[DEBUG] Clerk ID fourni: ${userId}`);
      // Chercher l'utilisateur par son clerkId
      let existingUser = await prisma.user.findUnique({
        where: { clerkId: userId }
      });
      
      if (!existingUser) {
        // Si l'utilisateur n'existe pas, on refuse la réservation
        // L'utilisateur doit d'abord être synchronisé via useUserSync
        return NextResponse.json(
          { error: 'Utilisateur non trouvé. Veuillez recharger la page.' },
          { status: 404 }
        );
      }
      
      actualUserId = existingUser.id; // Utiliser l'ID Prisma, pas l'ID Clerk
      console.log(`[DEBUG] Utilisateur trouvé/créé - Prisma ID: ${actualUserId}, Clerk ID: ${userId}`);
    }

    // Vérifier que le créneau de départ existe
    const startSlot = await prisma.serviceSlot.findUnique({
      where: { id: slotId },
      include: { service: true }
    });

    if (!startSlot) {
      return NextResponse.json(
        { error: 'Créneau non trouvé' },
        { status: 404 }
      );
    }

    // Calculer le nombre de slots nécessaires (durée en minutes / 15 minutes par slot)
    const slotsNeeded = Math.ceil(duration / 15);
    
    console.log(`[DEBUG] Réservation demandée:`);
    console.log(`- SlotId: ${slotId}`);
    console.log(`- Durée: ${duration} minutes`);
    console.log(`- Slots nécessaires: ${slotsNeeded}`);
    console.log(`- ServiceId: ${startSlot.serviceId}`);
    console.log(`- Heure de début: ${startSlot.startTime}`);
    console.log(`- userId: ${userId}`);
    
    // Trouver tous les slots consécutifs nécessaires
    const endTime = new Date(startSlot.startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    console.log(`- Heure de fin calculée: ${endTime}`);
    
    const requiredSlots = await prisma.serviceSlot.findMany({
      where: {
        serviceId: startSlot.serviceId,
        startTime: {
          gte: startSlot.startTime,
          lt: endTime
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(`[DEBUG] Slots trouvés: ${requiredSlots.length}`);
    console.log('Détails des slots trouvés:', requiredSlots.map(s => ({
      id: s.id,
      startTime: s.startTime,
      isBooked: s.isBooked
    })));

    // Vérifier qu'on a assez de slots consécutifs
    if (requiredSlots.length < slotsNeeded) {
      console.log(`[ERROR] Pas assez de slots: trouvés ${requiredSlots.length}, nécessaires ${slotsNeeded}`);
      return NextResponse.json(
        { 
          error: 'Pas assez de créneaux consécutifs disponibles',
          debug: {
            slotsFound: requiredSlots.length,
            slotsNeeded: slotsNeeded,
            duration: duration,
            serviceId: startSlot.serviceId
          }
        },
        { status: 409 }
      );
    }

    // Vérifier qu'aucun des slots requis n'est déjà réservé
    const bookedSlot = requiredSlots.find(slot => slot.isBooked);
    if (bookedSlot) {
      return NextResponse.json(
        { error: 'Un ou plusieurs créneaux sont déjà réservés' },
        { status: 409 }
      );
    }

    // Créer une commande pour la réservation liée à l'utilisateur
    const order = await prisma.order.create({
      data: {
        userId: actualUserId,
        total: (startSlot.service.prixHoraire * duration) / 60, // Prix proportionnel à la durée
        status: 'PENDING'
      },
      include: {
        user: true
      }
    });

    console.log(`[DEBUG] Commande créée: ${order.id} pour l'utilisateur ${actualUserId}`);

    // Marquer tous les créneaux requis comme réservés avec les nouvelles relations
    const slotIds = requiredSlots.slice(0, slotsNeeded).map(slot => slot.id);
    
    await prisma.serviceSlot.updateMany({
      where: {
        id: {
          in: slotIds
        }
      },
      data: {
        isBooked: true,
        bookedById: actualUserId,
        bookedAt: new Date()
      }
    });

    console.log(`[DEBUG] ${slotIds.length} créneaux marqués comme réservés pour l'utilisateur ${actualUserId}`);

    // Récupérer les slots mis à jour pour la réponse
    const updatedSlots = await prisma.serviceSlot.findMany({
      where: {
        id: {
          in: slotIds
        }
      },
      include: {
        service: true,
        bookedBy: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({
      message: 'Réservation créée avec succès',
      booking: updatedSlots,
      slotsBooked: slotIds.length,
      duration: duration,
      order: order
    });

  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.serviceSlot.findMany({
      where: { isBooked: true },
      include: {
        service: true,
        bookedBy: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
