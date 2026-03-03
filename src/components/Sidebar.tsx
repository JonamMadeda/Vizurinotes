import { Plus, Trash2 } from "lucide-react";
import { Note } from "@/types";

interface SidebarProps {
    notes: Note[];
    activeNoteId: string | null;
    onSelectNote: (id: string) => void;
    onAddNote: () => void;
    onDeleteNote: (id: string, e: React.MouseEvent) => void;
    isMobileListVisible: boolean;
}

export default function Sidebar({
    notes,
    activeNoteId,
    onSelectNote,
    onAddNote,
    onDeleteNote,
    isMobileListVisible,
}: SidebarProps) {
    return (
        <div
            className={`flex-col h-full bg-nav-bg text-nav-fg w-full md:w-80 md:flex flex-shrink-0 border-r border-nav-hover transition-all duration-300 ${isMobileListVisible ? "flex" : "hidden md:flex"
                }`}
        >
            <div className="p-4 border-b border-nav-hover flex items-center justify-between sticky top-0 bg-nav-bg z-10">
                <h1 className="text-xl font-bold tracking-tight">VIZURI NOTES</h1>
                <button
                    onClick={onAddNote}
                    className="p-2 bg-accent hover:bg-blue-600 rounded-md transition-colors shadow-sm cursor-pointer"
                    aria-label="Add new note"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {notes.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10 p-4">
                        <p className="text-sm">No notes yet.</p>
                        <p className="text-xs mt-1">Click the + button to create one.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => onSelectNote(note.id)}
                            className={`group flex items-start justify-between p-3 rounded-lg cursor-pointer transition-all ${activeNoteId === note.id
                                ? "bg-nav-hover shadow-sm"
                                : "hover:bg-nav-hover/50"
                                }`}
                        >
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-medium text-sm truncate">
                                    {note.title || "Untitled Note"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">
                                    {note.pages?.[0]?.content ? note.pages[0].content.replace(/<[^>]*>?/gm, '') : "Empty Note"}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${activeNoteId === note.id ? 'bg-accent/20 text-blue-300' : 'bg-nav-fg/10 text-nav-fg/70'
                                        }`}>
                                        {note.pages?.length || 0} page{(note.pages?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                    <p className={`text-[10px] ${activeNoteId === note.id ? 'text-blue-200/60' : 'text-nav-fg/40'}`}>
                                        {new Date(note.lastModified).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => onDeleteNote(note.id, e)}
                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                                aria-label="Delete note"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
