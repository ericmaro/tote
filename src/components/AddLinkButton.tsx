/**
 * AddLinkButton component
 */

import { useUI } from "../lib/ui-store";
import { PlusIcon } from "./Icons";

interface AddLinkButtonProps {
    categoryId?: string;
    primary?: boolean;
}

export function AddLinkButton({ categoryId, primary }: AddLinkButtonProps) {
    const { openAddLink } = useUI();

    return (
        <button
            className={primary ? "button-primary" : "action-button"}
            onClick={() => openAddLink(categoryId)}
        >
            <PlusIcon size={14} />
            Add Link
        </button>
    );
}
