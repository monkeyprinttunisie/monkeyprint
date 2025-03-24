"use client";

import { useState, useEffect } from "react";
import { ShippingAddress } from "@/types";

interface ShippingAddressFormProps {
  initialData?: ShippingAddress;
  onSave: (data: ShippingAddress) => void;
  onCancel: () => void;
}

export default function ShippingAddressForm({
  initialData,
  onSave,
  onCancel,
}: ShippingAddressFormProps) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    if (initialData) {
      setAddress(initialData.address || "");
      setCity(initialData.city || "");
      setPostcode(initialData.postcode || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      country: "Tunisia", // Default value as specified
      address,
      city,
      postcode,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* Country Field (disabled) */}
      <div className="space-y-1">
        <label
          htmlFor="country"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Country
        </label>
        <input
          type="text"
          id="country"
          value="Tunisia"
          disabled
          className="w-full px-3 py-2 focus:outline-none rounded-[9px]  border border-gray-300 bg-gray-100"
        />
      </div>

      {/* Address Field */}
      <div className="space-y-1">
        <label
          htmlFor="address"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Address
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
        />
      </div>

      {/* City Field */}
      <div className="space-y-1">
        <label
          htmlFor="city"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Town or City
        </label>
        <input
          type="text"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter your city"
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
        />
      </div>

      {/* Postcode Field */}
      <div className="space-y-1">
        <label
          htmlFor="postcode"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Postcode
        </label>
        <input
          type="text"
          id="postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Enter your postcode"
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
        />
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="w-full h-[40px] bg-[#004CFF] rounded-[11px] text-white font-raleway font-bold hover:bg-blue-700 cursor-pointer mb-[7vh]"
      >
        Save Changes
      </button>
    </form>
  );
}
