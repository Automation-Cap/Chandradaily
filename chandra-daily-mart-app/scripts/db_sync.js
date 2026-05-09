import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuaduskqfjyxzwykveeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YWR1c2txZmp5eHp3eWt2ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Nzg4MzUsImV4cCI6MjA5MjE1NDgzNX0.5VA9POnFgXblt4ZOnAs7LpA-kdOVUx7d6RuYRrIaltg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INSTANT_FOOD_ID = '4984f1c1-5f25-4d4e-b9fe-8bf362315d08';

const NEW_PRODUCTS = [
  // Milk & Dairy
  { category_id: 'd1f007cf-6996-4246-9c2f-365ada6ea9ec', name: 'Amul Taaza Toned Milk', price: 27, mrp: 28, weight_value: 500, weight_unit: 'ml', description: 'Fresh and pure toned milk from Amul.' },
  { category_id: 'd1f007cf-6996-4246-9c2f-365ada6ea9ec', name: 'Mother Dairy Full Cream Milk', price: 33, mrp: 34, weight_value: 500, weight_unit: 'ml', description: 'Rich and creamy full cream milk.' },
  { category_id: 'd1f007cf-6996-4246-9c2f-365ada6ea9ec', name: 'Amul Masti Spiced Buttermilk', price: 15, mrp: 15, weight_value: 200, weight_unit: 'ml', description: 'Refreshing spiced buttermilk.' },
  
  // Snacks & Biscuits
  { category_id: '88fdcd7e-9a65-4188-b8b9-dea7d5373e6b', name: 'Lay\'s Classic Salted', price: 20, mrp: 20, weight_value: 50, weight_unit: 'g', description: 'Crispy and salty potato chips.' },
  { category_id: '88fdcd7e-9a65-4188-b8b9-dea7d5373e6b', name: 'Kurkure Masala Munch', price: 20, mrp: 20, weight_value: 90, weight_unit: 'g', description: 'Crunchy and spicy tea-time snack.' },
  { category_id: '88fdcd7e-9a65-4188-b8b9-dea7d5373e6b', name: 'Britannia Good Day Cashew Biscuits', price: 30, mrp: 35, weight_value: 200, weight_unit: 'g', description: 'Delicious cashew cookies.' },
  
  // Beverages
  { category_id: 'a088e244-cf18-4cb4-aa4d-21f515dc4f2c', name: 'Coca-Cola Zero Sugar', price: 40, mrp: 40, weight_value: 600, weight_unit: 'ml', description: 'Sugar-free refreshing drink.' },
  { category_id: 'a088e244-cf18-4cb4-aa4d-21f515dc4f2c', name: 'Real Fruit Power Orange', price: 99, mrp: 110, weight_value: 1, weight_unit: 'L', description: 'Pure orange fruit juice.' },
  { category_id: 'a088e244-cf18-4cb4-aa4d-21f515dc4f2c', name: 'Bisleri Mineral Water', price: 20, mrp: 20, weight_value: 1, weight_unit: 'L', description: 'Safe and pure drinking water.' },
  
  // Personal Care
  { category_id: 'b7be12d2-b79c-4a10-a26a-1fc4963595c4', name: 'Dettol Original Soap', price: 45, mrp: 50, weight_value: 75, weight_unit: 'g', description: 'Germ protection for your skin.' },
  { category_id: 'b7be12d2-b79c-4a10-a26a-1fc4963595c4', name: 'Colgate Strong Teeth Toothpaste', price: 95, mrp: 105, weight_value: 200, weight_unit: 'g', description: 'Cavity protection for strong teeth.' },
  
  // Stationery
  { category_id: 'f1ade631-e2ef-44d6-9a9e-83b0a8cdc964', name: 'Classmate Notebook - Single Line', price: 60, mrp: 65, weight_value: 172, weight_unit: 'pages', description: 'High-quality notebook for school and office.' },
  { category_id: 'f1ade631-e2ef-44d6-9a9e-83b0a8cdc964', name: 'Natraj 621 Pencils Pack', price: 50, mrp: 50, weight_value: 10, weight_unit: 'pcs', description: 'Classic wooden pencils.' },
];

async function run() {
  console.log('Starting cleanup...');
  const { error: delError } = await supabase.from('products').delete().eq('category_id', INSTANT_FOOD_ID);
  if (delError) console.error('Delete error:', delError);
  else console.log('Cleaned up Instant Food products.');

  console.log('Starting seeding...');
  for (const prod of NEW_PRODUCTS) {
    const { error: insError } = await supabase.from('products').insert(prod);
    if (insError) console.error(`Error inserting ${prod.name}:`, insError);
    else console.log(`Inserted ${prod.name}`);
  }
  console.log('Seeding complete.');
}

run();
