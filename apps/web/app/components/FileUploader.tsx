"use client";
import React, { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/api/uploadthing/core";
import { toast } from "react-hot-toast";

interface UploadResponse {
  ufsUrl: string;
  url: string;
}

interface UploaderProps {
  handleUploadComplete: (res: UploadResponse[]) => void;
  buttonText?: string;
}

export default function Uploader({
  handleUploadComplete,
  buttonText = "Change Image",
}: UploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const apiKey = process.env.UPLOADTHING_TOKEN;
  const appId = process.env.UPLOADTHING_APP_ID;
  const regions = process.env.UPLOADTHING_REGIONS?.split(",") || ["us", "eu"];

  const tokenData = {
    apiKey,
    appId,
    regions,
  };

  const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString(
    "base64"
  );

  const handleUploadError = (error: any) => {
    console.error("Upload error:", error);
    toast.error(`Upload failed: ${error.message || "Unknown error"}`);
    setUploadProgress(null);
  };

  return (
    <div className="inline-flex">
      <UploadButton<OurFileRouter, "productImage">
        endpoint="productImage"
        headers={{
          Authorization: `Bearer ${encodedToken}`,
        }}
        onClientUploadComplete={(res) => {
          if (res && res.length > 0) {
            handleUploadComplete(res);
            setUploadProgress(null);
            toast.success("Image uploaded successfully!");
            console.log("Upload complete response:", res); // Add this for debugging
          }
        }}
        onUploadError={handleUploadError}
        onUploadProgress={(progress) => {
          console.log("Upload progress:", progress);
          setUploadProgress(progress);
        }}
        content={{
          button({ ready }) {
            return (
              <span className="flex items-center">
                {uploadProgress !== null ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading {uploadProgress}%
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {buttonText}
                  </>
                )}
              </span>
            );
          },
          allowedContent() {
            return null; // Hide allowed content text
          },
        }}
      />

      <style jsx global>{`
        /* Button styling */
        [data-ut-element="button"],
        [data-ut-element="button"][data-state="ready"],
        [data-ut-element="button"][data-state="readying"] {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          background-color: transparent !important;
          color: inherit;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition-property:
            color, background-color, border-color, box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          height: auto;
          width: auto;
        }

        [data-ut-element="button"]:hover {
          background-color: #f8fafc !important;
        }

        /* Hide unnecessary elements */
        [data-ut-element="container"] {
          position: relative !important;
          width: auto !important;
          height: auto !important;
        }

        [data-ut-element="allowed-content"] {
          display: none !important;
        }

        [data-ut-element="container"] > p {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
