import { createClient } from '@supabase/supabase-js';

// SupabaseのURLとAnon Keyを直接記述
const SUPABASE_URL = 'https://zbwdsphbunrkqtolzqlg.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpid2RzcGhidW5ya3F0b2x6cWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNzQ4NzQsImV4cCI6MjA0OTg1MDg3NH0.yX82v7e64rofYl-tCtiao7-nUEF0SW7thBVpFlMu-W0';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not defined');
}

// Supabaseクライアントを作成
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // セッションの永続化を有効にする
    autoRefreshToken: true, // トークンの自動リフレッシュを有効にする
    detectSessionInUrl: true, // 認証にリダイレクトされたときにセッションを認識する
  },
});

export default supabase;
