"use client";
import UploaderComponent from "@/components/UploaderComponent";
import { useSearchParams } from "next/navigation";
import useImageStore from "@/store/imageStore";
import { useState, useEffect } from "react";
interface UploadResponse {
    ufsUrl: string;
}

export default function Page() {
    const { images, addImage } = useImageStore();
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

    const handleUploadComplete = (res: UploadResponse[]) => {
        if (res && res.length > 0) {
            const uploadedFile = res[0];
            if (uploadedFile.ufsUrl) {
                addImage(uploadedFile.ufsUrl); 
                if (selectedProduct) {
                    window.location.href = `/designer_tool/products/previewProduct?product=${selectedProduct}&image=${encodeURIComponent(uploadedFile.ufsUrl)}`;
                } else {
                    alert("Please select a product first");
                }
            }
        }
    };


    return <UploaderComponent handleUploadComplete={handleUploadComplete} />;
}
