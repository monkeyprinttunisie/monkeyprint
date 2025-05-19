"use client";

import { useEffect, useState } from "react";
import { Link } from "@/../i18n/navigation";
import { getNewProducts } from "@/actions/productActions";
import { Product } from "@/types";

interface NewProductsProps {
  storeId?: string;
}

export default function NewProducts({ storeId }: NewProductsProps) {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProducts = async () => {
      setLoading(true);
      try {
        const productsData = await getNewProducts({
          take: 10,
          skip: 0,
          storeId,
        });

        setNewProducts((productsData.products as Product[]) || []);
      } catch (error) {
        console.error("Error fetching new products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, [storeId]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row justify-between">
        <span className="font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
          New Items
        </span>

        <Link href="/allProducts" className="flex flex-row items-center gap-1">
          <span className="font-['Raleway'] font-bold text-[15px] leading-[18px] text-[#202020]">
            See All
          </span>
          <img
            src="/icons/next-button-icon.svg"
            alt="Next"
            className="rtl:scale-x-[-1]"
          />
        </Link>
      </div>

      {/* Conditionally show loading spinner or products */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex flex-row w-full overflow-x-auto gap-4">
          {newProducts.length === 0 ? (
            <div className="py-4 text-gray-500">No products available</div>
          ) : (
            newProducts.map((newProduct: Product) => (
              <div
                className="flex flex-col gap-1.5 flex-shrink-0"
                key={newProduct.id}
              >
                <Link href={`/allProducts/${newProduct.id}`}>
                  <img
                    src={
                      newProduct.imageUrl || "/path/to/placeholder-image.jpg"
                    }
                    alt={newProduct.description as string}
                    className="w-32 h-32 rounded-lg"
                  />
                </Link>
                <p>{newProduct.name || "No description available."}</p>
                <p>
                  {newProduct.price
                    ? `${newProduct.price.toFixed(2)} dt`
                    : "Price not available"}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
