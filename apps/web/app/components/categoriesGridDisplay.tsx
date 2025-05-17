"use client";

import {
  getCategoriesByTypeWithPagination,
  getCategoryProductCount,
} from "@/actions/categoryActions";
import { getFirstFourProductsByCategorie } from "@/actions/productActions";
import { Product } from "@monkeyprint/db";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Link } from "@/../i18n/navigation";

export default function CategoriesGridDisplay() {
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<any>({});

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      const categoriesData =
        await getCategoriesByTypeWithPagination("SUBPRODUCT");
      setCategories(categoriesData);

      const productsData: any = {};
      for (const category of categoriesData) {
        const productsResponse = await getFirstFourProductsByCategorie(
          category.id
        );
        const productCount = await getCategoryProductCount(category.id);
        if (productsResponse.success) {
          productsData[category.id] = {
            products: productsResponse.products,
            productCount: productCount,
          };
        } else {
          productsData[category.id] = {
            products: [],
            productCount: 0,
          };
        }
      }
      setProductsByCategory(productsData);
    };

    fetchCategoriesAndProducts();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 justify-items-center w-full">
      <span className="justify-self-start font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
        Products
      </span>
      <Link
        href="/store/allProducts"
        className="justify-self-end flex flex-row items-center gap-1"
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

      {/* Dynamically rendering categories and products */}
      {categories.map((category) => (
        <div
          key={category.id}
          className="grid grid-cols-2 gap-1 justify-items-center"
        >
          {/* Render products for each category */}
          {productsByCategory[category.id]?.products?.map(
            (product: Product) => (
              <>
                <img
                  key={product.id}
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-25 h-25 rounded-lg"
                />
              </>
            )
          )}

          <div className="col-span-2 justify-self-start flex flex-row justify-between w-full">
            <span className="font-['Raleway'] font-bold text-[15px] leading-[18px] text-[#202020]">
              {category.name}
            </span>
            <Badge className="h-fit bg-[#C2D3FA] font-['Raleway'] font-bold text-[15px] leading-[18px] text-[#202020]">
              {productsByCategory[category.id]?.productCount || "0"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
