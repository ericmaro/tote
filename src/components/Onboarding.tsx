import { useState } from "react";
import { Category } from "../lib/types";
import {
    BriefcaseIcon,
    UserIcon,
    BookOpenIcon,
    Gamepad2Icon,
    CodeIcon,
    CameraIcon,
    ShoppingBagIcon,
    GlobeIcon,
    MusicIcon,
    ArrowRightIcon
} from "./Icons";

const SUGGESTED_CATEGORIES: Omit<Category, "id">[] = [
    { name: "Work", icon: "Briefcase", color: "#4da3ff" },
    { name: "Personal", icon: "User", color: "#3fe47e" },
    { name: "Learning", icon: "BookOpen", color: "#ff9f43" },
    { name: "Engineering", icon: "Code", color: "#a29bfe" },
    { name: "Art & Photo", icon: "Camera", color: "#ff7675" },
    { name: "Shopping", icon: "ShoppingBag", color: "#fdcb6e" },
    { name: "Internet", icon: "Globe", color: "#00cec9" },
    { name: "Music", icon: "Music", color: "#e84393" },
];

interface OnboardingProps {
    onComplete: (categories: Category[]) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [selected, setSelected] = useState<string[]>(["Work", "Personal"]);

    const toggleCategory = (name: string) => {
        setSelected(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const handleFinish = () => {
        const categories: Category[] = [
            { id: "all", name: "All Links", icon: "Link", color: "var(--border-accent)" },
            ...SUGGESTED_CATEGORIES
                .filter(c => selected.includes(c.name))
                .map(c => ({ ...c, id: crypto.randomUUID() }))
        ];
        onComplete(categories);
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-canvas">
                <div className="onboarding-header">
                    <h1 className="onboarding-title">Welcome to Tote</h1>
                    <p className="onboarding-subtitle">Pick a few categories to organize your links.</p>
                </div>

                <div className="onboarding-grid">
                    {SUGGESTED_CATEGORIES.map((cat) => {
                        const isSelected = selected.includes(cat.name);
                        return (
                            <button
                                key={cat.name}
                                className={`onboarding-item ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleCategory(cat.name)}
                            >
                                <div
                                    className="onboarding-item-icon"
                                    style={{ color: cat.color, backgroundColor: `${cat.color}15` }}
                                >
                                    <CategoryIcon icon={cat.icon} size={24} />
                                </div>
                                <span className="onboarding-item-name">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="onboarding-footer">
                    <button
                        className="onboarding-next-button"
                        onClick={handleFinish}
                        disabled={selected.length === 0}
                        title="Start Toting"
                    >
                        <ArrowRightIcon size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function CategoryIcon({ icon, size }: { icon: string; size: number }) {
    switch (icon) {
        case "Briefcase": return <BriefcaseIcon size={size} />;
        case "User": return <UserIcon size={size} />;
        case "BookOpen": return <BookOpenIcon size={size} />;
        case "Gamepad2": return <Gamepad2Icon size={size} />;
        case "Code": return <CodeIcon size={size} />;
        case "Camera": return <CameraIcon size={size} />;
        case "ShoppingBag": return <ShoppingBagIcon size={size} />;
        case "Globe": return <GlobeIcon size={size} />;
        case "Music": return <MusicIcon size={size} />;
        default: return <UserIcon size={size} />;
    }
}
