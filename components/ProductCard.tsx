import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  onAddToCart,
}: ProductCardProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      window.location.href = "/api/auth/signin";
      return;
    }

    setLoading(true);
    try {
      await onAddToCart(id, quantity);
      setQuantity(1);
      alert("Product added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid={`product-card-${id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <Link href={`/products/${id}`}>
        <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs">{name}</p>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 cursor-pointer">
            {name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          Product from our collection
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">${price}</span>
        </div>

        <div className="flex gap-2 items-center mb-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
            disabled={loading}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-12 text-center border rounded"
            min="1"
            disabled={loading}
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-2 py-1 bg-gray-200 rounded text-sm"
            disabled={loading}
          >
            +
          </button>
        </div>

        <button
          data-testid={`add-to-cart-button-${id}`}
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
