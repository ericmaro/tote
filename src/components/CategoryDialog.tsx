import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Category } from "../lib/types";
import { useCategories } from "../hooks/use-categories";
import { Modal } from "./Modal";

// Curated list of icons that make sense for categories
const POPULAR_ICONS = [
    "Folder", "Briefcase", "User", "BookOpen", "Gamepad2", "Code", "Music", "Camera",
    "Globe", "Coffee", "Heart", "Star", "ShoppingBag", "Plane", "Zap", "Home",
    "Mail", "Phone", "Settings", "Shield", "Lock", "Key", "Bell", "Calendar",
    "Clock", "Map", "Compass", "Bookmark", "Tag", "Flag", "Award", "Gift",
    "Box", "Archive", "Folder", "File", "FileText", "Image", "Video", "Film",
    "Tv", "Radio", "Headphones", "Mic", "Speaker", "Volume2", "Play", "Pause",
    "Sun", "Moon", "Cloud", "Umbrella", "Snowflake", "Flame", "Droplet", "Wind",
    "Car", "Bike", "Bus", "Train", "Ship", "Rocket", "Send", "Download",
    "Upload", "Link", "Share", "Clipboard", "Scissors", "Trash", "Edit", "Pen",
    "Pencil", "Brush", "Palette", "Layers", "Grid", "Layout", "Monitor", "Laptop",
    "Smartphone", "Tablet", "Watch", "Cpu", "HardDrive", "Database", "Server", "Wifi",
    "Bluetooth", "Battery", "Power", "Plug", "Lightbulb", "Flashlight", "Tool", "Wrench",
    "Hammer", "Screwdriver", "Ruler", "Target", "Crosshair", "Eye", "EyeOff", "Search",
    "ZoomIn", "ZoomOut", "Filter", "SlidersHorizontal", "BarChart", "PieChart", "LineChart", "TrendingUp",
    "DollarSign", "Euro", "CreditCard", "Wallet", "Receipt", "ShoppingCart", "Package", "Truck",
    "Building", "Store", "School", "Hospital", "Church", "Factory", "Warehouse", "Landmark",
    "Mountain", "Trees", "Flower", "Leaf", "Bug", "Cat", "Dog", "Bird",
    "Fish", "Skull", "Ghost", "Smile", "Frown", "Meh", "ThumbsUp", "ThumbsDown",
    "HandMetal", "Crown", "Diamond", "Gem", "Circle", "Square", "Triangle", "Hexagon",
    "Infinity", "Hash", "AtSign", "Percent", "Plus", "Minus", "X", "Check"
];

const PRESET_COLORS = [
    "#4da3ff", "#3fe47e", "#ff9f43", "#ff4d4d", "#a3ff4d",
    "#ff4da3", "#a34dff", "#4dffa3", "#ffffff", "#888888",
    "#f472b6", "#fb923c", "#facc15", "#a3e635", "#34d399",
    "#22d3d8", "#60a5fa", "#a78bfa", "#f87171", "#fbbf24"
];

interface CategoryDialogProps {
    category?: Category; // If provided, we are editing
    onClose: () => void;
}

export function CategoryDialog({ category, onClose }: CategoryDialogProps) {
    const [name, setName] = useState(category?.name || "");
    const [icon, setIcon] = useState(category?.icon || "Folder");
    const [color, setColor] = useState(category?.color || "#4da3ff");
    const [iconSearch, setIconSearch] = useState("");
    const [showCustomColor, setShowCustomColor] = useState(false);

    const { addCategory, updateCategory, deleteCategory } = useCategories();

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!iconSearch.trim()) return POPULAR_ICONS;
        const search = iconSearch.toLowerCase();
        return POPULAR_ICONS.filter(i => i.toLowerCase().includes(search));
    }, [iconSearch]);

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
                <input
                    type="text"
                    className="form-input icon-search"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                />
                <div className="icon-grid-scroll">
                    <div className="icon-grid-full">
                        {filteredIcons.map((iconName) => {
                            const IconComp = (LucideIcons as any)[iconName];
                            if (!IconComp) return null;
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    className={`icon-choice ${icon === iconName ? "selected" : ""}`}
                                    onClick={() => setIcon(iconName)}
                                    title={iconName}
                                >
                                    <IconComp size={18} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="form-field">
                <label className="form-label">Color</label>
                <div className="color-picker-container">
                    <div className="color-grid-extended">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                className={`color-choice ${color === c ? "selected" : ""}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                        <button
                            type="button"
                            className={`color-choice custom-color-trigger ${showCustomColor ? "active" : ""}`}
                            onClick={() => setShowCustomColor(!showCustomColor)}
                            title="Custom color"
                        >
                            <span className="custom-color-icon">+</span>
                        </button>
                    </div>
                    {showCustomColor && (
                        <div className="custom-color-row">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="custom-color-input"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="form-input custom-color-text"
                                placeholder="#000000"
                            />
                            <div
                                className="color-preview"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
