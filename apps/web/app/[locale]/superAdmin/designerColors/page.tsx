"use client";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { products } from "@/productOptions";
import { useSearchParams, useRouter } from "next/navigation";
import ProductColorPreview from "@/components/ProductColorPreview";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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

const grayScaleColors = [
  "#BFBFBF",
  "#B2B2B2",
  "#A6A6A6",
  "#999999",
  "#808080",
  "#666666",
  "#4D4D4D",
  "#333333",
  "#1A1A1A",
  "#000000",
];

const colorGrid = [
  // Row 1 - Dark shades
  [
    "#003366",
    "#000066",
    "#330066",
    "#660066",
    "#990066",
    "#660000",
    "#663300",
    "#996600",
    "#666600",
    "#336600",
  ],
  // Row 2 - Medium dark shades
  [
    "#006699",
    "#000099",
    "#330099",
    "#660099",
    "#990099",
    "#990000",
    "#993300",
    "#CC9900",
    "#999900",
    "#339900",
  ],
  // Row 3 - Medium shades
  [
    "#0099CC",
    "#0000CC",
    "#3300CC",
    "#6600CC",
    "#9900CC",
    "#CC0000",
    "#CC6600",
    "#FFCC00",
    "#CCCC00",
    "#33CC00",
  ],
  // Row 4 - Medium light shades
  [
    "#00CCFF",
    "#0000FF",
    "#3300FF",
    "#6600FF",
    "#9900FF",
    "#FF0000",
    "#FF6600",
    "#FFCC33",
    "#FFFF00",
    "#33FF00",
  ],
  // Row 5 - Light shades
  [
    "#00FFFF",
    "#3399FF",
    "#3333FF",
    "#6633FF",
    "#9933FF",
    "#FF3333",
    "#FF9966",
    "#FFFF33",
    "#CCFF33",
    "#66FF33",
  ],
  // Row 6 - Very light shades
  [
    "#99FFFF",
    "#99CCFF",
    "#9999FF",
    "#9966FF",
    "#CC99FF",
    "#FF99CC",
    "#FFCC99",
    "#FFFF99",
    "#CCFF99",
    "#99FF99",
  ],
];

// Alpha slider props interface
interface AlphaSliderProps {
  color: string;
  value: number;
  onChange: (value: number) => void;
}

// Alpha slider component
const AlphaSlider: React.FC<AlphaSliderProps> = ({
  color,
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Convert hex to HSL for gradient
  const hexToHsl = (hex: string) => {
    // Remove the # if present
    hex = hex.replace("#", "");

    // Convert hex to rgb
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find the max and min values to determine saturation
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    // Convert to degrees, percentages
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return { h, s, l };
  };
  // Use requestAnimationFrame for smoother updates
  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const effectiveWidth = rect.width - 20;
    const offsetX = Math.max(
      0,
      Math.min(effectiveWidth, clientX - rect.left - 10)
    );

    // Calculate percentage based on position
    let percentage = (offsetX / effectiveWidth) * 100;

    // Call the onChange handler with the new value
    onChange(Math.round(percentage));
  };
  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerMove(e);
    // Initial position update
    updatePosition(e.clientX);
    // Capture the pointer to improve dragging experience
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    // Cancel any pending animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Schedule the update in the next animation frame for smoother performance
    animationRef.current = requestAnimationFrame(() => {
      updatePosition(e.clientX);
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);

    // Cancel any pending animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Release pointer capture
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };
  // Cleanup animation frame on component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  const { h, s, l } = hexToHsl(color);
  const pointerColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${value / 100})`;

  return (
    <div
      className="react-colorful__alpha relative h-6 w-full rounded-full overflow-hidden cursor-pointer" // Changed w-[60vw] to w-full
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="Alpha"
      aria-valuetext={`${value}%`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      role="slider"
      tabIndex={0}
      style={{ touchAction: "none" }}
    >
      <div
        className="react-colorful__alpha-gradient absolute rounded-full inset-0 mx-[10px]"
        style={{
          backgroundImage: `linear-gradient(90deg, hsla(${h}, ${s}%, ${l}%, 0) 0%, hsla(${h}, ${s}%, ${l}%, 1) 100%)`,
        }}
      />
      <div
        className={`react-colorful__pointer absolute top-1/2 transform -translate-y-1/2 transition-transform ${isDragging ? "scale-110" : ""}`}
        style={{ left: `calc(${value}% * 0.8 + 10%)` }}
      >
        <div
          className="react-colorful__pointer-fill h-5 w-5 border-2 border-white rounded-full shadow-md transform -translate-x-1/2"
          style={{
            backgroundColor: pointerColor,
            boxShadow: isDragging ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "",
          }}
        />
      </div>
    </div>
  );
};
export default function ColorPage() {
  // State for the color picker
  const [adminSelectedColor, setAdminSelectedColor] = useState("#000000");
  const [superAdminSelectedColor, setSuperAdminSelectedColor] =
    useState("#000000");
  const [colorOpacity, setColorOpacity] = useState(100);
  const [productId, setProductId] = useState<string | null>(null);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [adminProductColor, setAdminProductColor] = useState<string | null>(
    null
  );
  const [superAdminProductColor, setSuperAdminProductColor] = useState<
    string | null
  >(null);
  const t = useTranslations("ColorPage");

  const router = useRouter();
  const searchParams = useSearchParams();

  const getSelectedColor = () => {
    return activeTab === "admin" ? adminSelectedColor : superAdminSelectedColor;
  };

  const setCurrentProductColor = (color: string | null) => {
    if (activeTab === "admin") {
      setAdminProductColor(color);
      if (color) {
        localStorage.setItem("adminProductColor", color);
      } else {
        localStorage.removeItem("adminProductColor");
      }
    } else {
      setSuperAdminProductColor(color);
      if (color) {
        localStorage.setItem("superAdminProductColor", color);
      } else {
        localStorage.removeItem("superAdminProductColor");
      }
    }
  };
  // Load admin colors from localStorage or use defaults
  const [adminColors, setAdminColors] = useState<string[]>(() => {
    // Only run in client-side
    if (typeof window !== "undefined") {
      const savedColors = localStorage.getItem("adminColors");
      return savedColors ? JSON.parse(savedColors) : defaultColors;
    }
    return defaultColors;
  });
  // Save admin colors to localStorage when they change
  useEffect(() => {
    localStorage.setItem("adminColors", JSON.stringify(adminColors));
  }, [adminColors]);

  // Product state
  const [productColor, setProductColor] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<"super-admin" | "admin">(
    "super-admin"
  );

  // Applied color state
  const [isColorApplied, setIsColorApplied] = useState(false);

  const handleGridColorSelect = (color: string) => {
    // Same pattern as handleColorSelect
    if (activeTab === "admin") {
      setAdminSelectedColor(color);
    } else {
      setSuperAdminSelectedColor(color);
    }

    const finalColor =
      colorOpacity < 100
        ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${colorOpacity / 100})`
        : color;

    setCurrentProductColor(finalColor);
    const colorKey =
      activeTab === "admin" ? "adminProductColor" : "superAdminProductColor";
    localStorage.setItem(colorKey, finalColor);
    localStorage.setItem("appliedProductColor", finalColor);
  };
  // Initialize product from URL params
  useEffect(() => {
    const product = searchParams.get("product");
    if (product && products[product]) {
      setProductId(product);
    } else {
      // Try getting from localStorage if not in URL
      const storedProduct = localStorage.getItem("selectedProduct");
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const adminColor = localStorage.getItem("adminProductColor");
    if (adminColor) {
      setAdminProductColor(adminColor);
    }

    const superAdminColor = localStorage.getItem("superAdminProductColor");
    if (superAdminColor) {
      setSuperAdminProductColor(superAdminColor);
    }

    // Set the initial applied color based on active tab
    const initialColorKey =
      activeTab === "admin" ? "adminProductColor" : "superAdminProductColor";
    const initialColor = localStorage.getItem(initialColorKey);
    if (initialColor) {
      localStorage.setItem("appliedProductColor", initialColor);
    }
  }, []);

  // Add color from super admin to admin panel
  const addColorToAdminPanel = () => {
    if (!adminColors.includes(superAdminSelectedColor)) {
      const newColors = [...adminColors, superAdminSelectedColor];
      setAdminColors(newColors);
      console.log(
        "Added color:",
        superAdminSelectedColor,
        "New colors:",
        newColors
      );
    } else {
      console.log(
        "Color already exists in admin panel:",
        superAdminSelectedColor
      );
      toast.error("Color already exists in admin panel");
    }
  };

  // Remove color from admin panel
  const removeColorFromAdminPanel = () => {
    const currentColor = getSelectedColor();
    if (adminColors.includes(currentColor)) {
      const newColors = adminColors.filter((color) => color !== currentColor);
      setAdminColors(newColors);

      if (newColors.length > 0) {
        // Select the first available color in the updated list
        if (activeTab === "admin") {
          setAdminSelectedColor(newColors[0]);
        } else {
          setSuperAdminSelectedColor(newColors[0]);
        }
      } else {
        // If no colors left, set to a default color
        if (activeTab === "admin") {
          setAdminSelectedColor("#000000");
        } else {
          setSuperAdminSelectedColor("#000000");
        }
      }
    } else {
      console.log("Color not found in admin panel:", currentColor);
    }
  };

  // Convert hex to rgba for opacity
  const getColorWithOpacity = () => {
    const currentColor = getSelectedColor();
    const r = parseInt(currentColor.slice(1, 3), 16);
    const g = parseInt(currentColor.slice(3, 5), 16);
    const b = parseInt(currentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${colorOpacity / 100})`;
  };

  // function to reset product color
  const resetProductColor = () => {
    setCurrentProductColor(null);

    const colorKey =
      activeTab === "admin" ? "adminProductColor" : "superAdminProductColor";
    localStorage.removeItem(colorKey);
    localStorage.setItem("appliedProductColor", "");

    if (showColorPanel) {
      setShowColorPanel(false);
    }

    console.log("Product color reset for", activeTab);
  };
  // Handle slider change for opacity
  const handleOpacityChange = (value: number) => {
    setColorOpacity(value);
  };

  // Redirect to PreviewProduct with color info once applied
  useEffect(() => {
    if (isColorApplied && productId) {
      localStorage.setItem("designColor", productColor || "");
      // Reset the flag
      setIsColorApplied(false);
    }
  }, [isColorApplied, productColor, productId]);

  const previewColor =
    colorOpacity < 100 ? getColorWithOpacity() : getSelectedColor();
  const displayColorText = getSelectedColor();
  useEffect(() => {
    // When tab changes, update the displayed color
    const colorKey =
      activeTab === "admin" ? "adminProductColor" : "superAdminProductColor";
    const storedColor = localStorage.getItem(colorKey);

    if (storedColor) {
      // Update the applied color in localStorage for the ProductColorPreview component
      localStorage.setItem("appliedProductColor", storedColor);
    } else {
      localStorage.removeItem("appliedProductColor");
    }

    // Trigger a custom event to notify components of color change
    const colorEvent = new Event("productColorChanged");
    window.dispatchEvent(colorEvent);
  }, [activeTab]);

  return (
    <div className="container mx-auto p-4">
      {/*tabs */}

      {/* Super Admin Panel Content */}
      {activeTab === "super-admin" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Product Display */}
            <div className="lg:col-span-1 rounded-lg p-4 h-[40vh] lg:h-[50vh] flex items-center justify-center bg-gray-50 mb-[4vh]">
              {productId && <ProductColorPreview color={productColor} />}
            </div>

            {/* Advanced Color Selection */}
            <div className="lg:col-span-2 rounded-lg p-4 lg:p-5 bg-white shadow-sm border">
              {/* Color Picker */}
              <div className="mb-4">
                {/* Color grid */}
                <div className="rounded mb-3">
                  <div className="flex w-full">
                    {grayScaleColors.map((color, index) => (
                      <div
                        key={`gray-${index}`}
                        className={`h-4 lg:h-5 w-2 flex-1 cursor-pointer ${superAdminSelectedColor === color ? "ring-2 ring-white ring-inset" : ""}`}
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
                          className={`h-5 lg:h-6 w-2 flex-1 cursor-pointer ${superAdminSelectedColor === color ? "ring-1 ring-white ring-inset" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleGridColorSelect(color)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Selected color highlight outline */}
                {superAdminSelectedColor && (
                  <div className="relative">
                    <div
                      className="absolute pointer-events-none border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: "24px",
                        height: "24px",
                        top: "50%",
                        left: "50%",
                        zIndex: 10,
                        display: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Opacity Control - Further reduced width */}
              <div className="mb-4">
                <label className="block text-blue-600 text-sm font-medium mb-2">
                  OPACITY
                </label>

                <div className="flex items-center space-x-3 w-full">
                  {/* Alpha Slider Component - Smaller width */}
                  <div className="flex-grow">
                    <AlphaSlider
                      color={superAdminSelectedColor}
                      value={colorOpacity}
                      onChange={handleOpacityChange}
                    />
                  </div>

                  {/* Percentage Display */}
                  <div className="bg-blue-600 rounded-lg p-1 h-7 w-12 text-center flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {colorOpacity}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Colors Display - More compact */}
              <div className="mb-4">
                <div className="flex bg-gray-100 rounded-lg p-3 max-w-2xl">
                  {/*  Selected color display */}
                  <div className="w-24 lg:w-28 p-2 rounded-lg mr-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-12 lg:h-14 w-12 lg:w-14 rounded shadow-md mb-1"
                        style={{ backgroundColor: previewColor }}
                      />
                      <span className="text-xs text-gray-800 text-center break-all leading-tight">
                        {displayColorText}
                      </span>
                    </div>
                  </div>

                  {/* Color grid - More compact */}
                  <div className="flex-1 p-2 rounded-lg">
                    <div className="grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 max-h-20 overflow-y-auto p-1">
                      {adminColors.map((color, index) => (
                        <div
                          key={index}
                          className={`h-6 w-6 sm:m-2 rounded-full cursor-pointer ${superAdminSelectedColor === color ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleGridColorSelect(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - More compact */}
              <div className="flex space-x-3 max-w-md">
                <button
                  onClick={addColorToAdminPanel}
                  className="flex justify-center items-center w-28 lg:w-32 text-white bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full transition-colors"
                >
                  <h1 className="text-sm font-medium">{t("add")}</h1>
                </button>
                <button
                  onClick={removeColorFromAdminPanel}
                  className="flex justify-center items-center w-28 lg:w-32 text-white bg-[#DC060A] hover:bg-red-800 p-2.5 rounded-full transition-colors"
                >
                  <h1 className="text-sm font-medium">{t("remove")}</h1>
                </button>
                {/* Reset Color Button */}
              </div>
              {/* <button
              onClick={resetProductColor}
              className="flex justify-center items-center text-gray-700 bg-gray-200 hover:bg-gray-300 p-3 rounded-full"
            >
              {t("resetColor")}
            </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
