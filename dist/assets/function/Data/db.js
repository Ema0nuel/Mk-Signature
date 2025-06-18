import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = "https://rddjqmqgndhtbrbcqmsf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZGpxbXFnbmRodGJyYmNxbXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5ODc5OTgsImV4cCI6MjA2NTU2Mzk5OH0.DKRLHDoTDR-aQc0ny5KPMyFNB2JTGwQvsfO5D-rc2Fk";
export const supabase = createClient(supabaseUrl, supabaseKey);
