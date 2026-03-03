'use client';

import { Page } from "@/types";
import { Calendar, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface PageCardProps {
    page: Page;
    pageIndex: number;
    totalPages: number;
    onUpdatePage: (updates: Partial<Page>) => void;
    onDeletePage: () => void;
}

export default function PageCard({
    page,
    pageIndex,
    totalPages,
    onUpdatePage,
    onDeletePage,
}: PageCardProps) {
    const isUpdatingContent = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing...',
            }),
        ],
        content: page.content || "",
        editorProps: {
            attributes: {
                class: 'focus:outline-none w-full text-base text-slate-700 leading-relaxed tiptap-editor',
            },
        },
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            isUpdatingContent.current = true;
            onUpdatePage({ content: editor.getHTML() });
            setTimeout(() => {
                isUpdatingContent.current = false;
            }, 0);
        },
    });

    // Sync content from parent if it changes externally
    useEffect(() => {
        if (editor && !isUpdatingContent.current) {
            const currentContent = editor.getHTML();
            if (page.content !== currentContent) {
                editor.commands.setContent(page.content, { emitUpdate: false });
            }
        }
    }, [page.content, editor]);

    return (
        <div className="group/card bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* Page Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                        {pageIndex + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={13} />
                        <input
                            type="date"
                            value={new Date(page.date).toISOString().split('T')[0]}
                            onChange={(e) => {
                                const ts = new Date(e.target.value).getTime();
                                onUpdatePage({ date: ts || Date.now() });
                            }}
                            className="text-xs text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-slate-700 transition-colors"
                        />
                    </div>
                </div>
                {totalPages > 1 && (
                    <button
                        onClick={onDeletePage}
                        className="text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all"
                        aria-label="Delete page"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Page Title */}
            <div className="px-6 pt-6 pb-2">
                <input
                    type="text"
                    value={page.title}
                    onChange={(e) => onUpdatePage({ title: e.target.value })}
                    placeholder="Page Title"
                    className="w-full text-2xl md:text-3xl font-bold tracking-tight bg-transparent border-none outline-none text-slate-900 placeholder-slate-300 transition-colors focus:placeholder-slate-200"
                />
            </div>

            {/* Page Body — height grows with content */}
            <div className="px-6 pb-6 pt-2 min-h-[120px]">
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    );
}
