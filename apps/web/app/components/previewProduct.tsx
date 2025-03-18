"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/productOptions";
import useImageStore from "@/store/imageStore";

const PreviewProduct: React.FC = () => {
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);
    const [view, setView] = useState<'front' | 'back'>('front');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const { images } = useImageStore();

    // Image editing state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState(0);
    const [initialRotation, setInitialRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [isSelected, setIsSelected] = useState(false);


    useEffect(() => {
        const id = searchParams.get("product");
        setProductId(id);
        const imageParam = searchParams.get("image");
        if (imageParam) {
            setImageUrl(imageParam);
        } else {
            setImageUrl(null);
        }
    }, [searchParams, images]);

    useEffect(() => {
        const containerElement = containerRef.current;

        if (containerElement) {
            const handleTouchMoveNonPassive = (e: TouchEvent) => {
                if (isDragging || isResizing || isRotating) {
                    e.preventDefault();

                    if (e.touches.length === 1) {
                        const touch = e.touches[0];
                        if (isDragging) {
                            setPosition({
                                x: touch.clientX - dragStart.x,
                                y: touch.clientY - dragStart.y
                            });
                        } else if (isResizing) {
                            const dx = touch.clientX - dragStart.x;
                            const newSize = Math.max(50, initialSize + dx);
                            setSize(newSize);
                        } else if (isRotating && imageRef.current) {
                            const rect = imageRef.current.getBoundingClientRect();
                            const centerX = rect.left + rect.width / 2;
                            const centerY = rect.top + rect.height / 2;
                            const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
                            setRotation(initialRotation + angle * (180 / Math.PI));
                        }
                    }
                }
            };

            // Add non-passive event listener
            containerElement.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });

            // Add class to body when dragging
            if (isDragging || isResizing || isRotating) {
                document.body.classList.add('dragging');
            } else {
                document.body.classList.remove('dragging');
            }

            // Clean up
            return () => {
                containerElement.removeEventListener('touchmove', handleTouchMoveNonPassive);
                document.body.classList.remove('dragging');
            };
        }
    }, [isDragging, isResizing, isRotating, dragStart, initialSize, initialRotation]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                imageRef.current &&
                !imageRef.current.contains(event.target as Node) &&
                !isDragging &&
                !isResizing &&
                !isRotating
            ) {
                setIsSelected(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDragging, isResizing, isRotating]);
    const product = productId ? products[productId] : null;

    const toggleView = () => {
        setView(prev => (prev === 'front' ? 'back' : 'front'));
    };

    if (!product) return <div>Product not found...</div>;

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSelected(true); // Set selected when interacting with the image
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        setIsSelected(true); // Set selected when interacting with the image
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        } else if (isResizing && imageRef.current) {
            const dx = e.clientX - dragStart.x;
            const newSize = Math.max(50, initialSize + dx);
            setSize(newSize);
        } else if (isRotating) {
            const rect = imageRef.current?.getBoundingClientRect();
            if (rect) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate angle between center of element and mouse position
                const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                setRotation(initialRotation + angle * (180 / Math.PI));
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setIsRotating(false);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        setIsRotating(false);
    };

    // Resize handlers
    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialSize(size);
    };

    const handleResizeTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (e.touches.length === 1) {
            setIsResizing(true);
            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            setInitialSize(size);
        }
    };

    // Rotation handlers
    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRotating(true);
        setInitialRotation(rotation);
        const rect = imageRef.current?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            setDragStart({ x: e.clientX - centerX, y: e.clientY - centerY });
        }
    };

    const handleRotateTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (e.touches.length === 1) {
            setIsRotating(true);
            setInitialRotation(rotation);
            const rect = imageRef.current?.getBoundingClientRect();
            if (rect) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                setDragStart({
                    x: e.touches[0].clientX - centerX,
                    y: e.touches[0].clientY - centerY
                });
            }
        }
    };

    // close
    const handleClose = () => {
        // Remove the image from view
        setImageUrl(null);
    };

    // Reset positioning
    const handleReset = () => {
        setPosition({ x: 0, y: 0 });
        setSize(100);
        setRotation(0);
    };

    // Handle image click to set selected
    const handleImageClick = () => {
        setIsSelected(true);
    };

    return (
        <div className="flex flex-col items-center">
            <div
                ref={containerRef}
                className="relative w-[50vh] h-[60vh] m-[4vw]"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchEnd={handleTouchEnd}
            >
                {/* Product image as background */}
                <img
                    src={product.images[view]}
                    alt={`${product.name} ${view}`}
                    className="w-full h-full absolute top-0 left-0"
                />

                {/* Uploaded image overlay with edit controls */}
                {imageUrl && (
                    <div
                        ref={imageRef}
                        className="absolute"
                        style={{
                            left: `calc(50% + ${position.x}px)`,
                            top: `calc(50% + ${position.y}px)`,
                            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                            width: `${size}px`,
                            height: 'auto',
                            zIndex: 10,
                            border: isSelected ? '2px dashed #2563eb' : 'none',
                            padding: '4px',
                            borderRadius: '4px'
                        }}
                        onClick={handleImageClick}
                    >
                        {/* Main image - draggable */}
                        <div
                            ref={imageContainerRef}
                            className="relative w-full h-full"
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleTouchStart}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            <img
                                src={imageUrl}
                                alt="Your design"
                                className="max-w-full max-h-full object-contain"
                                draggable="false"
                            />

                            {/* Conditionally render controls based on isSelected */}
                            {isSelected && (
                                <>
                                    {/* Resize handle */}
                                    <div
                                        className="absolute w-6 h-6 bg-blue-500 rounded-full right-0 bottom-0 cursor-se-resize transform translate-x-1/2 translate-y-1/2 border-2 border-white flex items-center justify-center"
                                        onMouseDown={handleResizeStart}
                                        onTouchStart={handleResizeTouchStart}
                                    >
                                        {/* Simple diagonal arrow icon for resize */}
                                        <span className="text-white text-xs font-bold transform rotate-45">↔</span>
                                    </div>

                                    {/* Rotation handle */}
                                    <div
                                        className="absolute w-6 h-6 bg-green-500 rounded-full top-0 cursor-move transform -translate-x-1/2 -translate-y-4 border-2 border-white flex items-center justify-center"
                                        onMouseDown={handleRotateStart}
                                        onTouchStart={handleRotateTouchStart}
                                    >
                                        {/* Simple rotation icon */}
                                        <span className="text-white text-xs">↻</span>
                                    </div>

                                    {/* Close button */}
                                    <button
                                        onClick={handleClose}
                                        className="absolute top-0 right-0 w-6 h-6  rounded-full text-white flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
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
                )}
            </div>

            {/* Navigation and control buttons */}
            <div className="flex justify-between space-x-20 mb-4">
                <button
                    onClick={toggleView}
                    className="flex justify-center w-12 h-12"
                >
                    <img
                        src="/icons/arrow_left.svg"
                        alt="Previous View"
                        className="w-4 h-4"
                    />
                </button>

                <button
                    onClick={toggleView}
                    className="flex justify-center w-12 h-12"
                >
                    <img
                        src="/icons/arrow_right.svg"
                        alt="Next View"
                        className="w-4 h-4"
                    />
                </button>
            </div>


            {/* Add prevent-scroll style for mobile */}
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