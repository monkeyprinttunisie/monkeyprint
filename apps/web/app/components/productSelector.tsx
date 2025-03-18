import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import IconButton from "@/components/iconButton";
import { useTranslations } from "next-intl";
import { products } from "@/productOptions"
interface ProductSelectorProps {
    onButtonClick: (link: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onButtonClick }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [activeLink, setActiveLink] = useState<string>("");

    const toggleOptions = () => setIsOpen(prev => !prev);

    const t = useTranslations("HomePage");


    const handleProductClick = (productId: string) => {
        setSelectedProduct(productId);
        console.log("Product ID is", productId);
        onButtonClick(productId);
        localStorage.setItem('selectedProduct', productId);  // Save selected product to localStorage
    };
    const handleDoubleClick = (productId: string) => {
        window.location.href = `/designer_tool/products/previewProduct?product=${productId}`;
    };

    const handleLinkClick = (link: string) => {
        setActiveLink(link);
    };

    useEffect(() => {
        const storedProduct = localStorage.getItem('selectedProduct');
        if (storedProduct) {
            setSelectedProduct(storedProduct);  // Restore selected product from localStorage
        }
    }, []);

    return (
        <div className="fixed rounded-lg shadow-lg border border-gray-200 overflow-hidden bottom-[9.5vh] w-[100vw]">
            <button
                onClick={toggleOptions}
                className="w-full flex items-center justify-center text-gray-700 font-semibold bg-[#004CFF] hover:bg-blue-200 transition"
            >
                <img src="/icons/slide.svg" alt="Choose Product" className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-blue-50 px-4 overflow-hidden"
                    >
                        <h1 className="text-center text-[#004CFF] mt-3 font-inter">{t("designer_tool")}</h1>

                        <div className="pt-2 pb-3 flex  h-[10vh] mt-1 overflow-x-auto w-full ">
                            {/* Button 1: tshirt */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex  items-center justify-center"
                            >

                                <IconButton
                                    iconSrc="/icons/tshirt.svg"
                                    altText="T-shirt Icon"
                                    onClick={() => handleProductClick('tshirt')}
                                    onDoubleClick={() => handleDoubleClick('tshirt')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "tshirt"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}

                                />
                            </motion.div>

                            {/* Button 2: hoodie */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/hoodie.svg"
                                    altText="Hoodie Icon"
                                    onClick={() => handleProductClick('hoodie')}
                                    onDoubleClick={() => handleDoubleClick('hoodie')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "hoodie"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>

                            {/* Button 3: mug */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/mug.svg"
                                    altText="Mug Icon"
                                    onClick={() => handleProductClick('mug')}
                                    onDoubleClick={() => handleDoubleClick('mug')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "mug"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>

                            {/* Button 4: casque */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/casque.svg"
                                    altText="Casque Icon"
                                    onClick={() => handleProductClick('casque')}
                                    onDoubleClick={() => handleDoubleClick('casque')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "casque"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/casque.svg"
                                    altText="Casque Icon"
                                    onClick={() => handleProductClick('casque')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "casque"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/casque.svg"
                                    altText="Casque Icon"
                                    onClick={() => handleProductClick('casque')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "casque"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/casque.svg"
                                    altText="Casque Icon"
                                    onClick={() => handleProductClick('casque')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "casque"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/casque.svg"
                                    altText="Casque Icon"
                                    onClick={() => handleProductClick('casque')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full mr-[4vw] ${selectedProduct === "casque"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center"
                            >
                                <IconButton
                                    iconSrc="/icons/casque.svg"
                                    altText="Casque Icon"
                                    onClick={() => handleProductClick('casque')}
                                    classN={`w-9 h-9 flex items-center justify-center rounded-full  mr-[4vw]${selectedProduct === "casque"
                                        ? "border-2 border-[#004CFF]"
                                        : ""
                                        }`}
                                />
                            </motion.div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/*  the Product Info (Global Overlay) */}
            {selectedProduct && (
                <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50 mb-[40vh]">
                    <div className="flex flex-col items-center  p-6 bg-white  rounded-lg max-w-md mx-auto">
                        <h2 className="text-lg font-semibold mb-4">
                            You selected: {selectedProduct}
                        </h2>
                        <h1>{products[selectedProduct].description} </h1>
                        <Link href={`/designer_tool/products/previewProduct?product=${selectedProduct}`}>
                            <button className="bg-blue-500 text-white text-xs p-[5vw]  py-2 rounded-full bg-gradient-to-r from-[#004CFF] to-[#3471FF] mt-[15vh]">
                                Edit
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSelector;
