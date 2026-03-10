import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encryptTextServer } from '@/lib/server-encryption';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { }
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updatedNote = await request.json();
    const encNoteTitle = encryptTextServer(updatedNote.title || "");

    const { error: noteError } = await supabase
        .from('notes')
        .update({
            title: encNoteTitle,
            last_modified: updatedNote.lastModified
        })
        .eq('id', id)
        .eq('user_id', session.user.id);

    if (noteError) return NextResponse.json({ error: noteError.message }, { status: 500 });

    for (const page of updatedNote.pages) {
        const encPageTitle = encryptTextServer(page.title || "");
        const encPageContent = encryptTextServer(page.content || "");

        await supabase
            .from('pages')
            .upsert({
                id: page.id,
                note_id: id,
                title: encPageTitle,
                content: encPageContent,
                date: page.date
            }, { onConflict: 'id' });
    }

    const { data: dbPages } = await supabase
        .from('pages')
        .select('id')
        .eq('note_id', id);

    if (dbPages) {
        const localPageIds = new Set(updatedNote.pages.map((p: any) => p.id));
        const pagesToDelete = dbPages.filter((p: any) => !localPageIds.has(p.id));

        for (const p of pagesToDelete) {
            await supabase.from('pages').delete().eq('id', p.id);
        }
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { }
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', session.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
