import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { Link, Category, DEFAULT_CATEGORIES } from "./types";
import { getStorage, setStorage } from "./store";
import { invoke } from "@tauri-apps/api/core";
import { useTrayEvents } from "../hooks/use-tray-events";

const CATEGORIES_KEY = "tote-categories";
const LINKS_KEY = "tote-links";

interface DataContextType {
    categories: Category[];
    links: Link[];
    isCategoriesLoading: boolean;
    isLinksLoading: boolean;
    addCategory: (category: Omit<Category, "id">) => Category;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    addLink: (link: Omit<Link, "id" | "createdAt">) => Link;
    updateLink: (id: string, updates: Partial<Link>) => void;
    deleteLink: (id: string) => void;
    refreshLinkMetadata: (id: string) => Promise<void>;
    getLinksByCategory: (categoryId: string) => Link[];
    recentLinks: Link[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
    const [isLinksLoading, setIsLinksLoading] = useState(true);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const storedCats = await getStorage<Category[]>(CATEGORIES_KEY);
                if (storedCats) {
                    setCategories(storedCats);
                } else {
                    setCategories(DEFAULT_CATEGORIES);
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
                setCategories(DEFAULT_CATEGORIES);
            } finally {
                setIsCategoriesLoading(false);
            }

            try {
                const storedLinks = await getStorage<Link[]>(LINKS_KEY);
                if (storedLinks) {
                    // Migrate old links that don't have tags
                    const migratedLinks = storedLinks.map(link => ({
                        ...link,
                        tags: link.tags || []
                    }));
                    setLinks(migratedLinks);
                }
            } catch (error) {
                console.error("Failed to load links:", error);
            } finally {
                setIsLinksLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Persistence effects
    useEffect(() => {
        if (!isCategoriesLoading) {
            setStorage(CATEGORIES_KEY, categories);
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        }
    }, [categories, isCategoriesLoading]);

    useEffect(() => {
        if (!isLinksLoading) {
            setStorage(LINKS_KEY, links);
            localStorage.setItem(LINKS_KEY, JSON.stringify(links));
        }
    }, [links, isLinksLoading]);

    // Categories Actions
    const addCategory = useCallback((category: Omit<Category, "id">) => {
        const newCategory: Category = {
            ...category,
            id: crypto.randomUUID(),
        };
        setCategories((prev) => [...prev, newCategory]);
        return newCategory;
    }, []);

    const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
        setCategories((prev) =>
            prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
        );
    }, []);

    const deleteCategory = useCallback((id: string) => {
        if (id === "all") return;
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }, []);

    const refreshLinkMetadata = useCallback(async (id: string) => {
        // We use setLinks with a callback to ensure we have the latest state 
        // without depending directly on the 'links' variable which might cause excessive rerenders
        setLinks((prev) => {
            const link = prev.find(l => l.id === id);
            if (!link) return prev;

            invoke("cache_link", { id, url: link.url })
                .then((result: any) => {
                    setLinks((innerPrev) =>
                        innerPrev.map((l) =>
                            l.id === id
                                ? {
                                    ...l,
                                    title: result.title,
                                    description: result.description,
                                    icon: result.icon,
                                    image: result.image,
                                    cachedContentPath: result.content_path,
                                    localIconPath: result.icon_path,
                                    localImagePath: result.image_path,
                                }
                                : l
                        )
                    );
                })
                .catch(err => console.error("Failed to refresh metadata:", err));

            return prev;
        });
    }, []);

    // Links Actions
    const updateLink = useCallback((id: string, updates: Partial<Link>) => {
        setLinks((prev) => {
            const currentLink = prev.find(l => l.id === id);
            const urlChanged = currentLink && updates.url && updates.url !== currentLink.url;

            const nextState = prev.map((link) => (link.id === id ? { ...link, ...updates } : link));

            if (urlChanged) {
                setTimeout(() => refreshLinkMetadata(id), 0);
            }

            return nextState;
        });
    }, [refreshLinkMetadata]);

    const addLink = useCallback((link: Omit<Link, "id" | "createdAt">) => {
        const newLink: Link = {
            ...link,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
        };

        setLinks((prev) => [newLink, ...prev]);

        // Trigger caching immediately using the consolidated logic
        setTimeout(() => refreshLinkMetadata(newLink.id), 50);

        return newLink;
    }, [refreshLinkMetadata]);

    const deleteLink = useCallback((id: string) => {
        setLinks((prev) => prev.filter((link) => link.id !== id));
        invoke("remove_cached_link", { id }).catch(console.error);
    }, []);

    const getLinksByCategory = useCallback((categoryId: string) => {
        if (categoryId === "all") return links;
        return links.filter((link) => link.categoryId === categoryId);
    }, [links]);

    const recentLinks = useMemo(() => {
        return [...links].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
    }, [links]);

    // Handle system tray "Add Link from Clipboard" events
    const handleTrayAddLink = useCallback((url: string) => {
        // Get the first non-"all" category
        const defaultCategory = categories.find(c => c.id !== "all");
        const categoryId = defaultCategory?.id || "personal";

        addLink({
            url,
            title: new URL(url).hostname,
            description: null,
            icon: null,
            image: null,
            categoryId,
            tags: [],
        });
    }, [categories, addLink]);

    useTrayEvents({ onAddLink: handleTrayAddLink });

    return (
        <DataContext.Provider value={{
            categories,
            links,
            isCategoriesLoading,
            isLinksLoading,
            addCategory,
            updateCategory,
            deleteCategory,
            addLink,
            updateLink,
            deleteLink,
            refreshLinkMetadata,
            getLinksByCategory,
            recentLinks
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
