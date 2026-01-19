/**
 * AddLinkDialog component
 */

import React, { useState, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useLinks } from "../hooks/use-links";
import { useCategories } from "../hooks/use-categories";
import { useLinkMetadata } from "../hooks/use-link-metadata";
import { Modal } from "./Modal";
import { SmartImage } from "./SmartImage";
import { Link } from "../lib/types";
import { TagIcon, XIcon } from "./Icons";

function CategoryIcon({ icon, color, size = 14 }: { icon: string; color: string; size?: number }) {
    const IconComp = (LucideIcons as any)[icon] || LucideIcons.Link;
    return <IconComp size={size} style={{ color }} />;
}

interface AddLinkDialogProps {
    defaultCategoryId?: string;
    link?: Link;
    onClose: () => void;
}

export function AddLinkDialog({ defaultCategoryId, link, onClose }: AddLinkDialogProps) {
    const isEditing = !!link;
    const [url, setUrl] = useState(link?.url || "");
    const inputRef = useRef<HTMLInputElement>(null);
    const { addLink, updateLink } = useLinks();
    const { categories } = useCategories();

    // Initialize with a valid category (not "all")
    const [categoryId, setCategoryId] = useState(link?.categoryId || defaultCategoryId || "");
    const [tags, setTags] = useState<string[]>(link?.tags || []);
    const [tagInput, setTagInput] = useState("");

    const addTag = (e?: React.KeyboardEvent) => {
        if (e && (e.key !== "Enter" && e.key !== ",")) return;
        if (e) e.preventDefault();

        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
            setTags(prev => [...prev, tag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    useEffect(() => {
        if (!categoryId && categories.length > 0) {
            const firstReal = categories.find(c => c.id !== "all");
            if (firstReal) setCategoryId(firstReal.id);
        }
    }, [categoryId, categories]);
    const { data: metadata, isLoading } = useLinkMetadata(
        url.startsWith("http") ? url : null
    );

    useEffect(() => {
        if (!isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) return;

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) {
            finalUrl = "https://" + finalUrl;
        }

        const availableCategories = categories.filter(c => c.id !== "all");
        const finalCategoryId = categoryId === "all"
            ? (availableCategories[0]?.id || "personal")
            : categoryId;

        const linkData = {
            url: finalUrl,
            title: metadata?.title || (isEditing ? link.title : new URL(finalUrl).hostname),
            description: metadata?.description || (isEditing ? link.description : null),
            icon: metadata?.icon || (isEditing ? link.icon : null),
            image: metadata?.image || (isEditing ? link.image : null),
            categoryId: finalCategoryId,
            tags,
        };

        if (isEditing) {
            updateLink(link.id, linkData);
        } else {
            addLink(linkData);
        }

        onClose();
    };

    const footer = (
        <>
            <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
            </button>
            <button
                type="submit"
                className="button-primary"
                disabled={!url.trim()}
                onClick={handleSubmit}
            >
                {isEditing ? "Update Link" : "Add Link"}
            </button>
        </>
    );

    return (
        <Modal title={isEditing ? "Edit Link" : "Add Link"} onClose={onClose} footer={footer}>
            <div className="form-field">
                <label htmlFor="url" className="form-label">
                    URL
                </label>
                <input
                    ref={inputRef}
                    id="url"
                    type="text"
                    className="form-input"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>

            <div className="form-field">
                <label htmlFor="category" className="form-label">
                    Category
                </label>
                <div className="category-select-wrapper">
                    <select
                        id="category"
                        className="form-select"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        {categories
                            .filter((c) => c.id !== "all")
                            .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                    </select>
                    <div className="category-select-icon">
                        {(() => {
                            const availableCategories = categories.filter(c => c.id !== "all");
                            const cat = categories.find(c => c.id === categoryId) || availableCategories[0];
                            if (!cat) return null;
                            return <CategoryIcon icon={cat.icon} color={cat.color} size={16} />;
                        })()}
                    </div>
                </div>
            </div>

            <div className="form-field">
                <label className="form-label">
                    <TagIcon size={14} style={{ marginRight: 6 }} />
                    Tags
                </label>
                <div className="tag-input-container">
                    {tags.map(tag => (
                        <span key={tag} className="tag-chip">
                            {tag}
                            <span className="tag-chip-remove" onClick={() => removeTag(tag)}>
                                <XIcon size={10} />
                            </span>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="tag-input-field"
                        placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        onBlur={() => addTag()}
                    />
                </div>
            </div>

            {/* Preview */}
            {url && (
                <div className="link-preview">
                    {isLoading ? (
                        <div className="link-preview-loading">
                            <div className="thread-skeleton" style={{ width: "60%" }} />
                            <div className="thread-skeleton" style={{ width: "80%" }} />
                        </div>
                    ) : metadata ? (
                        <>
                            <SmartImage
                                src={metadata.icon}
                                fallbackSrc={url.startsWith("http") ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` : null}
                                className="link-preview-icon"
                                size={32}
                            />
                            <div className="link-preview-text">
                                <div className="link-preview-title">{metadata.title}</div>
                                {metadata.description && (
                                    <div className="link-preview-desc">
                                        {metadata.description}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            )}
        </Modal>
    );
}
