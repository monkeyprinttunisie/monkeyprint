"use client";

import { useEffect, useState, use } from "react"; // Add 'use' import
import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/addToCartButton";
import { useProductStore } from "@/store/useProductStore";
import { Product } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
export default function ProductDetail({ params }: { params: Promise<{ id: string }> } ) {
    const t= useTranslations("ProductDetail");
    const router = useRouter();
    const products = useProductStore((state) => state.products);
    const loadProducts = useProductStore((state) => state.loadProducts);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = use(params); 

    useEffect(() => {
        const fetchProduct = async () => {
            // If products aren't loaded yet, load them
            if (products.length === 0) {
                await loadProducts();
            }

            // Find the product with matching ID using the unwrapped id
            const foundProduct = products.find(p => p.id === id);
            setProduct(foundProduct || null);
            setLoading(false);
        };

        fetchProduct();
    }, [id, products, loadProducts]); 
    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-4">
                <button
                    onClick={handleBack}
                    className="flex items-center mb-4 text-gray-600"
                >
                    <ArrowLeft size={20} />
                    <span className="ml-1">{t("back")}</span>
                </button>
                <div className="text-center py-8 text-gray-500">
                    {t("productNotFound")}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white pb-15 min-h-screen">
            <div className="p-4">
                {/* Back button */}
                <button
                    onClick={handleBack}
                    className="flex items-center mb-4 text-gray-600"
                >
                    <ArrowLeft size={20} />
                    <span className="ml-1">{t("back")}</span>
                </button>

                {/* Product image */}
                <div className="p-2 bg-white shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[12px] mb-4">
                    <img
                        className="w-full h-[40vh] rounded-[9px] object-cover"
                        src={product.imageUrl}
                        alt={product.name}
                    />
                </div>

                {/* Product details */}
                <div className="mt-4">
                    <h1 className="font-raleway font-bold text-[24px] text-gray-800 mb-2">
                        {product.name}
                    </h1>

                    <div className="flex items-center justify-between mb-4">
                        <p className="font-raleway font-bold text-[22px] text-gray-800">
                            {product.price.toFixed(2)}dt
                        </p>
                        <AddToCartButton product={product} />
                    </div>

                    {/* Product description - KEEP ONLY THIS ONE */}
                    <div className="mt-6 border-t pt-4">
                        <h2 className="font-raleway font-bold text-[18px] text-gray-800 mb-2">
                            {t("description")}
                        </h2>

                        {product.description ? (
                            <div className=" p-4 ">
                                <p className="font-nunito text-gray-600 text-[16px] leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic font-nunito">
                                {t("noDescription")}
                            </p>
                        )}
                    </div>

                    {/* Categories */}
                    {product.categories && product.categories.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-raleway font-bold text-[16px] text-gray-800 mb-2">
                                {t("categories")}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {product.categories.map(cat => (
                                    <span
                                        key={cat.categoryId}
                                        className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-sm"
                                    >
                                        {cat.category.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}