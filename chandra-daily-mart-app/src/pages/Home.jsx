import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import TopHeader from '../components/TopHeader';

import { CATEGORY_IMAGES, cleanCategoryName, EXCLUDED_CATEGORIES } from '../utils/format';

export default function Home() {
  const navigate = useNavigate();
  const { totalItems, totalPrice } = useCart();
  const { morningDeliveryEnabled, morningCutoff } = useStore();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*, categories(name)').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
      ]);
      
      if (cats.error) {
        console.warn('Categories fetch error:', cats.error);
        toast.error('Failed to load categories');
      }
      if (prods.error) {
        console.warn('Products fetch error:', prods.error);
        toast.error('Failed to load products');
      }

      setCategories(cats.data || []);
      const all = prods.data || [];
      setProducts(all);
      setFeatured(all.slice(0, 8));
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }

  const trending = products.slice(0, 8);

  return (
    <div className="page fade-in">
      <TopHeader />

      {/* Search Bar at Top */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div className="search-bar" onClick={() => navigate('/search')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input readOnly placeholder="Search groceries, snacks..." />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginTop: 8 }}>
        <span className="hero-badge">30-Min Delivery</span>
        <h2>Groceries at<br />Your Doorstep</h2>
        <p>Fresh, Fast & Affordable in Vinay nagar, Faridabad</p>
      </div>

      {/* Milk Scheduling Banner */}
      {morningDeliveryEnabled && (
        <div style={{ padding: '0 16px 12px' }}>
          <div
            className="promo-banner"
            style={{ 
              background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', 
              cursor: 'pointer', 
              borderRadius: 20,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              boxShadow: '0 6px 15px rgba(76, 29, 149, 0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => navigate('/schedule-delivery')}
          >
            {/* Elegant glass highlight */}
            <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 1 }}>Morning Milk Delivery</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Order by <strong style={{ color: '#fff' }}>12am</strong> for <strong style={{ color: '#fff' }}>7 AM</strong> delivery
              </p>
            </div>
            
            <div style={{
              background: '#fff', color: '#4c1d95', padding: '8px 14px', borderRadius: 10,
              fontWeight: 800, fontSize: 12, boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center'
            }}>
              Schedule
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-header">
          <span className="section-title">Shop by Category</span>
          <button className="see-all" onClick={() => navigate('/categories')}>See All</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'hidden' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ flexShrink: 0 }}>
                <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 12 }} />
                <div className="skeleton" style={{ width: 54, height: 10, marginTop: 6, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="category-grid">
          {categories
            .map(cat => {
              const cleanedName = cleanCategoryName(cat.name);
              return (
                <div key={cat.id} className="cat-pill" onClick={() => navigate(`/categories?cat=${cat.id}`)}>
                  <div className="cat-icon" style={{ overflow: 'hidden' }}>
                    {CATEGORY_IMAGES[cleanedName] ? (
                      <img src={CATEGORY_IMAGES[cleanedName]} alt={cleanedName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : cat.image_url ? (
                      <img src={cat.image_url} alt={cleanedName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '🛒'
                    )}
                  </div>
                  <span>{cleanedName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending Now */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-header">
          <span className="section-title">Trending Now</span>
          <button className="see-all" onClick={() => navigate('/categories')}>View All</button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'hidden' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ minWidth: 150, height: 200, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="products-scroll">
            {trending.map(p => <ProductCard key={p.id} product={p} compact />)}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* All Products */}
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <div className="section-header">
          <span className="section-title">Fresh Picks</span>
        </div>
        {loading ? (
          <div className="products-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
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
