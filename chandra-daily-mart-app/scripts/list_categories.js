import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuaduskqfjyxzwykveeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YWR1c2txZmp5eHp3eWt2ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Nzg4MzUsImV4cCI6MjA5MjE1NDgzNX0.5VA9POnFgXblt4ZOnAs7LpA-kdOVUx7d6RuYRrIaltg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listCategories() {
  const { data, error } = await supabase.from('categories').select('id, name');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

listCategories();
