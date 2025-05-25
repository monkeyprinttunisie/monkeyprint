"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createUser } from "@/actions/userActions";
import { createStoreUserRelation } from "@/actions/storeUserRelationAction";
import { useCurrentStore } from "@/store/useUserStore";
import { hashPassword } from "@monkeyprint/utils/hash";
import { useLocale } from "next-intl";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function AddCollaboratorPage() {
  const locale = useLocale();
  const isRTL = locale === "tn";
  const t = useTranslations("Team");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const store = useCurrentStore();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    try {
      const hashedPassword = await hashPassword(password);

      // Create the user first
      const newUser = await createUser({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
      });

      // TODO: Replace with your store ID logic
      const storeId = store?.id as string; // You'll handle this logic

      // Create the store-user relation with COLLABORATOR role
      await createStoreUserRelation({
        storeId,
        userId: newUser.id,
        role: "COLLABORATOR",
      });

      toast.success(t("collaborator_added"));
      // Reset form
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.error(t("collaborator_error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const mobileView = (
    <div className="flex flex-col justify-around items-center min-h-[92vh] w-screen max-w-[500px] p-9 pt-[90px] lg:hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/bubbles-login.svg')] bg-cover bg-no-repeat rtl:scale-x-[-1]"></div>
      <div
        className={`flex flex-col w-full ${isRTL ? "items-end text-right" : ""}`}
      >
        <span className="text-[52px] leading-[61px] font-bold tracking-[-0.52px] text-[#202020]">
          {t("add_collaborator")}
        </span>
        <span className="text-[19px] leading-[35px] font-light text-[#202020]">
          {t("add_collaborator_subtitle")}
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col ${isRTL ? "items-end" : "items-center"} justify-between h-auto w-full gap-4 my-8`}
      >
        <div className="flex flex-col gap-[14px] w-full">
          <input
            type="text"
            name="name"
            placeholder={t("full_name")}
            required
            className={`w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px] ${
              isRTL ? "text-right" : ""
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <input
            type="email"
            name="email"
            placeholder={t("email_address")}
            required
            className={`w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px] ${
              isRTL ? "text-right" : ""
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <input
            type="password"
            name="password"
            placeholder={t("password")}
            required
            className={`w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px] ${
              isRTL ? "text-right" : ""
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder={t("phone_number")}
            className={`w-[90vw] max-w-[330px] p-[15.764px_19.705px] bg-[#E0E9FC] rounded-[59.115px] ${
              isRTL ? "text-right" : ""
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-[90vw] max-w-[335px] h-[61px] p-[15.764px_19.705px] bg-[#004CFF] rounded-[16px] text-white
          transition-all duration-300 ease-in-out active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isSubmitting ? t("adding") : t("add_collaborator")}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={() => router.back()}
          className="text-[14px] font-semibold leading-[17px] text-[#004CFF]"
        >
          {t("back_to_team")}
        </button>
      </div>
    </div>
  );

  // Desktop view (new design matching register page)
  const desktopView = (
    <div className="hidden lg:flex min-h-screen w-full">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div
          className={`w-full max-w-md space-y-6 ${isRTL ? "text-right" : ""}`}
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              {t("add_collaborator")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("add_collaborator_subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("full_name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={t("full_name_placeholder")}
                required
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? "text-right" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                {t("email_address")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t("email_placeholder")}
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
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={t("password_placeholder")}
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
                  placeholder={t("phone_number_placeholder")}
                  className={`flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md ${isRTL ? "text-right" : ""}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-blue-400"
              >
                {isSubmitting ? t("adding") : t("add_collaborator")}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {t("back_to_team")}
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
          <h2 className="text-3xl font-bold mb-6">{t("team_promo_line1")}</h2>
          <h2 className="text-3xl font-bold mb-6">{t("team_promo_line2")}</h2>
          <h2 className="text-3xl font-semibold">{t("team_promo_action")}</h2>
        </div>

        <div className={`absolute bottom-0 ${isRTL ? "left-0" : "right-0"}`}>
          <Image
            src="/images/loginwoman1.png"
            alt="Team collaboration"
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
