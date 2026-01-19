/**
 * Hook for managing categories (now powered by global DataContext)
 */

import { useData } from "../lib/data-context";

export function useCategories() {
    const {
        categories,
        isCategoriesLoading: isLoading,
        addCategory,
        updateCategory,
        deleteCategory
    } = useData();

    return {
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}
