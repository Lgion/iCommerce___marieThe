import prisma from '@/lib/prisma';
import ProductsDashboard from './ProductsDashboard';
import '@/assets/scss/components/productsPage/_productsPage.scss';

export default async function ProductsPage() {
  const [products, shops] = await Promise.all([
    prisma.product.findMany({
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
      },
      orderBy: {
        title: 'asc'
      }
    }),
    prisma.shop.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  ]);

  return (
    <ProductsDashboard
      initialProducts={products}
      availableShops={shops}
    />
  );
}
