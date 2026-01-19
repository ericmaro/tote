/**
 * Category page - shows links in a specific category
 */

import { createFileRoute } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState, useMemo } from "react";
import { useLinks } from "../hooks/use-links";
import { useCategories } from "../hooks/use-categories";
import { LinkCard } from "../components/LinkCard.tsx";
import { AddLinkButton } from "../components/AddLinkButton.tsx";
import { InboxIcon } from "../components/Icons.tsx";

function CategoryIcon({ icon, color, size = 18 }: { icon: string; color: string; size?: number }) {
    const IconComp = (LucideIcons as any)[icon] || LucideIcons.Link;
    return <IconComp size={size} style={{ color }} />;
}

export const Route = createFileRoute("/category/$categoryId")({
    component: CategoryPage,
});

function CategoryPage() {
    const { categoryId } = Route.useParams();
    const { getLinksByCategory } = useLinks();
    const { categories } = useCategories();
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const category = categories.find((c) => c.id === categoryId);
    const allLinks = getLinksByCategory(categoryId);

    // Get unique tags for this category
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        allLinks.forEach(link => {
            link.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [allLinks]);

    const filteredLinks = useMemo(() => {
        if (!selectedTag) return allLinks;
        return allLinks.filter(link => link.tags?.includes(selectedTag));
    }, [allLinks, selectedTag]);

    if (!category) {
        return (
            <>
                <header className="main-topbar" data-tauri-drag-region>
                    <div className="main-topbar-left">
                        <span className="workspace-title-text">Category not found</span>
                    </div>
                </header>
                <div className="main-content">
                    <div className="empty-state">
                        <p>This category doesn't exist.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className="main-topbar" data-tauri-drag-region>
                <div className="main-topbar-left">
                    <div className="workspace-title-line">
                        <div className="workspace-title">
                            <CategoryIcon icon={category.icon} color={category.color} size={16} />
                            <span className="workspace-title-text">{category.name}</span>
                        </div>
                    </div>
                    {availableTags.length > 0 && (
                        <>
                            <div className="tag-filter-divider" />
                            <div className="tag-filter-bar">
                                <div
                                    className={`tag-filter-item ${!selectedTag ? "active" : ""}`}
                                    onClick={() => setSelectedTag(null)}
                                >
                                    All
                                </div>
                                {availableTags.map(tag => (
                                    <div
                                        key={tag}
                                        className={`tag-filter-item ${selectedTag === tag ? "active" : ""}`}
                                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    >
                                        #{tag}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="main-topbar-right">
                    <AddLinkButton categoryId={categoryId} />
                </div>
            </header>

            <div className="main-content">
                {allLinks.length === 0 ? (
                    <div className="empty-state">
                        <InboxIcon size={48} className="empty-state-icon" />
                        <h2 className="empty-state-title">No links in this category</h2>
                        <p className="empty-state-description">
                            Add your first link to this category.
                        </p>
                        <AddLinkButton categoryId={categoryId} />
                    </div>
                ) : (
                    <div className="links-grid">
                        {filteredLinks.map((link) => (
                            <LinkCard key={link.id} link={link} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
