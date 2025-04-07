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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      firstName,
      lastName,
      phone,
      email: email || undefined, // Only include if not empty
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* First Name Field */}
      <div className="space-y-1">
        <label
          htmlFor="firstName"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
          required
          className="w-full px-3 py-2 focus:outline-none bg-[#F1F4FE] rounded-[9px]"
        />
      </div>

      {/* Last Name Field */}
      <div className="space-y-1">
        <label
          htmlFor="lastName"
          className="font-nunito text-sm font-medium text-gray-700"
        >
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
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
