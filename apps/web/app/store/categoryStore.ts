import { createStore } from "zustand/vanilla";
import { CategoryState, CategoryRelations } from "@/types";
import { listCategories } from "@/actions/categoryActions";

export const categoryStore = createStore<CategoryState>()((set, get) => ({
  targetCategories: [],
  productCategories: [],
  subproductCategories: [],
  categoryRelations: {},
  loading: true,

  refreshCategories: async () => {
    set({ loading: true });
    try {
      const result = await listCategories();

      if (result.success && result.categories) {
        // Filter by type
        const targetCategories = result.categories.filter(
          (cat) => cat.type === "TARGET"
        );
        const productCategories = result.categories.filter(
          (cat) => cat.type === "PRODUCT"
        );
        const subproductCategories = result.categories.filter(
          (cat) => cat.type === "SUBPRODUCT"
        );

        // Build the category relations lookup map
        const relations: CategoryRelations = {};

        // Initialize all categories
        result.categories.forEach((cat) => {
          relations[cat.id] = { parents: [], children: [] };
        });

        // Populate the relations
        result.categories.forEach((cat) => {
          // Add parent-child relations
          if (cat.parentCategories?.length) {
            cat.parentCategories.forEach((relation) => {
              relations[cat.id].parents.push(relation.parentId);

              if (relations[relation.parentId]) {
                relations[relation.parentId].children.push(cat.id);
              }
            });
          }

          // Add child-parent relations
          if (cat.childCategories?.length) {
            cat.childCategories.forEach((relation) => {
              relations[cat.id].children.push(relation.childId);

              if (relations[relation.childId]) {
                relations[relation.childId].parents.push(cat.id);
              }
            });
          }
        });

        set({
          targetCategories,
          productCategories,
          subproductCategories,
          categoryRelations: relations,
          loading: false,
        });
      } else {
        console.error("Error loading categories:", result.error);
        set({
          targetCategories: [],
          productCategories: [],
          subproductCategories: [],
          categoryRelations: {},
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      set({
        targetCategories: [],
        productCategories: [],
        subproductCategories: [],
        categoryRelations: {},
        loading: false,
      });
    }
  },

  getProductCategoriesByTarget: (targetId) => {
    const { productCategories, categoryRelations } = get();

    if (targetId === "all") {
      return productCategories;
    }

    const childrenIds = categoryRelations[targetId]?.children || [];
    return productCategories.filter((cat) => childrenIds.includes(cat.id));
  },

  getSubproductCategoriesByProduct: (productId) => {
    const { subproductCategories, categoryRelations } = get();
    const childrenIds = categoryRelations[productId]?.children || [];
    return subproductCategories.filter((cat) => childrenIds.includes(cat.id));
  },
}));
