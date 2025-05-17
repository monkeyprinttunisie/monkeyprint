"use client";

import { useEffect, useState } from "react";
import { Link } from "@/../i18n/navigation";
import { getNewProducts } from "@/actions/productActions";
import { Product } from "@/types";
export default function NewProducts() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchNewProducts = async () => {
      const productsData = await getNewProducts({ take: 10, skip: 0 });
      setNewProducts(productsData.products as Product[]);
    };

    fetchNewProducts();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row justify-between">
        <span className="font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
          New Items
        </span>
        <Link
          href="/store/allProducts"
          className="flex flex-row items-center gap-1"
        >
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
      <div className="flex flex-row w-full overflow-x-auto gap-4">
        {newProducts.map((newProduct: Product) => (
          <div
            className="flex flex-col gap-1.5 flex-shrink-0"
            key={newProduct.id}
          >
            <img
              src={newProduct.imageUrl || "/path/to/placeholder-image.jpg"}
              alt={newProduct.description as string}
              className="w-32 h-32 rounded-lg"
            />
            <p>{newProduct.name || "No description available."}</p>
            <p>
              {newProduct.price
                ? `$${newProduct.price}`
                : "Price not available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
