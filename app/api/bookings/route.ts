import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { slotId } = await request.json();

    if (!slotId) {
      return NextResponse.json(
        { error: 'ID du créneau requis' },
        { status: 400 }
      );
    }

    // Vérifier que le créneau existe et n'est pas déjà réservé
    const slot = await prisma.serviceSlot.findUnique({
      where: { id: slotId },
      include: { product: true }
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Créneau non trouvé' },
        { status: 404 }
      );
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { error: 'Ce créneau est déjà réservé' },
        { status: 409 }
      );
    }

    // Créer une commande pour la réservation
    const order = await prisma.order.create({
      data: {
        total: slot.product.price,
        status: 'PENDING',
        items: {
          create: {
            productId: slot.productId,
            variation: null,
            quantity: 1,
            price: slot.product.price
          }
        }
      },
      include: {
        items: true
      }
    });

    // Marquer le créneau comme réservé et l'associer à la commande
    const updatedSlot = await prisma.serviceSlot.update({
      where: { id: slotId },
      data: {
        isBooked: true,
        orderItemId: order.items[0].id
      },
      include: {
        product: true,
        orderItem: {
          include: {
            order: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Réservation créée avec succès',
      booking: updatedSlot,
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
        product: true,
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
