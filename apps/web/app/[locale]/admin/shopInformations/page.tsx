"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Trash,
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
import { toast } from "sonner";
import Image from "next/image";

import { getCurrentUserStoreId } from "@/actions/productActions";
import {
  getStoreById,
  updateAboutUs,
  updateContactUs,
  updateStore,
  updateStorePages,
  updateUser,
} from "@/actions/storeActions";
import { getCurrentUser } from "@/actions/authActions";

import FileUploader from "@/components/FileUploader";

export default function ThemeConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [paymentType, setPaymentType] = useState("express-cart");
  const [currentSelectValue, setCurrentSelectValue] = useState("");

  const [storeData, setStoreData] = useState({
    name: "",
    title: "",
    domain: "",
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

  const [selectedPage, setSelectedPage] = useState<string>("");
  const [pagesEnabled, setPagesEnabled] = useState({
    home: true,
    products: true,
    about: false,
    contact: false,
  });
  const [additionalPages, setAdditionalPages] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const [availablePages, setAvailablePages] = useState([
    { id: 1, name: "Contact" },

    { id: 2, name: "About" },
  ]);
  // About Us state
  const [aboutUsData, setAboutUsData] = useState({
    introText: "",
    howWorks: true,
    ourValues: true,
    aboutUs: true,
    ourProducts: [] as { id: string; description: string; imageUrl: string }[],
  });

  const [contactUsData, setContactUsData] = useState({
    introText: "",
    workingTime: {
      monday: { isOpen: true, open: "09:00", close: "17:00" },
      tuesday: { isOpen: true, open: "09:00", close: "17:00" },
      wednesday: { isOpen: true, open: "09:00", close: "17:00" },
      thursday: { isOpen: true, open: "09:00", close: "17:00" },
      friday: { isOpen: true, open: "09:00", close: "17:00" },
      saturday: { isOpen: false, open: "09:00", close: "17:00" },
      sunday: { isOpen: false, open: "09:00", close: "17:00" },
    },
    requestDesign: true,
  });
  const [selectValue, setSelectValue] = useState<
    { value: string; label: string }[]
  >([]);

  //store data functions
  const handleSaveChanges = async () => {
    if (!storeId) {
      toast.error("Store ID not found. Please refresh the page.");
      return;
    }

    setIsSaving(true);

    try {
      // Map UI payment type to database enum
      let dbShippingType: "STANDARD" | "EXPRESS" | "BOTH";
      switch (paymentType) {
        case "express":
          dbShippingType = "STANDARD";
          break;
        case "cart":
          dbShippingType = "EXPRESS";
          break;
        case "express-cart":
        default:
          dbShippingType = "BOTH";
          break;
      }

      const storeResult = await updateStore(storeId, {
        name: storeData.name,
        seoDescription: storeData.seoDescription,
        socialMedia: {
          facebook: storeData.facebook,
          instagram: storeData.instagram,
          tiktok: storeData.tiktok,
          whatsapp: storeData.whatsapp,
        },
        checkoutFields: {
          shippingType: dbShippingType,
          name: fields.name,
          phone: fields.phone,
          email: fields.email,
          address: fields.address,
          city: fields.city,
        },
      });

      // Update enabled pages
      const userResult = await updateUser(userId, {
        phoneNumber: storeData.phone,
      });

      // Update enabled pages
      const pagesResult = await updateStorePages(storeId, pagesEnabled);

      // Update page-specific data if enabled
      let contactResult = { success: true };
      let aboutResult = { success: true };

      if (pagesEnabled.contact) {
        contactResult = await updateContactUs(storeId, contactUsData);
      }

      if (pagesEnabled.about) {
        aboutResult = await updateAboutUs(storeId, aboutUsData);
      }

      if (
        storeResult.success &&
        userResult.success &&
        pagesResult.success &&
        contactResult.success &&
        aboutResult.success
      ) {
        toast.success("Store information saved successfully!");
      } else {
        toast.error(
          storeResult.message || userResult.message || "Failed to save changes"
        );
      }
    } catch (error) {
      toast.error("An error occurred while saving changes");
      console.error("Error saving store data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setStoreData({
      ...storeData,
      seoDescription: storeData.seoDescription || "",
      [field]: value,
    });
  };

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setIsLoading(true);

        // Get the current user's store ID
        const storeId = await getCurrentUserStoreId();
        if (!storeId) {
          console.error("No store ID found for current user");
          return;
        }

        //save storeId
        setStoreId(storeId);

        // Get store details
        const storeDetails = await getStoreById(storeId);

        // Get user details
        const userData = await getCurrentUser();

        if (storeDetails && userData) {
          setUserId(userData.id);
          setStoreData({
            ...storeData,
            name: storeDetails.name || "",
            title: storeDetails.name || "",
            domain: `${storeDetails.url || storeDetails.name?.toLowerCase().replace(/\s+/g, "")}.monkeyprint.shop`,
            phone: userData.phoneNumber || "",
            email: userData.email || "",
            seoDescription: storeDetails.seoDescription || "",
            whatsapp:
              storeDetails.socialMedia?.whatsapp || userData.phoneNumber || "",
            // social media links
            facebook: storeDetails.socialMedia?.facebook || "",
            instagram: storeDetails.socialMedia?.instagram || "",
            tiktok: storeDetails.socialMedia?.tiktok || "",
          });
          // form fields
          if (storeDetails.checkoutFields) {
            // Map database enum to UI value
            let uiPaymentType: string;
            switch (storeDetails.checkoutFields.shippingType) {
              case "STANDARD":
                uiPaymentType = "express";
                break;
              case "EXPRESS":
                uiPaymentType = "cart";
                break;
              case "BOTH":
              default:
                uiPaymentType = "express-cart";
                break;
            }

            setPaymentType(uiPaymentType);

            // Set form fields if they exist
            if (storeDetails.checkoutFields) {
              setFields({
                name: storeDetails.checkoutFields.name ?? true,
                phone: storeDetails.checkoutFields.phone ?? true,
                city: storeDetails.checkoutFields.city ?? true,
                address: storeDetails.checkoutFields.address ?? true,
                email: storeDetails.checkoutFields.email ?? true,
              });
            }
          }
          if (storeDetails.pages) {
            setPagesEnabled({
              home: storeDetails.pages.home,
              products: storeDetails.pages.products,
              about: storeDetails.pages.about,
              contact: storeDetails.pages.contact,
            });

            const newAdditionalPages = [];

            if (storeDetails.pages.contact) {
              newAdditionalPages.push({ id: 1, name: "Contact" });
            }

            if (storeDetails.pages.about) {
              newAdditionalPages.push({ id: 2, name: "About" });
            }

            // Only set if there are actually pages to add
            if (newAdditionalPages.length > 0) {
              setAdditionalPages(newAdditionalPages);
            }
            // About Us data
            if (storeDetails.pages.about && storeDetails.aboutUs) {
              setAboutUsData({
                introText: storeDetails.aboutUs.introText,
                howWorks: storeDetails.aboutUs.howWorks,
                ourValues: storeDetails.aboutUs.ourValues,
                aboutUs: storeDetails.aboutUs.aboutUs,
                ourProducts: storeDetails.aboutUs.ourProducts.map(
                  (p: {
                    id: string;
                    description: string;
                    imageUrl: string;
                  }) => ({
                    id: p.id,
                    description: p.description,
                    imageUrl: p.imageUrl,
                  })
                ),
              });
            }

            // Contact Us data
            if (storeDetails.pages.contact && storeDetails.contactUs) {
              let workingTimeData;
              try {
                // Try to parse as JSON first (for new format)
                workingTimeData = JSON.parse(
                  storeDetails.contactUs.workingTime
                );
              } catch (e) {
                // If it fails, use the default structure with the old string as a fallback
                workingTimeData = {
                  monday: { isOpen: true, open: "09:00", close: "17:00" },
                  tuesday: { isOpen: true, open: "09:00", close: "17:00" },
                  wednesday: { isOpen: true, open: "09:00", close: "17:00" },
                  thursday: { isOpen: true, open: "09:00", close: "17:00" },
                  friday: { isOpen: true, open: "09:00", close: "17:00" },
                  saturday: { isOpen: false, open: "09:00", close: "17:00" },
                  sunday: { isOpen: false, open: "09:00", close: "17:00" },
                };
              }
              setContactUsData({
                introText: storeDetails.contactUs.introText,
                workingTime: workingTimeData,
                requestDesign: storeDetails.contactUs.requestDesign ?? true,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, []);

  //cart functions
  const handleFieldToggle = (field: keyof typeof fields) => {
    setFields({
      ...fields,
      [field]: !fields[field],
    });
  };

  //additional pages functions
  const removePage = (id: number) => {
    // First, find the page being removed
    const pageToRemove = additionalPages.find((page) => page.id === id);

    // Remove from additionalPages array
    setAdditionalPages(additionalPages.filter((page) => page.id !== id));

    // Also update pagesEnabled state
    if (pageToRemove) {
      if (pageToRemove.name === "Contact") {
        setPagesEnabled({ ...pagesEnabled, contact: false });
      } else if (pageToRemove.name === "About") {
        setPagesEnabled({ ...pagesEnabled, about: false });
      }
    }

    // If this page was currently selected, reset selected page
    if (
      (pageToRemove?.name === "Contact" && selectedPage === "contact") ||
      (pageToRemove?.name === "About" && selectedPage === "about")
    ) {
      setSelectedPage("");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
          <h1 className="text-xl font-semibold">Theme Settings</h1>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveChanges}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Selected Theme */}
        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg font-medium">Store Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
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
                    <label
                      htmlFor="store-title"
                      className="text-sm font-medium"
                    >
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
                      <label
                        htmlFor="store-domain"
                        className="text-sm font-medium"
                      >
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
                      <label
                        htmlFor="store-phone"
                        className="text-sm font-medium"
                      >
                        Phone Number
                      </label>
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="store-phone"
                      value={storeData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor="store-email"
                        className="text-sm font-medium"
                      >
                        Store Email
                      </label>
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="store-email"
                      type="email"
                      value={storeData.email}
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
                      value={storeData.facebook}
                      onChange={(e) => handleChange("facebook", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor="store-seo"
                        className="text-sm font-medium"
                      >
                        Store SEO Description
                      </label>
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </div>
                    <Textarea
                      value={storeData.seoDescription}
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
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="20"
                            rx="5"
                            ry="5"
                          />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>{" "}
                      </div>
                      <Input
                        id="store-instagram"
                        placeholder=""
                        value={storeData.instagram}
                        onChange={(e) =>
                          handleChange("instagram", e.target.value)
                        }
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
                        value={storeData.tiktok}
                        id="store-tiktok"
                        placeholder=""
                        onChange={(e) => handleChange("tiktok", e.target.value)}
                      />
                    </div>

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
                        value={storeData.whatsapp}
                        onChange={(e) =>
                          handleChange("whatsapp", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
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
                    disabled={true}
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
                    disabled={true}
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
                    disabled={true}
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
                    disabled={true}
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
                    className="data-[state=checked]:bg-blue-600 cursor-pointer"
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
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium">Additional Pages</label>
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
                {/* Home and Products are always enabled */}
                <Badge variant="outline" className="px-2 py-1 bg-blue-100">
                  Home
                </Badge>
                <Badge variant="outline" className="px-2 py-1 bg-blue-100">
                  Products
                </Badge>

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
                  const pageToAdd = availablePages.find((p) => p.id === pageId);
                  if (
                    pageToAdd &&
                    !additionalPages.some((p) => p.id === pageId)
                  ) {
                    setAdditionalPages([...additionalPages, pageToAdd]);

                    // Also update pagesEnabled state for compatibility
                    if (pageToAdd.name === "Contact") {
                      setPagesEnabled({ ...pagesEnabled, contact: true });
                    } else if (pageToAdd.name === "About") {
                      setPagesEnabled({ ...pagesEnabled, about: true });
                    }

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
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page to edit" />
                </SelectTrigger>
                <SelectContent>
                  {/* Only show enabled pages */}
                  {pagesEnabled.about && (
                    <SelectItem value="about">About Us</SelectItem>
                  )}
                  {pagesEnabled.contact && (
                    <SelectItem value="contact">Contact Us</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Render different settings based on selected page */}
              {selectedPage === "contact" && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Introduction Text
                    </label>
                    <Textarea
                      placeholder="Write your contact introduction..."
                      className="min-h-[100px]"
                      value={contactUsData.introText}
                      onChange={(e) =>
                        setContactUsData({
                          ...contactUsData,
                          introText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Working Hours</label>

                    {/* Working hours inputs for each day */}
                    <div className="space-y-3 border rounded-lg p-4">
                      {Object.entries(contactUsData.workingTime).map(
                        ([day, hours]) => (
                          <div
                            key={day}
                            className="flex items-center space-x-4"
                          >
                            <div className="w-28">
                              <span className="capitalize">{day}</span>
                            </div>

                            <div className="flex items-center">
                              <Switch
                                checked={hours.isOpen}
                                onCheckedChange={(checked) => {
                                  setContactUsData({
                                    ...contactUsData,
                                    workingTime: {
                                      ...contactUsData.workingTime,
                                      [day as keyof typeof contactUsData.workingTime]:
                                        {
                                          ...contactUsData.workingTime[
                                            day as keyof typeof contactUsData.workingTime
                                          ],
                                          isOpen: checked,
                                        },
                                    },
                                  });
                                }}
                                className="data-[state=checked]:bg-blue-600 mr-2"
                              />
                              <span className="text-sm text-gray-500">
                                {hours.isOpen ? "Open" : "Closed"}
                              </span>
                            </div>

                            {hours.isOpen && (
                              <div className="flex items-center space-x-2 flex-1">
                                <div className="flex-1">
                                  <Input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => {
                                      setContactUsData({
                                        ...contactUsData,
                                        workingTime: {
                                          ...contactUsData.workingTime,
                                          [day as keyof typeof contactUsData.workingTime]:
                                            {
                                              ...contactUsData.workingTime[
                                                day as keyof typeof contactUsData.workingTime
                                              ],
                                              open: e.target.value,
                                            },
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                <span>to</span>
                                <div className="flex-1">
                                  <Input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => {
                                      setContactUsData({
                                        ...contactUsData,
                                        workingTime: {
                                          ...contactUsData.workingTime,
                                          [day as keyof typeof contactUsData.workingTime]:
                                            {
                                              ...contactUsData.workingTime[
                                                day as keyof typeof contactUsData.workingTime
                                              ],
                                              close: e.target.value,
                                            },
                                        },
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-blue-600"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <label className="cursor-pointer">
                        Enable "Request Design" Feature
                      </label>
                    </div>
                    <Switch
                      checked={contactUsData.requestDesign}
                      onCheckedChange={(checked) =>
                        setContactUsData({
                          ...contactUsData,
                          requestDesign: checked,
                        })
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              )}

              {selectedPage === "about" && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Introduction Text
                    </label>
                    <Textarea
                      placeholder="Write your about us introduction..."
                      className="min-h-[100px]"
                      value={aboutUsData.introText}
                      onChange={(e) =>
                        setAboutUsData({
                          ...aboutUsData,
                          introText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={aboutUsData.howWorks}
                        onCheckedChange={(checked) =>
                          setAboutUsData({ ...aboutUsData, howWorks: checked })
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <label className="text-sm font-medium">
                        Show "How It Works" Section
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={aboutUsData.ourValues}
                        onCheckedChange={(checked) =>
                          setAboutUsData({ ...aboutUsData, ourValues: checked })
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <label className="text-sm font-medium">
                        Show "Our Values" Section
                      </label>
                    </div>

                    {/* <div className="flex items-center gap-2">
                      <Switch
                        checked={aboutUsData.aboutUs}
                        onCheckedChange={(checked) =>
                          setAboutUsData({ ...aboutUsData, aboutUs: checked })
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <label className="text-sm font-medium">
                        Show "About Us" Section
                      </label>
                    </div> */}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Our Products</h4>

                    {aboutUsData.ourProducts.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="mb-4 p-4 border rounded-lg"
                      >
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Product {index + 1}</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newProducts = [...aboutUsData.ourProducts];
                              newProducts.splice(index, 1);
                              setAboutUsData({
                                ...aboutUsData,
                                ourProducts: newProducts,
                              });
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Textarea
                            placeholder="Product description"
                            value={product.description}
                            onChange={(e) => {
                              const newProducts = [...aboutUsData.ourProducts];
                              newProducts[index].description = e.target.value;
                              setAboutUsData({
                                ...aboutUsData,
                                ourProducts: newProducts,
                              });
                            }}
                          />

                          <div className="mt-2">
                            <FileUploader
                              handleUploadComplete={(res) => {
                                if (res.length > 0) {
                                  const uploadedImageUrl =
                                    res[0].url || res[0].ufsUrl || "";
                                  const newProducts = [
                                    ...aboutUsData.ourProducts,
                                  ];
                                  newProducts[index].imageUrl =
                                    uploadedImageUrl;
                                  setAboutUsData({
                                    ...aboutUsData,
                                    ourProducts: newProducts,
                                  });
                                }
                              }} buttonText="Upload Image"
                            />

                            {product.imageUrl && (
                              <div className="mt-2 relative h-24 w-24 border rounded">
                                <Image
                                  src={product.imageUrl}
                                  alt="Product"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAboutUsData({
                          ...aboutUsData,
                          ourProducts: [
                            ...aboutUsData.ourProducts,
                            {
                              id: `new-${Date.now()}`,
                              description: "",
                              imageUrl: "",
                            },
                          ],
                        });
                      }}
                    >
                      Add Product
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
