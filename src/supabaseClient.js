import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://grtcebiusqczxloegpzs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydGNlYml1c3Fjenhsb2VncHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMzg3NzAsImV4cCI6MjEwNzYxNDc3MH0.2fwZzSyIfyHgNHi5NqYByWfA9Ecv9Mp9mi2JRqdjSgA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
