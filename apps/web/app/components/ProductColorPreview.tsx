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
        if (!isClient) return;

        // Check for new applied color
        const checkForColor = () => {
            const appliedColor = localStorage.getItem('appliedProductColor');
            if (appliedColor) {
                setColorApplied(appliedColor);
                console.log("Applied color to product:", appliedColor);
            }
        };

        checkForColor();
        const intervalId = setInterval(checkForColor, 500);

        return () => clearInterval(intervalId);
    }, [isClient]);

    // Toggle view between front and back
    const toggleView = () => {
        setView(view === 'front' ? 'back' : 'front');
    };

    if (!isClient) return null;

    const product = productId ? products[productId] : null;
    if (!product) return <div>No product selected</div>;

    return (
        <div ref={containerRef} className="relative w-full h-[50vh] ml-[3vw]">

            <img
                src={product.images[view]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                style={{ backgroundColor: colorApplied || 'transparent' }}

            />
            {/* View toggle */}
            <div className="flex justify-center gap-10 pt-4 mr-[5vw] ">
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