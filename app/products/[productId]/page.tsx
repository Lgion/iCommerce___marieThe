import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import '@/assets/scss/components/productsPage/_productsPage.scss';

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { productId } = params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variations: {
        include: {
          options: true
        }
      },
      shop: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <ProductDetailClient
      initialProduct={product}
      availableShops={shops}
    />
  );
}
