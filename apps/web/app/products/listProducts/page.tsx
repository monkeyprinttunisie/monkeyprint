"use client";

import { AddToCartButton } from "@/components/addToCartButton";
import DeleteProductButton from "@/components/DeleteProductButton";
import { useProducts } from "@/context/ProductContext";
import Menu from "@/components/Menu";

export default function ProductHome() {
  const { products, deleteProduct } = useProducts();

  return (
    <div className="bg-white h-[90vh] overflow-x-hidden">
      <h1 className="ml-2 mt-4 font-raleway font-bold text-[21px] text-gray-800">
        Products
      </h1>
      <div className="grid grid-cols-2 m-3 mt-0">
        {products.map((product) => (
          <div key={product.id} className="p-2 flex flex-col">
            <div className="p-1.5 bg-white shadow-md shadow-[rgba(0,0,0,0.1)] rounded-[9px]">
              <img
                className="w-[100%] h-[26vh] rounded-[9px]"
                src={product.imageUrl}
                alt={product.name}
              />
            </div>
            <div className="text-left">
              <h2 className="mt-3 font-nunito font-normal text-[16px] leading-[16px] text-gray-800">
                {product.name}
              </h2>
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              <p className="font-raleway font-bold text-[17px] text-gray-800">
                {product.price.toFixed(2)}dt
              </p>
              <AddToCartButton product={product} />
            </div>
            {/* <div className="">
              <DeleteProductButton
                productId={product.id}
                onDelete={deleteProduct}
              />
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
