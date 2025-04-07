"use client";
import UploaderComponent from "@/components/UploaderComponent";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import useImageStore from "@/store/imageStore";
import { useState, useEffect } from "react";
import { products } from "@/productOptions";
import RecentUploads from "@/components/recent_uploads";
interface UploadResponse {
    ufsUrl: string;
}

export default function Page() {
    const { images, addImage } = useImageStore();
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const zoneId = searchParams.get("zoneId");
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        if (productId) {
            setSelectedProduct(productId);

            // Set active zone from URL or use default
            if (zoneId && products[productId]?.designZones?.front?.some(z => z.id === zoneId)) {
                setActiveZoneId(zoneId);
            } else if (products[productId]?.designZones?.front?.[0]) {
                setActiveZoneId(products[productId].designZones.front[0].id);
            }
        }
        else if (isClient) {
            const storedProduct = localStorage.getItem('selectedProduct');
            if (storedProduct) {
                setSelectedProduct(storedProduct);

                // Set default zone for stored product
                if (products[storedProduct]?.designZones?.front?.[0]) {
                    setActiveZoneId(products[storedProduct].designZones.front[0].id);
                }
            }
        }
    }, [productId, zoneId, isClient]);

    const handleUploadComplete = (res: UploadResponse[]) => {
        if (!res || res.length === 0) return;

        const uploadedFile = res[0];
        if (!uploadedFile.ufsUrl || !selectedProduct) {
            if (!selectedProduct) alert("Please select a product first");
            return;
        }

        // Add image to store
        addImage(uploadedFile.ufsUrl);

        // Set these localStorage values to make the image display immediately
        const targetZoneId = activeZoneId ||
            (products[selectedProduct]?.designZones?.front?.[0]?.id || null);

        // Method 1: Set selectedImages for previewProduct to detect
        localStorage.setItem("selectedImages", JSON.stringify([uploadedFile.ufsUrl]));
        localStorage.setItem("createNewDesign", "false");

        // Method 2: Also pass via URL for direct loading
        const zoneParam = targetZoneId ? `&zoneId=${targetZoneId}` : '';
        localStorage.setItem("activeNavLink", "products");

        router.push(
            `/designer_tool/products/previewProduct?product=${selectedProduct}&image=${encodeURIComponent(uploadedFile.ufsUrl)}${zoneParam}`
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="flex-grow justify-center items-center pt-12 m-2 ">
                <UploaderComponent handleUploadComplete={handleUploadComplete} />
            </div>
            <div className="w-full px-4 py-6  ">
                <RecentUploads />
            </div>
        </div>
    );
}