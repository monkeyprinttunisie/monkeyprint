"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/oAuthSignInButton";
import { useTranslations } from "next-intl";
import { Link } from "@/../i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    if (response.ok) {
      router.push("/profile");
    } else {
      // Handle errors
      const data = await response.json();
      setError(data.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col justify-around items-center min-h-[92vh] w-screen max-w-[500px] p-9 pt-[90px]">
      <div className="absolute inset-0 -z-10 bg-[url('/bubbles-login.svg')] bg-cover bg-no-repeat rtl:scale-x-[-1]"></div>
      <div className="flex flex-col w-full justify-self-start">
        <span className="text-[52px] leading-[61px] font-bold tracking-[-0.52px] text-[#202020]">
          {t("title")}
        </span>
        <span className="text-[19px] leading-[35px] font-light text-[#202020]">
          {t("subTitle")}
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-between h-[100vw] max-h-[210px]"
      >
        <div className="flex flex-col gap-[14px]">
          <input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            required
            className="w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px]"
          />
          <input
            type="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
            required
            className="w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px]"
          />
        </div>
        <div className="self-start my-3 ml-2 text-sm text-[#004CFF]">
          <Link href="/auth/forgotPassword">
            {t("forgotPassword") + "?"}
          </Link>
        </div>
        <button
          type="submit"
          className="w-[90vw] max-w-[335px] h-[61px] p-[15.764px_19.705px] bg-[#004CFF] rounded-[16px] text-white
          transition-all duration-300 ease-in-out active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {t("title")}
        </button>
      </form>

      {error && <div style={{ color: "red" }}>{error}</div>}
      <div className="grid grid-cols-2 gap-4 justify-items-center">
        <span className="col-span-2">- {t("oAuthMessage")} -</span>
        <SignIn provider="google" className="justify-self-end" />
        <SignIn provider="facebook" className="justify-self-start" />
        <div className="col-span-2">
          {t("regiterMessage")}&nbsp;
          <span className="text-[14px] font-semibold leading-[17px] text-[#004CFF] underline">
            <Link href="/auth/register">{t("signUp")}</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
