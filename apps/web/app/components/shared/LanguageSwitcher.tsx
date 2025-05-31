"use client";

import { useRouter, usePathname } from "@/../i18n/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "tn", name: "التونسية", flag: "🇹🇳" },
];

interface LanguageSwitcherProps {
  variant?: "admin" | "default";
}

export default function LanguageSwitcher({
  variant = "default",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  if (variant === "admin") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-blue-200" />
          <span>Language</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 transition-colors duration-200">
            <span className="text-xs font-medium">{currentLanguage.name}</span>
            <div className="w-5 h-5 flex items-center justify-center rounded-full overflow-hidden border border-blue-700">
              <span className="text-[10px]">{currentLanguage.flag}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-blue-900 border-blue-700 text-white"
          >
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`${locale === language.code ? "bg-blue-700" : "hover:bg-blue-800"} text-white`}
              >
                <span className="mr-2">{language.flag}</span>
                <span>{language.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Default variant for other parts of the app
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors">
        <Globe className="h-4 w-4" />
        <span>
          {currentLanguage.flag} {currentLanguage.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={locale === language.code ? "bg-blue-50" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
