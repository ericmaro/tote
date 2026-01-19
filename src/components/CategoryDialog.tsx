import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Category } from "../lib/types";
import { useCategories } from "../hooks/use-categories";
import { Modal } from "./Modal";

const AVAILABLE_ICONS = [
    "Briefcase", "User", "BookOpen", "Gamepad2", "Code", "Music", "Camera",
    "Globe", "Coffee", "Heart", "Star", "ShoppingBag", "Plane", "Zap"
];

const AVAILABLE_COLORS = [
    "#4da3ff", "#3fe47e", "#ff9f43", "#ff4d4d", "#a3ff4d",
    "#ff4da3", "#a34dff", "#4dffa3", "#ffffff", "#888888"
];

interface CategoryDialogProps {
    category?: Category; // If provided, we are editing
    onClose: () => void;
}

export function CategoryDialog({ category, onClose }: CategoryDialogProps) {
    const [name, setName] = useState(category?.name || "");
    const [icon, setIcon] = useState(category?.icon || "Folder");
    const [color, setColor] = useState(category?.color || "#4da3ff");

    const { addCategory, updateCategory, deleteCategory } = useCategories();

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name.trim()) return;

        if (category) {
            updateCategory(category.id, { name, icon, color });
        } else {
            addCategory({ name, icon, color });
        }
        onClose();
    };

    const handleDelete = () => {
        if (category) {
            deleteCategory(category.id);
            onClose();
        }
    };

    const footer = (
        <>
            {category && (
                <button
                    type="button"
                    className="button-danger"
                    style={{ marginRight: "auto" }}
                    onClick={handleDelete}
                >
                    Delete
                </button>
            )}
            <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
            </button>
            <button
                type="submit"
                className="button-primary"
                disabled={!name.trim()}
                onClick={() => handleSubmit()}
            >
                {category ? "Save Changes" : "Create Category"}
            </button>
        </>
    );

    return (
        <Modal
            title={category ? "Edit Category" : "New Category"}
            onClose={onClose}
            footer={footer}
        >
            <div className="form-field">
                <label className="form-label">Name</label>
                <input
                    autoFocus
                    type="text"
                    className="form-input"
                    placeholder="Work, Projects, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="form-field">
                <label className="form-label">Icon</label>
                <div className="icon-grid">
                    {AVAILABLE_ICONS.map((iconName) => {
                        const IconComp = (LucideIcons as any)[iconName];
                        return (
                            <button
                                key={iconName}
                                type="button"
                                className={`icon-choice ${icon === iconName ? "selected" : ""}`}
                                onClick={() => setIcon(iconName)}
                            >
                                <IconComp size={18} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="form-field">
                <label className="form-label">Color</label>
                <div className="color-grid">
                    {AVAILABLE_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={`color-choice ${color === c ? "selected" : ""}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
}
