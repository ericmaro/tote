import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { UIProvider, useUI } from "../lib/ui-store";
import { CategoryDialog } from "../components/CategoryDialog";
import { AddLinkDialog } from "../components/AddLinkDialog";
import { SearchDialog } from "../components/SearchDialog";
import { Onboarding } from "../components/Onboarding";
import { useEffect } from "react";

import { DataProvider } from "../lib/data-context";

export const Route = createRootRoute({
    component: RootLayout,
});

function GlobalModals() {
    const { activeModal, selectedCategory, selectedLink, defaultCategoryId, closeModal } = useUI();

    return (
        <>
            {activeModal === "add-link" && (
                <AddLinkDialog
                    defaultCategoryId={defaultCategoryId || undefined}
                    link={selectedLink || undefined}
                    onClose={closeModal}
                />
            )}
            {activeModal === "category" && (
                <CategoryDialog
                    category={selectedCategory || undefined}
                    onClose={closeModal}
                />
            )}
            {activeModal === "search" && (
                <SearchDialog
                    onClose={closeModal}
                />
            )}
        </>
    );
}

function RootLayoutContent() {
    const { isOnboardingOpen, completeOnboarding, openSearch } = useUI();

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                openSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [openSearch]);

    if (isOnboardingOpen) {
        return <Onboarding onComplete={completeOnboarding} />;
    }

    return (
        <div className="app">
            <Sidebar />
            <main className="main">
                <Outlet />
            </main>
            <GlobalModals />
        </div>
    );
}

function RootLayout() {
    return (
        <DataProvider>
            <UIProvider>
                <RootLayoutContent />
            </UIProvider>
        </DataProvider>
    );
}
