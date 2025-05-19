import { CategoryType, OrderStatus, ShippingMethod } from "@monkeyprint/db";
import { OrderWithItems } from "./actions/orderActions";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
}

export interface ChatOrder {
  id: string;
  items: ChatOrderItem[];
  totalPrice: number;
  shippingMethod: "STANDARD" | "EXPRESS";
  contactInfo: ContactInfo;
}

export interface ChatOrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
}

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

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  storeId: string;
  stock: number | null;
  categories: ProductCategory[];
  categoryIds?: string[];
}

export interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  loadProducts: () => Promise<void>;
  loadStoreProducts: (storeId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  filterByCategories: (categoryIds: string[]) => Promise<void>;
  filterByStoreAndCategories: (
    storeId: string,
    categoryIds: string[]
  ) => Promise<void>;
}

export interface IUpdatedProductData {
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  stock?: number;
}

export interface IProductData {
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  stock?: number;
  storeId?: string;
  categoryIds?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
}

export interface CartState {
  cart: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  updateCartItemQuantity: (
    productId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentCategories?: CategoryRelation[];
  childCategories?: CategoryRelation[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CategoryState {
  targetCategories: Category[];
  productCategories: Category[];
  subproductCategories: Category[];
  categoryRelations: CategoryRelations;
  loading: boolean;
  refreshCategories: () => Promise<void>;
  getProductCategoriesByTarget: (targetId: string) => Category[];
  getSubproductCategoriesByProduct: (productId: string) => Category[];
}

export interface CategoryRelations {
  [key: string]: {
    parents: string[];
    children: string[];
  };
}

export interface CategoryRelation {
  parentId: string;
  childId: string;
  parent?: Category;
  child?: Category;
}

export interface ICategoryData {
  name: string;
  type: CategoryType;
  parentIds?: string[];
}

/* export interface CategoryType {
  TARGET: "TARGET";
  PRODUCT: "PRODUCT";
  SUBPRODUCT: "SUBPRODUCT";
} */

export interface ProductCategory {
  productId: string;
  categoryId: string;
  category: Category;
}

export interface CategoriesFilterProps {
  selectedCategory: string;
  selectedSubCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  onSubCategorySelect: (subCategoryIds: string[]) => void;
}

export interface ProductCategorySectionProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSubCategories: string[];
  onSubCategorySelect: (subCategoryId: string) => void;
}

export interface SubcategoriesProps {
  subcategories: Category[];
  selectedSubcategories: string[];
  onSubcategoryClick: (subcategoryId: string) => void;
}

export interface CategoryResponse {
  success: boolean;
  category?: Category;
  categories?: Category[];
  error?: string;
}

export interface ProductResponse {
  success: boolean;
  product?: Product;
  products?: Product[];
  error?: string;
}

export interface PaginationProps {
  take: number;
  skip: number;
}

export interface ContactInfo {
  id: string;
  name: string;
  orderId: string;
  phone: string;
  email: string | null;
  country: string;
  address: string;
  city: string;
}
export interface OrderItem extends CartItem {
  orderId: string;
  productId: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  status: OrderStatus;
  totalPrice: number;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  items: OrderItem[];
  contactInfo: ContactInfo | null;
  createdAt: Date;
  updatedAt: Date;
  storeId: string;
  isDeleted: boolean;
}

export interface OrderResponse {
  success: boolean;
  order?: OrderWithItems;
  orders?: OrderWithItems[];
  error?: string;
}
