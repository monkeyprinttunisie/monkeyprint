import { useTranslations } from "next-intl";
export default function Page() {
    const t = useTranslations("Page");
    return (
        <div>
            <h1>
                {t("default_designer_Page")}
            </h1>
        </div>

    );
}