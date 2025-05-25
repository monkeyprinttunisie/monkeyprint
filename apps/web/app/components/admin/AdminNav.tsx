"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ShoppingBasket,
  X,
  WalletIcon,
  Users,
  Package,
  Store,
  LayoutDashboardIcon,
  Settings,
  Globe,
} from "lucide-react";
import LogoutButton from "@/components/sharedAdminSuperAdmin/LogoutButton";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  subItems?: { name: string; href: string }[];
}

interface SuperAdminNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminNav({ isOpen, onClose }: SuperAdminNavProps) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const [storeId, setStoreId] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const currentPath = pathname || "";
    const router = useRouter();

    // Extract path parts
    const pathParts = currentPath.split("/");

    // Find the locale part (index 1 after splitting)
    const currentLocale = pathParts.length > 1 ? pathParts[1] : "en";

    // Determine new locale
    const newLocale = currentLocale === "en" ? "ar" : "en";

    // Replace locale in path parts and build new path
    pathParts[1] = newLocale;
    const newPath = pathParts.join("/");

    // Navigate to new path - must use window.location for complete page refresh
    window.location.href = newPath;
  };

  useEffect(() => {
    if (session?.user) {
      const userStoreId =
        (session.user as any).storeId ||
        (session as any).storeId ||
        (session as any).store?.id ||
        (session.user as any).store?.id;

      if (userStoreId) {
        setStoreId(userStoreId);
      }
    }
  }, [session]);

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: `/admin/dashboard?id=${storeId}`,
      icon: <LayoutDashboardIcon className="w-5 h-5" />,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: <ShoppingBasket className="w-5 h-5" />,
      subItems: [
        { name: "All Products", href: "/admin/products" },
        { name: "Add Product", href: "/admin/products/createProduct" },
      ],
    },
    {
      name: "Orders",
      href: storeId ? `/admin/orders?id=${storeId}` : "/admin/orders",
      icon: <Package className="w-5 h-5" />,
      subItems: [
        {
          name: "Dashboard View",
          href: storeId ? `/admin/orders?id=${storeId}` : "/admin/orders",
        },
        {
          name: "Orders State",
          href: storeId
            ? `/admin/ordersState?id=${storeId}`
            : "/admin/ordersState",
        },
      ],
    },
    {
      name: "Wallet",
      href: `/admin/wallet?id=${storeId}`,
      icon: <WalletIcon className="w-5 h-5" />,
      subItems: [
        { name: "Income", href: `/admin/wallet?id=${storeId}` },
        {
          name: "Print Invoice",
          href: `/admin/wallet/invoice?storeId=${storeId}`,
        },
      ],
    },
    {
      name: "Team",
      href: "/admin/team",
      icon: <Users className="w-5 h-5" />,
      subItems: [
        { name: "Collaborators", href: "/admin/team" },
        {
          name: "Add Collaborator",
          href: "/admin/team/addCollaborator",
        },
      ],
    },
    {
      name: "Shop Builder",
      href: "/admin/themes",
      icon: <Store className="w-5 h-5" />,
      subItems: [
        {
          name: "Themes",
          href: "/admin/themes",
        },
        {
          name: "Informations",
          href: "/admin/shopInformations",
        },
      ],
    },
  ];

  const toggleSubMenu = (name: string) => {
    if (openSubMenu === name) {
      setOpenSubMenu(null);
    } else {
      setOpenSubMenu(name);
    }
  };

  const isActive = (href: string, isExact = false) => {
    if (!pathname) return false;
    if (!isExact) {
      const pathParts = pathname.split("/");
      const hrefParts = href.split("/");

      if (pathParts.includes(hrefParts[hrefParts.length - 1])) {
        if (hrefParts.length === 2 && pathParts.length > 4) {
          return false;
        }
        return true;
      }
      return false;
    }

    return pathname.endsWith(href) || pathname === `/en${href}`;
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-[70vw] md:w-[14vw] bg-[#004CFF] text-white transition duration-200 ease-in-out shadow-lg flex flex-col h-full z-40`}
      >
        <div className="p-5 border-b border-blue-500 flex justify-between items-center">
          <Link href="/en/admin/dashboard" className="flex items-center gap-2">
            <img
              src="/icons/mp.png"
              alt="MonkeyPrint Logo"
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="text-l font-bold">Admin</span>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleSubMenu(item.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-md hover:bg-blue-700 ${
                        isActive(item.href) &&
                        !pathname?.includes("create") &&
                        !pathname?.includes("edit")
                          ? "bg-blue-700"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openSubMenu === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openSubMenu === item.name && (
                      <ul className="ml-6 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={
                                subItem.href.includes("?")
                                  ? `/en${subItem.href.split("?")[0]}?${subItem.href.split("?")[1]}`
                                  : `/en${subItem.href}`
                              }
                              className={`block p-2 rounded-md hover:bg-blue-600 ${
                                pathname === `/en${subItem.href}` ||
                                (subItem.href.endsWith(item.href) &&
                                  pathname === `/en${item.href}`)
                                  ? "bg-blue-700"
                                  : ""
                              }`}
                              onClick={handleLinkClick}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={
                      item.href.includes("?")
                        ? `/en${item.href.split("?")[0]}?${item.href.split("?")[1]}`
                        : `/en${item.href}`
                    }
                    className={`flex items-center p-3 rounded-md hover:bg-blue-700 ${
                      pathname === `/en${item.href}` ? "bg-blue-700" : ""
                    }`}
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <div className="px-4 pt-4 pb-2">
            <div className="bg-blue-800/40 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-3">
              {/* Language toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-blue-200" />
                  <span>Language</span>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 transition-colors duration-200"
                >
                  <span className="text-xs font-medium">
                    {pathname?.split("/")[1] === "ar" ? "العربية" : "English"}
                  </span>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full overflow-hidden border border-blue-700">
                    {pathname?.split("/")[1] === "ar" ? (
                      <span className="text-[10px]">🇸🇦</span>
                    ) : (
                      <span className="text-[10px]">🇺🇸</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 pt-0 pb-2">
            <Link
              href="/en/admin/settings"
              className="group flex items-center justify-between bg-blue-700 hover:bg-blue-600 p-3 rounded-lg transition-all duration-300 hover:shadow-lg"
              onClick={handleLinkClick}
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="ml-3 font-medium">Settings</span>
              </div>
              <div className="bg-blue-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ChevronDown className="w-4 h-4 rotate-270" />
              </div>
            </Link>
          </div>

          <div className="p-2 border-t border-blue-500">
            <LogoutButton onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}
