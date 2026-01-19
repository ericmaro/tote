import { useState, useEffect } from "react";
import { LinkIcon, GlobeIcon } from "./Icons.tsx";
import { convertFileSrc } from "@tauri-apps/api/core";

interface SmartImageProps {
    src: string | null;
    fallbackSrc?: string | null;
    alt?: string;
    className?: string;
    fallbackType?: "icon" | "image";
    size?: number;
}

export function SmartImage({
    src,
    fallbackSrc,
    alt = "",
    className,
    fallbackType = "icon",
    size = 16
}: SmartImageProps) {
    const [error, setError] = useState(false);
    const [useFallback, setUseFallback] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!src) {
            if (fallbackSrc) {
                setUseFallback(true);
            } else {
                setError(true);
            }
            setIsLoading(false);
            return;
        }
        setError(false);
        setUseFallback(false);
        setIsLoading(true);
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (!useFallback && fallbackSrc) {
            setUseFallback(true);
        } else {
            setError(true);
        }
    };

    if (error || (!src && !fallbackSrc)) {
        if (fallbackType === "image") {
            return (
                <div className={`${className} image-placeholder`}>
                    <GlobeIcon size={size * 1.5} />
                </div>
            );
        }
        return <LinkIcon size={size} className={className} />;
    }

    const getDisplaySrc = (source: string | null) => {
        if (!source) return "";
        // Check if it's a local absolute path (starts with / on macOS/Linux or has a drive letter on Windows)
        const isLocalPath = source.startsWith("/") || (source.includes(":\\") && !source.includes("://"));

        if (isLocalPath) {
            const converted = convertFileSrc(source);
            console.log(`SmartImage: Converted local path "${source}" to "${converted}"`);
            return converted;
        }
        return source;
    };

    return (
        <div className={`smart-image-container ${isLoading ? "loading" : ""}`}>
            <img
                src={getDisplaySrc((useFallback ? fallbackSrc : src) ?? null)}
                alt={alt}
                className={className}
                onLoad={() => setIsLoading(false)}
                onError={handleError}
            />
            {isLoading && (
                <div className="image-skeleton" />
            )}
        </div>
    );
}
