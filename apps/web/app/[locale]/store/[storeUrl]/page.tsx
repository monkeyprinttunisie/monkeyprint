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
  const [banners, setBanners] = useState<any[]>([]);

  const t = useTranslations("HomePage");
  useEffect(() => {
    async function fetchStoreId() {
      try {
        const store = await getStoreByUrl(storeUrl);
        if (store) {
          setStoreId(store.id);
          setStoreImage(store.image);
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
      <div className="flex flex-row items-center gap-5 w-full">
        <Avatar className="h-[54px] w-[54px]">
          <AvatarImage src={storeImage || undefined} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <form className="relative w-full">
          <input
            type="search"
            id="default-search"
            className="p-[15.764px_19.705px] bg-[#D9E4FF] rounded-[59.115px] w-full"
            placeholder="Search"
            required
          />
          <button type="submit" className="absolute top-2 end-0 p-2.5">
            <img src="/icons/search-icon.svg" alt="Search" />
          </button>
        </form>
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
