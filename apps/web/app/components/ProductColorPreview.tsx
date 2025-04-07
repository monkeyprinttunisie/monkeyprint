"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/productOptions";

export default function ProductColorPreview() {
    const [isClient, setIsClient] = useState(false);
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);
    const [view, setView] = useState<'front' | 'back'>('front');
    const containerRef = useRef<HTMLDivElement>(null);
    const [colorApplied, setColorApplied] = useState<string | null>(null);

    // Client-side initialization
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get product from URL or localStorage
    useEffect(() => {
        if (!isClient) return;

        const product = searchParams.get("product");
        if (product && products[product]) {
            setProductId(product);
        } else {
            const storedProduct = localStorage.getItem('selectedProduct');
            if (storedProduct && products[storedProduct]) {
                setProductId(storedProduct);
            } else if (Object.keys(products).length > 0) {
                // Fallback to first product if none selected
                setProductId(Object.keys(products)[0]);
            }
        }
    }, [isClient, searchParams]);

    // Apply color from localStorage
    useEffect(() => {
        if (!isClient || !containerRef.current) return;

        // Check for new applied color
        const checkForColor = () => {
            const appliedColor = localStorage.getItem('appliedProductColor');
            if (appliedColor && appliedColor !== colorApplied) {
                // Create or get overlay element
                let colorOverlay = document.getElementById('product-color-overlay');
                if (!colorOverlay) {
                    colorOverlay = document.createElement('div');
                    colorOverlay.id = 'product-color-overlay';
                    colorOverlay.style.position = 'absolute';
                    colorOverlay.style.top = '0';
                    colorOverlay.style.left = '0';
                    colorOverlay.style.width = '100%';
                    colorOverlay.style.height = '100%';
                    colorOverlay.style.pointerEvents = 'none';
                    colorOverlay.style.mixBlendMode = 'multiply';
                    if (containerRef.current) {
                        containerRef.current.appendChild(colorOverlay);
                    }
                }

                // Apply the color
                colorOverlay.style.backgroundColor = appliedColor;
                setColorApplied(appliedColor);
                console.log("Applied color to product:", appliedColor);
            }
        };

        // Check immediately and set up polling
        checkForColor();
        const intervalId = setInterval(checkForColor, 500);

        return () => clearInterval(intervalId);
    }, [isClient, colorApplied]);

    // Toggle view between front and back
    const toggleView = () => {
        setView(view === 'front' ? 'back' : 'front');
    };

    if (!isClient) return null;

    const product = productId ? products[productId] : null;
    if (!product) return <div>No product selected</div>;

    return (
        <div ref={containerRef} className="relative w-full h-[50vh]">
            <img
                src={product.images[view]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
            />

            {/* View toggle */}
            <div className="flex justify-center gap-10 pt-4 ">
                <button onClick={toggleView} className="flex justify-center w-12 h-12">
                    <img src="/icons/arrow_left.svg" alt="Previous" className="w-5 h-5" />
                </button>
                <button onClick={toggleView} className="flex justify-center w-12 h-12">
                    <img src="/icons/arrow_right.svg" alt="Next" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}