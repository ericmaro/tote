/**
 * Hook for fetching link metadata using TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { LinkMetadata } from "../lib/types";

export function useLinkMetadata(url: string | null) {
    return useQuery({
        queryKey: ["link-metadata", url],
        queryFn: async (): Promise<LinkMetadata> => {
            if (!url) throw new Error("No URL provided");

            try {
                const metadata = await invoke<LinkMetadata>("fetch_link_metadata", { url });
                return metadata;
            } catch {
                // Fallback: extract domain for basic info
                const domain = new URL(url).hostname;
                return {
                    title: domain,
                    description: null,
                    icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                    image: null,
                };
            }
        },
        enabled: !!url,
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 1,
    });
}
