import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

/*
SQL Schema — run this in your Supabase SQL editor:

CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  title TEXT NOT NULL DEFAULT 'New conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations"
  ON conversations
  USING (user_id = current_setting('app.user_id', true) OR user_id = 'anonymous');

-- For share feature:
CREATE TABLE shared_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_id TEXT,
  title TEXT NOT NULL DEFAULT 'Shared conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE shared_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shared conversations"
  ON shared_conversations FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can create shared conversations"
  ON shared_conversations FOR INSERT
  WITH CHECK (true);
*/
