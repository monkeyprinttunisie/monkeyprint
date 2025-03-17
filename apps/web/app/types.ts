import { CategoryType } from "@monkeyprint/db";

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  stock: number | null;
  categories: ProductCategory[];
  categoryIds?: string[];
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
  categoryIds?: string[]; // Added categoryIds field
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
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