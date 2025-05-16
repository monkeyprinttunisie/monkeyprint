import CardCarousel from "@/components/cardCarousel";
import CategoriesGridDisplay from "@/components/categoriesGridDisplay";
import DiscountCard from "@/components/DiscountCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import NewProducts from "@/components/newProducts";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <div className="flex flex-col gap-5 items-center h-[92vh] w-screen max-w-[500px] p-5">
      <div className="flex flex-row items-center gap-5 w-full">
        <Avatar className="h-[54px] w-[54px]">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
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
      <CardCarousel
        cards={[<DiscountCard />, <DiscountCard />, <DiscountCard />]}
      />
      <CategoriesGridDisplay />
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
      <NewProducts />
    </div>
  );
}
