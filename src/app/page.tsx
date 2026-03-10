/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import NoteEditor from "@/components/NoteEditor";
import EmptyState from "@/components/EmptyState";
import Auth from "@/components/Auth";
import { Note, Page } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Load auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchNotes(session.user.id);
      } else {
        setIsLoaded(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchNotes(session.user.id);
      } else {
        setNotes([]);
        setActiveNoteId(null);
        setIsLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchNotes(userId: string) {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      } else {
        console.error("Failed to fetch notes via API");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
    setIsLoaded(true);
  }

  const handleAddNote = async () => {
    if (!session) return;
    const noteId = crypto.randomUUID();
    const pageId = crypto.randomUUID();
    const now = Date.now();

    const newNote: Note = {
      id: noteId,
      title: "",
      lastModified: now,
      pages: [{
        id: pageId,
        title: "Untitled Page",
        content: "",
        date: now
      }],
    };

    // Optimistic UI Update
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(noteId);
    setIsMobileListVisible(false);

    // Call Secure Backend API
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: noteId,
        title: "",
        defaultPageId: pageId,
        now
      })
    });
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    // Optimistic UI Update
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );

    // Call Secure Backend API
    await fetch(`/api/notes/${updatedNote.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedNote)
    });
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistic UI Update
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

    if (activeNoteId === id) {
      setActiveNoteId(null);
      setIsMobileListVisible(true);
    }

    // Call Secure Backend API
    await fetch(`/api/notes/${id}`, {
      method: 'DELETE'
    });
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin"></div></div>;

  if (!session) {
    return <Auth />;
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onSignOut={() => supabase.auth.signOut()}
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
