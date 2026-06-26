// app/supabase-test/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function SupabaseTestPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('connection_smoke_tests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <pre>Supabase error: {error.message}</pre>;
    }

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
