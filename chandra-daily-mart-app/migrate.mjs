// Migration script — creates wishlist and scheduled_deliveries tables
// Uses Supabase Management API
// Run: node migrate.mjs <SERVICE_ROLE_KEY>
//
// Get your SERVICE_ROLE_KEY from:
// Supabase Dashboard → Project Settings → API → service_role (secret)

import https from 'https';

const PROJECT_REF = 'xuaduskqfjyxzwykveeb';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  console.error('❌ Usage: node migrate.mjs <SERVICE_ROLE_KEY>');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role');
  process.exit(1);
}

const SQL = `
-- 1. Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='wishlist' AND policyname='Users manage own wishlist'
  ) THEN
    CREATE POLICY "Users manage own wishlist" ON public.wishlist
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Scheduled deliveries table
CREATE TABLE IF NOT EXISTS public.scheduled_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  products jsonb NOT NULL DEFAULT '[]',
  delivery_date text NOT NULL,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.scheduled_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='scheduled_deliveries' AND policyname='Users manage own schedules'
  ) THEN
    CREATE POLICY "Users manage own schedules" ON public.scheduled_deliveries
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

SELECT 'Migration complete' AS status;
`;

function post(path, body, headers) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.supabase.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

console.log('🚀 Running migration on project:', PROJECT_REF);
const res = await post(`/v1/projects/${PROJECT_REF}/database/query`, { query: SQL });
console.log('Status:', res.status);
if (res.status === 200) {
  console.log('✅ Migration successful!', JSON.stringify(res.data, null, 2));
} else {
  console.error('❌ Migration failed:', JSON.stringify(res.data, null, 2));
}
