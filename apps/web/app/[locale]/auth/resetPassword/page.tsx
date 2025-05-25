"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPasswordPage");
  const locale = useLocale();
  const isRTL = locale === "tn";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (password !== confirmPassword) {
      toast.error(t("passwords_mismatch"));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t("success_message"));
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error(result.message || t("error_message"));
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mobileView = (
    <div className="min-h-[92vh] flex flex-col items-center justify-center bg-white px-4 py-12 relative overflow-hidden lg:hidden">
      {/* Background decorations */}
      <div
        className={`absolute -top-10 ${isRTL ? "-left-9" : "-right-9"} w-[374px]`}
      >
        <img src="/icons/bubble02.svg" alt="" className="w-full" />
      </div>
      <div
        className={`absolute ${isRTL ? "-left-30" : "-right-30"} -top-20 w-[403px]`}
      >
        <img src="/icons/bubble01.svg" alt="" className="w-full" />
      </div>

      {/* Success/error message */}
      {message && (
        <div
          className={`mb-6 w-full p-4 rounded-lg text-center shadow-md ${
            message.includes(t("success_keyword"))
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header section */}
        <div
          className={`mb-10 flex flex-col items-center ${isRTL ? "text-right" : "text-center"}`}
        >
          <div className="rounded-full p-1 mb-6 border-2 border-white shadow-lg">
            <img
              src="/icons/avatar.svg"
              alt={t("alt_image")}
              className="w-24 h-24 p-1 rounded-[100%]"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="text-black font-light text-l mt-2">{t("subtitle")}</p>
        </div>

        {/* Form section - fixed the fixed positioning issues */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-4">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full text-[#2554b8] p-3 bg-[#E0E9FC] border-none rounded-[9px] font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
              placeholder={t("new_password_placeholder")}
              dir={isRTL ? "rtl" : "ltr"}
            />

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full text-[#2554b8] p-3 bg-[#E0E9FC] border-none rounded-[9px] font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
              placeholder={t("confirm_password_placeholder")}
              dir={isRTL ? "rtl" : "ltr"}
            />
            <p
              className={`text-s text-[#676767] mt-1 ${isRTL ? "text-right" : ""}`}
            >
              <span className="text-[#FF4B26]">*</span>{" "}
              {t("passwords_must_match")}
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out disabled:bg-blue-300"
            >
              {isSubmitting ? t("submitting") : t("reset_button")}
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="w-full text-center text-[15px] text-[#202020] opacity-90 font-light"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Desktop view (new design matching other auth pages)
  const desktopView = (
    <div className="hidden lg:flex min-h-screen w-full">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div
          className={`w-full max-w-md space-y-8 ${isRTL ? "text-right" : ""}`}
        >
          <div className="flex flex-col items-center mb-8">
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="desktop-password"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("new_password_label")}
                </label>
                <input
                  type="password"
                  id="desktop-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("new_password_placeholder")}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="desktop-confirmPassword"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("confirm_password_label")}
                </label>
                <input
                  type="password"
                  id="desktop-confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("confirm_password_placeholder")}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <p
                className={`text-xs text-gray-500 ${isRTL ? "text-right" : ""}`}
              >
                <span className="text-red-500">*</span>{" "}
                {t("passwords_must_match")}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-blue-400"
              >
                {isSubmitting ? t("submitting") : t("reset_button")}
              </button>

              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="w-full text-center mt-4 text-sm text-gray-600 hover:text-gray-800"
              >
                {t("cancel")}
              </button>
            </div>
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
