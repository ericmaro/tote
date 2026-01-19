/**
 * Hook for managing links (now powered by global DataContext)
 */

import { useData } from "../lib/data-context";

export function useLinks() {
    const {
        links,
        isLinksLoading: isLoading,
        recentLinks,
        addLink,
        updateLink,
        deleteLink,
        refreshLinkMetadata,
        getLinksByCategory,
    } = useData();

    return {
        links,
        isLoading,
        recentLinks,
        addLink,
        updateLink,
        deleteLink,
        refreshLinkMetadata,
        getLinksByCategory,
    };
}
