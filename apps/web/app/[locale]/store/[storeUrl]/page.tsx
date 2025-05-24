"use client";

import CardCarousel from "@/components/cardCarousel";
import CategoriesGridDisplay from "@/components/categoriesGridDisplay";
import DiscountCard from "@/components/DiscountCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import NewProducts from "@/components/newProducts";
import { getStoreByUrl } from "@/actions/storeActions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function HomePage() {
  const params = useParams();
  const storeUrl = params.storeUrl as string;
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);

  const [banners, setBanners] = useState<any[]>([]);

  const t = useTranslations("HomePage");
  useEffect(() => {
    async function fetchStoreId() {
      try {
        const store = await getStoreByUrl(storeUrl);
        if (store) {
          setStoreId(store.id);
          setStoreImage(store.image);
          setStoreName(store.name);
          if (store.homeBanner && store.homeBanner.length > 0) {
            setBanners(store.homeBanner);
          }
        }
      } catch (error) {
        console.error("Error fetching store:", error);
      }
    }

    fetchStoreId();
  }, [storeUrl]);
  return (
    <div className="flex flex-col gap-5 items-center h-[92vh] w-screen max-w-[500px] p-5">
      <div className="w-full mb-6 space-y-6">
        {/* Store Profile Card */}
        <div className="relative bg-white rounded-xl p-4 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
          {/* Static Bubbles Background */}
          <div className="absolute top-0 right-0 bottom-0 w-1/3 rounded-r-xl overflow-hidden">
            <div className="absolute top-[10%] right-[5%] w-16 h-16 rounded-full bg-blue-100/70"></div>

            <div className="absolute top-[15%] right-[30%] w-3 h-3 rounded-full bg-indigo-200/80"></div>
            <div className="absolute top-[40%] right-[10%] w-5 h-5 rounded-full bg-blue-200/60"></div>
            <div className="absolute top-[60%] right-[25%] w-4 h-4 rounded-full bg-sky-100/70"></div>

            <div className="absolute top-[25%] right-[15%] w-10 h-10 rounded-full bg-blue-300/30 blur-md"></div>
            <div className="absolute top-[70%] right-[5%] w-8 h-8 rounded-full bg-indigo-200/40 blur-sm"></div>

            <div className="absolute top-[30%] right-[40%] w-1.5 h-1.5 rounded-full bg-blue-400/60"></div>
            <div className="absolute top-[50%] right-[35%] w-2 h-2 rounded-full bg-indigo-300/50"></div>
            <div className="absolute top-[80%] right-[20%] w-1.5 h-1.5 rounded-full bg-blue-300/60"></div>
          </div>

          {/* Store Info Content */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full blur opacity-30"></div>
              <Avatar className="h-14 w-14 border-2 border-white shadow-md relative">
                <AvatarImage src={storeImage || undefined} />
                <AvatarFallback>
                  {storeUrl?.substring(0, 2)?.toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <h1 className="font-bold text-gray-900 text-lg">{storeName}</h1>
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-3 h-3 text-yellow-400 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  Official Store
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {banners.length > 0 && (
        <CardCarousel
          cards={banners.map((banner) => (
            <DiscountCard key={banner.id} banner={banner} />
          ))}
        />
      )}
      <CategoriesGridDisplay storeId={storeId || undefined} />
      <div className="flex flex-col gap-1 w-full">
        <span className="font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
          Top Products
        </span>
        <div className="flex flex-row items-center gap-4 w-full overflow-x-auto py-4">
          <div>
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img
                src="/Placeholder_01(1).png"
                alt="Placeholder 1"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img
                src="/Placeholder_01(2).png"
                alt="Placeholder 1"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img
                src="/Placeholder_01(3).png"
                alt="Placeholder 1"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img
                src="/Placeholder_01(4).png"
                alt="Placeholder 1"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img
                src="/Placeholder_01(1).png"
                alt="Placeholder 1"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      {storeId ? (
        <NewProducts storeId={storeId} />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row justify-between">
            <span className="font-['Raleway'] font-bold text-[21px] leading-[30px] tracking-[-0.21px] text-[#202020]">
              New Items
            </span>

            <Link
              href="/allProducts"
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
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}{" "}
    </div>
  );
}
