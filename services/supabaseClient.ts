
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzchpfbcmusknizzmgke.supabase.co';
// This is an anon key, safe to be exposed on the client side with proper RLS policies.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y2hwZmJjbXVza25penptZ2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTU3MjQsImV4cCI6MjA3NTc5MTcyNH0.g38f6c7R6YOMA2BNy4l9f2oWzB6JzIPAJ6uLF9Lh6a0';

export const supabase = createClient(supabaseUrl, supabaseKey);
