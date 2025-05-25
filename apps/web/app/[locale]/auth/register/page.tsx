"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/oAuthSignInButton";
import Uploader from "@/components/Uploader";
import { registerSchema } from "@monkeyprint/utils/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Link } from "@/../i18n/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { toast } from "react-hot-toast";

const roleOptions = [
  { label: "SUPER ADMIN", value: "SUPER_ADMIN" },
  { label: "ADMIN", value: "ADMIN" },
];

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const locale = useLocale();
  const isRTL = locale === "tn";
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    name: "",
    phoneNumber: "",
    image: "",
    role: roleOptions[1].value,
  });

  // Validation state
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    email: "",
  });

  // UI state
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode] = useState("+216");

  // Upload state
  const [imageUrl, setImageUrl] = useState<string>("");

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUploadComplete = async (res: any) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0];
      if (uploadedFile && uploadedFile.ufsUrl) {
        setImageUrl(uploadedFile.ufsUrl);
        setFormData({
          ...formData,
          image: uploadedFile.ufsUrl,
        });
      }
    }
  };

  const nextStep = () => {
    // Validate first step
    let isValid = true;
    const newErrors = { ...errors };
    let errorMessages = [];
    try {
      registerSchema.shape.email.parse(formData.email);
      newErrors.email = "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
        errorMessages.push("Email is invalid");
        isValid = false;
      }
    }

    try {
      registerSchema.shape.password.parse(formData.password);
      newErrors.password = "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
        errorMessages.push("Password must be at least 8 characters");
        isValid = false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      errorMessages.push("Passwords do not match");
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error(errorMessages[0]);
      return;
    }

    setStep(2);
    setMessage(null);
  };

  const prevStep = () => {
    setStep(1);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Combine phone with country code
    const fullPhoneNumber = countryCode + formData.phoneNumber;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: fullPhoneNumber,
          image: imageUrl || formData.image,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t("success_message"));
        // Redirect to login after successful registration
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error(result.message || t("error_message"));
      }
    } catch (error) {
      toast.error(t("error_message"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare upload token for UploadThing
  const apiKey = process.env.UPLOADTHING_TOKEN;
  const appId = process.env.UPLOADTHING_APP_ID;
  const regions = process.env.UPLOADTHING_REGIONS?.split(",") || ["us", "eu"];
  const tokenData = { apiKey, appId, regions };
  const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString(
    "base64"
  );

  // Mobile view (existing view with RTL support)
  const mobileView = (
    <div className="bg-[url('/icons/register-bg.svg')] bg-cover bg-center px-5 h-screen flex flex-col max-h-[92vh] justify-center overflow-auto lg:hidden">
      {/* Success/error notification */}
      {message && (
        <div
          className={`fixed top-6 left-0 right-0 mx-auto w-5/6 max-w-sm p-3 rounded-lg text-sm z-50 shadow-md ${
            message.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="w-full max-w-md mt-[0vh] max-h-[100vh]">
        {step === 1 ? (
          /* Step 1: Basic Info */
          <div className="flex flex-col">
            <h1
              className={`text-5xl font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"} w-[50vw] mb-5`}
            >
              {t("create_store")}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              <div className="space-y-4">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("email")}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("password")}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("confirm_password")}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out shadow-md"
                  >
                    {t("next")}
                  </button>
                </div>

                <div className="relative flex items-center justify-center mt-4">
                  <div className="border-t border-gray-300 w-1/4"></div>
                  <span className="px-3 text-gray-500 text-sm bg-white">
                    {t("oauth_message")}
                  </span>
                  <div className="border-t border-gray-300 w-1/4"></div>
                </div>

                <div
                  className={`flex justify-center space-x-4 pt-2 ${isRTL ? "space-x-reverse" : ""}`}
                >
                  <SignIn
                    provider="google"
                    className={
                      isRTL ? "justify-self-start mr-4" : "justify-self-end"
                    }
                  />
                  <SignIn
                    provider="facebook"
                    className={
                      isRTL ? "justify-self-end mr-4" : "justify-self-start"
                    }
                  />
                </div>

                <div
                  className={`text-center pt-4 ${isRTL ? "text-right" : ""}`}
                >
                  <p className="text-gray-600">
                    {t("have_account")}{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/auth/login")}
                      className="text-blue-600 cursor-pointer font-medium hover:underline"
                    >
                      {t("sign_in")}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Store Details */
          <div className="flex flex-col mt-[14vh]">
            <h1
              className={`text-5xl font-semibold text-gray-900 ${isRTL ? "text-right" : "text-left"} w-[50vw] mt-8`}
            >
              {t("create_store")}
            </h1>

            <form
              onSubmit={handleSubmit}
              className={`space-y-5 w-full ${isRTL ? "text-right" : "text-left"}`}
            >
              <div className="space-y-4">
                <div
                  className={`flex flex-col mb-6 ${isRTL ? "items-end" : ""}`}
                >
                  {imageUrl ? (
                    <div className="relative mt-4 w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img src={imageUrl} alt={t("store_logo")} />
                    </div>
                  ) : (
                    <Uploader handleUploadComplete={handleUploadComplete} />
                  )}
                </div>

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("first_name")}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("last_name")}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full h-[6vh] px-4 text-[#2554b8] bg-[#E0E9FC] border-none rounded-full font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none focus:ring-2 focus:ring-blue-400 ${isRTL ? "text-right" : ""}`}
                  placeholder={t("store_name")}
                  dir={isRTL ? "rtl" : "ltr"}
                />

                <div
                  className={`flex items-center bg-[#E0E9FC] rounded-full ${isRTL ? "flex-row-reverse pl-4" : "pl-4"}`}
                >
                  <div
                    className={`flex items-center ${isRTL ? "border-l" : "border-r"} border-gray-400 px-4`}
                  >
                    <div
                      className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <span className="text-[#2554b8] font-['Raleway'] text-[17px]">
                        +216
                      </span>
                      <img
                        src="/icons/down-arrow-icon.svg"
                        alt={t("select_country_code")}
                        className="mx-2 w-4 h-2"
                      />
                    </div>
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full text-[#2554b8] px-3 h-[6vh] rounded-full bg-transparent border-none font-['Raleway'] text-[17px] placeholder-[#B7BFF9] focus:outline-none ${isRTL ? "text-right" : ""}`}
                    placeholder={t("phone_number")}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>

                <div className="flex justify-between pt-8 gap-4 mb-[12vh]">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out shadow-md"
                  >
                    {t("back")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#004CFF] text-xl text-white font-light py-4 rounded-2xl transition duration-150 ease-in-out shadow-md disabled:bg-blue-300"
                  >
                    {isSubmitting ? t("submitting") : t("done")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop view (new design matching login page)
  const desktopView = (
    <div className="hidden lg:flex min-h-screen w-full">
      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div
          className={`w-full max-w-lg space-y-6 ${isRTL ? "text-right" : ""}`}
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              {t("create_store")}
            </h1>
            <p className="text-sm text-gray-600">{t("register_subtitle")}</p>
          </div>

          {message && (
            <div
              className={`p-2 text-sm ${message.includes("success") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"} rounded-md`}
            >
              {message}
            </div>
          )}

          {step === 1 ? (
            // Step 1 Form - Desktop
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("email_placeholder")}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("password_placeholder")}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("confirm_password")}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("confirm_password_placeholder")}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 mt-4"
              >
                {t("next")}
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-gray-300"></div>
                <div className="px-3 bg-white text-sm text-gray-500 whitespace-nowrap">
                  {t("oauth_message")}
                </div>
                <div className="w-full border-t border-gray-300"></div>
              </div>

              <div className="space-y-3">
                <SignIn provider="google" className="w-full" />
                <SignIn provider="facebook" className="w-full" />
              </div>

              <p className="text-center text-sm text-gray-600">
                {t("have_account")}{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {t("sign_in")}
                </Link>
              </p>
            </form>
          ) : (
            // Step 2 Form - Desktop
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`flex flex-col mb-6 ${isRTL ? "items-end" : ""}`}>
                {imageUrl ? (
                  <div className="relative mt-4 w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={imageUrl}
                      alt={t("store_logo")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t("store_logo")}
                    </p>
                    <Uploader handleUploadComplete={handleUploadComplete} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("first_name")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t("first_name_placeholder")}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("last_name")}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t("last_name_placeholder")}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("store_name")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("store_name_placeholder")}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700 block"
                >
                  {t("phone_number")}
                </label>
                <div
                  className={`flex items-center border border-gray-300 rounded-md ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`px-4 py-2 ${isRTL ? "border-l" : "border-r"} border-gray-300 bg-gray-50`}
                  >
                    <span>+216</span>
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={t("phone_number_placeholder")}
                    className={`flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md ${isRTL ? "text-right" : ""}`}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300"
                >
                  {t("back")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-blue-400"
                >
                  {isSubmitting ? t("submitting") : t("done")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right side - Promotional Section */}
      <div className="flex-1 bg-[#2862EB] mx-4 my-4 rounded-lg relative overflow-hidden">
        <div
          className={`absolute z-10 ${isRTL ? "right-8 text-right" : "left-8"} top-16 text-white max-w-xs`}
        >
          <h2 className="text-4xl font-bold mb-6 whitespace-nowrap">
            {t("promo_line1")}
          </h2>
          <h2 className="text-4xl font-bold mb-6 whitespace-nowrap">
            {t("promo_line2")}
          </h2>
          <h2 className="text-4xl font-bold">{t("start_today")}</h2>
        </div>

        <div className={`absolute bottom-0 ${isRTL ? "left-0" : "right-0"}`}>
          <Image
            src="/images/loginwoman1.png"
            alt="Professional with laptop"
            width={600}
            height={750}
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
