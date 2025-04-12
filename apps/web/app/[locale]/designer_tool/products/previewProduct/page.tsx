"use client";
// pages/previewProduct.tsx
import PreviewProduct from "@/components/previewProduct";
import Link from "next/link";
import { useEffect, useState } from "react";

const PreviewPage: React.FC = () => {
  // Check if we're coming from product creation page

  const [isFromProductPage, setIsFromProductPage] = useState(false);
  useEffect(() => {
    // Check localStorage after component mounts
    const fromProductPage = localStorage.getItem("designForProduct") === "true";
    setIsFromProductPage(fromProductPage);
    console.log("From product page:", fromProductPage);
  }, []);
  // Function to capture design and return to product page
  const handleDone = () => {
    try {
      window.dispatchEvent(new CustomEvent("design:deselectAll"));
      if (document.getSelection) {
        document.getSelection()?.empty();
      }

      setTimeout(() => {
        // Capture the current design view as an image
        const designContainer = document.querySelector(
          ".relative.w-\\[50vh\\].h-\\[60vh\\]"
        );

        if (designContainer) {
          import("html-to-image").then(({ toPng }) => {
            toPng(designContainer as HTMLElement, {
              // Important: disable selection and make any selection controls invisible
              filter: (node) => {
                // Skip any selection handles, resize controls, etc.
                if (
                  node.classList?.contains("selection-handle") ||
                  node.classList?.contains("resize-control") ||
                  node.classList?.contains("rotation-handle") ||
                  node.classList?.contains("delete-button") ||
                  node.hasAttribute?.("data-control")
                ) {
                  return false;
                }
                return true;
              },
            })
              .then((dataUrl) => {
                // Store the captured design
                localStorage.setItem("productDesignImage", dataUrl);

                // Clear the design flag
                localStorage.removeItem("designForProduct");

                // Redirect back to product creation
                window.location.href = "/products";
              })
              .catch((error) => {
                console.error("Error capturing design:", error);
                alert("Error capturing your design. Please try again.");
              });
          });
        } else {
          alert("Could not capture the design. Please try again.");
        }
      }, 100); // Small delay to allow UI to update
    } catch (error) {
      console.error("Error in handleDone:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <PreviewProduct />
      <div
        className={`flex items-center mt-6 ${isFromProductPage ? "justify-center gap-4" : "justify-center"}`}
      >
        <Link href="/designer_tool/products" passHref>
          <button className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full bg-gradient-to-r from-[#004CFF] to-[#3471FF]">
            Change Product
          </button>
        </Link>

        {isFromProductPage && (
          <button
            onClick={handleDone}
            className="bg-green-500 text-white text-sm py-2 px-6 rounded-full bg-gradient-to-r from-[#009900] to-[#00CC00] font-bold"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
