import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, isOwner: true, appType: true },
    });

    if (!user?.isOwner) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Dates pour comparaison (mois actuel vs mois précédent)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Statistiques selon le type d'app
    const stats: any = {};

    // Revenue (commandes)
    if (user.appType === 'ECOMMERCE' || user.appType === 'BOTH') {
      const ordersThisMonth = await prisma.order.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      const ordersLastMonth = await prisma.order.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      });

      const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.total, 0);
      const revenueLastMonth = ordersLastMonth.reduce((sum, o) => sum + o.total, 0);

      stats.revenue = {
        current: revenueThisMonth,
        previous: revenueLastMonth,
        change:
          revenueLastMonth > 0
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
            : 0,
      };

      stats.orders = {
        current: ordersThisMonth.length,
        previous: ordersLastMonth.length,
        change:
          ordersLastMonth.length > 0
            ? ((ordersThisMonth.length - ordersLastMonth.length) / ordersLastMonth.length) * 100
            : 0,
      };
    }

    // Réservations (services)
    if (user.appType === 'SERVICES' || user.appType === 'BOTH') {
      const bookingsThisMonth = await prisma.serviceSlot.count({
        where: {
          isBooked: true,
          bookedAt: { gte: startOfMonth },
          service: {
            providerId: user.id,
          },
        },
      });

      const bookingsLastMonth = await prisma.serviceSlot.count({
        where: {
          isBooked: true,
          bookedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          service: {
            providerId: user.id,
          },
        },
      });

      stats.bookings = {
        current: bookingsThisMonth,
        previous: bookingsLastMonth,
        change:
          bookingsLastMonth > 0
            ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
            : 0,
      };
    }

    // Nouveaux clients
    const newCustomersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth },
        isOwner: false,
      },
    });

    const newCustomersLastMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        isOwner: false,
      },
    });

    stats.newCustomers = {
      current: newCustomersThisMonth,
      previous: newCustomersLastMonth,
      change:
        newCustomersLastMonth > 0
          ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
          : 0,
    };

    // Top produits
    if (user.appType === 'ECOMMERCE' || user.appType === 'BOTH') {
      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      const productsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { title: true, price: true },
          });
          return {
            ...product,
            quantity: item._sum.quantity,
          };
        })
      );

      stats.topProducts = productsWithDetails;
    }

    // Top services
    if (user.appType === 'SERVICES' || user.appType === 'BOTH') {
      const topServices = await prisma.serviceSlot.groupBy({
        by: ['serviceId'],
        where: {
          isBooked: true,
          service: {
            providerId: user.id,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      const servicesWithDetails = await Promise.all(
        topServices.map(async (item) => {
          const service = await prisma.service.findUnique({
            where: { id: item.serviceId },
            select: { name: true, prixHoraire: true },
          });
          return {
            ...service,
            bookings: item._count.id,
          };
        })
      );

      stats.topServices = servicesWithDetails;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
