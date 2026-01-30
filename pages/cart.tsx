import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (session) {
      fetchCart();
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const cartData = await response.json();
      setCart(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: Math.max(1, quantity) - (cart?.items.find(i => i.product.id === productId)?.quantity || 0),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      await fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setUpdating(true);
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item from cart");
    } finally {
      setUpdating(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-lg">Please sign in to view your cart.</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p>Loading cart...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`cart-item-${item.product.id}`}
                    className="bg-white rounded-lg shadow p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600">
                        ${item.product.price.toFixed(2)} each
                      </p>
                      <p className="text-gray-600">
                        Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity and Remove */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          disabled={updating}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          data-testid={`quantity-input-${item.product.id}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.product.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          disabled={updating}
                          className="w-12 text-center border rounded py-1"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          disabled={updating}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        data-testid={`remove-item-button-${item.product.id}`}
                        onClick={() => handleRemoveItem(item.product.id)}
                        disabled={updating}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(cart.total - 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div
                  data-testid="cart-total"
                  className="flex justify-between text-xl font-bold"
                >
                  <span>Total:</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    setUpdating(true);
                    const res = await fetch('/api/orders', { method: 'POST' });
                    if (!res.ok) {
                      throw new Error('Failed to place order');
                    }
                    const data = await res.json();
                    alert(`Order placed — total $${data.total}`);
                    await fetchCart();
                  } catch (err) {
                    console.error(err);
                    alert('Failed to place order');
                  } finally {
                    setUpdating(false);
                  }
                }}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold mb-3"
              >
                {updating ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <Link href="/">
                <button className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/">
              <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Continue Shopping
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This page will redirect to sign in if not authenticated via middleware
  return {
    props: {},
  };
};
