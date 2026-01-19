import { ReactNode } from "react";
import { XIcon } from "./Icons";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
    return (
        <div className="dialog-backdrop">
            <div className="dialog">
                <header className="dialog-header">
                    {/* Invisible spacer to help center the title */}
                    <div style={{ width: 24 }} />
                    <h2 className="dialog-title">{title}</h2>
                    <button className="dialog-close" onClick={onClose} title="Close">
                        <XIcon size={14} />
                    </button>
                </header>

                <div className="dialog-body">
                    {children}
                </div>

                {footer && (
                    <footer className="dialog-footer">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}
