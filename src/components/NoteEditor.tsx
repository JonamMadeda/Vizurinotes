'use client';

import { Note, Page } from "@/types";
import { ArrowLeft, Plus } from "lucide-react";
import PageCard from "./PageCard";

interface NoteEditorProps {
    note: Note;
    onUpdateNote: (updatedNote: Note) => void;
    onBack: () => void;
    isMobileListVisible: boolean;
}

export default function NoteEditor({
    note,
    onUpdateNote,
    onBack,
    isMobileListVisible,
}: NoteEditorProps) {

    const updatePage = (pageId: string, updates: Partial<Page>) => {
        const now = Date.now();
        const updatedPages = note.pages.map(p =>
            p.id === pageId ? { ...p, ...updates } : p
        );
        onUpdateNote({
            ...note,
            pages: updatedPages,
            lastModified: now,
        });
    };

    const handleAddPage = () => {
        const now = Date.now();
        const newPage: Page = {
            id: crypto.randomUUID(),
            title: `Page ${note.pages.length + 1}`,
            content: "",
            date: now,
        };
        onUpdateNote({
            ...note,
            pages: [...note.pages, newPage],
            lastModified: now,
        });
    };

    const handleDeletePage = (pageId: string) => {
        if (note.pages.length <= 1) return;
        const now = Date.now();
        const remainingPages = note.pages.filter(p => p.id !== pageId);
        onUpdateNote({
            ...note,
            pages: remainingPages,
            lastModified: now,
        });
    };

    return (
        <div
            className={`flex-col h-full bg-slate-100/60 w-full md:flex ${isMobileListVisible ? "hidden md:flex" : "flex"
                }`}
        >
            {/* Top Bar */}
            <div className="h-14 border-b border-border flex items-center px-4 md:px-8 bg-background/90 backdrop-blur-sm z-10 shrink-0">
                <button
                    onClick={onBack}
                    className="md:hidden flex items-center text-slate-600 hover:text-foreground mr-4 p-2 -ml-2 rounded-md hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="ml-1 text-sm font-medium">Back</span>
                </button>

                {/* Note Title (editable) */}
                <input
                    type="text"
                    value={note.title}
                    onChange={(e) => {
                        const now = Date.now();
                        onUpdateNote({
                            ...note,
                            title: e.target.value,
                            lastModified: now,
                        });
                    }}
                    placeholder="Note Title"
                    className="flex-1 text-lg font-bold bg-transparent border-none outline-none text-slate-800 placeholder-slate-300 tracking-tight"
                />

                <span className="text-[11px] text-slate-400 ml-4 whitespace-nowrap">
                    {note.pages.length} page{note.pages.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Scrollable Page Stack */}
            <div className="flex-1 overflow-y-auto px-4 py-8 md:px-[12%] lg:px-[18%]">
                <div className="flex flex-col gap-6">
                    {note.pages.map((page, index) => (
                        <PageCard
                            key={page.id}
                            page={page}
                            pageIndex={index}
                            totalPages={note.pages.length}
                            onUpdatePage={(updates) => updatePage(page.id, updates)}
                            onDeletePage={() => handleDeletePage(page.id)}
                        />
                    ))}

                    {/* Add Page Button */}
                    <button
                        onClick={handleAddPage}
                        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all group cursor-pointer"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Add New Page</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
