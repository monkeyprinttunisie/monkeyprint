import {ProductOption} from "@/types"
// Product Data
export const products: Record<string, ProductOption> = {
    tshirt: {
      id: "tshirt",
      name: "T-Shirt",
      description:"it's a white tshirt that...",
      images: {
        front: "/images/frontTshirt.png",
        back: "/images/backTshirt.png",
      },
    },
    hoodie: {
      id: "hoodie",
      name: "Hoodie",
      description:"it's a trendy hoodie that...",
      images: {
        front: "/images/hoodie-front.png",
        back: "/images/hoodie-back.png",
      },
    },
    mug: {
      id: "mug",
      name: "Mug",
      description:"it's an original mug that...",
      images: {
        front: "/images/mug-front.png",
        back: "/images/mug-back.png",
      },
    },
    casque: {
      id: "casque",
      name: "Casque",
      description:"it's a white casque that...",
      images: {
        front: "/images/casque-front.png",
        back: "/images/casque-back.png",
      },
    },
  };