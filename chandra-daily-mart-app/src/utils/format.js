export const EXCLUDED_CATEGORIES = ['Instant Food'];

export const CATEGORY_IMAGES = {
  'Milk & Dairy': '/categories/milk_dairy.png',
  'Bread & Bakery': '/categories/bread_bakery.png',
  'Beverages': '/categories/beverages.png',
  'Rice, Atta & Pulses': '/categories/rice_atta.png',
  'Snacks & Biscuits': '/categories/snacks.png',
  'Oil & Masala': '/categories/oil_masala.png',
  'Cleaning & Household': '/categories/cleaning.png',
  'Personal Care': '/categories/personal_care.png',
  'Eggs & Protein': '/categories/eggs_protein.png',
  'Vegetables': '/categories/vegetables.png',
  'Stationery': '/categories/stationery.png',
};

export const cleanCategoryName = (name) => {
  if (!name) return '';
  return name
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove emojis
    .replace(/[\u0900-\u097F]/g, '') // Remove Hindi characters
    .replace(/\(.*\)/g, '') // Remove text in parentheses
    .replace(/&/g, ' & ') // Ensure space around ampersand
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();
};
