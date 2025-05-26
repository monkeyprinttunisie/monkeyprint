"use server";

import { db } from "@monkeyprint/db";

export async function getAllStores() {
  return await db.store.findMany();
}

export async function getStoreById(id: string) {
  try {
    const store = await db.store.findUnique({
      where: { id: id },
      include: {
        socialMedia: true,
        checkoutFields: true,
        pages: true,
        aboutUs: {
          include: {
            ourProducts: true,
          },
        },
        contactUs: true,
        homeBanner: {
          include: {
            button: true,
          },
        },
      },
    });
    return store;
  } catch (error) {
    console.error("Error fetching store:", error);
    return null;
  }
}

export async function getStoreByUrl(url: string) {
  return await db.store.findFirst({
    where: {
      url: url,
      isDeleted: false,
    },
    include: {
      homeBanner: {
        include: {
          button: true,
        },
      },
      checkoutFields: true,
      aboutUs: {
        include: {
          ourProducts: true,
        },
      },
      contactUs: true,
      pages: true,
    },
  });
}

export async function getStoreOwnerByStoreId(storeId: string) {
  const storeOwner = await db.storeUserRelation.findFirst({
    where: {
      storeId: storeId,
      role: "OWNER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      },
    },
  });

  return storeOwner?.user;
}

export async function updateUser(
  userId: string,
  data: { image?: string; phoneNumber?: string }
) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data,
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateStore(
  storeId: string,
  data: {
    name?: string;
    title?: string;
    seoDescription?: string;
    phone?: string;
    email?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      whatsapp?: string;
    };
    checkoutFields?: {
      shippingType: "STANDARD" | "EXPRESS" | "BOTH";
      name?: boolean;
      phone?: boolean;
      email?: boolean;
      address?: boolean;
      city?: boolean;
    };
  }
) {
  try {
    // Update the main store information
    await db.store.update({
      where: { id: storeId },
      data: {
        name: data.name,
        seoDescription: data.seoDescription,
      },
    });

    // Update or create the social media links
    await db.socialMediaLinks.upsert({
      where: { storeId },
      create: {
        storeId,
        facebook: data.socialMedia?.facebook || "",
        instagram: data.socialMedia?.instagram || "",
        tiktok: data.socialMedia?.tiktok || "",
        whatsapp: data.socialMedia?.whatsapp || "",
      },
      update: {
        facebook: data.socialMedia?.facebook,
        instagram: data.socialMedia?.instagram,
        tiktok: data.socialMedia?.tiktok,
        whatsapp: data.socialMedia?.whatsapp,
      },
    });

    if (data.checkoutFields) {
      await db.checkoutFields.upsert({
        where: { storeId },
        create: {
          storeId,
          shippingType: data.checkoutFields.shippingType,
          name: data.checkoutFields.name,
          phone: data.checkoutFields.phone,
          email: data.checkoutFields.email,
          address: data.checkoutFields.address,
          city: data.checkoutFields.city,
        },
        update: {
          shippingType: data.checkoutFields.shippingType,
          name: data.checkoutFields.name,
          phone: data.checkoutFields.phone,
          email: data.checkoutFields.email,
          address: data.checkoutFields.address,
          city: data.checkoutFields.city,
        },
      });
    }

    return { success: true, message: "Store information updated successfully" };
  } catch (error) {
    console.error("Error updating store:", error);
    return {
      success: false,
      message: "Failed to update store information",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateStoreBanners(
  storeId: string,
  banners: {
    id: string;
    imageUrl?: string | null;
    title?: string | null;
    titleColor?: string | null;
    description?: string | null;
    descriptionColor?: string | null;
    backgroundColor?: string | null;
    buttonText: string;
    buttonLink: string;
    textColor: string;
    buttonBackgroundColor: string;
    borderColor?: string;
  }[]
) {
  try {
    // Delete existing banners
    await db.callToActionButton.deleteMany({
      where: {
        homeBanner: {
          storeId: storeId,
        },
      },
    });

    await db.homeBanner.deleteMany({
      where: { storeId },
    });

    // Create new banners
    for (const banner of banners) {
      // Create button first
      const button = await db.callToActionButton.create({
        data: {
          buttonText: banner.buttonText,
          buttonLink: banner.buttonLink,
          textColor: banner.textColor,
          backgroundColor: banner.buttonBackgroundColor,
          borderColor: banner.borderColor || "transparent",
        },
      });

      // Create banner with button relation
      await db.homeBanner.create({
        data: {
          title: banner.title || "",
          titleColor: banner.titleColor || "#000000",
          description: banner.description || "",
          descriptionColor: banner.descriptionColor || "#000000",
          backgroundColor: banner.backgroundColor || "center",
          imageUrl: banner.imageUrl || "",
          buttonId: button.id,
          storeId: storeId,
        },
      });
    }

    return { success: true, message: "Banners updated successfully" };
  } catch (error) {
    console.error("Error updating store banners:", error);
    return { success: false, message: String(error) };
  }
}

// Add these to storeActions.ts
export async function updateStorePages(
  storeId: string,
  data: {
    home: boolean;
    products: boolean;
    about: boolean;
    contact: boolean;
  }
) {
  try {
    await db.storePages.upsert({
      where: { storeId },
      create: {
        storeId,
        ...data,
      },
      update: data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating store pages:", error);
    return { success: false, message: String(error) };
  }
}

export async function updateAboutUs(
  storeId: string,
  data: {
    introText: string;
    howWorks: boolean;
    ourValues: boolean;
    aboutUs: boolean;
    ourProducts: {
      id?: string;
      description: string;
      imageUrl: string;
    }[];
  }
) {
  try {
    // First, delete existing product entries if there are any
    const existingAboutUs = await db.aboutUs.findUnique({
      where: { storeId },
      include: { ourProducts: true },
    });

    if (existingAboutUs) {
      await db.ourProducts.deleteMany({
        where: { aboutUsId: existingAboutUs.id },
      });

      // Update the about us record
      await db.aboutUs.update({
        where: { id: existingAboutUs.id },
        data: {
          introText: data.introText,
          howWorks: data.howWorks,
          ourValues: data.ourValues,
          aboutUs: data.aboutUs,
        },
      });

      // Create new product entries
      for (const product of data.ourProducts) {
        await db.ourProducts.create({
          data: {
            description: product.description,
            imageUrl: product.imageUrl,
            aboutUsId: existingAboutUs.id,
          },
        });
      }
    } else {
      // Create a new about us record with products
      const aboutUs = await db.aboutUs.create({
        data: {
          storeId,
          introText: data.introText,
          howWorks: data.howWorks,
          ourValues: data.ourValues,
          aboutUs: data.aboutUs,
          ourProducts: {
            create: data.ourProducts.map((product) => ({
              description: product.description,
              imageUrl: product.imageUrl,
            })),
          },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating about us:", error);
    return { success: false, message: String(error) };
  }
}

export async function updateContactUs(
  storeId: string,
  data: {
    introText: string;
    workingTime: object;
    requestDesign: boolean;
  }
) {
  try {
    const workingTimeString =
      typeof data.workingTime === "object"
        ? JSON.stringify(data.workingTime)
        : data.workingTime;

    await db.contactUs.upsert({
      where: { storeId },
      create: {
        storeId,
        introText: data.introText,
        workingTime: workingTimeString,
        requestDesign: data.requestDesign,
      },
      update: {
        introText: data.introText,
        workingTime: workingTimeString,
        requestDesign: data.requestDesign,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating contact us:", error);
    return { success: false, message: String(error) };
  }
}

export async function getStoreNetEarning(storeId: string) {
  try {
    // Fetch all orders for this store
    const orders = await db.order.findMany({
      where: {
        storeId,
        isDeleted: false,
      },
    });

    if (!orders || orders.length === 0) {
      return {
        success: true,
        data: {
          deliveredTotal: 0,
          totalDeliveryFees: 0,
          totalMonkeyPrintEarnings: 0,
          totalReturnFees: 0,
          netEarnings: 0,
          fulfilledOrdersCount: 0,
          canceledOrdersCount: 0,
        },
      };
    }

    // Filter orders by status
    const fulfilledOrders = orders.filter(
      (order) => order.status === "FULFILLED"
    );
    const canceledOrders = orders.filter(
      (order) => order.status === "CANCELED"
    );

    // Calculate delivered total
    const deliveredTotal = fulfilledOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Calculate total delivery fees
    const totalDeliveryFees = fulfilledOrders.reduce((sum, order) => {
      return sum + (order.shippingMethod === "EXPRESS" ? 7 : 5);
    }, 0);

    // Calculate total MonkeyPrint earnings (10% of each order's value after shipping fees)
    const totalMonkeyPrintEarnings = fulfilledOrders.reduce((sum, order) => {
      const deliveryFee = order.shippingMethod === "EXPRESS" ? 7 : 5;
      const totalAfterFees = order.totalPrice - deliveryFee;
      return sum + totalAfterFees * 0.1;
    }, 0);

    // Calculate total return fees (5 per canceled order)
    const totalReturnFees = canceledOrders.length * 5;

    // Calculate net earnings
    const netEarnings =
      deliveredTotal -
      totalDeliveryFees -
      totalReturnFees -
      totalMonkeyPrintEarnings;

    return {
      success: true,
      data: {
        deliveredTotal,
        totalDeliveryFees,
        totalMonkeyPrintEarnings,
        totalReturnFees,
        netEarnings,
        fulfilledOrdersCount: fulfilledOrders.length,
        canceledOrdersCount: canceledOrders.length,
      },
    };
  } catch (error) {
    console.error("Error calculating store net earnings:", error);
    return {
      success: false,
      error: "Failed to calculate net earnings",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
