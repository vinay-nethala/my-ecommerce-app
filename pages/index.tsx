import { GetServerSideProps } from "next";
import { useState } from "react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { useRouter } from "next/router";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface HomeProps {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

const PRODUCTS_PER_PAGE = 12;

export default function Home({
  products,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
}: HomeProps) {
  const router = useRouter();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const query =
      localSearchQuery.trim().length > 0 ? localSearchQuery : undefined;
    await router.push(
      query ? `/?q=${encodeURIComponent(query)}` : "/",
      undefined,
      { shallow: false }
    );

    setLoading(false);
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to add to cart");
    }

    return response.json();
  };

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>

          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              data-testid="search-input"
              type="text"
              placeholder="Search products..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <button
              data-testid="search-button"
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchQuery && (
            <p className="text-gray-600">
              Found {totalCount} product{totalCount !== 1 ? "s" : ""} matching "
              {searchQuery}"
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                {currentPage > 1 && (
                  <a
                    data-testid="pagination-prev"
                    href={`/?page=${currentPage - 1}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Previous
                  </a>
                )}

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <a
                        key={page}
                        href={`/?page=${page}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                        className={`px-3 py-2 rounded ${
                          page === currentPage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </a>
                    )
                  )}
                </div>

                {currentPage < totalPages && (
                  <a
                    data-testid="pagination-next"
                    href={`/?page=${currentPage + 1}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No products found matching your search.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
) => {
  try {
    const { q, page = "1" } = context.query;
    const currentPage = Math.max(1, parseInt(page as string) || 1);
    const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

    const searchQuery = (q as string) || "";

    // Build where clause for search
    const where = searchQuery
      ? {
          OR: [
            {
              name: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    // Fetch products and total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: PRODUCTS_PER_PAGE,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

    // Convert Date objects to ISO strings for serialization
    const serializedProducts = products.map((product) => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return {
      props: {
        products: serializedProducts,
        totalCount,
        currentPage,
        totalPages,
        searchQuery,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        products: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        searchQuery: "",
      },
    };
  }
};
