"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { products } from "@/productOptions";
import DesignZone from "@/components/designZone";
import TextEditorToolbar from "@/components/textEditorToolbar";
import EditableText from "@/components/editableText";
import { useCallback } from "react";

interface PreviewProductProps {
  mode?: string;
}

export default function PreviewProduct({ mode }: PreviewProductProps) {
  // === Initialization and state ===
  const [isClient, setIsClient] = useState(false);

  // URL params and navigation
  const searchParams = useSearchParams();
  const [productId, setProductId] = useState<string | null>(null);
  const [view, setView] = useState<"front" | "back">("front");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Design zone states
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [showZones, setShowZones] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const activationInProgress = useRef(false);
  const activationRef = useRef(false);

  // Design states
  const [designImages, setDesignImages] = useState<
    Array<{
      url: string;
      position: { x: number; y: number };
      size: number;
      rotation: number;
      isSelected: boolean;
      zoneId: string;
    }>
  >([]);

  // Text design states
  const [designTexts, setDesignTexts] = useState<
    Array<{
      content: string;
      position: { x: number; y: number };
      size: number;
      rotation: number;
      fontFamily: string;
      color: string;
      isBold: boolean;
      alignment: "left" | "center" | "right";
      isSelected: boolean;
      zoneId: string;
    }>
  >([]);

  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState(0);
  const [initialRotation, setInitialRotation] = useState(0);

  // Text editing states
  const [isEditingText, setIsEditingText] = useState(false);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(
    null
  );

  // === CLIENT INITIALIZATION ===
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {

    // Listen for the custom deselection event
    const handleDeselectAll = () => {
      // Deselect all images by updating their isSelected property
      setDesignImages((prev) =>
        prev.map((img) => ({ ...img, isSelected: false }))
      );

      // Also deselect any text elements
      setDesignTexts((prev) =>
        prev.map((txt) => ({ ...txt, isSelected: false }))
      );

      // Hide text editing UI
      setShowTextToolbar(false);
      setIsEditingText(false);
    };

    window.addEventListener("design:deselectAll", handleDeselectAll);

    return () => {
      window.removeEventListener("design:deselectAll", handleDeselectAll);
    };
  }, []);

  // === TEXT HANDLING ===
  // Add new text element
  const handleAddText = useCallback(() => {
    if (!productId || !activeZoneId) return;

    const zone = products[productId].designZones[view].find(
      (z) => z.id === activeZoneId
    );
    if (!zone) return;

    // Check if we're already in the process of adding text
    if (activationInProgress.current) return;

    // Set flag to prevent duplicate additions
    activationInProgress.current = true;

    // Deselect all elements
    setDesignImages((prev) =>
      prev.map((img) => ({ ...img, isSelected: false }))
    );
    setDesignTexts((prev) =>
      prev.map((txt) => ({ ...txt, isSelected: false }))
    );

    // Create new text element
    const newText = {
      content: "Your text here",
      position: { x: 0, y: 0 },
      size: 24,
      rotation: 0,
      fontFamily: "Arial",
      color: "#000000",
      isBold: false,
      alignment: "center" as const,
      isSelected: true,
      zoneId: activeZoneId,
    };

    // Add text and set editing mode
    setDesignTexts((prev) => [...prev, newText]);
    setSelectedTextIndex(designTexts.length);
    setIsEditingText(true);
    setShowTextToolbar(true);

    // Reset flag after a short delay
    setTimeout(() => {
      activationInProgress.current = false;
    }, 100);
  }, [productId, activeZoneId, view, designTexts.length]);

  const handleSelectText = (index: number) => {
    // Deselect all images
    setDesignImages((prev) =>
      prev.map((img) => ({ ...img, isSelected: false }))
    );

    // Select the text and its zone
    const selectedText = designTexts[index];
    setActiveZoneId(selectedText.zoneId);
    setSelectedTextIndex(index);

    setDesignTexts((prev) =>
      prev.map((text, i) => ({
        ...text,
        isSelected: i === index,
      }))
    );

    setShowTextToolbar(true);
    setIsEditingText(true);
  };

  // === TEXT EDITOR ACTIVATION ===
  useEffect(() => {
    if (!isClient) return;

    // Function to activate text editing components
    const handleTextEditorActivation = (
      event: CustomEvent<{ source: string }>
    ) => {
      console.log("Text editor activation received", event.detail);

      // Prevent multiple activations
      if (activationRef.current) return;
      activationRef.current = true;

      // Set timeout to reset activation flag for future activations
      setTimeout(() => {
        if (designTexts.length === 0) {
          // No text elements yet, create one
          handleAddText();
        } else {
          // Text elements exist, select the first one
          handleSelectText(0);
        }

        // Show text toolbar
        setShowTextEditor(true);
        setShowTextToolbar(true);
        setIsEditingText(true);
      }, 0);
    };

    // Handle refresh events specifically for repeated activations
    const handleRefresh = () => {
      // Reset activation state for explicit refreshes only
      activationRef.current = true;
      setShowTextEditor(true);
      handleAddText();
    };

    // Listen for both event types
    window.addEventListener(
      "activateTextEditor",
      handleTextEditorActivation as EventListener
    );
    window.addEventListener("refreshTextEditor", handleRefresh);

    // Only check these conditions once on initial mount, not on every render
    const checkActivation = () => {
      if (activationRef.current) return;

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("activateText") === "true") {
        console.log("Activating text editor from URL parameter");
        handleTextEditorActivation(
          new CustomEvent("activateTextEditor", { detail: { source: "url" } })
        );
        return;
      }

      const redirectFlag = localStorage.getItem("redirectToTextEditor");
      if (redirectFlag === "true") {
        console.log("Activating text editor from localStorage flag");
        localStorage.removeItem("redirectToTextEditor"); // Clear the flag
        handleTextEditorActivation(new CustomEvent("activateTextEditor", { detail: { source: 'storage' } }));
        return;
      }

      const activeNavLink = localStorage.getItem("activeNavLink");
      if (activeNavLink === "text") {
        handleTextEditorActivation(
          new CustomEvent("activateTextEditor", {
            detail: { source: "navActive" },
          })
        );
      }
    };

    // Run the check once
    checkActivation();

    // Clean up event listeners
    return () => {
      window.removeEventListener(
        "activateTextEditor",
        handleTextEditorActivation as EventListener
      );
      window.removeEventListener("refreshTextEditor", handleRefresh);
    };
  }, [isClient, productId, activeZoneId, handleAddText, designTexts]);

  // === DESIGN LOADING & INITIALIZATION ===
  useEffect(() => {
    if (!isClient) return;

    const id = searchParams.get("product");
    if (!id) return;

    setProductId(id);
    const designStorageKey = `design_${id}`;
    const textStorageKey = `textDesign_${id}`;
    const imageParam = searchParams.get("image");
    const zoneParam = searchParams.get("zoneId");

    // Set active zone from URL or use default
    if (
      zoneParam &&
      products[id]?.designZones?.[view]?.some((z) => z.id === zoneParam)
    ) {
      setActiveZoneId(zoneParam);
    } else if (products[id]?.designZones?.[view]?.[0]) {
      setActiveZoneId(products[id].designZones[view][0].id);
    }

    // Load existing design if available
    let currentDesign: any[] = [];
    try {
      const savedDesign = localStorage.getItem(designStorageKey);
      if (savedDesign) {
        const parsedDesign = JSON.parse(savedDesign);
        if (Array.isArray(parsedDesign) && parsedDesign.length > 0) {
          currentDesign = parsedDesign;
          setDesignImages(
            parsedDesign.map((img) => ({
              ...img,
              isSelected: false,
              zoneId: img.zoneId || products[id].designZones[view][0].id,
            }))
          );
        }
      }
    } catch (e) {
      console.error("Error loading design:", e);
    }

    // Load existing text design if available
    try {
      const savedTextDesign = localStorage.getItem(textStorageKey);
      if (savedTextDesign) {
        const parsedTextDesign = JSON.parse(savedTextDesign);
        if (Array.isArray(parsedTextDesign) && parsedTextDesign.length > 0) {
          setDesignTexts(
            parsedTextDesign.map((text) => ({
              ...text,
              isSelected: false,
            }))
          );
        }
      }
    } catch (e) {
      console.error("Error loading text design:", e);
    }

    // Handle new images from RecentUploads
    try {
      const storedImages = localStorage.getItem("selectedImages");
      const createNewDesign =
        localStorage.getItem("createNewDesign") === "true";

      if (storedImages) {
        const parsedImages = JSON.parse(storedImages);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          // Use active zone ID or default to first zone
          const targetZoneId =
            activeZoneId || products[id].designZones[view][0].id;

          // Create new image objects with the target zone ID
          const newImageObjects = parsedImages.map((url, index) => ({
            url,
            position: { x: 0, y: 0 },
            size: 100,
            rotation: 0,
            isSelected: index === 0,
            zoneId: targetZoneId,
          }));

          if (createNewDesign) {
            setDesignImages(newImageObjects);
            localStorage.setItem(
              designStorageKey,
              JSON.stringify(newImageObjects)
            );
          } else {
            // Add to existing design without duplicates
            const existingUrls = currentDesign.map((img) => img.url);
            const filteredNewImages = newImageObjects.filter(
              (img) => !existingUrls.includes(img.url)
            );

            const updatedDesign = [
              ...currentDesign.map((img) => ({ ...img, isSelected: false })),
              ...filteredNewImages,
            ];

            setDesignImages(updatedDesign);
            localStorage.setItem(
              designStorageKey,
              JSON.stringify(updatedDesign)
            );
          }

          if (imageParam) setImageUrl(imageParam);
        }

        // Clear localStorage after processing
        localStorage.removeItem("selectedImages");
        localStorage.removeItem("createNewDesign");
      } else if (imageParam && currentDesign.length === 0) {
        const targetZoneId =
          zoneParam || activeZoneId || products[id].designZones[view][0].id;

        const newDesign = [
          {
            url: imageParam,
            position: { x: 0, y: 0 },
            size: 100,
            rotation: 0,
            isSelected: true,
            zoneId: targetZoneId,
          },
        ];

        setImageUrl(imageParam);
        setDesignImages(newDesign);
        localStorage.setItem(designStorageKey, JSON.stringify(newDesign));
      }
    } catch (e) {
      console.error("Error processing images:", e);
    }
  }, [searchParams, view, isClient, activeZoneId]);

  // === SAVE DESIGNS ===
  // Save image designs
  useEffect(() => {
    if (!isClient || !productId) return;

    if (designImages.length > 0) {
      localStorage.setItem(`design_${productId}`, JSON.stringify(designImages));
    }
  }, [designImages, productId, isClient]);

  // Save text designs
  useEffect(() => {
    if (!isClient || !productId) return;

    if (designTexts.length > 0) {
      localStorage.setItem(
        `textDesign_${productId}`,
        JSON.stringify(designTexts)
      );
    } else {
      localStorage.removeItem(`textDesign_${productId}`);
    }
  }, [designTexts, productId, isClient]);

  // === POSITION CONSTRAINTS ===
  const constrainPositionToZone = (
    position: { x: number; y: number },
    zoneId: string,
    elementSize: number
  ) => {
    if (!productId) return position;

    const zone = products[productId].designZones[view].find(
      (z) => z.id === zoneId
    );
    if (!zone) return position;

    // Calculate effective size including padding
    const padding = 4;
    const effectiveSize = elementSize + padding * 2;

    // Calculate max offsets from center to keep element inside zone
    const maxX = (zone.width - effectiveSize) / 2;
    const maxY = (zone.height - effectiveSize) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, position.x)),
      y: Math.max(-maxY, Math.min(maxY, position.y)),
    };
  };

  // === TOUCH EVENT HANDLING ===
  useEffect(() => {
    if (!isClient) return;

    const containerElement = containerRef.current;
    if (!containerElement) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging && !isResizing && !isRotating) return;

      e.preventDefault();
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];

      // Check if we're manipulating an image
      const selectedImageIndex = designImages.findIndex(
        (img) => img.isSelected
      );
      if (selectedImageIndex >= 0) {
        const selectedImage = designImages[selectedImageIndex];

        if (isDragging) {
          const newPosition = {
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
          };

          // Constrain position to zone
          const constrainedPosition = constrainPositionToZone(
            newPosition,
            selectedImage.zoneId,
            selectedImage.size
          );

          setDesignImages((prev) =>
            prev.map((img, i) =>
              i === selectedImageIndex
                ? { ...img, position: constrainedPosition }
                : img
            )
          );
        } else if (isResizing) {
          // Get zone for constraints
          const zone = productId
            ? products[productId].designZones[view].find(
              (z) => z.id === selectedImage.zoneId
            )
            : null;

          // Calculate max size based on zone
          let maxSize = 500;
          if (zone) {
            maxSize = Math.min(zone.width, zone.height) - 8;
          }

          // Calculate new size with constraints
          const newSize = Math.min(
            maxSize,
            Math.max(50, initialSize + (touch.clientX - dragStart.x))
          );

          setDesignImages((prev) =>
            prev.map((img, i) =>
              i === selectedImageIndex ? { ...img, size: newSize } : img
            )
          );

          // Re-constrain position after resize
          const constrainedPosition = constrainPositionToZone(
            selectedImage.position,
            selectedImage.zoneId,
            newSize
          );

          if (
            constrainedPosition.x !== selectedImage.position.x ||
            constrainedPosition.y !== selectedImage.position.y
          ) {
            setDesignImages((prev) =>
              prev.map((img, i) =>
                i === selectedImageIndex
                  ? { ...img, position: constrainedPosition }
                  : img
              )
            );
          }
        } else if (isRotating && imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const angle = Math.atan2(
            touch.clientY - centerY,
            touch.clientX - centerX
          );
          const newRotation = initialRotation + angle * (180 / Math.PI);

          setDesignImages((prev) =>
            prev.map((img, i) =>
              i === selectedImageIndex ? { ...img, rotation: newRotation } : img
            )
          );
        }
      }
      // Check if we're manipulating a text element
      else {
        const selectedTextIndex = designTexts.findIndex(
          (txt) => txt.isSelected
        );
        if (selectedTextIndex >= 0) {
          const selectedText = designTexts[selectedTextIndex];

          if (isDragging) {
            const newPosition = {
              x: touch.clientX - dragStart.x,
              y: touch.clientY - dragStart.y,
            };

            // Constrain position to zone
            const constrainedPosition = constrainPositionToZone(
              newPosition,
              selectedText.zoneId,
              selectedText.size * 2
            );

            setDesignTexts((prev) =>
              prev.map((txt, i) =>
                i === selectedTextIndex
                  ? { ...txt, position: constrainedPosition }
                  : txt
              )
            );
          } else if (isResizing) {
            // Calculate new size with constraints
            const newSize = Math.min(
              72, // Max font size
              Math.max(12, initialSize + (touch.clientX - dragStart.x) / 4)
            );

            setDesignTexts((prev) =>
              prev.map((txt, i) =>
                i === selectedTextIndex ? { ...txt, size: newSize } : txt
              )
            );
          } else if (isRotating) {
            const textElement = document.getElementById(
              `design-text-${selectedTextIndex}`
            );
            if (textElement) {
              const rect = textElement.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const angle = Math.atan2(
                touch.clientY - centerY,
                touch.clientX - centerX
              );
              const newRotation = initialRotation + angle * (180 / Math.PI);

              setDesignTexts((prev) =>
                prev.map((txt, i) =>
                  i === selectedTextIndex
                    ? { ...txt, rotation: newRotation }
                    : txt
                )
              );
            }
          }
        }
      }
    };

    containerElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    if (isDragging || isResizing || isRotating) {
      document.body.classList.add("dragging");
    } else {
      document.body.classList.remove("dragging");
    }

    return () => {
      containerElement.removeEventListener("touchmove", handleTouchMove);
      document.body.classList.remove("dragging");
    };
  }, [
    isDragging,
    isResizing,
    isRotating,
    dragStart,
    initialSize,
    initialRotation,
    designImages,
    designTexts,
    isClient,
    productId,
    view,
  ]);

  // === CLICK OUTSIDE HANDLER ===
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current?.contains(event.target as Node) &&
        !isDragging &&
        !isResizing &&
        !isRotating
      ) {
        const clickedOnImage = designImages.some((_, index) => {
          const imageElement = document.getElementById(`design-image-${index}`);
          return imageElement?.contains(event.target as Node);
        });

        const clickedOnText = designTexts.some((_, index) => {
          const textElement = document.getElementById(`design-text-${index}`);
          return textElement?.contains(event.target as Node);
        });

        if (!clickedOnImage && !clickedOnText) {
          setDesignImages((prev) =>
            prev.map((img) => ({ ...img, isSelected: false }))
          );
          setDesignTexts((prev) =>
            prev.map((txt) => ({ ...txt, isSelected: false }))
          );
          setShowTextToolbar(false);
          setIsEditingText(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDragging, isResizing, isRotating, designImages, designTexts, isClient]);

  // === UI CONTROL FUNCTIONS ===
  // Toggle function to show/hide design zones
  const toggleShowZones = () => setShowZones((prev) => !prev);

  // Zone selection handler
  const handleZoneSelect = (zoneId: string) => {
    setActiveZoneId(zoneId);
  };

  // Get default zone ID for a product view
  const getDefaultZoneId = (
    prodId: string,
    currentView: "front" | "back" = "front"
  ): string | null => {
    if (!prodId || !products[prodId]) return null;
    return products[prodId].designZones[currentView]?.[0]?.id || null;
  };

  // === EVENT HANDLERS ===
  // Image selection handler
  const handleSelectImage = (index: number) => {
    // Deselect all texts
    setDesignTexts((prev) =>
      prev.map((text) => ({ ...text, isSelected: false }))
    );
    setShowTextToolbar(false);
    setIsEditingText(false);

    const selectedImage = designImages[index];
    setActiveZoneId(selectedImage.zoneId);

    setDesignImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isSelected: i === index,
      }))
    );
  };

  // Mouse/touch event handlers
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    handleSelectImage(index);
    setIsDragging(true);
    const currentImage = designImages[index];
    setDragStart({
      x: e.clientX - currentImage.position.x,
      y: e.clientY - currentImage.position.y,
    });
  };

  const handleTextMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    handleSelectText(index);
    setIsDragging(true);
    const currentText = designTexts[index];
    setDragStart({
      x: e.clientX - currentText.position.x,
      y: e.clientY - currentText.position.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    handleSelectImage(index);
    if (e.touches.length === 1) {
      setIsDragging(true);
      const currentImage = designImages[index];
      setDragStart({
        x: e.touches[0].clientX - currentImage.position.x,
        y: e.touches[0].clientY - currentImage.position.y,
      });
    }
  };

  const handleTextTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    handleSelectText(index);
    if (e.touches.length === 1) {
      setIsDragging(true);
      const currentText = designTexts[index];
      setDragStart({
        x: e.touches[0].clientX - currentText.position.x,
        y: e.touches[0].clientY - currentText.position.y,
      });
    }
  };

  // Element manipulation handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    // Check if we're working with a text or an image
    const selectedImageIndex = designImages.findIndex((img) => img.isSelected);
    const selectedTextIdx = designTexts.findIndex((txt) => txt.isSelected);

    if (selectedImageIndex >= 0) {
      const selectedImage = designImages[selectedImageIndex];

      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };

        // Constrain position to zone
        const constrainedPosition = constrainPositionToZone(
          newPosition,
          selectedImage.zoneId,
          selectedImage.size
        );

        setDesignImages((prev) =>
          prev.map((img, i) =>
            i === selectedImageIndex
              ? { ...img, position: constrainedPosition }
              : img
          )
        );
      } else if (isResizing) {
        // Get zone for constraints
        const zone = productId
          ? products[productId].designZones[view].find(
            (z) => z.id === selectedImage.zoneId
          )
          : null;

        // Calculate max size based on zone
        let maxSize = 500; // Default max size
        if (zone) {
          maxSize = Math.min(zone.width, zone.height) - 8;
        }

        // Calculate new size with constraints
        const newSize = Math.min(
          maxSize,
          Math.max(50, initialSize + (e.clientX - dragStart.x))
        );

        setDesignImages((prev) =>
          prev.map((img, i) =>
            i === selectedImageIndex ? { ...img, size: newSize } : img
          )
        );

        // Re-constrain position after resize
        const constrainedPosition = constrainPositionToZone(
          selectedImage.position,
          selectedImage.zoneId,
          newSize
        );

        if (
          constrainedPosition.x !== selectedImage.position.x ||
          constrainedPosition.y !== selectedImage.position.y
        ) {
          setDesignImages((prev) =>
            prev.map((img, i) =>
              i === selectedImageIndex
                ? { ...img, position: constrainedPosition }
                : img
            )
          );
        }
      } else if (isRotating && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        setDesignImages((prev) =>
          prev.map((img, i) =>
            i === selectedImageIndex
              ? { ...img, rotation: initialRotation + angle * (180 / Math.PI) }
              : img
          )
        );
      }
    } else if (selectedTextIdx >= 0) {
      const selectedText = designTexts[selectedTextIdx];

      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };

        // Constrain position to zone
        const constrainedPosition = constrainPositionToZone(
          newPosition,
          selectedText.zoneId,
          selectedText.size * 2
        );

        setDesignTexts((prev) =>
          prev.map((txt, i) =>
            i === selectedTextIdx
              ? { ...txt, position: constrainedPosition }
              : txt
          )
        );
      } else if (isResizing) {
        // Calculate new size with constraints
        const newSize = Math.min(
          72,
          Math.max(12, initialSize + (e.clientX - dragStart.x) / 4)
        );

        setDesignTexts((prev) =>
          prev.map((txt, i) =>
            i === selectedTextIdx ? { ...txt, size: newSize } : txt
          )
        );
      } else if (isRotating) {
        const textElement = document.getElementById(
          `design-text-${selectedTextIdx}`
        );
        if (textElement) {
          const rect = textElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          const newRotation = initialRotation + angle * (180 / Math.PI);

          setDesignTexts((prev) =>
            prev.map((txt, i) =>
              i === selectedTextIdx ? { ...txt, rotation: newRotation } : txt
            )
          );
        }
      }
    }
  };

  // === CONTROL HANDLERS ===
  // Image control handlers
  const handleResizeStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSize(designImages[index].size);
  };

  const handleRotateStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setIsRotating(true);
    setInitialRotation(designImages[index].rotation);
    const imageElement = document.getElementById(`design-image-${index}`);
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setDragStart({ x: e.clientX - centerX, y: e.clientY - centerY });
    }
  };

  // Touch control handlers
  const handleResizeTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      setIsResizing(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialSize(designImages[index].size);
    }
  };



  const handleRotateTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      setIsRotating(true);
      setInitialRotation(designImages[index].rotation);
      const imageElement = document.getElementById(`design-image-${index}`);
      if (imageElement) {
        const rect = imageElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setDragStart({
          x: e.touches[0].clientX - centerX,
          y: e.touches[0].clientY - centerY,
        });
      }
    }
  };



  // === ELEMENT OPERATIONS ===
  // Remove image
  const handleRemoveImage = (index: number) => {
    // Remove the image from the designImages array
    setDesignImages((prev) => {
      const updatedImages = prev.filter((_, i) => i !== index);

      // Immediately update localStorage to ensure the change is saved
      if (productId) {
        const designStorageKey = `design_${productId}`;

        if (updatedImages.length > 0) {
          // If there are still images, save the updated design
          localStorage.setItem(designStorageKey, JSON.stringify(updatedImages));
        } else {
          // If all images are removed, clear the design from localStorage
          localStorage.removeItem(designStorageKey);
          setImageUrl(null);
        }
      }

      return updatedImages;
    });
  };

  // === Text edition ===
  const handleTextChange = (content: string) => {
    setDesignTexts((prev) =>
      prev.map((text) => (text.isSelected ? { ...text, content } : text))
    );
  };

  const handleFontChange = (fontFamily: string) => {
    setDesignTexts((prev) =>
      prev.map((text) => (text.isSelected ? { ...text, fontFamily } : text))
    );
  };

  const handleColorChange = (color: string) => {
    setDesignTexts((prev) =>
      prev.map((text) => (text.isSelected ? { ...text, color } : text))
    );
  };

  const handleSizeChange = (size: number) => {
    setDesignTexts((prev) =>
      prev.map((text) => (text.isSelected ? { ...text, size } : text))
    );
  };

  const toggleBold = () => {
    setDesignTexts((prev) =>
      prev.map((text) =>
        text.isSelected ? { ...text, isBold: !text.isBold } : text
      )
    );
  };

  const changeAlignment = (alignment: "left" | "center" | "right") => {
    setDesignTexts((prev) =>
      prev.map((text) => {
        if (!text.isSelected) return text;
        return { ...text, alignment };
      })
    );
  };

  const handleDeleteText = (index: number) => {
    setDesignTexts((prev) => prev.filter((_, i) => i !== index));
    setIsEditingText(false);
    setShowTextToolbar(false);
  };

  // Reset interaction states
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  };

  // Toggle product view
  const toggleView = () => {
    const newView = view === "front" ? "back" : "front";
    setView(newView);

    // Update active zone to first zone of new view if product exists
    if (productId && products[productId]?.designZones?.[newView]?.[0]) {
      setActiveZoneId(products[productId].designZones[newView][0].id);
    }
  };

  // apply color chosen
  useEffect(() => {
    if (!isClient) return;

    // Initial color check
    const applyStoredColor = () => {
      const appliedColor = localStorage.getItem('appliedProductColor');

      // Find the product container
      const productContainer = containerRef.current?.querySelector('.relative.w-full.h-\\[60vh\\]');

      if (productContainer) {
        // Check if we already have a color overlay
        let colorOverlay = productContainer.querySelector('.product-color-overlay');

        // If no overlay exists yet, create one
        if (!colorOverlay) {
          colorOverlay = document.createElement('div');
          colorOverlay.className = 'product-color-overlay absolute inset-0';

          // Insert before the image so it's behind it
          productContainer.insertBefore(colorOverlay, productContainer.firstChild);
        }

        // Set the color and positioning to match ProductColorPreview
        (colorOverlay as HTMLElement).style.backgroundColor = appliedColor || 'transparent';
        (colorOverlay as HTMLElement).style.height = '75%';
        (colorOverlay as HTMLElement).style.width = '65%';
        (colorOverlay as HTMLElement).style.top = '12%';
        (colorOverlay as HTMLElement).style.left = '18%';
        (colorOverlay as HTMLElement).style.position = 'absolute';
        (colorOverlay as HTMLElement).style.zIndex = '0';
      }
    };
    // Apply color immediately
    applyStoredColor();

    // Set up event listener for color changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appliedProductColor') {
        applyStoredColor();
      }
    };

    // Create a custom event listener for immediate updates within the app
    const handleColorUpdate = () => {
      applyStoredColor();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('productColorChanged', handleColorUpdate);

    // Set up polling as a fallback mechanism
    const intervalId = setInterval(applyStoredColor, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('productColorChanged', handleColorUpdate);
      clearInterval(intervalId);
    };
  }, [isClient]);
  // === RENDER ===
  // For hydration safety
  if (!isClient) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[50vh] h-[60vh] m-[4vw]"></div>
      </div>
    );
  }

  const product = productId ? products[productId] : null;
  if (!product) return <div>Product not found</div>;

  // Get available zones for current view
  const currentZones = product.designZones[view] || [];

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative w-[50vh] h-[60vh] m-[4vw]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {/* Product background */}
        <div className="relative w-full h-[60vh]  mt-[2vh] flex items-center justify-center">
          <img
            src={product.images[view]}
            alt={`${product.name} ${view} product`}
            className="max-w-full max-h-full object-contain"
            style={{ opacity: 0.99 }}
          />
        </div>

        {/* Design zones with their contained images and text */}
        {currentZones.map((zone) => (
          <DesignZone
            key={zone.id}
            zone={zone}
            isActive={zone.id === activeZoneId}
            showBorder={showZones || zone.id === activeZoneId}
          >
            {/* Images in this zone */}
            {designImages
              .filter((image) => image.zoneId === zone.id)
              .map((image, zoneIndex) => {
                // Find global index for this image
                const globalIndex = designImages.findIndex(
                  (img) => img.url === image.url && img.zoneId === zone.id
                );

                return (
                  <div
                    id={`design-image-${globalIndex}`}
                    key={`${image.url}-${globalIndex}`}
                    ref={image.isSelected ? imageRef : null}
                    className="absolute"
                    style={{
                      left: `50%`,
                      top: `50%`,
                      transform: `translate(-50%, -50%) translate(${image.position.x}px, ${image.position.y}px) rotate(${image.rotation}deg)`,
                      width: `${image.size}px`,
                      height: "auto",
                      zIndex: image.isSelected ? 20 : 10,
                      border: image.isSelected ? "2px dashed #2563eb" : "none",
                      padding: "3px",
                      borderRadius: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectImage(globalIndex);
                    }}
                  >
                    <div
                      className="relative w-full h-full"
                      onMouseDown={(e) => handleMouseDown(e, globalIndex)}
                      onTouchStart={(e) => handleTouchStart(e, globalIndex)}
                      style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    >
                      <img
                        src={image.url}
                        alt={`Design ${globalIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        draggable="false"
                      />

                      {/* Control handles for selected image */}
                      {image.isSelected && (
                        <>
                          {/* Resize handle */}
                          <div
                            className="absolute w-6 h-6 bg-blue-500 rounded-full right-0 bottom-0 cursor-se-resize transform translate-x-1/2 translate-y-1/2  flex items-center justify-center"
                            onMouseDown={(e) =>
                              handleResizeStart(e, globalIndex)
                            }
                            onTouchStart={(e) =>
                              handleResizeTouchStart(e, globalIndex)
                            }
                          >
                            <span className="text-white text-xs font-bold transform rotate-45">
                              ↔
                            </span>
                          </div>

                          {/* Rotate handle */}
                          <div
                            className="absolute w-6 h-6 bg-green-500 rounded-full top-0 left-0 cursor-move transform -translate-x-1/2 -translate-y-4   flex items-center justify-center"
                            onMouseDown={(e) =>
                              handleRotateStart(e, globalIndex)
                            }
                            onTouchStart={(e) =>
                              handleRotateTouchStart(e, globalIndex)
                            }
                          >
                            <span className="text-white text-xs">↻</span>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveImage(globalIndex)}
                            className="absolute top-0 right-0 w-7 h-7  text-white flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                            title="Remove image"
                          >
                            <img
                              src="/icons/closeImage.svg"
                              alt="Close"
                              width="30"
                              height="30"
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Text elements in this zone */}
            {designTexts
              .filter((text) => text.zoneId === zone.id)
              .map((text, zoneIndex) => {
                // Find global index for this text
                const globalIndex = designTexts.findIndex((t) => t === text);

                return (
                  <div
                    id={`design-text-${globalIndex}`}
                    key={`text-${globalIndex}`}
                    className="absolute"
                    style={{
                      left: `50%`,
                      top: `50%`,
                      transform: `translate(-50%, -50%) translate(${text.position.x}px, ${text.position.y}px) rotate(${text.rotation}deg)`,
                      zIndex: text.isSelected ? 20 : 10,
                      padding: "3px",
                      borderRadius: "4px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectText(globalIndex);
                    }}
                    onMouseDown={(e) => handleTextMouseDown(e, globalIndex)}
                    onTouchStart={(e) => handleTextTouchStart(e, globalIndex)}
                  >
                    <EditableText
                      text={text}
                      isEditing={isEditingText && text.isSelected}
                      onChange={handleTextChange}
                      onDelete={() => handleDeleteText(globalIndex)}
                      onResize={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                        setDragStart({ x: e.clientX, y: e.clientY });
                        setInitialSize(text.size);
                      }}
                      onResizeTouchStart={(e) => {
                        e.stopPropagation();
                        if (e.touches.length === 1) {
                          setIsResizing(true);
                          setDragStart({
                            x: e.touches[0].clientX,
                            y: e.touches[0].clientY,
                          });
                          setInitialSize(text.size);
                        }
                      }}
                    />
                  </div>
                );
              })}
          </DesignZone>
        ))}
      </div>

      {/* Zone selection UI */}
      {currentZones.length > 1 && (
        <div className="flex space-x-2 mb-4 flex-wrap justify-center">
          {currentZones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleZoneSelect(zone.id)}
              className={`px-3 py-1 m-1 text-sm rounded ${zone.id === activeZoneId
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
                }`}
            >
              {zone.name}
            </button>
          ))}
          <button
            onClick={toggleShowZones}
            className="px-3 py-1 m-1 text-sm rounded bg-gray-200 text-gray-800"
          >
            {showZones ? "Hide Zones" : "Show Zones"}
          </button>
        </div>
      )}

      {/* Text Editor Toolbar */}
      <TextEditorToolbar
        isVisible={showTextToolbar}
        selectedText={
          selectedTextIndex !== null
            ? designTexts[selectedTextIndex]
            : designTexts.find((text) => text.isSelected) || null
        }
        onFontChange={handleFontChange}
        onColorChange={handleColorChange}
        onSizeChange={handleSizeChange}
        onToggleBold={toggleBold}
        onAlignmentChange={changeAlignment}
      />

      {/* View toggle */}
      <div className="flex justify-between space-x-20 mb-16">
        <button onClick={toggleView} className="flex justify-center w-12 h-12">
          <img src="/icons/arrow_left.svg" alt="Previous" className="w-4 h-4" />
        </button>
        <button onClick={toggleView} className="flex justify-center w-12 h-12">
          <img src="/icons/arrow_right.svg" alt="Next" className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile styling */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body.dragging {
            overflow: hidden;
            touch-action: none;
          }
        }
      `}</style>
    </div>
  );
}
