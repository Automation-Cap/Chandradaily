import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

import { CATEGORY_IMAGES, cleanCategoryName, EXCLUDED_CATEGORIES } from '../utils/format';

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { totalItems, totalPrice } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (activeCat) fetchProducts(activeCat); }, [activeCat]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      setCategories(data || []);
      const first = searchParams.get('cat') || data?.[0]?.id;
      setActiveCat(first);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts(categoryId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  const activeCategory = categories.find(c => c.id === activeCat);

  return (
    <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="top-header">
        <div className="flex-between">
          <h1 style={{ fontSize: 20 }}>Categories</h1>
          <button onClick={() => navigate('/search')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 80, background: 'var(--surface-container)', overflowY: 'auto', flexShrink: 0, paddingBottom: 80 }}>
            {categories
              .filter(cat => !EXCLUDED_CATEGORIES.includes(cat.name))
              .map(cat => {
              const cleanedName = cleanCategoryName(cat.name);
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    padding: '14px 6px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    cursor: 'pointer',
                    background: activeCat === cat.id ? 'var(--surface-lowest)' : 'transparent',
                    borderLeft: activeCat === cat.id ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="cat-sidebar-icon" style={{ overflow: 'hidden', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {CATEGORY_IMAGES[cleanedName] ? (
                      <img src={CATEGORY_IMAGES[cleanedName]} alt={cleanedName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : cat.image_url ? (
                      <img src={cat.image_url} alt={cleanedName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      '🛒'
                    )}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', color: activeCat === cat.id ? 'var(--primary)' : 'var(--on-surface-variant)', lineHeight: 1.2 }}>
                    {cleanedName}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Products */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
          {activeCategory && (
            <div style={{ padding: '14px 12px 10px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>{cleanCategoryName(activeCategory.name)}</h2>
              <p style={{ fontSize: 12, color: 'var(--outline)' }}>{products.length} products available</p>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">📦</span>
              <h3>No products yet</h3>
              <p>Coming soon in this category</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="view-cart-bar" onClick={() => navigate('/cart')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>{totalItems} item{totalItems > 1 ? 's' : ''} in cart</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>View Cart | ₹{totalPrice}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      )}

    </div>
  );
}
