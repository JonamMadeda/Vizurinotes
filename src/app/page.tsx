/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import NoteEditor from "@/components/NoteEditor";
import EmptyState from "@/components/EmptyState";
import { Note } from "@/types";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("vizuri-notes");
    if (savedNotes) {
      try {
        const parsedNotes: any[] = JSON.parse(savedNotes);

        // Migration logic for old notes
        const migratedNotes: Note[] = parsedNotes.map(n => {
          if (n.content !== undefined) {
            return {
              id: n.id,
              title: n.title,
              lastModified: n.lastModified,
              pages: [{
                id: crypto.randomUUID(),
                title: "Page 1",
                content: n.content,
                date: n.lastModified
              }]
            };
          }
          return n;
        });

        setNotes(migratedNotes);
      } catch (e) {
        console.error("Failed to parse notes from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("vizuri-notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const handleAddNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "",
      pages: [{
        id: crypto.randomUUID(),
        title: "Untitled Page",
        content: "",
        date: Date.now()
      }],
      lastModified: Date.now(),
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    setIsMobileListVisible(false); // Hide list on mobile to show editor
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

    if (activeNoteId === id) {
      setActiveNoteId(null);
      setIsMobileListVisible(true); // Show list on mobile since active note is gone
    }
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    setIsMobileListVisible(false); // Hide the list on mobile to show the editor
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true); // Return to list view on mobile
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Don't render until client-side hydration is complete to avoid dark mode / mismatch flickers
  if (!isLoaded) return <div className="min-h-screen bg-background" />;

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        isMobileListVisible={isMobileListVisible}
      />

      {activeNote ? (
        <NoteEditor
          note={activeNote}
          onUpdateNote={handleUpdateNote}
          onBack={handleBackToList}
          isMobileListVisible={isMobileListVisible}
        />
      ) : (
        <EmptyState isMobileListVisible={isMobileListVisible} />
      )}
    </main>
  );
}
