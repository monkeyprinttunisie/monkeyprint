"use client";
import React, { useState } from "react";
import { UploadDropzone } from "@/uploadthing";
import Image from "next/image";
import { createProduct } from "@/actions/productActions";

const AddProduct: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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

  const handleUploadComplete = async (res: any) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0];

      if (uploadedFile && uploadedFile.ufsUrl) {
        const ufsUrl = uploadedFile.ufsUrl;

        setImageUrl(ufsUrl);

        try {
          setIsLoading(true);
          const response = await createProduct({
            name,
            description,
            price: Number(price),
            imageUrl: ufsUrl,
          });
          setIsLoading(false);
          if (response.success) {
            setName("");
            setPrice("");
            setDescription("");
            setImageUrl("");
            alert("Image data stored");
          } else {
            console.error("Failed to save product");
          }
        } catch (error) {
          console.error("Error while saving the product:", error);
        }
      } else {
        console.error("Uploaded file object or ufsUrl is missing");
      }
    } else {
      console.error("Upload response is empty or malformed");
    }
  };

  const handleUploadError = (error: any) => {
    console.error("Image Upload Error:", error);
  };

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="btn" onClick={handleModal}>
        Add New Product
      </button>

      <div className={isOpen ? "modal modal-open" : "modal"}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add New Product</h3>
          <form>
            <div className="form-control w-full">
              <label className="label font-bold">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered"
                placeholder="Product Name"
              />
            </div>
            <div className="form-control w-full">
              <label className="label font-bold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input-bordered"
                placeholder="Product Description"
              />
            </div>
            <div className="form-control w-full">
              <label className="label font-bold">Price</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input input-bordered"
                placeholder="Price"
              />
            </div>

            <div className="form-control w-full">
              <label className="label font-bold">Product Image</label>
              <UploadDropzone
                endpoint="productImage"
                headers={{
                  Authorization: `Bearer ${encodedToken}`,
                }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
              {imageUrl && (
                <div className="w-full overflow-hidden rounded-lg shadow-md mt-4">
                  <Image
                    src={imageUrl}
                    alt="Product Image"
                    width={1000}
                    height={300}
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              )}
            </div>

            <div className="modal-action">
              {isLoading && (
                <button type="button" className="btn loading">
                  Saving...
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AddProduct;