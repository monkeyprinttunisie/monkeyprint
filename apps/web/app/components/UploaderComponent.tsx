"use client";
import React, { useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import Image from "next/image";
import type { OurFileRouter } from "@/api/uploadthing/core";
import { useTranslations } from "next-intl";

interface UploadResponse {
    ufsUrl: string;
}
interface UploaderComponentProps {
    handleUploadComplete: (res: UploadResponse[]) => void;
}
export default function UploaderComponent({ handleUploadComplete }: UploaderComponentProps) {
    const t = useTranslations("RecentUploads");
    const [imageUrl, setImageUrl] = useState<string>("");
    const apiKey = process.env.UPLOADTHING_TOKEN;
    const appId = process.env.UPLOADTHING_APP_ID;
    const regions = process.env.UPLOADTHING_REGIONS?.split(",") || ["us", "eu"];

    const tokenData = {
        apiKey,
        appId,
        regions,
    };

    const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString("base64");

    const handleUploadError = (error: any) => {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error.message}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
            <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-md ">
                <h2 className="text-2xl  text-blue-600 text-center">{t("upload")}</h2>

                <div className="mt-6 border-none ">
                    <UploadDropzone<OurFileRouter, "productImage">
                        className="border-none"
                        endpoint="productImage"
                        headers={{
                            Authorization: `Bearer ${encodedToken}`,
                        }}
                        onClientUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                        content={{
                            uploadIcon: (
                                <img
                                    src="/icons/upload.svg"
                                    alt="Upload"
                                    className="mx-auto block h-12 w-12 align-middle"
                                />
                            ),

                        }}

                    />

                    <style jsx global>{`
  /* Target the upload button */
  [data-ut-element="button"],
  [data-ut-element="button"][data-state="ready"],
  [data-ut-element="button"][data-state="readying"] {
    margin-top: 1rem;
    height: 2.5rem;
    width: 9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 9999px !important; /* Fully rounded */
    border: none;
    font-size: 1rem;
    color: white;
    background-color: #2563eb !important; /* blue-600 */
  }

  /* Add focus and state styling */
  [data-ut-element="button"]:focus-within {
    ring: 2px;
    ring-color: #2563eb;
    ring-offset: 2px;
  }

  /* Disabled states */
  [data-ut-element="button"][data-state="disabled"],
  [data-ut-element="button"][data-state="readying"] {
    cursor: not-allowed;
    background-color: #60a5fa !important; /* blue-400 */
  }

  /* Progress bar */
  [data-ut-element="button"]::after {
    position: absolute;
    left: 0;
    height: 100%;
    width: var(--progress-width);
    background-color: #2563eb;
    transition: width 500ms;
    content: '';
  }
`}</style>



                    {imageUrl && (
                        <div className="mt-4 w-full  rounded-lg shadow-md">
                            <Image src={imageUrl} alt="Uploaded Image" width={500} height={300} className="w-full h-auto object-contain" />
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
