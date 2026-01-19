import { useState } from "react";
import { RefreshIcon } from "./Icons";
import { useLinks } from "../hooks/use-links";

interface RefetchPreviewsButtonProps {
    linkIds: string[];
}

export function RefetchPreviewsButton({ linkIds }: RefetchPreviewsButtonProps) {
    const { refreshLinkMetadata } = useLinks();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefetch = async () => {
        if (isRefreshing || linkIds.length === 0) return;

        setIsRefreshing(true);
        try {
            // Refetch all in parallel with a small delay to avoid overwhelming the backend/network
            await Promise.all(linkIds.map(id => refreshLinkMetadata(id)));
        } catch (error) {
            console.error("Failed to refetch some previews:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <button
            className="action-button"
            onClick={handleRefetch}
            disabled={isRefreshing || linkIds.length === 0}
            title="Refetch all previews"
        >
            <RefreshIcon
                size={14}
                className={isRefreshing ? "spin" : ""}
            />
            {isRefreshing ? "Refetching..." : "Refetch Previews"}
        </button>
    );
}
