import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Category, Link } from "./types";
import { getStorage, setStorage } from "./store";

interface UIContextType {
    activeModal: "add-link" | "category" | "search" | null;
    selectedCategory: Category | null;
    selectedLink: Link | null;
    defaultCategoryId: string | null;
    isOnboardingOpen: boolean;
    openAddLink: (categoryId?: string, link?: Link) => void;
    openCategory: (category?: Category) => void;
    openSearch: () => void;
    closeModal: () => void;
    completeOnboarding: (categories: Category[]) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [activeModal, setActiveModal] = useState<"add-link" | "category" | "search" | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Check onboarding status on mount
    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const hasCompleted = await getStorage<boolean>("onboarding-completed");
                if (!hasCompleted) {
                    setIsOnboardingOpen(true);
                }
            } catch (error) {
                console.error("Failed to check onboarding status:", error);
                // Fallback: if store fails, we might want to default to closed or open 
                // depending on how critical it is. For now, just proceed to let user see app
            } finally {
                setIsInitialized(true);
            }
        };
        checkOnboarding();
    }, []);

    const openAddLink = (categoryId?: string, link?: Link) => {
        setDefaultCategoryId(categoryId || null);
        setSelectedLink(link || null);
        setActiveModal("add-link");
    };

    const openCategory = (category?: Category) => {
        setSelectedCategory(category || null);
        setActiveModal("category");
    };

    const openSearch = () => {
        setActiveModal("search");
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedCategory(null);
        setSelectedLink(null);
        setDefaultCategoryId(null);
    };

    const completeOnboarding = async (categories: Category[]) => {
        await setStorage("tote-categories", categories);
        await setStorage("onboarding-completed", true);
        setIsOnboardingOpen(false);
        // Page level reload or state update will happen via useCategories
        window.location.reload();
    };

    if (!isInitialized) return null; // Or a splash screen

    return (
        <UIContext.Provider value={{
            activeModal,
            selectedCategory,
            selectedLink,
            defaultCategoryId,
            isOnboardingOpen,
            openAddLink,
            openCategory,
            openSearch,
            closeModal,
            completeOnboarding
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
}
