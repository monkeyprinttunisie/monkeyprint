// types.ts
export interface DesignZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  maxImagesAllowed?: number;
}
export interface ProductOption {
  id: string;
  name: string;
  price?: number;
  ImpressionType?: string;
  link?: string;
  description: string;
  images: {
    front: string;
    back: string;
  };
  designZones: {
    front: DesignZone[];
    back: DesignZone[];
  };
}
