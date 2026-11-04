import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div 
                className="bg-cornsilk-900 border border-sunlit-clay-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 bg-cornsilk-800 border-b border-sunlit-clay-800">
                    <h3 className="text-lg font-bold text-black-forest-500">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-olive-leaf-500 hover:text-black-forest-500 p-1 rounded-lg hover:bg-cornsilk-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}