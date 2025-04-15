"use client";
import PreviewProduct from "@/components/previewProduct";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUploadThing } from "@/uploadthing";

const PreviewPage: React.FC = () => {
  const [isFromProductPage, setIsFromProductPage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing("productImage");

  useEffect(() => {
    const fromProductPage = localStorage.getItem("designForProduct") === "true";
    setIsFromProductPage(fromProductPage);
    console.log("From product page:", fromProductPage);
  }, []);

  const handleDone = async () => {
    try {
      // Deselect all elements first
      window.dispatchEvent(new CustomEvent("design:deselectAll"));
      if (document.getSelection) {
        document.getSelection()?.empty();
      }

      // Set uploading state to show loading indicator
      setIsUploading(true);

      setTimeout(async () => {
        // Capture the current design view as an image
        const designContainer = document.querySelector(
          ".relative.w-\\[50vh\\].h-\\[60vh\\]"
        );

        if (designContainer) {
          try {
            const { toPng } = await import("html-to-image");

            const dataUrl = await toPng(designContainer as HTMLElement, {
              filter: (node) => {
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
            });

            // Convert data URL to Blob
            const blob = await fetch(dataUrl).then((res) => res.blob());

            // Create a File object from the Blob
            const fileName = `product-design-${Date.now()}.png`;
            const file = new File([blob], fileName, { type: "image/png" });

            // Upload to UploadThing directly
            const uploadResult = await startUpload([file]);

            if (!uploadResult || uploadResult.length === 0) {
              throw new Error("Upload failed");
            }

            // Get the URL from the upload result
            const uploadedUrl = uploadResult[0].url;
            console.log("Upload successful:", uploadedUrl);

            // Store the uploaded URL (not the data URL)
            localStorage.setItem("productDesignImage", uploadedUrl);

            // Clear the design flag
            localStorage.removeItem("designForProduct");

            // Redirect back to product creation
            window.location.href = "/products";
          } catch (error) {
            console.error("Error processing or uploading design:", error);
            alert("Error uploading your design. Please try again.");
            setIsUploading(false);
          }
        } else {
          alert("Could not capture the design. Please try again.");
          setIsUploading(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error in handleDone:", error);
      alert("An error occurred. Please try again.");
      setIsUploading(false);
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
            disabled={isUploading}
            className="bg-green-500 text-white text-sm py-2 px-6 rounded-full bg-gradient-to-r from-[#009900] to-[#00CC00] font-bold"
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Done"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
