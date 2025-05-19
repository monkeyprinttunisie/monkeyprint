"use client";
import PreviewProduct from "@/components/previewProduct";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUploadThing } from "@/uploadthing";
import { getCurrentUser } from "@/actions/authActions";

const PreviewPage: React.FC = () => {
  const [isFromProductPage, setIsFromProductPage] = useState(false);
  const [isFromUpdatePage, setIsFromUpdatePage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [targetCategories, setTargetCategories] = useState<string[]>([]);
  const { startUpload } = useUploadThing("productImage");
  const [targetCategoryNames, setTargetCategoryNames] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  //for the mockup generator
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserRole(user.role);
          console.log("User role set from server action:", user.role);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserRole();

    const fromProductPage = localStorage.getItem("designForProduct") === "true";
    const fromUpdatePage =
      localStorage.getItem("designForProductUpdate") === "true";

    setIsFromProductPage(fromProductPage);
    setIsFromUpdatePage(fromUpdatePage);
    console.log("From product page:", fromProductPage);
    console.log("From update page:", fromUpdatePage);

    // Load target categories from localStorage
    try {
      const storedCategories = localStorage.getItem("designTargetCategories");
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        setTargetCategories(parsedCategories);
        console.log("Loaded target categories:", parsedCategories);
      }
      // Also load target category names (for mockup selection)
      const storedCategoryNames = localStorage.getItem(
        "designTargetCategoryNames"
      );
      if (storedCategoryNames) {
        const parsedCategoryNames = JSON.parse(storedCategoryNames);
        setTargetCategoryNames(parsedCategoryNames);
        console.log("Loaded target category names:", parsedCategoryNames);
      }
    } catch (err) {
      console.error("Error parsing target categories:", err);
    }
  }, []);

  const generateMockup = async (designUrl: string): Promise<string> => {
    console.log("Generating mockup with design URL:", designUrl);
    console.log("Using target categories:", targetCategories);
    // Call the mockup API
    const mockupResponse = await fetch("/api/mockup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        designUrl,
        targetCategories: targetCategoryNames,
      }),
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
        try {
          console.log("Starting design extraction...");

          // 1. Find all design elements (images and text)
          const designImages = document.querySelectorAll(
            'div[id^="design-image-"]'
          );
          const designTexts = document.querySelectorAll(
            'div[id^="design-text-"]'
          );

          console.log(
            `Found ${designImages.length} design images and ${designTexts.length} design texts`
          );

          if (designImages.length === 0 && designTexts.length === 0) {
            throw new Error(
              "No design elements found. Please add images or text to your design."
            );
          }

          // 2. First pass: determine the bounding box of all elements
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          // Padding to add around the design (in pixels)
          const padding = 0; // Increased padding for better visibility on mockups

          // Calculate for image elements
          for (const imgElement of designImages) {
            const elementStyle = window.getComputedStyle(
              imgElement as HTMLElement
            );
            const styleTransform = (imgElement as HTMLElement).style.transform;
            const translateMatch = styleTransform.match(
              /translate\(([^,]+)px,\s*([^)]+)px\)/
            );
            const translateX = translateMatch
              ? parseFloat(translateMatch[1])
              : 0;
            const translateY = translateMatch
              ? parseFloat(translateMatch[2])
              : 0;

            // Get element width and height
            const width = parseFloat(elementStyle.width) || 100;
            const height = parseFloat(elementStyle.height) || 100;

            // Calculate element boundaries
            const left = translateX - width / 2;
            const top = translateY - height / 2;
            const right = translateX + width / 2;
            const bottom = translateY + height / 2;

            // Update our bounding box
            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
          }

          // For text elements, we need a different approach since getBoundingClientRect might not be accurate
          for (const textElement of designTexts) {
            // Try to find the inner content element
            const contentDiv = textElement.querySelector(
              'div[style*="font-family"]'
            );
            const textarea = textElement.querySelector("textarea");
            const contentElement = contentDiv || textarea || textElement;

            // Get transform data
            const styleTransform = (textElement as HTMLElement).style.transform;
            const translateMatch = styleTransform.match(
              /translate\(([^,]+)px,\s*([^)]+)px\)/
            );
            const translateX = translateMatch
              ? parseFloat(translateMatch[1])
              : 0;
            const translateY = translateMatch
              ? parseFloat(translateMatch[2])
              : 0;

            // Get more accurate dimensions from the content element
            const rect = (
              contentElement as HTMLElement
            ).getBoundingClientRect();

            // Calculate element boundaries
            const left = translateX - rect.width / 2;
            const top = translateY - rect.height / 2;
            const right = translateX + rect.width / 2;
            const bottom = translateY + rect.height / 2;

            // Update our bounding box
            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
          }

          // Handle edge case if no elements properly processed
          if (
            minX === Infinity ||
            minY === Infinity ||
            maxX === -Infinity ||
            maxY === -Infinity
          ) {
            console.log("Couldn't determine design bounds, using default size");
            minX = -200;
            minY = -200;
            maxX = 200;
            maxY = 200;
          }

          // Calculate canvas dimensions with padding
          const canvasWidth = Math.round(maxX - minX) + padding * 2;
          const canvasHeight = Math.round(maxY - minY) + padding * 2;

          console.log(`Canvas dimensions: ${canvasWidth}x${canvasHeight}`);
          console.log(`Design bounds: (${minX},${minY}) to (${maxX},${maxY})`);

          // 3. Create canvas with transparent background
          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Could not get canvas context");
          }

          // Clear canvas to ensure transparency
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 4. Capture and render all design elements
          const designElementsPromises = [];

          // Process design images
          for (const imgElement of designImages) {
            // Get the img tag from inside the design element
            const imgTag = imgElement.querySelector("img");
            if (imgTag) {
              const img = new Image();
              img.crossOrigin = "anonymous";

              designElementsPromises.push(
                new Promise<void>((resolve, reject) => {
                  img.onload = () => {
                    // Get position data from the style transform
                    const styleTransform = (imgElement as HTMLElement).style
                      .transform;
                    const translateMatch = styleTransform.match(
                      /translate\(([^,]+)px,\s*([^)]+)px\)/
                    );
                    const translateX = translateMatch
                      ? parseFloat(translateMatch[1])
                      : 0;
                    const translateY = translateMatch
                      ? parseFloat(translateMatch[2])
                      : 0;

                    // Get rotation if any
                    const rotateMatch =
                      styleTransform.match(/rotate\(([^)]+)deg\)/);
                    const rotateDeg = rotateMatch
                      ? parseFloat(rotateMatch[1])
                      : 0;

                    // Get width from style
                    const width =
                      parseFloat((imgElement as HTMLElement).style.width) ||
                      100;
                    const height = width * (img.height / img.width); // Maintain aspect ratio

                    // Draw with rotation if needed
                    ctx.save();

                    // Position adjusted for the bounding box and centered
                    const posX = translateX - minX + padding;
                    const posY = translateY - minY + padding;

                    if (rotateDeg !== 0) {
                      // Apply rotation around the center point
                      ctx.translate(posX, posY);
                      ctx.rotate((rotateDeg * Math.PI) / 180);
                      ctx.translate(-posX, -posY);
                    }

                    // Draw the image centered at the position
                    ctx.drawImage(
                      img,
                      posX - width / 2,
                      posY - height / 2,
                      width,
                      height
                    );

                    ctx.restore();
                    resolve();
                  };

                  img.onerror = () => {
                    console.error("Failed to load image:", imgTag.src);
                    reject(
                      new Error(
                        `Failed to load image for element ${imgElement.id}`
                      )
                    );
                  };

                  img.src = imgTag.src;
                })
              );
            }
          }

          // Process design texts
          for (const textElement of designTexts) {
            // Try to find the actual text content element
            const textDiv = textElement.querySelector(
              'div[style*="font-family"]'
            );
            const textarea = textElement.querySelector("textarea");

            let textContent = "";
            let fontFamily = "Arial";
            let fontSize = "24px";
            let fontWeight = "normal";
            let color = "#000000";
            let textAlign = "center";

            // Get the text content and styles from the appropriate element
            if (textDiv) {
              textContent = textDiv.textContent || "";
              const style = window.getComputedStyle(textDiv);
              fontFamily = style.fontFamily;
              fontSize = style.fontSize;
              fontWeight = style.fontWeight;
              color = style.color;
              textAlign = style.textAlign;
            } else if (textarea) {
              textContent = (textarea as HTMLTextAreaElement).value;
              const style = window.getComputedStyle(textarea);
              fontFamily = style.fontFamily;
              fontSize = style.fontSize;
              fontWeight = style.fontWeight;
              color = style.color;
              textAlign = style.textAlign;
            } else {
              // If neither found, try to extract from the parent element
              textContent = textElement.textContent || "";
              const style = window.getComputedStyle(textElement as HTMLElement);
              if (style.fontFamily) fontFamily = style.fontFamily;
              if (style.fontSize) fontSize = style.fontSize;
              if (style.fontWeight) fontWeight = style.fontWeight;
              if (style.color) color = style.color;
              if (style.textAlign) textAlign = style.textAlign;
            }

            if (textContent && textContent.trim()) {
              // Get position data from the style transform
              const styleTransform = (textElement as HTMLElement).style
                .transform;
              const translateMatch = styleTransform.match(
                /translate\(([^,]+)px,\s*([^)]+)px\)/
              );
              const translateX = translateMatch
                ? parseFloat(translateMatch[1])
                : 0;
              const translateY = translateMatch
                ? parseFloat(translateMatch[2])
                : 0;

              // Get rotation if any
              const rotateMatch = styleTransform.match(/rotate\(([^)]+)deg\)/);
              const rotateDeg = rotateMatch ? parseFloat(rotateMatch[1]) : 0;

              // Position adjusted for the bounding box
              const posX = translateX - minX + padding;
              const posY = translateY - minY + padding;

              // Draw text with rotation if needed
              ctx.save();

              // Apply rotation if needed
              if (rotateDeg !== 0) {
                ctx.translate(posX, posY);
                ctx.rotate((rotateDeg * Math.PI) / 180);
                ctx.translate(-posX, -posY);
              }

              // Set text properties
              ctx.font = `${fontWeight} ${fontSize} ${fontFamily.replace(/"/g, "")}`;
              ctx.fillStyle = color;
              ctx.textAlign = textAlign as CanvasTextAlign;
              ctx.textBaseline = "middle"; // This helps center the text vertically

              // Draw the text
              ctx.fillText(textContent, posX, posY);

              ctx.restore();
              console.log(`Drew text "${textContent}" at (${posX}, ${posY})`);
            } else {
              console.log("No text content found in element:", textElement.id);
            }
          }

          // Wait for all image elements to be processed
          await Promise.all(designElementsPromises);
          console.log("All design elements rendered to canvas");

          // 5. Convert the canvas to an image with transparent background
          const designDataUrl = canvas.toDataURL("image/png");
          console.log("Design converted to data URL");

          // 6. Convert data URL to File and upload to get URL
          console.log("Converting and uploading design...");
          const blob = await fetch(designDataUrl).then((res) => res.blob());
          const fileName = `design-${Date.now()}.png`;
          const file = new File([blob], fileName, { type: "image/png" });

          // Upload to UploadThing to get URL
          const uploadResult = await startUpload([file]);
          if (!uploadResult || uploadResult.length === 0) {
            throw new Error("Failed to upload design");
          }

          // Get the URL from the upload result
          const designUrl = uploadResult[0].ufsUrl || uploadResult[0].ufsUrl;
          console.log("Design uploaded successfully:", designUrl);

          // 7. Generate mockup using the design URL
          console.log("Generating mockup with the design...");
          const mockupUrl = await generateMockup(designUrl);
          console.log("Mockup URL:", mockupUrl);

          // 8. Store the mockup URL for product creation
          localStorage.setItem("productDesignImage", mockupUrl);
          sessionStorage.setItem("productDesignImage", mockupUrl);

          // 9. Set a flag that this is a fresh image to be used
          localStorage.setItem("freshDesignImage", "true");
          const user = getCurrentUser();

          // Smart redirection based on source and role stored in state
          if (isFromUpdatePage) {
            // Came from update product page - keep pendingProduct data for restoration
            localStorage.removeItem("designForProductUpdate");

            const pendingData = localStorage.getItem("pendingProduct");
            if (pendingData) {
              const productData = JSON.parse(pendingData);
              if (userRole === "SUPER_ADMIN") {
                window.location.href = `/en/superAdmin/products/updateProduct?id=${productData.id}`;
              } else {
                window.location.href = `/en/admin/products/updateProduct?id=${productData.id}`;
              }
            } else {
              window.location.href =
                userRole === "SUPER_ADMIN"
                  ? "/en/superAdmin/products"
                  : "/en/admin/products";
            }
          } else {
            // Came from create product page
            window.location.href =
              userRole === "SUPER_ADMIN"
                ? "/en/superAdmin/products/createProduct"
                : "/en/admin/products/createProduct";
          }
        } catch (error) {
          console.error("Error processing or uploading design:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Error uploading your design. Please try again.";

          setError(errorMessage);
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
