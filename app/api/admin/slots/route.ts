import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Vérifier si l'utilisateur est admin
async function isAdmin(userId: string | null) {
  if (!userId) return false;
  
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then(res => res.json());
  
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_USER;
  return clerkUser.email_addresses?.some((email: any) => email.email_address === adminEmail);
}

// GET - Récupérer tous les créneaux
export async function GET() {
  try {
    const slots = await prisma.serviceSlot.findMany({
      include: { 
        product: { select: { title: true, price: true } },
        orderItem: {
          include: {
            order: { select: { id: true, status: true, createdAt: true } }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
    
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau créneau
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    const { productId, startTime, endTime } = await request.json();
    
    if (!productId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }
    
    const slot = await prisma.serviceSlot.create({
      data: {
        productId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isBooked: false
      },
      include: { product: { select: { title: true, price: true } } }
    });
    
    return NextResponse.json(slot);
  } catch (error) {
    console.error('Erreur lors de la création du créneau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un créneau
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    const body = await request.json();
    const { slotId } = body;
    
    if (!slotId) {
      return NextResponse.json({ error: 'ID du créneau manquant' }, { status: 400 });
    }
    
    // Vérifier que le créneau n'est pas réservé
    const slot = await prisma.serviceSlot.findUnique({
      where: { id: slotId }
    });
    
    if (!slot) {
      return NextResponse.json({ error: 'Créneau non trouvé' }, { status: 404 });
    }
    
    if (slot.isBooked) {
      return NextResponse.json({ error: 'Impossible de supprimer un créneau réservé' }, { status: 400 });
    }
    
    await prisma.serviceSlot.delete({
      where: { id: slotId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du créneau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
