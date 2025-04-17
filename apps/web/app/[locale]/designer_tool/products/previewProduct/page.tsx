"use client";
import PreviewProduct from "@/components/previewProduct";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useUploadThing } from "@/uploadthing";

const PreviewPage: React.FC = () => {
  const [isFromProductPage, setIsFromProductPage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing("productImage");

  //for the mockup generator
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromProductPage = localStorage.getItem("designForProduct") === "true";
    setIsFromProductPage(fromProductPage);
    console.log("From product page:", fromProductPage);
  }, []);

  const generateMockup = async (designUrl: string): Promise<string> => {
    console.log("Generating mockup with design URL:", designUrl);

    // Call the mockup API
    const mockupResponse = await fetch("/api/mockup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ designUrl }),
    });

    console.log("Mockup API response status:", mockupResponse.status);

    // Get response as text first for debugging
    const responseText = await mockupResponse.text();
    console.log("Mockup API raw response:", responseText);

    // Parse the response
    let mockupResult;
    try {
      mockupResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse mockup API response:", e);
      throw new Error(
        `Invalid response from server: ${responseText.substring(0, 100)}...`
      );
    }

    // Check for errors
    if (!mockupResponse.ok || mockupResult.error) {
      const errorMsg =
        mockupResult.error || `Server error (${mockupResponse.status})`;
      throw new Error(errorMsg);
    }

    // Check for render URL
    if (!mockupResult.renderUrl) {
      console.error("Missing renderUrl in response:", mockupResult);
      throw new Error("No mockup URL returned from server");
    }

    console.log("Mockup generated successfully:", mockupResult.renderUrl);
    return mockupResult.renderUrl;
  };

  const handleDone = async () => {
    try {
      // Clear any previous errors
      setError(null);

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
            // 1. Capture design as image
            console.log("Capturing design as image...");
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

            // 2. Convert data URL to File and upload to get URL
            console.log("Converting and uploading design...");
            const blob = await fetch(dataUrl).then((res) => res.blob());
            const fileName = `design-${Date.now()}.png`;
            const file = new File([blob], fileName, { type: "image/png" });

            // Upload to UploadThing to get URL
            const uploadResult = await startUpload([file]);
            if (!uploadResult || uploadResult.length === 0) {
              throw new Error("Failed to upload design");
            }

            // Get the URL from the upload result
            const designUrl = uploadResult[0].ufsUrl || uploadResult[0].url;
            console.log("Design uploaded successfully:", designUrl);

            // 3. Generate mockup using the design URL
            console.log("Generating mockup with the design...");
            const mockupUrl = await generateMockup(designUrl);
            console.log("Mockup URL:", mockupUrl);

            // 4. Store the mockup URL for product creation
            localStorage.setItem("productDesignImage", mockupUrl);

            // 5. Clear the design flag
            localStorage.removeItem("designForProduct");

            // 6. Redirect back to product creation
            console.log("Process completed successfully, redirecting...");
            window.location.href = "/products";
          } catch (error) {
            console.error("Error processing or uploading design:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Error uploading your design. Please try again.";

            setError(errorMessage);
            setIsUploading(false);
          }
        } else {
          setError("Could not capture the design. Please try again.");
          setIsUploading(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error in handleDone:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";

      setError(errorMessage);
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <PreviewProduct />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
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
