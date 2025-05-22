"use client";

import { useState } from "react";
import {
  ExternalLink,
  Save,
  Phone,
  Mail,
  MessageSquare,
  Home,
  Truck,
  PackageCheck,
  Zap,
  User,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
export default function ThemeConfigPage() {
  const [paymentType, setPaymentType] = useState("express-cart");
  const [currentSelectValue, setCurrentSelectValue] = useState("");

  const [storeData, setStoreData] = useState({
    name: "Shopify",
    title: "Shopify",
    domain: "shopify.monkeyprint.shop",
    phone: "",
    email: "",
    facebook: "",
    seoDescription: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
    whatsappIcon: "",
  });

  const [fields, setFields] = useState({
    name: true,
    phone: true,
    city: true,
    address: true,
    email: true,
  });

  const [additionalPages, setAdditionalPages] = useState([
    { id: 1, name: "About" },
    { id: 2, name: "Terms" },
    { id: 3, name: "Refund" },
    { id: 4, name: "Privacy" },
    { id: 5, name: "Contact" },
  ]);

  const [availablePages, setAvailablePages] = useState([
    { id: 1, name: "About" },
    { id: 2, name: "Terms" },
    { id: 3, name: "Refund" },
    { id: 4, name: "Privacy" },
    { id: 5, name: "Contact" },
    { id: 6, name: "FAQ" },
    { id: 7, name: "Blog" },
    { id: 8, name: "Shipping" },
  ]);

  const [selectValue, setSelectValue] = useState<
    { value: string; label: string }[]
  >([]);

  //store data functions
  const handleChange = (field: string, value: string) => {
    setStoreData({
      ...storeData,
      [field]: value,
    });
  };

  //cart functions
  const handleFieldToggle = (field: keyof typeof fields) => {
    setFields({
      ...fields,
      [field]: !fields[field],
    });
  };

  //additional pages functions
  const removePage = (id: number) => {
    setAdditionalPages(additionalPages.filter((page) => page.id !== id));
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
          <h1 className="text-xl font-semibold">Theme Settings</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Selected Theme */}
        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg font-medium">Store Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="store-name" className="text-sm font-medium">
                  Store Name
                </label>
                <Input
                  id="store-name"
                  value={storeData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="store-title" className="text-sm font-medium">
                  Store Title
                </label>
                <Input
                  id="store-title"
                  value={storeData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label htmlFor="store-domain" className="text-sm font-medium">
                    Default Domain
                  </label>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  className="bg-gray-50 cursor-not-allowed focus-visible:ring-[0px] focus-visible:ring-transparent"
                  id="store-domain"
                  readOnly
                  value={storeData.domain}
                  onChange={(e) => handleChange("domain", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label htmlFor="store-phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="store-phone"
                  placeholder=""
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label htmlFor="store-email" className="text-sm font-medium">
                    Store Email
                  </label>
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="store-email"
                  type="email"
                  placeholder=""
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label
                    htmlFor="store-facebook"
                    className="text-sm font-medium"
                  >
                    Facebook
                  </label>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-gray-500"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <Input
                  id="store-facebook"
                  placeholder=""
                  onChange={(e) => handleChange("facebook", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-1">
                  <label htmlFor="store-seo" className="text-sm font-medium">
                    Store SEO Description
                  </label>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </div>
                <Textarea
                  id="store-seo"
                  placeholder="Write something about your store..."
                  className="min-h-[200px]"
                  onChange={(e) =>
                    handleChange("seoDescription", e.target.value)
                  }
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label
                      htmlFor="store-instagram"
                      className="text-sm font-medium"
                    >
                      Instagram
                    </label>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-500"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>{" "}
                  </div>
                  <Input
                    id="store-instagram"
                    placeholder=""
                    onChange={(e) => handleChange("instagram", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label
                      htmlFor="store-tiktok"
                      className="text-sm font-medium"
                    >
                      TikTok
                    </label>
                    <svg
                      className="h-4 w-4 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <Input
                    id="store-tiktok"
                    placeholder=""
                    onChange={(e) => handleChange("tiktok", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor="store-whatsapp"
                        className="text-sm font-medium"
                      >
                        WhatsApp
                      </label>
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="store-whatsapp"
                      placeholder=""
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="whatsapp-icon"
                      className="text-sm font-medium"
                    >
                      Fixed WhatsApp Icon
                    </label>
                    <Select
                      onValueChange={(value) =>
                        handleChange("whatsappIcon", value)
                      }
                    >
                      <SelectTrigger id="whatsapp-icon">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg font-medium">
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Payment Type */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Shipping Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer ${
                    paymentType === "express"
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                  onClick={() => setPaymentType("express")}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Standard Delivery 🔶</p>
                    <p className="text-sm text-gray-500">
                      Delivery in 72h and costs 5dt
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`h-5 w-5 rounded-full border ${
                        paymentType === "express"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentType === "express" && (
                        <div className="h-2.5 w-2.5 translate-x-[5px] translate-y-[5px] rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer ${
                    paymentType === "cart"
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                  onClick={() => setPaymentType("cart")}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Truck className="h-6 w-6 text-blue-600" />
                    <Zap className="h-3 w-3 text-blue-600 absolute -bottom-1 -right-1" />{" "}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Express Delivery 🛒</p>
                    <p className="text-sm text-gray-500">
                      Delivery in 24h and costs 8dt
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`h-5 w-5 rounded-full border ${
                        paymentType === "cart"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentType === "cart" && (
                        <div className="h-2.5 w-2.5 translate-x-[5px] translate-y-[5px] rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer ${
                    paymentType === "express-cart"
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                  onClick={() => setPaymentType("express-cart")}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <div className="relative">
                      <Truck className="h-6 w-6 text-blue-600" />
                      <PackageCheck className="h-3 w-3 text-blue-600 absolute -bottom-1 -right-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Standard + Express 🔶+🛒</p>
                    <p className="text-sm text-gray-500">Let user choose</p>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`h-5 w-5 rounded-full border ${
                        paymentType === "express-cart"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentType === "express-cart" && (
                        <div className="h-2.5 w-2.5 translate-x-[5px] translate-y-[5px] rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Fields */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Checkout Fields</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <label htmlFor="name-field" className="cursor-pointer">
                      Name
                    </label>
                  </div>
                  <Switch
                    id="name-field"
                    checked={fields.name}
                    onCheckedChange={() => handleFieldToggle("name")}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <label htmlFor="phone-field" className="cursor-pointer">
                      Phone
                    </label>
                  </div>
                  <Switch
                    id="phone-field"
                    checked={fields.phone}
                    onCheckedChange={() => handleFieldToggle("phone")}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <label htmlFor="city-field" className="cursor-pointer">
                      City
                    </label>
                  </div>
                  <Switch
                    id="city-field"
                    checked={fields.city}
                    onCheckedChange={() => handleFieldToggle("city")}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <label htmlFor="address-field" className="cursor-pointer">
                      Address
                    </label>
                  </div>
                  <Switch
                    id="address-field"
                    checked={fields.address}
                    onCheckedChange={() => handleFieldToggle("address")}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <label htmlFor="email-field" className="cursor-pointer">
                      Email
                    </label>
                  </div>
                  <Switch
                    id="email-field"
                    checked={fields.email}
                    onCheckedChange={() => handleFieldToggle("email")}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg font-medium">Page Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium">
                    Additional Pages
                  </label>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      <path d="M9 17h6" />
                      <path d="M9 13h6" />
                    </svg>
                  </button>
                </div>

                {/* Display selected pages as badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {additionalPages.map((page) => (
                    <Badge
                      key={page.id}
                      variant="outline"
                      className="px-2 py-1 bg-gray-100"
                    >
                      {page.name}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => removePage(page.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Dropdown for selecting pages */}
                <Select
                  value={currentSelectValue}
                  onValueChange={(value) => {
                    const pageId = parseInt(value);
                    const pageToAdd = availablePages.find(
                      (p) => p.id === pageId
                    );
                    if (
                      pageToAdd &&
                      !additionalPages.some((p) => p.id === pageId)
                    ) {
                      setAdditionalPages([...additionalPages, pageToAdd]);

                      // Also update selectValue for consistency with other components
                      setSelectValue([
                        ...selectValue,
                        {
                          value: pageId.toString(),
                          label: pageToAdd.name,
                        },
                      ]);

                      // Reset the select value to empty to show placeholder again
                      setTimeout(() => setCurrentSelectValue(""), 0);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add pages..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages
                      .filter(
                        (page) => !additionalPages.some((p) => p.id === page.id)
                      )
                      .map((page) => (
                        <SelectItem key={page.id} value={page.id.toString()}>
                          {page.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Page</label>
                <button className="text-blue-600 hover:text-blue-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                    <path d="M9 17h6" />
                    <path d="M9 13h6" />
                  </svg>
                </button>
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="about">About</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-1">
                <label htmlFor="store-seo" className="text-sm font-medium">
                  About us text
                </label>
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </div>
              <Textarea
                id="store-seo"
                placeholder="Write something about your store..."
                className="min-h-[200px]"
                onChange={(e) => handleChange("seoDescription", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
