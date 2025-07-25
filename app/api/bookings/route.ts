import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { slotId, duration } = await request.json();

    if (!slotId || !duration) {
      return NextResponse.json(
        { error: 'ID du créneau et durée requis' },
        { status: 400 }
      );
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

    // Créer une commande pour la réservation
    // Note: Pour les services, nous créons un produit virtuel temporaire
    // ou nous pourrions étendre le modèle pour gérer les services directement
    const order = await prisma.order.create({
      data: {
        total: startSlot.service.prixHoraire,
        status: 'PENDING',
        items: {
          create: {
            productId: startSlot.serviceId, // Utilisation temporaire du serviceId comme productId
            variation: null,
            quantity: 1,
            price: startSlot.service.prixHoraire
          }
        }
      },
      include: {
        items: true
      }
    });

    // Marquer tous les créneaux requis comme réservés
    const slotIds = requiredSlots.slice(0, slotsNeeded).map(slot => slot.id);
    
    await prisma.serviceSlot.updateMany({
      where: {
        id: {
          in: slotIds
        }
      },
      data: {
        isBooked: true,
        orderItemId: order.items[0].id
      }
    });

    // Récupérer les slots mis à jour pour la réponse
    const updatedSlots = await prisma.serviceSlot.findMany({
      where: {
        id: {
          in: slotIds
        }
      },
      include: {
        service: true,
        orderItem: {
          include: {
            order: true
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
        orderItem: {
          include: {
            order: true
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
