// Run this with: node run_migration.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuaduskqfjyxzwykveeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YWR1c2txZmp5eHp3eWt2ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Nzg4MzUsImV4cCI6MjA5MjE1NDgzNX0.5VA9POnFgXblt4ZOnAs7LpA-kdOVUx7d6RuYRrIaltg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
const { data: profilesTest, error: profilesErr } = await supabase.from('profiles').select('id').limit(1);
console.log('profiles table reachable:', !profilesErr, profilesErr?.message || '');

// Check wishlist table
const { error: wishlistErr } = await supabase.from('wishlist').select('id').limit(1);
console.log('wishlist table exists:', !wishlistErr, wishlistErr?.message || '');

// Check scheduled_deliveries table
const { error: schedErr } = await supabase.from('scheduled_deliveries').select('id').limit(1);
console.log('scheduled_deliveries table exists:', !schedErr, schedErr?.message || '');

// Check profiles columns
const { data: profileCols } = await supabase.from('profiles').select('wallet_balance, email').limit(1);
console.log('profiles has wallet_balance + email columns:', profileCols !== null);
