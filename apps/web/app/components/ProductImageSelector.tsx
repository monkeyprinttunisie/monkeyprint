"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { listProductsAction } from "@/actions/productActions";

interface ProductImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

export default function ProductImageSelector({
  isOpen,
  onClose,
  onSelect,
}: ProductImageSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await listProductsAction();

      if (response.success && response.products) {
        // Only include products that have images
        const productsWithImages = response.products.filter(
          (product: Product) =>
            product.imageUrl && product.imageUrl.trim() !== ""
        );

        setProducts(productsWithImages);
      } else {
        console.error("Error in response:", response.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-[90vw] max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.25)] border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Product Image</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto flex-1">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-all ${
                    selectedImage === product.imageUrl
                      ? "border-blue-600 ring-2 ring-blue-400"
                      : ""
                  }`}
                  onClick={() => setSelectedImage(product.imageUrl)}
                >
                  <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-md mb-2">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-center truncate">{product.name}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No products found with images
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-4 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className={`px-4 py-2 rounded-md ${
              selectedImage
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-300 text-white cursor-not-allowed"
            }`}
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
}
