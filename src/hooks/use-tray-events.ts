/**
 * Hook for listening to system tray events
 */

import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

interface UseTrayEventsOptions {
    onAddLink: (url: string) => void;
}

export function useTrayEvents({ onAddLink }: UseTrayEventsOptions) {
    useEffect(() => {
        const unlisten = listen<string>("tray-add-link", (event) => {
            console.log("[Tray] Adding link from clipboard:", event.payload);
            onAddLink(event.payload);
        });

        return () => {
            unlisten.then((fn) => fn());
        };
    }, [onAddLink]);
}
