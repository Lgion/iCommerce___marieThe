import '@/assets/scss/components/productCard/_productCard.scss';

export default function ProductCard({ product }) {
  return (
    <div className="productCard">
      <div className="productCard__image h-48 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-500">Image du produit</span>
      </div>
      <div className="productCard__content p-4">
        <h3 className="productCard__title font-bold text-xl">{product.title}</h3>
        <p className="productCard__description text-gray-600 mt-2">{product.description}</p>
        <div className="productCard__footer mt-4 flex justify-between items-center">
          <span className="productCard__price font-bold">{product.price}€</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
