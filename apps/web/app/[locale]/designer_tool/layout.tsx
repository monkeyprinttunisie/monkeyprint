import ScrollableNavBar from "@/components/scrollableNavigationBar";
import { ReactNode } from "react";

export default function DesignerToolLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <ScrollableNavBar />
            <main>{children}</main>
        </div>
    );
}
