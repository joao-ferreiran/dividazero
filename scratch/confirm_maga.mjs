import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZreG14dmV2b2xiaG5qbG11Z3ZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2Njg5MCwiZXhwIjoyMDk0MzQyODkwfQ.7CaCh-Ht2cVy9nIVlIjhS2U4JSs0mtk7Gt0R2DNjHRU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws }
});

async function confirmUser() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    'c6c48386-5abc-46df-bc09-eb8acd0adacc',
    { email_confirm: true }
  );
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success confirmed email for:", data.user?.email);
  }
}
confirmUser();
