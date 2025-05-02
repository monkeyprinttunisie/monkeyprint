"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUploadThing } from "@/uploadthing";

interface ChatImageUploaderProps {
  onUploadComplete: (url: string) => void;
}

const ChatImageUploader: React.FC<ChatImageUploaderProps> = ({
  onUploadComplete,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { startUpload } = useUploadThing("productImage");

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

  // Simulate upload progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    if (isUploading && uploadProgress < 95) {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          // Progress algorithm: faster at start, slower toward end
          const increment = Math.max(1, Math.floor((100 - prev) / 10));
          return Math.min(95, prev + increment);
        });
      }, 300);
    } else if (!isUploading) {
      setUploadProgress(0);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isUploading, uploadProgress]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setCapturedFile(file);
    setPhotoTaken(true);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCapturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create video element to show stream
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas to capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw video frame to canvas
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Stop video stream
      stream.getTracks().forEach((track) => track.stop());

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
      });

      // Create a File from the blob
      const file = new File([blob], "camera-capture.jpg", {
        type: "image/jpeg",
      });

      // Create preview and store the file (but don't upload yet)
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setCapturedFile(file);
      setPhotoTaken(true);
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert(
        "Could not access camera. Please make sure camera permissions are granted."
      );
    }
  };

  const handleRetake = () => {
    // Reset state
    setPreviewUrl(null);
    setCapturedFile(null);
    setPhotoTaken(false);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (!capturedFile) {
      console.error("No file to upload");
      setUploadError("No file to upload. Please capture a photo first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    // Set a timeout to prevent hanging uploads
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }

    uploadTimeoutRef.current = setTimeout(() => {
      if (isUploading) {
        setIsUploading(false);
        setUploadError("Upload timed out. Please try again.");
        console.error("Upload timed out after 30 seconds");
      }
    }, 30000); // 30 second timeout

    try {
      const uploadResult = await startUpload([capturedFile]);

      if (uploadResult && uploadResult[0]?.url) {
        const imageUrl = uploadResult[0].url;
        console.log("Upload successful, image URL:", imageUrl);

        // Complete the progress bar
        setUploadProgress(100);

        // Small delay to show 100% complete before hiding
        setTimeout(() => {
          // Pass the URL directly to the handler
          onUploadComplete(imageUrl);
        }, 300);
      } else {
        throw new Error("Upload completed but no URL returned");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      // Clear the timeout
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
        uploadTimeoutRef.current = null;
      }

      // Set uploading to false after a small delay to show 100% complete
      setTimeout(() => {
        setIsUploading(false);
      }, 300);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Initial buttons - only show if no photo is taken yet */}
      {!photoTaken && (
        <div className="flex space-x-2">
          <button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upload Image
          </button>

          <button
            onClick={handleCapturePhoto}
            disabled={isUploading}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Take Photo
          </button>
        </div>
      )}

      {/* Loading indicator with percentage */}
      {isUploading && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
          {uploadError}
        </div>
      )}

      {/* Preview and action buttons */}
      {photoTaken && previewUrl && (
        <div>
          <div className="mt-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-60 rounded-md object-cover"
            />
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 mt-3">
            <button
              onClick={handleRetake}
              disabled={isUploading}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center justify-center"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retake Photo
            </button>

            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-md flex items-center justify-center"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Submit Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatImageUploader;
