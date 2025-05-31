"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/../i18n/navigation";
import { CheckCircle } from "lucide-react";

export default function VerificationSuccessPage() {
  const t = useTranslations("Auth");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verified!
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Your email has been successfully verified. You can now log in to
            your account.
          </p>

          <div className="pt-4">
            <Link
              href="/auth/login"
              className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Log in now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
