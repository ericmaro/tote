/**
 * TOTE - Sidebar Component
 * CodexMonitor-style category navigation
 */

import { Link, useLocation } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useCategories } from "../hooks/use-categories";
import { useUI } from "../lib/ui-store";
import {
    FolderIcon,
    PlusIcon,
    SettingsIcon,
    MoreIcon,
    SearchIcon,
} from "./Icons";

// Map icon name to actual icon component from Lucide
export function CategoryIcon({ icon, color, size = 14 }: { icon: string; color: string; size?: number }) {
    const IconComp = (LucideIcons as any)[icon] || LucideIcons.Link;
    return <IconComp size={size} style={{ color }} />;
}

export function Sidebar() {
    const location = useLocation();
    const { categories } = useCategories();
    const { openCategory, openSearch } = useUI();

    const currentPath = location.pathname;
    const isHome = currentPath === "/";

    return (
        <aside className="sidebar" data-tauri-drag-region>
            {/* Header */}
            <div className="sidebar-header" data-tauri-drag-region>
                <h1 className="sidebar-title">
                    <FolderIcon size={14} />
                    Categories
                </h1>
                <button
                    className="workspace-add"
                    title="Add category"
                    onClick={() => openCategory()}
                    style={{ webkitAppRegion: 'no-drag' } as any}
                >
                    <PlusIcon size={12} />
                </button>
            </div>

            {/* Global Search Feature */}
            <div className="sidebar-search-container">
                <button className="sidebar-search-trigger" onClick={() => openSearch()} style={{ webkitAppRegion: 'no-drag' } as any}>
                    <div className="sidebar-search-left">
                        <SearchIcon size={14} />
                        <span>Search links...</span>
                    </div>
                    <span className="sidebar-search-kbd">⌘K</span>
                </button>
            </div>

            {/* Category List */}
            <div className="sidebar-body">
                <div className="workspace-list">
                    {categories.map((category) => {
                        const isActive = category.id === "all"
                            ? isHome
                            : currentPath === `/category/${category.id}`;

                        return (
                            <div key={category.id} className="workspace-card">
                                <div className="workspace-row-container">
                                    <Link
                                        to={category.id === "all" ? "/" : "/category/$categoryId"}
                                        params={category.id === "all" ? {} : { categoryId: category.id }}
                                        className="sidebar-link"
                                        style={{ flex: 1 }}
                                    >
                                        <div className={`workspace-row ${isActive ? "active" : ""}`}>
                                            <div className="workspace-name-row">
                                                {isActive && (
                                                    <span
                                                        className="active-dot-category"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                )}
                                                <div className="workspace-title">
                                                    <CategoryIcon icon={category.icon} color={category.color} size={14} />
                                                    <span className="workspace-name">{category.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {category.id !== "all" && (
                                        <button
                                            className="category-edit-trigger"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openCategory(category);
                                            }}
                                        >
                                            <MoreIcon size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Corner Actions */}
            <div className="sidebar-corner-actions">
                <button className="sidebar-corner-button" title="Settings">
                    <SettingsIcon size={14} />
                </button>
            </div>
        </aside>
    );
}
