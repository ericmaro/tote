/**
 * Home / All Links page
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useLinks } from "../hooks/use-links";
import { LinkCard } from "../components/LinkCard.tsx";
import { AddLinkButton } from "../components/AddLinkButton.tsx";
import { RefetchPreviewsButton } from "../components/RefetchPreviewsButton.tsx";
import { InboxIcon } from "../components/Icons.tsx";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    const { links } = useLinks();
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Get all unique tags from all links
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        links.forEach(link => {
            link.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [links]);

    const filteredLinks = useMemo(() => {
        const sorted = [...links].sort((a, b) => b.createdAt - a.createdAt);
        if (!selectedTag) return sorted;
        return sorted.filter(link => link.tags?.includes(selectedTag));
    }, [links, selectedTag]);

    return (
        <>
            <header className="main-topbar" data-tauri-drag-region>
                <div className="main-topbar-left">
                    <div className="workspace-title-line">
                        <span className="workspace-title-text">All Links</span>
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
                    <RefetchPreviewsButton linkIds={filteredLinks.map(l => l.id)} />
                    <AddLinkButton />
                </div>
            </header>

            <div className="main-content">
                {links.length === 0 ? (
                    <div className="empty-state">
                        <InboxIcon size={48} className="empty-state-icon" />
                        <h2 className="empty-state-title">No links yet</h2>
                        <p className="empty-state-description">
                            Start by adding your first link. We'll automatically fetch the title,
                            description, and preview image.
                        </p>
                        <AddLinkButton />
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
