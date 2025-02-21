"use client";
import React from "react";
import { UploadDropzone } from "@/uploadthing";
import Image from "next/image";

export default function Home() {
  const [imageData, setImageData] = React.useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    e.productImage = imageData;
  };

  // fetch data from .env file
  const apiKey = process.env.UPLOADTHING_TOKEN;
  const appId = process.env.UPLOADTHING_APP_ID;
  const regions = process.env.UPLOADTHING_REGIONS?.split(",") || ["us", "eu"];

  const tokenData = {
    apiKey: apiKey,
    appId: appId,
    regions: regions,
  };

  console.log("Token Data:", tokenData);

  // converting into base64 using Buffer
  const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString(
    "base64",
  );

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            UploadThing File Upload!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Upload your product image below.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-600">
                Attach Image
              </label>
              {imageData && (
                <button
                  type="button"
                  onClick={() => setImageData("")}
                  className="py-1 px-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  + Edit Image
                </button>
              )}
            </div>

            {imageData ? (
              <div className="w-full overflow-hidden rounded-lg shadow-md">
                <Image
                  src={imageData}
                  alt="productImage"
                  width={1000}
                  height={100}
                  className="w-full h-auto max-h-[300px] object-contain sm:h-[250px]"
                />
              </div>
            ) : (
              <UploadDropzone
                endpoint="productImage"
                headers={{
                  Authorization: `Bearer ${encodedToken}`, // Pass the token as an Authorization header
                }}
                onClientUploadComplete={(res: any) => {
                  console.log("Upload successful:", res); // Debug log
                  if (res && res.length > 0) {
                    setImageData(res[0].url);
                    window.alert("Upload completed");
                  } else {
                    console.error("Upload response is empty:", res);
                  }
                }}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                  window.alert(`Upload failed: ${error.message}`);
                  console.log(
                    "UPLOADTHING_SECRET:",
                    process.env.UPLOADTHING_TOKEN,
                  );
                }}
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded-full font-semibold shadow-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Upload
          </button>
        </form>
      </div>
    </main>
  );
}
