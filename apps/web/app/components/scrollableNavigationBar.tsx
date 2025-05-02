"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import IconButton from "./iconButton";

export default function ScrollableNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeLink, setActiveLink] = useState<string>("products");
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Update active link based on current path
  useEffect(() => {
    // Determine active link from URL path
    if (pathname.includes("/designer_tool/products")) {
      setActiveLink("products");
      localStorage.setItem("activeNavLink", "products");
    } else if (pathname.includes("/designer_tool/color")) {
      setActiveLink("color");
      localStorage.setItem("activeNavLink", "color");
    } else if (pathname.includes("/designer_tool/upload")) {
      setActiveLink("upload");
      localStorage.setItem("activeNavLink", "upload");
    } else if (pathname.includes("/designer_tool/cliparts")) {
      setActiveLink("cliparts");
      localStorage.setItem("activeNavLink", "cliparts");
    }  else if (pathname.includes("/designer_tool/ai-generation")) {
      setActiveLink("ai-generation");
      localStorage.setItem("activeNavLink", "ai-generation");
    }
    else if (pathname.includes("/designer_tool/previewProduct")) {
      setActiveLink("preview");
      localStorage.setItem("activeNavLink", "preview");
    }
    // Special case for text editor - only keep this active if explicitly set by clicking
    if (pathname.includes("/previewProduct") && localStorage.getItem("activeNavLink") === "text") {
      setActiveLink("text");
    }
  }, [pathname]);

  // Scroll active button into view when it changes
  useEffect(() => {
    if (navContainerRef.current) {
      const activeButton = navContainerRef.current.querySelector(`.${activeLink}-button`);
      if (activeButton) {
        // Scroll the active button into view with smooth animation
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeLink]);

  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    localStorage.setItem("activeNavLink", linkName);
  };

  return (
    <div className="">
      <nav className="w-full h-[9.5vh] bg-white border-t border-gray-200 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] fixed bottom-0 left-0 z-50 pt-1">
        <div
          ref={navContainerRef}
          className="flex justify-start overflow-x-auto py-2  gap-4 whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-4 w-full"
        >
          <Link href="/designer_tool/products">
            <div
              onClick={() => handleLinkClick("products")}
              className={`products-button rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "products" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/product_icon.svg"
                altText="Product Icon"
              />
            </div>
          </Link>
          <div
            onClick={() => {
              handleLinkClick("preview");
              const selectedProduct = localStorage.getItem('selectedProduct');
              if (selectedProduct) {
                router.push(`/designer_tool/previewProduct?product=${selectedProduct}`);
              } else {
                alert("Please select a product first");
                // Reset the active link to previous state
                const savedLink = localStorage.getItem("activeNavLink");
                if (savedLink && savedLink !== "preview") {
                  setActiveLink(savedLink);
                } else {
                  // Default to products if no saved link
                  setActiveLink("products");
                }
              }
            }}
          >
            <IconButton
              iconSrc="/icons/preview_icon.png"
              altText="Preview Icon"
              classN={`preview-button rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "preview" ? "bg-[#ECF1FF]" : ""}`}

            />
          </div>
          <Link href="/designer_tool/color">
            <div
              onClick={() => handleLinkClick("color")}
              className={`color-button rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "color" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton iconSrc="/icons/color_icon.svg" altText="Color Icon" />
            </div>
          </Link>

          <div
            className="text-button"
            onClick={() => {
              handleLinkClick("text");

              // if we're already on preview page
              if (pathname.includes("/previewProduct")) {
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
                } else {
                  // Default to products if no saved link
                  setActiveLink("products");
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
              className={`upload-button rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "upload" ? "bg-[#ECF1FF]" : ""}`}
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
              className={`cliparts-button rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "cliparts" ? "bg-[#ECF1FF]" : ""}`}
            >
              <IconButton
                iconSrc="/icons/cliparts_icon.svg"
                altText="Cliparts Icon"
              />
            </div>
          </Link>

          <Link href="/designer_tool/ai-generation">
            <div
              onClick={() => handleLinkClick("ai-generation")}
              className={`ai-generation-button rounded pt-1.5 h-[6vh] w-[15vw] flex items-center justify-center ${activeLink === "ai-generation" ? "bg-[#ECF1FF]" : ""}`}
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