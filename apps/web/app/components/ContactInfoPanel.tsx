"use client";

import { useState, useEffect } from "react";
import { ContactInfo } from "@/types";

interface ContactInfoFormProps {
  initialData?: ContactInfo;
  onSave: (data: ContactInfo) => void;
  onCancel: () => void;
}

export default function ContactInfoForm({
  initialData,
  onSave,
  onCancel,
}: ContactInfoFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setAddress(initialData.address || "");
      setCity(initialData.city || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: initialData?.id || `temp-${Date.now()}`,
      name,
      orderId: initialData?.orderId || "pending",
      phone,
      email: email || null,
      country: "Tunisia",
      address,
      city,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* First Name Field */}
      <div className="space-y-1">
        <label
          htmlFor="name"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your first name"
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
        />
      </div>

      {/* Phone Number Field */}
      <div className="space-y-1">
        <label
          htmlFor="phone"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
        />
      </div>

      {/* Email Field (optional) */}
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Email (optional)
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
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
        <select
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px] h-[40px] appearance-none"
        >
          <option value="" disabled>
            Select your city
          </option>
          <option value="Tunis">Tunis</option>
          <option value="Ariana">Ariana</option>
          <option value="Ben Arous">Ben Arous</option>
          <option value="Manouba">Manouba</option>
          <option value="Nabeul">Nabeul</option>
          <option value="Zaghouan">Zaghouan</option>
          <option value="Bizerte">Bizerte</option>
          <option value="Béja">Béja</option>
          <option value="Jendouba">Jendouba</option>
          <option value="Kef">Kef</option>
          <option value="Siliana">Siliana</option>
          <option value="Sousse">Sousse</option>
          <option value="Monastir">Monastir</option>
          <option value="Mahdia">Mahdia</option>
          <option value="Sfax">Sfax</option>
          <option value="Kairouan">Kairouan</option>
          <option value="Kasserine">Kasserine</option>
          <option value="Sidi Bouzid">Sidi Bouzid</option>
          <option value="Gabès">Gabès</option>
          <option value="Medenine">Medenine</option>
          <option value="Tataouine">Tataouine</option>
          <option value="Gafsa">Gafsa</option>
          <option value="Tozeur">Tozeur</option>
          <option value="Kebili">Kebili</option>
        </select>
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
