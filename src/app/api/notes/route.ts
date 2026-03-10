import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encryptTextServer, decryptTextServer } from '@/lib/server-encryption';
import { Note } from '@/types';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Read-only path
                    }
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('notes')
        .select(`
      id,
      title,
      last_modified,
      pages (
        id,
        title,
        content,
        date
      )
    `)
        .order('last_modified', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Decrypt the data using the master key before sending it to the client
    const decryptedNotes: Note[] = (data || []).map((n: any) => ({
        id: n.id,
        title: decryptTextServer(n.title || ""),
        lastModified: n.last_modified,
        pages: (n.pages || []).map((p: any) => ({
            id: p.id,
            title: decryptTextServer(p.title || ""),
            content: decryptTextServer(p.content || ""),
            date: p.date
        }))
    }));

    return NextResponse.json({ notes: decryptedNotes });
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { id, title, defaultPageId, now } = body;

    // Encrypt the defaults before saving to database
    const encTitle = encryptTextServer(title || "");
    const encPageTitle = encryptTextServer("Untitled Page");
    const encPageContent = encryptTextServer("");

    await supabase.from('notes').insert({
        id: id,
        user_id: session.user.id,
        title: encTitle,
        last_modified: now
    });

    await supabase.from('pages').insert({
        id: defaultPageId,
        note_id: id,
        title: encPageTitle,
        content: encPageContent,
        date: now
    });

    return NextResponse.json({ success: true });
}
