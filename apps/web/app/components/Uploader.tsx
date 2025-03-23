"use client";
import React, { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/api/uploadthing/core";

interface UploadResponse {
  ufsUrl: string;
}

interface UploaderProps {
  handleUploadComplete: (res: UploadResponse[]) => void;
}

export default function Uploader({
  handleUploadComplete,
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
    alert(`Upload failed: ${error.message}`);
  };

  return (
    <div className="mt-[2.8vh] border-none flex flex-col items-start">
      <div className="relative w-[6.5rem] h-[6.5rem]">
        <UploadButton<OurFileRouter, "productImage">
          className="border-none"
          endpoint="productImage"
          headers={{
            Authorization: `Bearer ${encodedToken}`,
          }}
          onClientUploadComplete={(res) => {
            handleUploadComplete(res);
            setUploadProgress(null);
          }}
          onUploadError={handleUploadError}
          onUploadProgress={(progress) => {
            console.log("Upload progress:", progress);
            setUploadProgress(progress);
          }}
        />

        {uploadProgress !== null && (
          <div className="absolute top-0 -translate-y-[2px] -left-0.5 w-[6.8rem] h-[6.8rem] flex flex-col items-center justify-center bg-white bg-opacity-60 rounded-full ">
            <div className="w-12 h-12 relative">
              {/* Circular progress indicator */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-300"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-blue-500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (uploadProgress / 100) * 264}
                />
              </svg>

              {/* Percentage text in the middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-500 text-sm font-semibold">
                  {uploadProgress}%
                </span>
              </div>
            </div>
            <p className="text-white text-xs mt-1">Uploading...</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Target the upload button */
        [data-ut-element="button"],
        [data-ut-element="button"][data-state="ready"],
        [data-ut-element="button"][data-state="readying"] {
          margin-top: 0rem;
          height: 6.5rem;
          width: 6.5rem;
          background-image: url("/icons/UploadPhotoButton.svg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: transparent !important;
        }

        /* Force correct positioning of the container */
        [data-ut-element="container"] {
          position: static !important;
          width: 6.5rem !important;
          height: 6.5rem !important;
        }

        [data-ut-element="allowed-content"] {
          display: none;
        }
        [data-ut-element="container"] > p {
          display: none;
        }
      `}</style>
    </div>
  );
}
