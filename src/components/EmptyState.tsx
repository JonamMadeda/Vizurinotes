import { FileText, Plus } from "lucide-react";

interface EmptyStateProps {
    isMobileListVisible: boolean;
}

export default function EmptyState({ isMobileListVisible }: EmptyStateProps) {
    return (
        <div
            className={`relative flex-1 flex-col items-center justify-center bg-background w-full h-full md:flex ${isMobileListVisible ? "hidden" : "flex"
                }`}
        >
            {/* Background ambient gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative w-28 h-28 bg-nav-bg/5 rounded-3xl flex items-center justify-center mb-8 text-nav-bg ring-1 ring-nav-bg/10 shadow-sm transition-transform hover:scale-105 duration-500 will-change-transform">
                <FileText size={48} strokeWidth={1.5} className="opacity-80" />

                {/* Floating decorative elements */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>
                    <Plus size={16} className="text-accent" />
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Select a note
            </h2>
            <p className="text-slate-500 text-center max-w-md px-6 leading-relaxed">
                Choose a note from the sidebar to view its pages, or create a brand new note to capture your thoughts.
            </p>
        </div>
    );
}
