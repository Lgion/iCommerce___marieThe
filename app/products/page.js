import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import '@/assets/scss/components/productsPage/_productsPage.scss';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { variations: true }
  });

  return (
    <div className="productsPage">
      <h1 className="productsPage__title">Nos Produits</h1>
      <div className="productsPage__grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
