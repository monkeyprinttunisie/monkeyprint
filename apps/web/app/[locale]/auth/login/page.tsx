"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SignIn from "@/components/oAuthSignInButton";
import { useTranslations } from "next-intl";
import { Link } from "@/../i18n/navigation";
import { useUserActions } from "@/store/useUserStore";
import { User, Store, StoreType } from "@/store/storeStore";
import { useLocale } from "next-intl";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const [error, setError] = useState<string | null>(null);
  const { setUser, setCurrentStore, setStoreRole } = useUserActions();
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "tn";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save user to the store
      setUser(data.user as User);

      // If the user has a store, save it
      if (data.store) {
        setCurrentStore(data.store as Store);
        setStoreRole(data.storeRole as StoreType);
      }
      toast.success(t("login_success"));
      if (data.user.role === "SUPER_ADMIN") {
        router.push("/superAdmin/dashboard");
      } else {
        router.push(`/admin/orders?id=${data.store.id}`);
      }
    } else {
      // Handle errors
      toast.error(data.error || t("login_error"));
    }
  }

  // Mobile view (default)
  const mobileView = (
    <div className="flex flex-col justify-around items-center min-h-[92vh] w-screen max-w-[500px] p-9 pt-[90px] lg:hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/bubbles-login.svg')] bg-cover bg-no-repeat rtl:scale-x-[-1]"></div>
      <div
        className={`flex flex-col w-full ${isRTL ? " items-end text-right" : ""}`}
      >
        <span className="text-[52px] leading-[61px] font-bold tracking-[-0.52px] text-[#202020]">
          {t("title")}
        </span>
        <span className="text-[19px] leading-[35px] font-light text-[#202020]">
          {t("subTitle")}
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col ${isRTL ? "items-end" : "items-center"} justify-between h-[100vw] max-h-[210px]`}
      >
        <div className="flex flex-col gap-[14px]">
          <input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            required
            className={`w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px] ${
              isRTL ? "text-right" : ""
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <input
            type="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
            required
            className={`w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px] ${
              isRTL ? "text-right" : ""
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
        <div
          className={`my-3 text-sm text-[#004CFF] ${
            isRTL ? "self-end mr-2" : "self-start ml-2"
          }`}
        >
          <Link href="/auth/forgotPassword">{t("forgotPassword") + "?"}</Link>
        </div>
        <button
          type="submit"
          className="w-[90vw] max-w-[335px] h-[61px] p-[15.764px_19.705px] bg-[#004CFF] rounded-[16px] text-white
        transition-all duration-300 ease-in-out active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {t("title")}
        </button>
      </form>

      {error && (
        <div className={`text-red-500 ${isRTL ? "text-right w-full" : ""}`}>
          {error}
        </div>
      )}

      <div
        className={`grid grid-cols-2 gap-4 justify-items-center ${isRTL ? "rtl" : ""}`}
      >
        <span className="col-span-2">- {t("oAuthMessage")} -</span>

        <SignIn
          provider="google"
          className={isRTL ? "justify-self-start" : "justify-self-end"}
        />
        <SignIn
          provider="facebook"
          className={isRTL ? "justify-self-end" : "justify-self-start"}
        />

        <div className={`col-span-2 ${isRTL ? "text-right" : ""}`}>
          {t("regiterMessage")}&nbsp;
          <span className="text-[14px] font-semibold leading-[17px] text-[#004CFF] underline">
            <Link href="/auth/register">{t("signUp")}</Link>
          </span>
        </div>
      </div>
    </div>
  );

  // Desktop view (new design)
  const desktopView = (
    <div className="hidden lg:flex min-h-screen w-full">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div
          className={`w-full max-w-md space-y-6 ${isRTL ? "text-right" : ""}`}
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-sm text-gray-600">{t("subTitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("passwordLabel")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••"
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            <div className={isRTL ? "text-right" : "text-left"}>
              <Link
                href="/auth/forgotPassword"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              {t("title")}
            </button>
          </form>

          {error && (
            <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="relative flex items-center justify-center my-6">
            <div className="w-full border-t border-gray-300"></div>
            <div className="px-3 bg-white text-sm text-gray-500 whitespace-nowrap">
              {t("oAuthMessage")}
            </div>
            <div className="w-full border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <SignIn provider="google" className="w-full" />
            <SignIn provider="facebook" className="w-full" />
          </div>

          <p className="text-center text-sm text-gray-600">
            {t("regiterMessage")}{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {t("signUp")}
            </Link>
          </p>
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
          <h2 className="text-4xl font-bold mb-6">{t("promo_line2")}</h2>
          <h2 className="text-4xl font-bold">{t("signUp")}</h2>
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
