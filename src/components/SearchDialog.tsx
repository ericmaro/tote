import { useState, useMemo, useEffect, useRef } from "react";
import { useLinks } from "../hooks/use-links";
import { SearchIcon, LinkIcon } from "./Icons";
import { CategoryIcon } from "./Sidebar";
import { useCategories } from "../hooks/use-categories";

interface SearchDialogProps {
    onClose: () => void;
}

export function SearchDialog({ onClose }: SearchDialogProps) {
    const { links } = useLinks();
    const { categories } = useCategories();
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const filteredLinks = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return links.filter(link =>
            link.title?.toLowerCase().includes(q) ||
            link.url.toLowerCase().includes(q) ||
            link.description?.toLowerCase().includes(q) ||
            link.tags?.some(tag => tag.toLowerCase().includes(q))
        ).slice(0, 8); // Limit results for speed/ui
    }, [links, query]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredLinks]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredLinks.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredLinks.length) % filteredLinks.length);
        } else if (e.key === "Enter" && filteredLinks[selectedIndex]) {
            e.preventDefault();
            window.open(filteredLinks[selectedIndex].url, "_blank");
            onClose();
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    const getCategory = (id: string) => categories.find(c => c.id === id);

    return (
        <div className="dialog-backdrop search-backdrop" onClick={onClose}>
            <div className="search-dialog" onClick={e => e.stopPropagation()}>
                <div className="search-input-wrapper">
                    <SearchIcon size={18} className="search-input-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Search all links..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="search-kbd-hint">ESC</div>
                </div>

                {query.trim() !== "" && (
                    <div className="search-results" ref={scrollRef}>
                        {filteredLinks.length > 0 ? (
                            filteredLinks.map((link, index) => {
                                const category = getCategory(link.categoryId);
                                return (
                                    <div
                                        key={link.id}
                                        className={`search-result-item ${index === selectedIndex ? "selected" : ""}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => {
                                            window.open(link.url, "_blank");
                                            onClose();
                                        }}
                                    >
                                        <div className="result-icon">
                                            {link.icon ? (
                                                <img src={link.icon} alt="" />
                                            ) : (
                                                <LinkIcon size={16} />
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <div className="result-title">{link.title || link.url}</div>
                                            <div className="result-url">{link.url}</div>
                                            {link.tags && link.tags.length > 0 && (
                                                <div className="search-result-tags">
                                                    {link.tags.map(tag => (
                                                        <span key={tag} className="search-result-tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {category && (
                                            <div className="result-category">
                                                <CategoryIcon icon={category.icon} color={category.color} size={10} />
                                                <span>{category.name}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="search-empty">No links found for "{query}"</div>
                        )}
                    </div>
                )}

                <div className="search-footer">
                    <div className="search-shortcut-hint">
                        <span>↑↓</span> to navigate
                        <span className="kbd">↵</span> to open
                    </div>
                </div>
            </div>
        </div>
    );
}
