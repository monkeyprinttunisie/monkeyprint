"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/productOptions";

const PreviewProduct: React.FC = () => {
    // URL params and state
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);
    const [view, setView] = useState<'front' | 'back'>('front');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

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
    }>>([]);

    // Interaction states
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState(0);
    const [initialRotation, setInitialRotation] = useState(0);

    // Load and initialize design
    useEffect(() => {
        const id = searchParams.get("product");
        if (!id) return;

        setProductId(id);
        const designStorageKey = `design_${id}`;
        const imageParam = searchParams.get("image");

        // Load existing design if available
        let currentDesign: any[] = [];
        try {
            const savedDesign = localStorage.getItem(designStorageKey);
            if (savedDesign) {
                const parsedDesign = JSON.parse(savedDesign);
                if (Array.isArray(parsedDesign) && parsedDesign.length > 0) {
                    currentDesign = parsedDesign;
                    setDesignImages(parsedDesign.map(img => ({ ...img, isSelected: false })));
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
                    // Create new image objects
                    const newImageObjects = parsedImages.map((url, index) => ({
                        url,
                        position: { x: 20 + index * 15, y: 20 + index * 15 },
                        size: 100,
                        rotation: 0,
                        isSelected: index === 0
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
                // Handle single image parameter
                const newDesign = [{
                    url: imageParam,
                    position: { x: 0, y: 0 },
                    size: 100,
                    rotation: 0,
                    isSelected: true
                }];

                setImageUrl(imageParam);
                setDesignImages(newDesign);
                localStorage.setItem(designStorageKey, JSON.stringify(newDesign));
            }
        } catch (e) {
            console.error("Error processing images:", e);
        }
    }, [searchParams]);

    // Save design changes
    useEffect(() => {
        if (productId && designImages.length > 0) {
            localStorage.setItem(`design_${productId}`, JSON.stringify(designImages));
        }
    }, [designImages, productId]);

    // Handle touch events
    useEffect(() => {
        const containerElement = containerRef.current;
        if (!containerElement) return;

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging && !isResizing && !isRotating) return;

            e.preventDefault();
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const selectedIndex = designImages.findIndex(img => img.isSelected);
            if (selectedIndex < 0) return;

            if (isDragging) {
                setDesignImages(prev => prev.map((img, i) =>
                    i === selectedIndex
                        ? {
                            ...img, position: {
                                x: touch.clientX - dragStart.x,
                                y: touch.clientY - dragStart.y
                            }
                        }
                        : img
                ));
            } else if (isResizing) {
                const newSize = Math.max(50, initialSize + (touch.clientX - dragStart.x));
                setDesignImages(prev => prev.map((img, i) =>
                    i === selectedIndex ? { ...img, size: newSize } : img
                ));
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
    }, [isDragging, isResizing, isRotating, dragStart, initialSize, initialRotation, designImages]);

    // Click outside to deselect
    useEffect(() => {
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
    }, [isDragging, isResizing, isRotating, designImages]);

    const product = productId ? products[productId] : null;
    if (!product) return <div>Product not found</div>;

    // Image manipulation handlers
    const handleSelectImage = (index: number) => {
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

        if (isDragging) {
            setDesignImages(prev => prev.map((img, i) =>
                i === selectedIndex
                    ? {
                        ...img, position: {
                            x: e.clientX - dragStart.x,
                            y: e.clientY - dragStart.y
                        }
                    }
                    : img
            ));
        } else if (isResizing) {
            const newSize = Math.max(50, initialSize + (e.clientX - dragStart.x));
            setDesignImages(prev => prev.map((img, i) =>
                i === selectedIndex ? { ...img, size: newSize } : img
            ));
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
        setDesignImages(prev => prev.filter((_, i) => i !== index));
        if (designImages.length === 1) setImageUrl(null);
    };

    // Reset interaction states
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setIsRotating(false);
    };

    const toggleView = () => setView(prev => prev === 'front' ? 'back' : 'front');

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

                {/* Design images */}
                {designImages.map((image, index) => (
                    <div
                        id={`design-image-${index}`}
                        key={`${image.url}-${index}`}
                        ref={image.isSelected ? imageRef : null}
                        className="absolute"
                        style={{
                            left: `calc(50% + ${image.position.x}px)`,
                            top: `calc(50% + ${image.position.y}px)`,
                            transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                            width: `${image.size}px`,
                            height: 'auto',
                            zIndex: image.isSelected ? 20 : 10,
                            border: image.isSelected ? '2px dashed #2563eb' : 'none',
                            padding: '4px',
                            borderRadius: '4px'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelectImage(index);
                        }}
                    >
                        <div
                            className="relative w-full h-full"
                            onMouseDown={(e) => handleMouseDown(e, index)}
                            onTouchStart={(e) => handleTouchStart(e, index)}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            <img
                                src={image.url}
                                alt={`Design ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                                draggable="false"
                            />

                            {/* Control handles for selected image */}
                            {image.isSelected && (
                                <>
                                    {/* Resize handle */}
                                    <div
                                        className="absolute w-6 h-6 bg-blue-500 rounded-full right-0 bottom-0 cursor-se-resize transform translate-x-1/2 translate-y-1/2 border-2 border-white flex items-center justify-center"
                                        onMouseDown={(e) => handleResizeStart(e, index)}
                                        onTouchStart={(e) => handleResizeTouchStart(e, index)}
                                    >
                                        <span className="text-white text-xs font-bold transform rotate-45">↔</span>
                                    </div>

                                    {/* Rotate handle */}
                                    <div
                                        className="absolute w-6 h-6 bg-green-500 rounded-full top-0 cursor-move transform -translate-x-1/2 -translate-y-4 border-2 border-white flex items-center justify-center"
                                        onMouseDown={(e) => handleRotateStart(e, index)}
                                        onTouchStart={(e) => handleRotateTouchStart(e, index)}
                                    >
                                        <span className="text-white text-xs">↻</span>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        onClick={() => handleRemoveImage(index)}
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
                ))}
            </div>

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