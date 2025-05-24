"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Package,
  ShoppingBasket,
  Tags,
  X,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import LogoutButton from "../sharedAdminSuperAdmin/LogoutButton";

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
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Define navigation items with their respective routes and submenus
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/superAdmin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Products",
      href: "/superAdmin/products",
      icon: <ShoppingBasket className="w-5 h-5" />,
      subItems: [
        { name: "All Products", href: "/superAdmin/products" },
        { name: "Add Product", href: "/superAdmin/products/createProduct" },
      ],
    },
    {
      name: "Categories",
      href: "/superAdmin/categories",
      icon: <Tags className="w-5 h-5" />,
      subItems: [
        { name: "All Categories", href: "/superAdmin/categories" },
        { name: "Add Category", href: "/superAdmin/categories/create" },
      ],
    },
    {
      name: "Orders",
      href: "/superAdmin/adminOrders",
      icon: <Package className="w-5 h-5" />,
      subItems: [
        { name: "Dashboard Preview", href: "/superAdmin/adminOrders" },
        { name: "Detailed Orders", href: "/superAdmin/orders" },
      ],
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const currentPath = pathname || "";
    const newLocale = currentPath.includes("/en/") ? "ar" : "en";
    const newPath = currentPath.replace(/\/(en|ar)\//, `/${newLocale}/`);
    router.push(newPath);
  };

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

    // For submenu items, do an exact match or direct path match
    return pathname.endsWith(href) || pathname === `/en${href}`;
  };

  // Manage link click to close the sidebar on mobile
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 w-[70vw] md:w-[14vw] bg-[#004CFF] text-white transition duration-200 ease-in-out z-40 shadow-lg flex flex-col h-full`}
    >
      <div className="p-5 border-b border-blue-500 flex justify-between items-center">
        <Link
          href="/en/superAdmin/dashboard"
          className="flex items-center gap-2"
        >
          <img
            src="/icons/mp.png"
            alt="MonkeyPrint Logo"
            className="h-8 w-auto brightness-0 invert"
          />
          <span className="text-l font-bold">Super Admin</span>
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
                            href={`/en${subItem.href}`}
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
                  href={`/en${item.href}`}
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
      <div className="p-2 border-t border-blue-500">
        <LogoutButton onClose={onClose} />
      </div>
    </div>
  );
}
