import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/productOptions";
interface ProductColorPreviewProps {
    color?: string | null;
}
export default function ProductColorPreview({ color }: ProductColorPreviewProps) {
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
    useEffect(() => {
        if (!isClient) return;

        const handleColorChanged = () => {
            const appliedColor = localStorage.getItem('appliedProductColor');
            if (appliedColor) {
                setColorApplied(appliedColor);
            } else {
                setColorApplied(null);
            }
        };

        // Listen for the custom event
        window.addEventListener('productColorChanged', handleColorChanged);

        return () => {
            window.removeEventListener('productColorChanged', handleColorChanged);
        };
    }, [isClient]);
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
    useEffect(() => {
        if (!isClient) return;

        if (color !== undefined) {
            // Use the color from props
            setColorApplied(color);
        } else {
            // Fall back to localStorage if no prop is provided
            const appliedColor = localStorage.getItem('appliedProductColor');
            if (appliedColor) {
                setColorApplied(appliedColor);
            }
        }
    }, [color, isClient]);
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



    if (!isClient) return null;

    const product = productId ? products[productId] : null;
    if (!product) return <div>No product selected</div>;

    return (
        <div ref={containerRef} className="flex flex-col items-center w-full mt-5">
            {/* our product image*/}
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative" style={{ display: 'inline-block' }}>
                    {/* Colored background  */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundColor: colorApplied || 'transparent',
                            height:"90%",
                            width:"90%",
                            top: "9%",
                            left: "5%",
                        }}
                    />

                    {/* Original transparent image */}
                    <img
                        src={product.images[view]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain relative"
                    />
                </div>
            </div>

            {/* View toggle buttons */}
            <div className="flex justify-center gap-10 mt- w-full">
                <button
                    onClick={() => setView('front')}
                    className={`flex justify-center w-12 h-12 ${view === 'front'}`}
                >
                    <img src="/icons/arrow_left.svg" alt="Front" className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setView('back')}
                    className={`flex justify-center w-12 h-12 ${view === 'back'}`}
                >
                    <img src="/icons/arrow_right.svg" alt="Back" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}