import { GetServerSideProps } from "next";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import prisma from "@/lib/prisma";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      window.location.href = "/api/auth/signin";
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      alert("Product added to cart!");
      setQuantity(1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              <div className="relative w-full h-96">
                {!imageError ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full">
                    <svg
                      className="w-16 h-16 mb-2"
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
                    <p className="text-sm">{product.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-start">
              <h1 data-testid="product-name" className="text-3xl font-bold mb-4">
                {product.name}
              </h1>

              <p
                data-testid="product-price"
                className="text-4xl font-bold text-green-600 mb-6"
              >
                ${product.price}
              </p>

              <p
                data-testid="product-description"
                className="text-gray-700 mb-6 leading-relaxed text-lg"
              >
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-lg font-semibold">Quantity:</label>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
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
                    className="w-20 text-center border rounded py-2"
                    min="1"
                    disabled={loading}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                data-testid="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-lg"
              >
                {loading ? "Adding to Cart..." : "Add to Cart"}
              </button>

              {!session && (
                <p className="text-gray-600 text-sm mt-4">
                  Please sign in to add items to your cart.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ProductDetailProps> =
  async (context) => {
    try {
      const { id } = context.params as { id: string };

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return {
          notFound: true,
        };
      }

      // Convert Date objects to ISO strings for serialization
      const serializedProduct = {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };

      return {
        props: { product: serializedProduct },
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return {
        notFound: true,
      };
    }
  };
