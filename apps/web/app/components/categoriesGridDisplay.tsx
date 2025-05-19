"use client";

import {
  getCategoriesByTypeWithPagination,
  getCategoryProductCountByStore,
} from "@/actions/categoryActions";
import { getFirstFourProductsByCategoryAndStore } from "@/actions/productActions";
import { Product } from "@monkeyprint/db";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/../i18n/navigation";
import { useParams } from "next/navigation";
import { getStoreByUrl } from "@/actions/storeActions";

interface CategoriesGridDisplayProps {
  storeId?: string;
}

export default function CategoriesGridDisplay({
  storeId: propStoreId,
}: CategoriesGridDisplayProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<any>({});
  const params = useParams();
  const storeUrl = params?.storeUrl as string;
  const [storeId, setStoreId] = useState<string | null>(propStoreId || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId && storeUrl) {
      const fetchStoreId = async () => {
        try {
          const store = await getStoreByUrl(storeUrl);
          if (store) {
            setStoreId(store.id);
          }
        } catch (error) {
          console.error("Error fetching store:", error);
        }
      };

      fetchStoreId();
    }
  }, [storeId, storeUrl]);

  useEffect(() => {
    if (!storeId) return;

    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true);

        // Get all SUBPRODUCT categories
        const categoriesData =
          await getCategoriesByTypeWithPagination("SUBPRODUCT");

        // First check which categories have products
        const categoriesWithProductsData = [];
        const productsData: any = {};

        for (const category of categoriesData) {
          const productCount = await getCategoryProductCountByStore(
            category.id,
            storeId
          );

          // Skip categories with no products
          if (productCount <= 0) continue;

          // Add to our filtered categories
          categoriesWithProductsData.push(category);

          // Get products for categories that have them
          const productsResponse = await getFirstFourProductsByCategoryAndStore(
            category.id,
            storeId
          );

          productsData[category.id] = {
            products: productsResponse.success ? productsResponse.products : [],
            productCount: productCount,
          };
        }

        // Set state with only categories that have products
        setCategories(categoriesWithProductsData);
        setProductsByCategory(productsData);
      } catch (error) {
        console.error("Error fetching categories and products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, [storeId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 justify-items-center w-full">
        <span className="justify-self-start font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
          Products
        </span>
        <div className="justify-self-end flex flex-row items-center gap-1">
          <span className="font-['Raleway'] font-bold text-[15px] leading-[18px] text-[#202020]">
            See All
          </span>
          <img
            src="/icons/next-button-icon.svg"
            alt="Next"
            className="rtl:scale-x-[-1]"
          />
        </div>
        <div className="col-span-2 flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  const categoriesWithProducts = categories.filter(
    (category) => productsByCategory[category.id]?.products?.length > 0
  );

  // If no categories have products in this store, don't render the component
  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 justify-items-center w-full">
      <span className="justify-self-start font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
        Products
      </span>
      <Link
        href="/allProducts"
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
      {categoriesWithProducts.map((category) => (
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
