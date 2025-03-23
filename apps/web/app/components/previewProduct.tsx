"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/productOptions";
import DesignZone from "./designZone";

const PreviewProduct: React.FC = () => {
    // Client-side detection for hydration
    const [isClient, setIsClient] = useState(false);

    // URL params and state
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);
    const [view, setView] = useState<'front' | 'back'>('front');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Design zones state
    const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
    const [showZones, setShowZones] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    // Design state
    const [designImages, setDesignImages] = useState<Array<{
        url: string;
        position: { x: number, y: number };
        size: number;
        rotation: number;
        isSelected: boolean;
        zoneId: string; // Track which zone this image belongs to
    }>>([]);

    // Interaction states
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState(0);
    const [initialRotation, setInitialRotation] = useState(0);

    // Set isClient true after mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load and initialize design
    useEffect(() => {
        if (!isClient) return;

        const id = searchParams.get("product");
        if (!id) return;

        setProductId(id);
        const designStorageKey = `design_${id}`;
        const imageParam = searchParams.get("image");
        const zoneParam = searchParams.get("zoneId");

        // Set active zone from URL or use default
        if (zoneParam && products[id]?.designZones?.[view]?.some(z => z.id === zoneParam)) {
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
                    setDesignImages(parsedDesign.map(img => ({
                        ...img,
                        isSelected: false,
                        zoneId: img.zoneId || products[id].designZones[view][0].id
                    })));
                }
            }
        } catch (e) {
            console.error("Error loading design:", e);
        }

        // Handle new images from RecentUploads
        try {
            const storedImages = localStorage.getItem("selectedImages");
            const createNewDesign = localStorage.getItem("createNewDesign") === "true";

            if (storedImages) {
                const parsedImages = JSON.parse(storedImages);
                if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                    // Use active zone ID or default to first zone
                    const targetZoneId = activeZoneId || products[id].designZones[view][0].id;

                    // Create new image objects with the target zone ID
                    const newImageObjects = parsedImages.map((url, index) => ({
                        url,
                        position: { x: 0, y: 0 },
                        size: 100,
                        rotation: 0,
                        isSelected: index === 0,
                        zoneId: targetZoneId
                    }));

                    if (createNewDesign) {
                        setDesignImages(newImageObjects);
                        localStorage.setItem(designStorageKey, JSON.stringify(newImageObjects));
                    } else {
                        // Add to existing design without duplicates
                        const existingUrls = currentDesign.map(img => img.url);
                        const filteredNewImages = newImageObjects.filter(
                            img => !existingUrls.includes(img.url)
                        );

                        const updatedDesign = [
                            ...currentDesign.map(img => ({ ...img, isSelected: false })),
                            ...filteredNewImages
                        ];

                        setDesignImages(updatedDesign);
                        localStorage.setItem(designStorageKey, JSON.stringify(updatedDesign));
                    }

                    if (imageParam) setImageUrl(imageParam);
                }

                // Clear localStorage after processing
                localStorage.removeItem("selectedImages");
                localStorage.removeItem("createNewDesign");
            } else if (imageParam && currentDesign.length === 0) {
                const targetZoneId = zoneParam || activeZoneId || products[id].designZones[view][0].id;

                const newDesign = [{
                    url: imageParam,
                    position: { x: 0, y: 0 }, // Center in zone
                    size: 100,
                    rotation: 0,
                    isSelected: true,
                    zoneId: targetZoneId
                }];

                setImageUrl(imageParam);
                setDesignImages(newDesign);
                localStorage.setItem(designStorageKey, JSON.stringify(newDesign));
            }
        } catch (e) {
            console.error("Error processing images:", e);
        }
    }, [searchParams, view, isClient, activeZoneId]);

    // Save design changes
    useEffect(() => {
        if (!isClient) return;

        if (productId && designImages.length > 0) {
            localStorage.setItem(`design_${productId}`, JSON.stringify(designImages));
        }
    }, [designImages, productId, isClient]);

    // Function to keep positions within zone boundaries
    const constrainPositionToZone = (position: { x: number, y: number }, zoneId: string, imageSize: number) => {
        if (!productId) return position;

        const zone = products[productId].designZones[view].find(z => z.id === zoneId);
        if (!zone) return position;

        // Calculate effective size including padding
        const padding = 4;
        const effectiveSize = imageSize + padding * 2;

        // Calculate max offsets from center to keep image inside zone
        const maxX = (zone.width - effectiveSize) / 2;
        const maxY = (zone.height - effectiveSize) / 2;

        return {
            x: Math.max(-maxX, Math.min(maxX, position.x)),
            y: Math.max(-maxY, Math.min(maxY, position.y))
        };
    };

    // Handle touch events for dragging, rotating, resizing
    useEffect(() => {
        if (!isClient) return;

        const containerElement = containerRef.current;
        if (!containerElement) return;

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging && !isResizing && !isRotating) return;

            e.preventDefault();
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const selectedIndex = designImages.findIndex(img => img.isSelected);
            if (selectedIndex < 0) return;

            const selectedImage = designImages[selectedIndex];

            if (isDragging) {
                const newPosition = {
                    x: touch.clientX - dragStart.x,
                    y: touch.clientY - dragStart.y
                };

                // Constrain position to zone
                const constrainedPosition = constrainPositionToZone(
                    newPosition,
                    selectedImage.zoneId,
                    selectedImage.size
                );

                setDesignImages(prev => prev.map((img, i) =>
                    i === selectedIndex
                        ? { ...img, position: constrainedPosition }
                        : img
                ));
            } else if (isResizing) {
                // Get zone for constraints
                const zone = productId ?
                    products[productId].designZones[view].find(z => z.id === selectedImage.zoneId) : null;

                // Calculate max size based on zone
                let maxSize = 500; // Default max size
                if (zone) {
                    maxSize = Math.min(zone.width, zone.height) - 8; // Fixed: properly update maxSize
                }

                // Calculate new size with constraints
                const newSize = Math.min(
                    maxSize,
                    Math.max(50, initialSize + (touch.clientX - dragStart.x))
                );

                setDesignImages(prev => prev.map((img, i) =>
                    i === selectedIndex ? { ...img, size: newSize } : img
                ));

                // Re-constrain position after resize
                const constrainedPosition = constrainPositionToZone(
                    selectedImage.position,
                    selectedImage.zoneId,
                    newSize
                );

                if (constrainedPosition.x !== selectedImage.position.x ||
                    constrainedPosition.y !== selectedImage.position.y) {
                    setDesignImages(prev => prev.map((img, i) =>
                        i === selectedIndex ? { ...img, position: constrainedPosition } : img
                    ));
                }
            } else if (isRotating && imageRef.current) {
                const rect = imageRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
                const newRotation = initialRotation + angle * (180 / Math.PI);

                setDesignImages(prev => prev.map((img, i) =>
                    i === selectedIndex ? { ...img, rotation: newRotation } : img
                ));
            }
        };

        containerElement.addEventListener('touchmove', handleTouchMove, { passive: false });

        if (isDragging || isResizing || isRotating) {
            document.body.classList.add('dragging');
        } else {
            document.body.classList.remove('dragging');
        }

        return () => {
            containerElement.removeEventListener('touchmove', handleTouchMove);
            document.body.classList.remove('dragging');
        };
    }, [isDragging, isResizing, isRotating, dragStart, initialSize, initialRotation, designImages, isClient, productId, view]);

    // Click outside to deselect
    useEffect(() => {
        if (!isClient) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current?.contains(event.target as Node) &&
                !isDragging && !isResizing && !isRotating
            ) {
                const clickedOnImage = designImages.some((_, index) => {
                    const imageElement = document.getElementById(`design-image-${index}`);
                    return imageElement?.contains(event.target as Node);
                });

                if (!clickedOnImage) {
                    setDesignImages(prev => prev.map(img => ({ ...img, isSelected: false })));
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDragging, isResizing, isRotating, designImages, isClient]);

    // Toggle function to show/hide design zones
    const toggleShowZones = () => setShowZones(prev => !prev);

    // Zone selection handler
    const handleZoneSelect = (zoneId: string) => {
        setActiveZoneId(zoneId);
    };

    // Get default zone ID for a product view
    const getDefaultZoneId = (prodId: string, currentView: 'front' | 'back' = 'front'): string | null => {
        if (!prodId || !products[prodId]) return null;
        return products[prodId].designZones[currentView]?.[0]?.id || null;
    };

    // Add image to active zone
    const addImageToActiveZone = (imageUrl: string) => {
        if (!productId || !activeZoneId) return;

        const zone = products[productId].designZones[view].find(z => z.id === activeZoneId);
        if (!zone) return;

        // Count images in this zone
        const imagesInZone = designImages.filter(img => img.zoneId === activeZoneId).length;

        // Check if zone has reached max images
        if (zone.maxImagesAllowed && imagesInZone >= zone.maxImagesAllowed) {
            alert(`This zone can only have ${zone.maxImagesAllowed} images`);
            return;
        }

        // Create new image with zone constraints
        const newImage = {
            url: imageUrl,
            position: { x: 0, y: 0 }, // Center of zone
            size: Math.min(100, zone.width / 2), // Reasonable default size
            rotation: 0,
            isSelected: true,
            zoneId: activeZoneId
        };

        // Add image and deselect others
        setDesignImages(prev => [
            ...prev.map(img => ({ ...img, isSelected: false })),
            newImage
        ]);
    };

    // Image manipulation handlers
    const handleSelectImage = (index: number) => {
        const selectedImage = designImages[index];
        setActiveZoneId(selectedImage.zoneId);

        setDesignImages(prev => prev.map((img, i) => ({
            ...img, isSelected: i === index
        })));
    };

    const handleMouseDown = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        handleSelectImage(index);
        setIsDragging(true);
        const currentImage = designImages[index];
        setDragStart({
            x: e.clientX - currentImage.position.x,
            y: e.clientY - currentImage.position.y
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
                y: e.touches[0].clientY - currentImage.position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const selectedIndex = designImages.findIndex(img => img.isSelected);
        if (selectedIndex < 0) return;

        const selectedImage = designImages[selectedIndex];

        if (isDragging) {
            const newPosition = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };

            // Constrain position to zone
            const constrainedPosition = constrainPositionToZone(
                newPosition,
                selectedImage.zoneId,
                selectedImage.size
            );

            setDesignImages(prev => prev.map((img, i) =>
                i === selectedIndex
                    ? { ...img, position: constrainedPosition }
                    : img
            ));
        } else if (isResizing) {
            // Get zone for constraints
            const zone = productId ?
                products[productId].designZones[view].find(z => z.id === selectedImage.zoneId) : null;

            // Calculate max size based on zone
            let maxSize = 500; // Default max size
            if (zone) {
                maxSize = Math.min(zone.width, zone.height) - 8; // Fixed: properly update maxSize variable
            }

            // Calculate new size with constraints
            const newSize = Math.min(
                maxSize,
                Math.max(50, initialSize + (e.clientX - dragStart.x))
            );

            setDesignImages(prev => prev.map((img, i) =>
                i === selectedIndex ? { ...img, size: newSize } : img
            ));

            // Re-constrain position after resize
            const constrainedPosition = constrainPositionToZone(
                selectedImage.position,
                selectedImage.zoneId,
                newSize
            );

            if (constrainedPosition.x !== selectedImage.position.x ||
                constrainedPosition.y !== selectedImage.position.y) {
                setDesignImages(prev => prev.map((img, i) =>
                    i === selectedIndex ? { ...img, position: constrainedPosition } : img
                ));
            }
        } else if (isRotating && imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            setDesignImages(prev => prev.map((img, i) =>
                i === selectedIndex
                    ? { ...img, rotation: initialRotation + angle * (180 / Math.PI) }
                    : img
            ));
        }
    };

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
                    y: e.touches[0].clientY - centerY
                });
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        // Remove the image from the designImages array
        setDesignImages(prev => {
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

    // Reset interaction states
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setIsRotating(false);
    };

    const toggleView = () => {
        const newView = view === 'front' ? 'back' : 'front';
        setView(newView);

        // Update active zone to first zone of new view if product exists
        if (productId && products[productId]?.designZones?.[newView]?.[0]) {
            setActiveZoneId(products[productId].designZones[newView][0].id);
        }
    };

    // For hydration safety
    if (!isClient) {
        return <div className="flex flex-col items-center">
            <div className="relative w-[50vh] h-[60vh] m-[4vw]"></div>
        </div>;
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
                <img
                    src={product.images[view]}
                    alt={`${product.name} ${view}`}
                    className="w-full h-full absolute top-0 left-0"
                />

                {/* Design zones with their contained images */}
                {currentZones.map(zone => (
                    <DesignZone
                        key={zone.id}
                        zone={zone}
                        isActive={zone.id === activeZoneId}
                        showBorder={showZones || zone.id === activeZoneId}
                    >
                        {designImages
                            .filter(image => image.zoneId === zone.id)
                            .map((image, zoneIndex) => {
                                // Find global index for this image
                                const globalIndex = designImages.findIndex(img =>
                                    img.url === image.url && img.zoneId === zone.id);

                                return (
                                    <div
                                        id={`design-image-${globalIndex}`}
                                        key={`${image.url}-${globalIndex}`}
                                        ref={image.isSelected ? imageRef : null}
                                        className="absolute"
                                        style={{
                                            left: `50%`, // Changed from image.position.x to 50%
                                            top: `50%`, // Changed from image.position.y to 50%
                                            transform: `translate(-50%, -50%) translate(${image.position.x}px, ${image.position.y}px) rotate(${image.rotation}deg)`,
                                            width: `${image.size}px`,
                                            height: 'auto',
                                            zIndex: image.isSelected ? 20 : 10,
                                            border: image.isSelected ? '2px dashed #2563eb' : 'none',
                                            padding: '3px',
                                            borderRadius: '4px'
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
                                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
                                                        className="absolute w-6 h-6 bg-blue-500 rounded-full right-0 bottom-0 cursor-se-resize transform translate-x-1/2 translate-y-1/2 border-2 border-white flex items-center justify-center"
                                                        onMouseDown={(e) => handleResizeStart(e, globalIndex)}
                                                        onTouchStart={(e) => handleResizeTouchStart(e, globalIndex)}
                                                    >
                                                        <span className="text-white text-xs font-bold transform rotate-45">↔</span>
                                                    </div>

                                                    {/* Rotate handle */}
                                                    <div
                                                        className="absolute w-6 h-6 bg-green-500 rounded-full top-0 left-0 cursor-move transform -translate-x-1/2 -translate-y-4 border-2 border-white flex items-center justify-center"
                                                        onMouseDown={(e) => handleRotateStart(e, globalIndex)}
                                                        onTouchStart={(e) => handleRotateTouchStart(e, globalIndex)}
                                                    >
                                                        <span className="text-white text-xs">↻</span>
                                                    </div>

                                                    {/* Remove button */}
                                                    <button
                                                        onClick={() => handleRemoveImage(globalIndex)}
                                                        className="absolute top-0 right-0 w-6 h-6 rounded-full text-white flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                                                        title="Remove image"
                                                    >
                                                        <img
                                                            src="/icons/close.svg"
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
                    </DesignZone>
                ))}
            </div>

            {/* Zone selection UI */}
            {currentZones.length > 1 && (
                <div className="flex space-x-2 mb-4 flex-wrap justify-center">
                    {currentZones.map(zone => (
                        <button
                            key={zone.id}
                            onClick={() => handleZoneSelect(zone.id)}
                            className={`px-3 py-1 m-1 text-sm rounded ${zone.id === activeZoneId
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            {zone.name}
                        </button>
                    ))}
                    <button
                        onClick={toggleShowZones}
                        className="px-3 py-1 m-1 text-sm rounded bg-gray-200 text-gray-800"
                    >
                        {showZones ? 'Hide Zones' : 'Show Zones'}
                    </button>
                </div>
            )}

            {/* View toggle */}
            <div className="flex justify-between space-x-20 mb-4">
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
};

export default PreviewProduct;