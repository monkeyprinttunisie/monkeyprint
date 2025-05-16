"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  ShoppingBasket,
  Tags,
  ShoppingCart,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";

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

  useEffect(() => {
    console.log("Session data:", session);

    if (session?.user) {
      console.log("Session user:", session.user);

      const userStoreId =
        (session.user as any).storeId ||
        (session as any).storeId ||
        (session as any).store?.id ||
        (session.user as any).store?.id;

      console.log("Found store ID:", userStoreId);

      if (userStoreId) {
        setStoreId(userStoreId);
      } else {
        console.log("No store ID found in session");
      }
    }
  }, [session]);

  // Define navigation items with their respective routes and submenus
  const navItems: NavItem[] = [
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
      name: "Wallet",
      href: `/admin/wallet?id=${storeId}`,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Team",
      href: "/admin/team",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Orders",
      href: storeId ? `/admin/orders?id=${storeId}` : "/admin/orders",
      icon: <ShoppingCart className="w-5 h-5" />,
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
      } lg:translate-x-0 w-64 bg-[#004CFF] text-white transition duration-200 ease-in-out z-40 shadow-lg`}
    >
      <div className="p-5 border-b border-blue-500 flex justify-between items-center">
        <Link href="/en/superAdmin/dashboard" className="flex items-center">
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>

        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-200"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-5">
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
    </div>
  );
}
