"use client";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { products } from "@/productOptions";
import { useSearchParams, useRouter } from "next/navigation";
import ProductColorPreview from "@/components/ProductColorPreview";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from "next-intl";


// Default colors for admin panel
const defaultColors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#000000", // Black
    "#E69DB8", // Cameo pink
    "#D2B48C", // Tan
    "#BDB76B", // Dark Khaki
];

// Pastel colors palette
const pastelColors = [
    "#FFB6C1", // Light Pink
    "#FFD700", // Gold
    "#87CEFA", // Light Sky Blue
    "#98FB98", // Pale Green
    "#E6E6FA", // Lavender
    "#FFA07A", // Light Salmon
    "#F0E68C", // Khaki
    "#F5DEB3", // Wheat
];

// Earth tone colors palette
const earthToneColors = [
    "#8B4513", // Saddle Brown
    "#A0522D", // Sienna
    "#CD853F", // Peru
    "#D2B48C", // Tan
    "#556B2F", // Dark Olive Green
    "#6B8E23", // Olive Drab
    "#BDB76B", // Dark Khaki
    "#F5F5DC", // Beige
];
const grayScaleColors = [
    "#BFBFBF",
    "#B2B2B2", "#A6A6A6", "#999999", "#808080", "#666666", "#4D4D4D", "#333333", "#1A1A1A", "#000000"
];

const colorGrid = [
    // Row 1 - Dark shades
    ["#003366", "#000066", "#330066", "#660066", "#990066", "#660000", "#663300", "#996600", "#666600", "#336600"],
    // Row 2 - Medium dark shades
    ["#006699", "#000099", "#330099", "#660099", "#990099", "#990000", "#993300", "#CC9900", "#999900", "#339900"],
    // Row 3 - Medium shades
    ["#0099CC", "#0000CC", "#3300CC", "#6600CC", "#9900CC", "#CC0000", "#CC6600", "#FFCC00", "#CCCC00", "#33CC00"],
    // Row 4 - Medium light shades
    ["#00CCFF", "#0000FF", "#3300FF", "#6600FF", "#9900FF", "#FF0000", "#FF6600", "#FFCC33", "#FFFF00", "#33FF00"],
    // Row 5 - Light shades
    ["#00FFFF", "#3399FF", "#3333FF", "#6633FF", "#9933FF", "#FF3333", "#FF9966", "#FFFF33", "#CCFF33", "#66FF33"],
    // Row 6 - Very light shades
    ["#99FFFF", "#99CCFF", "#9999FF", "#9966FF", "#CC99FF", "#FF99CC", "#FFCC99", "#FFFF99", "#CCFF99", "#99FF99"]
];

export default function ColorPage() {
    // State for the color picker
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [colorOpacity, setColorOpacity] = useState(100);
    const [view, setView] = useState<'front' | 'back'>('front');
    const [productId, setProductId] = useState<string | null>(null);
    const [showColorPanel, setShowColorPanel] = useState(false);
    const t = useTranslations("ColorPage");

    const router = useRouter();
    const searchParams = useSearchParams();

    // State for the admin panel colors
    const [adminColors, setAdminColors] = useState(defaultColors);

    // Product state
    const [productColor, setProductColor] = useState<string | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<'admin' | 'super-admin'>('admin');

    // Applied color state
    const [isColorApplied, setIsColorApplied] = useState(false);

    // Handle color selection
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };
    const handleGridColorSelect = (color: string) => {
        setSelectedColor(color);
    };
    // Initialize product from URL params
    useEffect(() => {
        const product = searchParams.get("product");
        if (product && products[product]) {
            setProductId(product);
        } else {
            // Try getting from localStorage if not in URL
            const storedProduct = localStorage.getItem('selectedProduct');
            if (storedProduct && products[storedProduct]) {
                setProductId(storedProduct);

                // Update URL to include product
                const params = new URLSearchParams(searchParams.toString());
                params.set("product", storedProduct);
                router.push(`${window.location.pathname}?${params.toString()}`);
            } else if (Object.keys(products).length > 0) {
                // Set default product if none selected
                setProductId(Object.keys(products)[0]);
            }
        }
    }, [searchParams, router]);

    // Apply color to product
    const applyColorToProduct = () => {
        const finalColor = colorOpacity < 100
            ? getColorWithOpacity()
            : selectedColor;

        setProductColor(finalColor);

        // Set a flag to indicate color has been applied
        setIsColorApplied(true);

        // Store applied color in localStorage
        localStorage.setItem('appliedProductColor', finalColor);

        // Close the color panel after applying
        setShowColorPanel(false);

        console.log(`Applied color: ${finalColor}`);
    };

    // Add color from super admin to admin panel
    const addColorToAdminPanel = () => {
        if (!adminColors.includes(selectedColor)) {
            const newColors = [...adminColors, selectedColor];
            setAdminColors(newColors);
            console.log("Added color:", selectedColor, "New colors:", newColors);
        } else {
            console.log("Color already exists in admin panel:", selectedColor);
        }
    };

    // Remove color from admin panel
    const removeColorFromAdminPanel = () => {
        if (adminColors.includes(selectedColor)) {
            const newColors = adminColors.filter(color => color !== selectedColor);
            setAdminColors(newColors);
        }
    };

    // Convert hex to rgba for opacity
    const getColorWithOpacity = () => {
        const r = parseInt(selectedColor.slice(1, 3), 16);
        const g = parseInt(selectedColor.slice(3, 5), 16);
        const b = parseInt(selectedColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${colorOpacity / 100})`;
    };

    // Handle slider change for opacity
    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColorOpacity(parseInt(e.target.value));
    };

    // Redirect to PreviewProduct with color info once applied
    useEffect(() => {
        if (isColorApplied && productId) {
            localStorage.setItem('designColor', productColor || '');

            // Reset the flag
            setIsColorApplied(false);
        }
    }, [isColorApplied, productColor, productId]);

    // Toggle color panel visibility
    const toggleColorPanel = () => {
        setShowColorPanel(prev => !prev);
    };

    return (
        <div className="container mx-auto p-4  ">
            {/*tabs */}
            <div className="mb-4">
                <div className="inline-flex w-full h-[6vh] items-center justify-center rounded-xl bg-blue-100 p-1">
                    <button
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl w-[48vw] h-[5vh] text-sm font-medium transition-all focus:outline-none ${activeTab === 'admin'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                        onClick={() => setActiveTab('admin')}
                    >
                        Admin
                    </button>
                    <button
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-8 py-1.5 text-sm font-medium transition-all focus:outline-none ${activeTab === 'super-admin'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                        onClick={() => setActiveTab('super-admin')}
                    >
                        Super Admin
                    </button>
                </div>
            </div>

            {/* Admin Panel Content */}
            {activeTab === 'admin' && (
                <div>
                    {/* Preview Product Display */}
                    <div className="rounded-lg p-7 h-[70vh] flex flex-col items-center justify-center relative">
                        {productId && (
                            <ProductColorPreview />
                        )}

                        {/* Color Panel Toggle Button */}
                        <button
                            onClick={toggleColorPanel}
                            className="mt-15 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg"
                        >
                            Choose Color
                        </button>
                    </div>

                    {/* Color Panel Popup */}
                    <AnimatePresence>
                        {showColorPanel && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0  bg-opacity-50 z-40"
                                    onClick={toggleColorPanel}
                                />

                                {/* Popup */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="fixed left-1/2 bottom-[10vh] transform -translate-x-1/2 z-50"
                                >
                                    <div className="bg-gray-100 rounded-lg w-[98vw] h-[24vh]">
                                        {/* Header with close button */}
                                        <div className="flex justify-end items-center mb-3">
                                            <button
                                                onClick={toggleColorPanel}
                                                className="text-gray-400 hover:text-gray-600 m-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex">
                                            {/*  Selected color display */}
                                            <div className="w-1/4 p-3 rounded-lg mr-3">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="h-16 w-16 rounded shadow-md mb-2"
                                                        style={{ backgroundColor: selectedColor }}
                                                    />
                                                    <span className="text-sm text-gray-800">{selectedColor}</span>
                                                </div>
                                            </div>

                                            {/* Color grid */}
                                            <div className="w-3/4 rounded-lg mb-8   h-10"> {/* Added fixed height and background */}
                                                <div
                                                    className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto pl-1 pb-1"
                                                    style={{ scrollbarWidth: 'thin' }} /* For Firefox */
                                                >
                                                    {adminColors.map((color, index) => (
                                                        <div
                                                            key={index}
                                                            className={`h-7 w-7 rounded-full cursor-pointer mb-1 ${selectedColor === color ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => handleColorSelect(color)}
                                                        />
                                                    ))}
                                                </div>


                                                {/* Apply button */}
                                                <div className="flex justify-end mt-[-30px] mr-[4vw] ">
                                                    <button
                                                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white h-6 w-6 rounded-full"
                                                        onClick={applyColorToProduct}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Super Admin Panel Content */}
            {activeTab === 'super-admin' && (
                <div className="space-y-4 h-[160vh] ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Preview Product Display */}
                        <div className="rounded-lg p-4 h-[50vh] flex items-center justify-center relative">
                            {productId && (
                                <ProductColorPreview />
                            )}
                        </div>

                        {/* Advanced Color Selection */}
                        <div className="rounded-lg p-7 bg-white h-auto flex flex-col justify-between">


                            {/* Color Picker */}
                            <div className="mb-4">
                                {/* Color grid */}
                                <div>
                                    <div className="flex w-full">
                                        {grayScaleColors.map((color, index) => (
                                            <div
                                                key={`gray-${index}`}
                                                className={`h-6 flex-1 cursor-pointer ${selectedColor === color ? "ring-2 ring-white ring-inset" : ""}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => handleGridColorSelect(color)}
                                            />
                                        ))}
                                    </div>
                                    {colorGrid.map((row, rowIndex) => (
                                        <div key={`row-${rowIndex}`} className="flex w-full">
                                            {row.map((color, colIndex) => (
                                                <div
                                                    key={`grid-${rowIndex}-${colIndex}`}
                                                    className={`h-6 w-6 flex-1 cursor-pointer ${selectedColor === color ? "ring-1 ring-white ring-inset" : ""}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleGridColorSelect(color)}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Selected color highlight outline */}
                                {selectedColor && (
                                    <div className="relative">
                                        <div
                                            className="absolute pointer-events-none border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                top: '50%',
                                                left: '50%',
                                                zIndex: 10,
                                                display: 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Opacity Control */}
                            <div className="mb-6">
                                <label className="block text-blue-600 text-sm font-medium mb-4">OPACITY</label>

                                <div className="mt-4">
                                    <div className="bg-blue-600 rounded p-1 h-7 w-12 ml-[60vw]">
                                        <label className="block text-sm font-medium text-white mb-1">
                                            {colorOpacity}%
                                        </label>
                                    </div>

                                    {/* Slider track background */}
                                    <div className="relative h-8 mb-2">
                                        <div
                                            className="absolute left-0 right-0 h-2 top-3 rounded-full"
                                            style={{
                                                background: `linear-gradient(to right, ${selectedColor}00, ${selectedColor}FF)`,
                                            }}
                                        />

                                        {/* Slider input */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={colorOpacity}
                                            onChange={handleOpacityChange}
                                            className="w-full h-8 appearance-none bg-transparent cursor-pointer"
                                            style={{
                                                accentColor: selectedColor,
                                                opacity: colorOpacity / 100,
                                            }}
                                        />
                                    </div>


                                </div>
                            </div>
                            {/* Admin Colors Display (same layout as admin panel) */}
                            <div className="mb-4">
                                <div className="flex bg-gray-100 rounded-lg  h-30   ">
                                    {/*  Selected color display */}
                                    <div className="w-1/4 p-3 rounded-lg mr-3">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="h-16 w-16 rounded shadow-md mb-2"
                                                style={{ backgroundColor: selectedColor }}
                                            />
                                            <span className="text-sm text-gray-800">{selectedColor}</span>
                                        </div>
                                    </div>

                                    {/* Color grid */}
                                    <div className=" p-3 rounded-lg">
                                        <div className="grid grid-cols-5 gap-2 h-25 w-45 overflow-x-auto pr-8">
                                            {adminColors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    className={`h-7 w-7 rounded-full cursor-pointer mb-1 ${selectedColor === color ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleGridColorSelect(color)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex space-x-2 m-2">
                                <button
                                    onClick={addColorToAdminPanel}
                                    className="flex justify-center items-center w-[30vw] text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full"
                                >
                                    <h1 className="">Add </h1>
                                </button>
                                <button
                                    onClick={removeColorFromAdminPanel}
                                    className="flex justify-center items-center w-[30vw] text-white bg-[#DC060A] hover:bg-red-800 p-2 rounded-full"
                                >
                                    <h1 className="">Remove</h1>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}