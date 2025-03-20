"use client";
import useImageStore from "@/store/imageStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RecentUploads() {
    const { images } = useImageStore();
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const t = useTranslations("RecentUploads");

    useEffect(() => {
        if (productId) {
            setSelectedProduct(productId);
        }
        else {
            const storedProduct = localStorage.getItem('selectedProduct');
            if (storedProduct) {
                setSelectedProduct(storedProduct);
            }
        }
    }, [productId]);

    const handleImageClick = (index: number) => {
        setSelectedIndices(prev => {
            // If already selected, remove from selection
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            // Otherwise add to selection
            else {
                return [...prev, index];
            }
        });
    };

    const handleApplyClick = () => {
        if (!selectedProduct) {
            alert("Please select a product first");
            return;
        }

        if (selectedIndices.length === 0) {
            alert("Please select at least one image");
            return;
        }

        try {
            // Get selected images
            const selectedImages = selectedIndices.map(index => images[index]);

            // Store selected images in localStorage
            localStorage.setItem("selectedImages", JSON.stringify(selectedImages));

            // Always append to existing design
            localStorage.setItem("createNewDesign", "false");

            // Set active nav link
            localStorage.setItem("activeNavLink", "products");

            // Navigate to preview with the first selected image as parameter
            router.push(`/designer_tool/products/previewProduct?product=${selectedProduct}&image=${encodeURIComponent(selectedImages[0])}`);
        } catch (error) {
            console.error("Error applying selected images:", error);
            alert("An error occurred while applying your selection. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-12 px-6 pb-28">
            <h1 className="text-2xl font-bold mb-6 text-blue-600">{t("title")}</h1>

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-20">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer relative group bg-white p-3 rounded-lg shadow-md ${selectedIndices.includes(index)}`}
                            onClick={() => handleImageClick(index)}
                        >
                            {/* Fixed aspect ratio container for consistent sizing */}
                            <div className="relative aspect-square w-full overflow-hidden rounded-md">
                                <Image
                                    src={image}
                                    alt={`Uploaded Image ${index}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-contain transition-all duration-300"
                                    style={{ objectFit: "contain" }}
                                />

                                {/* Darker overlay for selected image */}
                                <div
                                    className={`absolute inset-0 bg-black transition-opacity duration-300
                                    ${selectedIndices.includes(index) ? 'opacity-30' : 'opacity-0 group-hover:opacity-10'}`}
                                >
                                </div>

                                {/* Checkmark for selected image */}
                                {selectedIndices.includes(index) && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center p-8 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500 mb-4">{t("no_uploads")}</p>
                        <button
                            onClick={() => router.push('/designer_tool/upload')}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full transition-colors"
                        >
                            {t("upload")}
                        </button>
                    </div>
                )}
            </div>

            {/* Apply button fixed at the bottom */}
            {images.length > 0 && (
                <div className="fixed bottom-20 left-0 right-0 flex justify-center p-4 z-40">
                    <button
                        onClick={handleApplyClick}
                        disabled={selectedIndices.length === 0}
                        className={`py-3 px-8 rounded-full text-white font-medium shadow-lg transition-all
                                ${selectedIndices.length !== 0
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        {t("apply")} {selectedIndices.length > 0 ? `(${selectedIndices.length})` : ''}
                    </button>
                </div>
            )}
        </div>
    );
}
