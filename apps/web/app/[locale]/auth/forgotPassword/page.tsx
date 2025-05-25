"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPasswordPage");
  const locale = useLocale();
  const isRTL = locale === "tn";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t("success_message"));
      } else {
        toast.error(result.message || t("error_message"));
      }
    } catch (error) {
      toast.error(t("error_message"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const mobileView = (
    <div className="min-h-[92vh] flex flex-col items-center justify-center bg-white px-4 py-12 relative overflow-hidden lg:hidden">
      {/* Background decorations */}
      <div className="absolute -top-10 -right-9 w-[374px] transform -rotate-[0deg]">
        <img src="/icons/bubble02.svg" alt="" className="w-full" />
      </div>
      <div className="absolute -right-30 -top-20 w-[403px] transform -rotate-z-10">
        <img src="/icons/bubble01.svg" alt="" className="w-full" />
      </div>

      {/* Success/error message */}
      {message && (
        <div
          className={`fixed top-[3vh] left-0 right-0 mx-auto w-[90%] max-w-md p-4 rounded-lg text-center shadow-md z-50 ${
            message.includes(t("success_keyword"))
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Header section */}
        <div
          className={`mb-20 flex flex-col items-center ${isRTL ? "text-right" : "text-center"}`}
        >
          <div className="rounded-full p-1 mb-6 border-3 border-white shadow-lg">
            <img
              src="/icons/avatar.svg"
              alt={t("alt_image")}
              className="w-24 h-24 p-1 rounded-[100%]"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="text-black font-light text-l mt-2">{t("subtitle")}</p>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 mb-20">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full text-[#2554b8] p-3 bg-[#E0E9FC] border-none rounded-[9px] font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
              placeholder={t("email_placeholder")}
              dir={isRTL ? "rtl" : "ltr"}
            />
            <p
              className={`text-s text-[#676767] mt-1 ${isRTL ? "text-right" : ""}`}
            >
              <span className="text-[#FF4B26]">*</span> {t("email_note")}
            </p>
          </div>

          <div className="space-y-4 mt-20">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out disabled:bg-blue-300"
            >
              {isSubmitting ? t("sending") : t("next")}
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full text-center text-[15px] text-[#202020] opacity-90 font-light"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Desktop view (new design matching login and register pages)
  const desktopView = (
    <div className="hidden lg:flex min-h-screen w-full">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div
          className={`w-full max-w-md space-y-8 ${isRTL ? "text-right" : ""}`}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="rounded-full p-1 mb-6 border-2 border-white shadow-lg">
              <img
                src="/icons/avatar.svg"
                alt={t("alt_image")}
                className="w-20 h-20 p-1 rounded-full"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-gray-600 text-sm mt-2">{t("subtitle")}</p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes(t("success_keyword"))
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="desktop-email"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("email_label")}
              </label>
              <input
                type="email"
                id="desktop-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                placeholder={t("email_placeholder")}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <p
                className={`text-xs text-gray-500 ${isRTL ? "text-right" : ""}`}
              >
                <span className="text-red-500">*</span> {t("email_note")}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-blue-400"
            >
              {isSubmitting ? t("sending") : t("next")}
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
            >
              {t("cancel")}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Promotional Section */}
      <div className="flex-1 bg-[#2862EB] mx-4 my-4 rounded-lg relative overflow-hidden">
        <div
          className={`absolute z-10 ${isRTL ? "right-8 text-right" : "left-8"} top-16 text-white max-w-xs`}
        >
          <h2 className="text-4xl font-bold mb-6">{t("promo_line1")}</h2>
          <h2 className="text-4xl font-bold mb-6">{t("promo_line2")}</h2>
          <h3 className="text-2xl font-semibold">{t("promo_action")}</h3>
        </div>

        <div className={`absolute bottom-0 ${isRTL ? "left-0" : "right-0"}`}>
          <Image
            src="/images/forgetPassword.png"
            alt="Reset password"
            width={720}
            height={900}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}
