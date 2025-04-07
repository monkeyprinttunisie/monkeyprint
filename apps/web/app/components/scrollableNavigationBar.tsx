"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import IconButton from "./iconButton";

export default function ScrollableNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeLink, setActiveLink] = useState<string>("products");

  // Update with pathname dependency
  useEffect(() => {
    // Read from localStorage whenever path changes
    const savedLink = localStorage.getItem("activeNavLink");
    if (savedLink) {
      setActiveLink(savedLink);
    }

    // Listen for localStorage changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "activeNavLink") {
        setActiveLink(e.newValue || "products");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pathname]);

  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    localStorage.setItem("activeNavLink", linkName);
  };

  return (
    <div className="">
      <nav className="w-full h-[9.5vh] bg-white shadow-lg fixed bottom-0 left-0 z-50 pt-1">
        <div className="flex justify-start overflow-x-auto py-2 gap-4 whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-4 w-full">
          <Link href="/designer_tool/products">
            <div
              onClick={() => handleLinkClick("products")}
              className={`rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "products" ? "bg-[#ECF1FF]" : ""}`}
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
              className={`rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "color" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton iconSrc="/icons/color_icon.svg" altText="Color Icon" />
            </div>
          </Link>

          <div
            onClick={() => {
              handleLinkClick("text");

              // if we're already on preview page
              if (pathname.includes("products/previewProduct")) {
                localStorage.setItem("activeNavLink", "text");

                // Add a timestamp to make each event unique
                const event = new CustomEvent("activateTextEditor", {
                  detail: {
                    source: 'navBar',
                    timestamp: Date.now()
                  }
                });

                window.dispatchEvent(event);
                console.log("Text editor activation event dispatched", Date.now());

                setTimeout(() => {
                  const refreshEvent = new CustomEvent("refreshTextEditor");
                  window.dispatchEvent(refreshEvent);
                }, 50);
              } else {
                //if we're not in preview page 
                alert("Please select a product first to use the text editor");
                // Reset the active link to previous state
                const savedLink = localStorage.getItem("activeNavLink");
                if (savedLink && savedLink !== "text") {
                  setActiveLink(savedLink);
                }
              }
            }}

          >

            <IconButton
              iconSrc="/icons/text_icon.svg"
              altText="Text Icon"
              classN={`rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "text" ? "bg-[#ECF1FF]" : ""}`}

            />
          </div>

          <Link href="/designer_tool/upload">
            <div
              onClick={() => handleLinkClick("upload")}
              className={`rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "upload" ? "bg-[#ECF1FF]" : ""}`}
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
              className={`rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "cliparts" ? "bg-[#ECF1FF]" : ""}`}
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
}