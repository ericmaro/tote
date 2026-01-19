import React, { useState } from "react";
import { Link } from "../lib/types";
import { useLinkMetadata } from "../hooks/use-link-metadata";
import { useLinks } from "../hooks/use-links";
import { EditIcon, TrashIcon, CopyIcon, ExternalLinkIcon, RefreshIcon } from "./Icons.tsx";
import { invoke } from "@tauri-apps/api/core";
import { useUI } from "../lib/ui-store.tsx";

import { SmartImage } from "./SmartImage";

interface LinkCardProps {
    link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
    const { deleteLink, refreshLinkMetadata } = useLinks();
    const { openAddLink } = useUI();
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: metadata, isLoading } = useLinkMetadata(
        !link.title ? link.url : null
    );

    // Use stored data or fetched metadata, prioritizing local cache
    const title = link.title || metadata?.title || new URL(link.url).hostname;
    const description = link.description || metadata?.description;
    const icon = link.localIconPath || link.icon || metadata?.icon || null;
    const image = link.localImagePath || link.image || metadata?.image || null;

    const handleOpenInBrowser = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        window.open(link.url, "_blank");
    };

    const handleOpen = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (link.cachedContentPath) {
            invoke("plugin:opener|open", { path: link.cachedContentPath }).catch(console.error);
        } else {
            handleOpenInBrowser(e);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (link.id) {
            deleteLink(link.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        openAddLink(link.categoryId, link);
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(link.url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleRefetch = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isRefreshing || !link.id) return;

        setIsRefreshing(true);
        try {
            await refreshLinkMetadata(link.id);
        } catch (error) {
            console.error("Failed to refetch metadata:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <article className="link-card" onClick={handleOpen}>
            {image && (
                <div className="link-card-image">
                    <SmartImage
                        src={image}
                        fallbackType="image"
                        className="link-card-main-image"
                        size={64}
                    />
                </div>
            )}
            <div className="link-card-content">
                <div className="link-card-header">
                    <SmartImage
                        src={icon}
                        fallbackSrc={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`}
                        className="link-card-favicon"
                        size={20}
                    />
                    {isLoading && !icon && <div className="link-card-favicon-skeleton" />}
                    <h3 className="link-card-title">{title}</h3>
                </div>
                {description && (
                    <p className="link-card-description">{description}</p>
                )}
                {link.tags && link.tags.length > 0 && (
                    <div className="tags-list">
                        {link.tags.map(tag => (
                            <span key={tag} className="tag-chip">{tag}</span>
                        ))}
                    </div>
                )}
                <div className="link-card-footer">
                    <span className="link-card-domain">
                        {copied ? (
                            <span style={{ color: "var(--status-success)", fontWeight: 500 }}>
                                Copied!
                            </span>
                        ) : (
                            new URL(link.url).hostname.replace("www.", "")
                        )}
                    </span>
                    <div className="link-card-actions">
                        <button
                            type="button"
                            className="link-card-action"
                            onClick={handleOpenInBrowser}
                            title="Open in browser"
                        >
                            <ExternalLinkIcon size={14} style={{ pointerEvents: "none" }} />
                        </button>
                        <button
                            type="button"
                            className="link-card-action"
                            onClick={handleCopy}
                            title="Copy link"
                        >
                            <CopyIcon size={14} style={{ pointerEvents: "none" }} />
                        </button>
                        <button
                            type="button"
                            className="link-card-action"
                            onClick={handleRefetch}
                            title="Refetch metadata"
                            disabled={isRefreshing}
                        >
                            <RefreshIcon
                                size={14}
                                className={isRefreshing ? "spin" : ""}
                                style={{ pointerEvents: "none" }}
                            />
                        </button>
                        <button
                            type="button"
                            className="link-card-action"
                            onClick={handleEdit}
                            title="Edit link"
                        >
                            <EditIcon size={14} style={{ pointerEvents: "none" }} />
                        </button>
                        <button
                            type="button"
                            className="link-card-action delete"
                            onClick={handleDelete}
                            title="Delete link"
                        >
                            <TrashIcon size={14} style={{ pointerEvents: "none" }} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
