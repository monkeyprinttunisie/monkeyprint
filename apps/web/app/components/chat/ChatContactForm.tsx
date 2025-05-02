"use client";

import { ContactInfo } from "@/types";
import ContactInfoForm from "@/components/ContactInfoPanel";

interface ChatContactFormProps {
  onSubmit: (contactInfo: ContactInfo) => void;
}

export default function ChatContactForm({ onSubmit }: ChatContactFormProps) {
  const handleSave = (data: ContactInfo) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    console.log("Cancelled");
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">
        Enter your contact information
      </h3>
      <ContactInfoForm
        onSave={handleSave}
        onCancel={handleCancel}
        // No initialData to start fresh
      />
    </div>
  );
}
