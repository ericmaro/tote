import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { Link, Category, DEFAULT_CATEGORIES } from "./types";
import { getStorage, setStorage } from "./store";
import { invoke } from "@tauri-apps/api/core";

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

    // Links Actions
    const updateLink = useCallback((id: string, updates: Partial<Link>) => {
        setLinks((prev) => {
            const currentLink = prev.find(l => l.id === id);
            const urlChanged = currentLink && updates.url && updates.url !== currentLink.url;

            if (urlChanged) {
                invoke("cache_link", { id, url: updates.url! })
                    .then((result: any) => {
                        setLinks((innerPrev) =>
                            innerPrev.map((link) =>
                                link.id === id
                                    ? {
                                        ...link,
                                        cachedContentPath: result.content_path,
                                        localIconPath: result.icon_path,
                                        localImagePath: result.image_path,
                                    }
                                    : link
                            )
                        );
                    })
                    .catch(console.error);
            }

            return prev.map((link) => (link.id === id ? { ...link, ...updates } : link));
        });
    }, []);

    const addLink = useCallback((link: Omit<Link, "id" | "createdAt">) => {
        const newLink: Link = {
            ...link,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
        };
        setLinks((prev) => [newLink, ...prev]);

        // Trigger caching in background
        invoke("cache_link", { id: newLink.id, url: newLink.url })
            .then((result: any) => {
                updateLink(newLink.id, {
                    cachedContentPath: result.content_path,
                    localIconPath: result.icon_path,
                    localImagePath: result.image_path,
                });
            })
            .catch(console.error);

        return newLink;
    }, [updateLink]);

    const deleteLink = useCallback((id: string) => {
        setLinks((prev) => prev.filter((link) => link.id !== id));
        invoke("remove_cached_link", { id }).catch(console.error);
    }, []);

    const refreshLinkMetadata = useCallback(async (id: string) => {
        const link = links.find(l => l.id === id);
        if (!link) return;

        try {
            const result: any = await invoke("cache_link", { id, url: link.url });
            updateLink(id, {
                cachedContentPath: result.content_path,
                localIconPath: result.icon_path,
                localImagePath: result.image_path,
            });
        } catch (error) {
            console.error("Failed to refresh metadata:", error);
            throw error;
        }
    }, [links, updateLink]);

    const getLinksByCategory = useCallback((categoryId: string) => {
        if (categoryId === "all") return links;
        return links.filter((link) => link.categoryId === categoryId);
    }, [links]);

    const recentLinks = useMemo(() => {
        return [...links].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
    }, [links]);

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
