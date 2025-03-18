import { useTranslations } from "next-intl";
import ScrollableNav from "@/components/scrollableNavigationBar";
export default function Page() {
    const t = useTranslations("HomePage");
    return (
        <div>
            <h1>
                {t("default_designer_Page")}
            </h1>
        </div>
        
    );
}