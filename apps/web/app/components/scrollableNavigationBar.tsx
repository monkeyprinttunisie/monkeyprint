"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import IconButton from "@/components/iconButton";
import { usePathname } from "next/navigation";

export default function ScrollableNav() {
  const [activeLink, setActiveLink] = useState<string>("");
  const pathname = usePathname();
  const handleLinkClick = (link: string) => {
    setActiveLink(link);
    localStorage.setItem("activeNavLink", link);
  };
  useEffect(() => {
    const path = pathname?.split("/").filter(Boolean);
    const currentSection = path?.[2];
    if (currentSection) {
      if (pathname.includes("products/previewProduct")) {
        setActiveLink("products");
        localStorage.setItem("activeNavLink", "products");
      } else if (currentSection && ["products", "color", "text", "upload", "cliparts", "library", "recent-uploads", "ai-generation"].includes(currentSection)) {
        setActiveLink(currentSection);
        localStorage.setItem("activeNavLink", currentSection);
      }
      else {
        // Fallback to localStorage if no path match
        const savedLink = localStorage.getItem("activeNavLink");
        if (savedLink) {
          setActiveLink(savedLink);
        }
      }
    }
  }, [pathname]);

  return (
    <div className="">
      <nav className="w-full h-[9.5vh] bg-white shadow-lg fixed bottom-0 left-0 z-50 pt-1">
        <div className="flex justify-between overflow-x-auto py-2 gap-4 whitespace-nowrap scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent px-4 w-full">
          <Link href="/designer_tool/products">
            <div
              onClick={() => handleLinkClick("products")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "products" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/product_icon.svg"
                altText="Product Icon"
              />
            </div>
          </Link>

          <Link href="/designer_tool/color">
            <div
              onClick={() => handleLinkClick("color")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "color" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton iconSrc="/icons/color_icon.svg" altText="Color Icon" />
            </div>
          </Link>

          <Link href="/designer_tool/text">
            <div
              onClick={() => handleLinkClick("text")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "text" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton iconSrc="/icons/text_icon.svg" altText="Text Icon" />
            </div>
          </Link>

          <Link href="/designer_tool/upload">
            <div
              onClick={() => handleLinkClick("upload")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "upload" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/upload_icon.svg"
                altText="Upload Icon"
              />
            </div>
          </Link>

          <Link href="/designer_tool/cliparts">
            <div
              onClick={() => handleLinkClick("cliparts")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "cliparts" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/cliparts_icon.svg"
                altText="Cliparts Icon"
              />
            </div>
          </Link>

          <Link href="/designer_tool/library">
            <div
              onClick={() => handleLinkClick("library")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "lirary" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/library_icon.svg"
                altText="Library Icon"
              />
            </div>
          </Link>

          <Link href="/designer_tool/recent-uploads">
            <div
              onClick={() => handleLinkClick("recent-uploads")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "recent-uploads" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/recentUpload_icon.svg"
                altText="Recent Uploads Icon"
              />
            </div>
          </Link>

          <Link href="/designer_tool/ai-generation">
            <div
              onClick={() => handleLinkClick("ai-generation")}
              className={` rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center  ${activeLink === "ai-generation" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/Generate_icon.svg"
                altText="AI Generation Icon"
              />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
};


