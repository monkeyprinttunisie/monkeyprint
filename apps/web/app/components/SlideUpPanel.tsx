"use client";

import { useState, useEffect, useRef } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  disableBackdropBlur?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  disableBackdropBlur = false,
  children,
}: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`absolute inset-0 transition-all duration-200  ${disableBackdropBlur ? "" : " backdrop-blur-[4.55px] bg-[rgba(0,66,224,0.12)]"}  ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`absolute left-0 bottom-0 w-full bg-white rounded-t-[9px] transform transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="sticky top-0 bg-[#F8FAFF] p-4 z-10">
          <div className="flex justify-between items-center">
            <h2 className="font-raleway font-bold text-xl">{title}</h2>
            <button onClick={onClose} className="p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
