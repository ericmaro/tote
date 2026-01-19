/**
 * Core types for Tote link collection app
 */

export interface Link {
    id: string;
    url: string;
    title: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    categoryId: string;
    tags: string[];
    createdAt: number;
    cachedContentPath?: string;
    localIconPath?: string;
    localImagePath?: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string; // Lucide icon name
    color: string; // Hex color
}

export interface LinkMetadata {
    title: string;
    description: string | null;
    icon: string | null;
    image: string | null;
}

// Default categories with Lucide icon names and colors
export const DEFAULT_CATEGORIES: Category[] = [
    { id: "all", name: "All Links", icon: "Link", color: "var(--border-accent)" },
    { id: "work", name: "Work", icon: "Briefcase", color: "#4da3ff" },
    { id: "personal", name: "Personal", icon: "User", color: "#3fe47e" },
    { id: "learning", name: "Learning", icon: "BookOpen", color: "#ff9f43" },
    { id: "entertainment", name: "Entertainment", icon: "Gamepad2", color: "#ff4d4d" },
];
