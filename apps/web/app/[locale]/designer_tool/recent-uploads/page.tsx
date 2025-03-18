"use client";
import useImageStore from "@/store/imageStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RecentUploads() {
    const { images } = useImageStore();
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");

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

    const handleImageClick = (imageUrl: string) => {
        if (selectedProduct) {
            window.location.href = `/designer_tool/products/previewProduct?product=${selectedProduct}&image=${encodeURIComponent(imageUrl)}`;
        } else {
            alert("Please select a product first");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-12 px-6">
            <h1 className="text-3xl font-bold mb-6">Recent Uploads</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div
                            key={index}
                            className="cursor-pointer relative group"
                            onClick={() => handleImageClick(image)}
                        >
                            <Image
                                src={image}
                                alt={`Uploaded Image ${index}`}
                                width={200}
                                height={200}
                                className="rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-lg"></div>
                        </div>
                    ))
                ) : (
                    <p>No images uploaded yet</p>
                )}
            </div>
        </div>
    );
}