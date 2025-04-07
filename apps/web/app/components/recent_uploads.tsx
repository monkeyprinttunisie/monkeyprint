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
            
            // Dispatch storage event to notify other components
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('storage'));
            }
            // Navigate to preview with the first selected image as parameter
            router.push(`/designer_tool/products/previewProduct?product=${selectedProduct}&image=${encodeURIComponent(selectedImages[0])}`);
        } catch (error) {
            console.error("Error applying selected images:", error);
            alert("An error occurred while applying your selection. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center w-full bg-gray-50 py-4 px-6">
            <h1 className="text-2xl font-bold mb-4 text-blue-600">{t("title")}</h1>

            <div className="w-full max-w-2xl overflow-y-auto max-h-[300px] mb-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer relative group bg-white p-3 rounded-lg shadow-md ${selectedIndices.includes(index)}`}
                                onClick={() => handleImageClick(index)}
                            >
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
            </div>

            {/* Apply button - fixed at the bottom of the screen */}
            {images.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center p-16   z-10">
                    <button
                        onClick={handleApplyClick}
                        disabled={selectedIndices.length === 0}
                        className={`py-2 px-6 rounded-full text-white font-medium shadow-lg transition-all
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
