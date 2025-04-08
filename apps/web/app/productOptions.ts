import { ProductOption } from "@/types"
// Product Data
export const products: Record<string, ProductOption> = {
  tshirt: {
    id: "tshirt",
    name: "T-Shirt",
    description: "it's a white tshirt that...",
    images: {
      front: "/images/frontSweatshirt.png",
      back: "/images/backSweatshirt.png",

    },
    designZones: {
      front: [
        {
          id: "frontChest",
          name: "Front Print Area",
          x: 0, 
          y: -20,
          width: 150, 
          height: 250, 
          rotation: 0,
          maxImagesAllowed: 5
        }
      ],
      back: [
        {
          id: "backCenter",
          name: "Back Print Area",
          x: 0,
          y: -30,
          width: 250,
          height: 300,
          rotation: 0,
          maxImagesAllowed: 5
        }
      ]
    }
  },
  hoodie: {
    id: "hoodie",
    name: "Hoodie",
    description: "it's a trendy hoodie that...",
    images: {
      front: "/images/hoodie-front.png",
      back: "/images/hoodie-back.png",
    },
    designZones: {
      front: [
        {
          id: "frontChest",
          name: "Front Print Area",
          x: 0, // center position (can be negative)
          y: -20, // slightly above center
          width: 250, // width in pixels
          height: 300, // height in pixels
          rotation: 0,
          maxImagesAllowed: 5
        }
      ],
      back: [
        {
          id: "backCenter",
          name: "Back Print Area",
          x: 0,
          y: -30,
          width: 250,
          height: 300,
          rotation: 0,
          maxImagesAllowed: 5
        }
      ]
    }
  },
  mug: {
    id: "mug",
    name: "Mug",
    description: "it's an original mug that...",
    images: {
      front: "/images/mug-front.png",
      back: "/images/mug-back.png",
    },
    designZones: {
      front: [
        {
          id: "frontCenter",
          name: "Front Print Area",
          x: 0,
          y: 0,
          width: 150,
          height: 100,
          rotation: 0,
          maxImagesAllowed: 3
        }
      ],
      back: [
        {
          id: "backCenter",
          name: "Back Print Area",
          x: 0,
          y: 0,
          width: 150,
          height: 100,
          rotation: 0,
          maxImagesAllowed: 3
        }
      ]
    }
  },
  casque: {
    id: "casque",
    name: "Casque",
    description: "it's a white casque that...",
    images: {
      front: "/images/casque-front.png",
      back: "/images/casque-back.png",
    },
    designZones: {
      front: [
        {
          id: "frontChest",
          name: "Front Print Area",
          x: 0, // center position (can be negative)
          y: -20, // slightly above center
          width: 250, // width in pixels
          height: 300, // height in pixels
          rotation: 0,
          maxImagesAllowed: 5
        }
      ],
      back: [
        {
          id: "backCenter",
          name: "Back Print Area",
          x: 0,
          y: -30,
          width: 250,
          height: 300,
          rotation: 0,
          maxImagesAllowed: 5
        }
      ]
    }
  },
};