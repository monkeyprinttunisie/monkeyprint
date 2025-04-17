"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { openDB } from "idb";

// API keys for image generation and background removal services
const IMAGEPIG_API_KEY = "d68df09a-dc33-4c99-ac79-b843d4f282e1";
const REMOVE_BG_API_KEY = "gZmBYu4uSsDF8HS4giRHj3rA";

// IndexedDB configuration
const DB_NAME = "monkeyprint-db";
const DB_VERSION = 1;

// Style names for the UI display
const STYLE_NAMES = ["Style 1", "Style 2", "Style 3", "Style 4"];

export default function ImageGenerator() {
  const router = useRouter();

  // Prompt-related state
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isPromptChanged, setIsPromptChanged] = useState(false);

  // Image generation states
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Background removal states
  const [removeBackground, setRemoveBackground] = useState(false);
  const previousRemoveBackground = useRef(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [shouldRemoveBackgroundOnly, setShouldRemoveBackgroundOnly] =
    useState(false);

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // to remove
  /* const [styleNames] = useState(["Style 1", "Style 2", "Style 3", "Style 4"]); */

  /**
   * IndexedDB Functions
   * Manages database initialization and operations
   */
  const initializeIndexedDB = async () => {
    try {
      console.log("Initializing IndexedDB...");
      const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create image and settings stores if they don't exist
          if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings");
          }
        },
      });
      console.log("IndexedDB initialized successfully");
      db.close();
      return true;
    } catch (error) {
      console.error("Error initializing IndexedDB:", error);
      return false;
    }
  };

  const saveImagesToIndexedDB = async (images: string[]) => {
    try {
      // Open database connection
      const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings");
          }
        },
      });

      // Clear existing images first to avoid accumulation
      const tx = db.transaction("images", "readwrite");
      await tx.objectStore("images").clear();
      await tx.done;

      // Save each image at full quality
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          // Store without compression
          await db.put("images", images[i], `image-${i}`);
        }
      }

      // Save prompt
      await db.put("settings", prompt, "lastPrompt");
      console.log("Saved full-quality images to IndexedDB");
    } catch (error) {
      console.error("Error saving to IndexedDB:", error);
    }
  };

  const loadImagesFromIndexedDB = async () => {
    try {
      // Open database connection
      const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings");
          }
        },
      });

      const images = [];

      // Load each image from storage
      for (let i = 0; i < 4; i++) {
        const img = await db.get("images", `image-${i}`);
        images.push(img || "");
      }

      // Load prompt from storage
      const lastPrompt = await db.get("settings", "lastPrompt");

      return { images, lastPrompt: lastPrompt || "" };
    } catch (error) {
      console.error("Error loading from IndexedDB:", error);
      return { images: [], lastPrompt: "" };
    }
  };

  /**
   * Image Generation and Processing Functions
   */
  // Generate a single image using the ImagePig API
  const generateSingleImage = async (
    currentPrompt: string
  ): Promise<string> => {
    // API endpoint according to documentation
    const apiEndpoint = "https://api.imagepig.com/xl";

    // Prepare request payload
    const payload = {
      prompt: currentPrompt + ", high quality",
      negative_prompt: "",
      format: "PNG",
    };

    try {
      // Make API request with proper headers
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": IMAGEPIG_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      // Create image URL from base64 data
      const imageUrl = `data:${data.mime_type};base64,${data.image_data}`;

      // Apply background removal if option is enabled
      if (removeBackground && !shouldRemoveBackgroundOnly) {
        try {
          return await removeImageBackground(imageUrl);
        } catch (error) {
          console.error("Error removing background:", error);
          return imageUrl; // Return original image if background removal fails
        }
      }
      return imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  };

  // Remove image background using remove.bg API
  const removeImageBackground = async (imageUrl: string): Promise<string> => {
    try {
      // Extract base64 data from data URL
      const base64Data = imageUrl.split(",")[1];

      // Call remove.bg API
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_file_b64: base64Data,
          size: "auto",
          format: "png",
          channels: "rgba",
        }),
      });

      if (!response.ok) {
        // Handle different error response formats
        const contentType = response.headers.get("content-type");
        let errorMessage;

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.errors?.[0]?.title || response.statusText;
          } catch (parseError) {
            errorMessage = `Failed to parse error response: ${response.statusText}`;
          }
        } else {
          errorMessage = `Failed with status: ${response.status} ${response.statusText}`;
        }

        throw new Error(`Remove.bg API error: ${errorMessage}`);
      }

      // Handle different response formats
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        // Handle JSON response
        const data = await response.json();
        return `data:image/png;base64,${data.data.result_b64}`;
      } else if (contentType && contentType.includes("image/png")) {
        // Handle direct PNG response
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        return `data:image/png;base64,${base64}`;
      } else {
        throw new Error("Unexpected response format from remove.bg API");
      }
    } catch (error) {
      console.error("Background removal error:", error);

      // Special handling for quota exceeded errors
      if (
        error instanceof Error &&
        (error.message.includes("quota") || error.message.includes("exceeded"))
      ) {
        alert(
          "You've reached the free limit (50 images) for background removal. Please try again later or upgrade on remove.bg."
        );
        // Disable background removal to prevent further attempts
        setRemoveBackground(false);
      }

      // Return the original image if background removal fails
      return imageUrl;
    }
  };

  // Apply background removal to existing images
  const applyBackgroundRemovalToExistingImages = async () => {
    if (generatedImages.length === 0) return;

    setIsRemovingBackground(true);

    try {
      // Create a copy of the current images
      const updatedImages = [...generatedImages];

      // Process each image with background removal
      for (let i = 0; i < updatedImages.length; i++) {
        if (updatedImages[i]) {
          try {
            updatedImages[i] = await removeImageBackground(updatedImages[i]);
            // Update images one by one so user sees progress
            setGeneratedImages([...updatedImages]);
            saveImagesToStorage([...updatedImages]);
          } catch (error) {
            console.error(`Error removing background from image ${i}:`, error);
          }

          // Add a small delay between API calls to avoid rate limits
          if (i < updatedImages.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // Reset the flag since we've processed all images
      setShouldRemoveBackgroundOnly(false);
    } catch (error) {
      console.error("Error processing images:", error);

      // Handle quota exceeded errors
      if (error instanceof Error) {
        if (
          error.message.includes("quota") ||
          error.message.includes("exceeded")
        ) {
          alert(
            "You've reached the free limit for background removal. The operation was aborted."
          );
          setRemoveBackground(false);
        }
      }
    } finally {
      setIsRemovingBackground(false);
    }
  };

  // Generate multiple images based on prompt
  const generateImages = async (baseOnSelected = false) => {
    if (prompt.trim().length === 0) return;

    setIsGenerating(true);

    try {
      // Determine how many images to generate based on API rate limits
      const imagesToGenerate = baseOnSelected ? 1 : 2;

      // If we're generating based on selected, we need to keep track of which images to replace
      const targetIndices =
        baseOnSelected && selectedImageIndex !== null
          ? Array.from({ length: 4 })
              .map((_, i) => i)
              .filter((i) => i !== selectedImageIndex)
          : [0, 1, 2, 3]; // All indices if not based on selected

      console.log(
        `Generating ${imagesToGenerate} images for indices:`,
        targetIndices
      );

      //to remove
      /* let newImages: string[] = []; */

      // Generate in parallel if not removing backgrounds during generation
      const imagePromises = Array.from({ length: imagesToGenerate }).map(() =>
        generateSingleImage(prompt)
      );
      const newImages = await Promise.all(imagePromises);

      console.log("Generated new images:", newImages.length);

      // Update state based on generation mode (keep selection or generate all new)
      if (baseOnSelected && selectedImageIndex !== null) {
        // Create a copy of current images
        const updatedImages = [...generatedImages];

        // Replace only the non-selected images
        for (let i = 0; i < targetIndices.length && i < newImages.length; i++) {
          updatedImages[targetIndices[i]] = newImages[i];
        }

        setGeneratedImages(updatedImages);
        saveImagesToStorage(updatedImages);
      } else {
        // Need to preserve length of 4 even if we generate fewer images
        const completeImageSet = Array(4).fill(null);
        for (let i = 0; i < newImages.length; i++) {
          completeImageSet[i] = newImages[i];
        }

        setGeneratedImages(completeImageSet);
        saveImagesToStorage(completeImageSet);
      }

      // Update the original prompt
      setOriginalPrompt(prompt);
      setIsPromptChanged(false);
    } catch (error) {
      console.error("Error generating images:", error);

      // Handle specific API errors
      if (error instanceof Error) {
        if (
          error.message.includes("exceeded your quota") ||
          error.message.includes("upgrade your plan")
        ) {
          alert(
            "You've reached the free limit for the ImagePig API. The app will now use placeholder images instead."
          );
        } else if (error.message.includes("rate limited")) {
          alert(
            "You've hit the API rate limit. Please wait a moment before generating more images."
          );
        }
      }

      // Fallback to mock images when API fails
      const mockImages = Array(4)
        .fill(0)
        .map(
          (_, i) => `https://picsum.photos/seed/${prompt.length + i}/512/512`
        );

      if (baseOnSelected && selectedImageIndex !== null) {
        // Create a copy of current images
        const updatedImages = [...generatedImages];
        let newIndex = 0;

        // Keep the selected image, replace the rest with mock images
        for (let i = 0; i < 4; i++) {
          if (i !== selectedImageIndex) {
            updatedImages[i] = mockImages[newIndex];
            newIndex++;
          }
        }

        setGeneratedImages(updatedImages);
      } else {
        setGeneratedImages(mockImages);
      }

      // Even with mock images, update the original prompt
      setOriginalPrompt(prompt);
      setIsPromptChanged(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Compress image for preview (to avoid localStorage quota issues)
  const compressImageForPreview = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        // Moderate reduction to 600px for preview only
        const maxWidth = 600;
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.floor((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          if (dataUrl.includes("png") && removeBackground) {
            // For transparent images, preserve transparency
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/png"));
          } else {
            // For regular images, use white background and JPEG
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          }
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  /**
   * Storage and Persistence
   */
  // Save images to IndexedDB wrapper
  const saveImagesToStorage = useCallback(
    (images: string[]) => {
      // Save original quality images to IndexedDB
      saveImagesToIndexedDB(images);
    },
    [prompt, removeBackground]
  );

  /**
   * Event Handlers
   */
  // Handle text prompt changes
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 1000) {
      setPrompt(text);
    }
  };

  // Handle image selection
  const handleStyleSelect = (index: number) => {
    if (generatedImages.length > 0) {
      setSelectedImageIndex(index);
    }
  };

  // Handle initial generation
  const handleGenerate = () => {
    setShouldRemoveBackgroundOnly(false);
    setSelectedImageIndex(null);
    generateImages(false);
  };

  // Handle regeneration or background removal
  const handleRegenerate = () => {
    // If only removing backgrounds, don't generate new images
    if (shouldRemoveBackgroundOnly) {
      applyBackgroundRemovalToExistingImages();
      return;
    }

    // Otherwise follow the regular generation logic
    if (isPromptChanged) {
      // If prompt changed, generate all new images
      setSelectedImageIndex(null);
      generateImages(false);
    } else if (selectedImageIndex !== null) {
      // If image selected, generate based on that
      generateImages(true);
    }
  };

  // Handle image application to product
  const handleApply = async () => {
    if (selectedImageIndex === null) {
      alert("Please select an image first");
      return;
    }

    if (!selectedProduct) {
      alert("Please select a product first");
      return;
    }

    try {
      // Get the selected image
      const selectedImage = generatedImages[selectedImageIndex];

      // Compress for preview to avoid storage quota errors
      const compressedForPreview = await compressImageForPreview(selectedImage);

      // Clear any existing stored images
      sessionStorage.clear();
      localStorage.removeItem("selectedImages");

      // Store in both sessionStorage and localStorage to ensure compatibility with different components
      const imageData = JSON.stringify([compressedForPreview]);
      localStorage.setItem("selectedImages", imageData);
      sessionStorage.setItem("selectedImages", imageData);

      // Set the individual image for previews
      localStorage.setItem("imageForPreview", compressedForPreview);
      sessionStorage.setItem("imageForPreview", compressedForPreview);

      // Set required flags for navigation
      localStorage.setItem("createNewDesign", "false");
      sessionStorage.setItem("createNewDesign", "false");
      localStorage.setItem("activeNavLink", "products");
      sessionStorage.setItem("activeNavLink", "products");
      localStorage.setItem("selectedProduct", selectedProduct);
      sessionStorage.setItem("selectedProduct", selectedProduct);

      // Trigger storage event for components that listen to it
      window.dispatchEvent(new Event("storage"));

      // Navigate to preview
      router.push(
        `/designer_tool/products/previewProduct?product=${selectedProduct}`
      );
    } catch (error) {
      console.error("Error applying selected image:", error);
      alert(
        "Error storing the selected image. Please try again with a smaller image."
      );
    }
  };

  /**
   * Effects
   */
  // Track checkbox changes for background removal
  useEffect(() => {
    // If user turns on the checkbox after generating images, enable regenerate button
    if (
      !previousRemoveBackground.current &&
      removeBackground &&
      generatedImages.length > 0
    ) {
      setShouldRemoveBackgroundOnly(true);
    } else if (!removeBackground) {
      setShouldRemoveBackgroundOnly(false);
    }

    // Save the current state for future comparison
    previousRemoveBackground.current = removeBackground;
  }, [removeBackground, generatedImages]);

  // Track prompt changes
  useEffect(() => {
    // Check if prompt has changed from the original
    if (originalPrompt && prompt !== originalPrompt) {
      setIsPromptChanged(true);
    } else {
      setIsPromptChanged(false);
    }
  }, [prompt, originalPrompt]);

  // Load saved product on mount
  useEffect(() => {
    // Get the selected product from localStorage
    const storedProduct = localStorage.getItem("selectedProduct");
    if (storedProduct) {
      setSelectedProduct(storedProduct);
    }
  }, []);

  // Initialize DB and load saved images on mount
  useEffect(() => {
    const loadData = async () => {
      await initializeIndexedDB();

      const { images, lastPrompt } = await loadImagesFromIndexedDB();

      // Only set images if we have valid ones
      if (images.length > 0 && images.some((img) => img)) {
        setGeneratedImages(images as string[]);

        if (lastPrompt) {
          setPrompt(lastPrompt);
          setOriginalPrompt(lastPrompt);
        }

        console.log("Restored full-quality images from IndexedDB");
      }

      // Get the selected product from localStorage
      const storedProduct = localStorage.getItem("selectedProduct");
      if (storedProduct) {
        setSelectedProduct(storedProduct);
      }
    };

    loadData();
  }, []);

  // Determine if regenerate button should be enabled
  const isRegenerateEnabled =
    !isGenerating &&
    !isRemovingBackground &&
    (shouldRemoveBackgroundOnly ||
      isPromptChanged ||
      selectedImageIndex !== null);

  return (
    <div className="flex flex-col items-center max-h-[90vh] bg-white px-4 py-6 max-w-md mx-auto">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Text prompt</h1>
      </div>

      <div className="w-full bg-blue-50 rounded-3xl p-6 mb-6">
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Enter a detailed description of the image you want to create"
          className="w-full bg-transparent border-none resize-none outline-none text-blue-700 placeholder-blue-300 h-24"
          disabled={isGenerating || isRemovingBackground}
        />
        <div className="flex justify-end">
          <span className="text-blue-600 text-sm">{prompt.length}/1000</span>
        </div>
      </div>

      <div className="w-full flex items-center mb-4 px-2">
        <input
          type="checkbox"
          id="transparent-bg"
          checked={removeBackground}
          onChange={(e) => setRemoveBackground(e.target.checked)}
          disabled={isGenerating || isRemovingBackground}
          className="mr-2 h-4 w-4 rounded border-gray-300"
        />
        <label
          htmlFor="transparent-bg"
          className="text-sm text-gray-700 cursor-pointer select-none"
        >
          Generate images with transparent background (limited to 50 free
          images)
        </label>
      </div>

      {(isGenerating || isRemovingBackground) && (
        <div
          className="w-full bg-blue-50 rounded-3xl p-6 mb-4 flex items-center justify-center"
          style={{ height: "160px" }}
        >
          <div className="loading-spinner">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
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
          </div>
          <p className="ml-3 text-blue-600">
            {isRemovingBackground
              ? "Removing backgrounds from existing images..."
              : removeBackground
                ? "Generating images with transparent backgrounds..."
                : "Generating images..."}
          </p>
        </div>
      )}

      <div className="w-full mb-6">
        <h2 className="text-xl font-medium text-blue-600 mb-4">
          Generated Images
        </h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-0">
          {STYLE_NAMES.map((name, index) => (
            <div
              key={index}
              className={`cursor-pointer rounded-lg border-4 border-white shadow-[0px_5px_10px_rgba(0,0,0,0.1)] overflow-hidden w-[35vw] h-[35vw] mx-auto
                ${selectedImageIndex === index ? "ring-4 ring-blue-500" : ""}
                ${!generatedImages[index] ? "opacity-50" : ""}`}
              onClick={() => generatedImages[index] && handleStyleSelect(index)}
            >
              {generatedImages[index] ? (
                <div className="relative h-32 w-full bg-checkerboard">
                  <Image
                    src={generatedImages[index]}
                    alt={`Generated image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Image {index + 1}</span>
                </div>
              )}
              {/* <div className="p-2 text-center bg-white">
                <span className="text-blue-500">Variation {index + 1}</span>
              </div> */}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-between gap-4">
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full"
          onClick={handleRegenerate}
          disabled={!isRegenerateEnabled}
        >
          {shouldRemoveBackgroundOnly ? "Apply Transparent BG" : "Regenerate"}
        </Button>

        {generatedImages.length > 0 ? (
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-full"
            onClick={handleApply}
            disabled={
              isGenerating ||
              isRemovingBackground ||
              selectedImageIndex === null
            }
          >
            Apply
          </Button>
        ) : (
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full"
            onClick={handleGenerate}
            disabled={
              isGenerating || isRemovingBackground || prompt.trim().length === 0
            }
          >
            Generate
          </Button>
        )}
      </div>

      {/* CSS for transparent background visualization */}
      <style jsx global>{`
        .bg-checkerboard {
          background-image:
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position:
            0 0,
            0 10px,
            10px -10px,
            -10px 0px;
        }
      `}</style>
    </div>
  );
}
