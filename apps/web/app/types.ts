// types.ts

export interface ProductOption {
  id: string;
  name: string;
  price?: number; 
  ImpressionType?: string;
  link?: string;
  description:string;
  images: {
    front: string;
    back: string;
  };
}
