import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_IMAGES, cleanCategoryName } from '../utils/format';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWishlist();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  async function fetchWishlist() {
    setLoading(true);
    const { data } = await supabase
      .from('wishlist')
      .select('*, products(*, categories(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setWishlist(data || []);
    setLoading(false);
  }

  async function removeItem(wishlistId) {
    const { error } = await supabase.from('wishlist').delete().eq('id', wishlistId);
    if (!error) {
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      toast.success('Removed from wishlist');
    }
  }

  if (authLoading) return (
    <div className="page" style={{ background: 'var(--surface-low)' }}>
      <div className="loader"><div className="spinner" /></div>
    </div>
  );

  if (!user) return (
    <div className="page" style={{ background: 'var(--surface-low)' }}>
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/profile')} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 style={{ fontSize: 20 }}>Wishlist</h1>
      </div>
      <div className="empty-state">
        <div style={{ fontSize: 56 }}>❤️</div>
        <h3>Login to view wishlist</h3>
        <button className="btn-primary" style={{ marginTop: 16, maxWidth: 200 }} onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)' }}>
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/profile')} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 style={{ fontSize: 20, flex: 1 }}>Wishlist</h1>
        <span style={{ fontSize: 13, color: 'var(--outline)' }}>{wishlist.length} items</span>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : wishlist.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64 }}>❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love to find them easily later</p>
          <button className="btn-primary" style={{ marginTop: 16, maxWidth: 220 }} onClick={() => navigate('/')}>
            Explore Products
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {wishlist.map(item => {
            const product = item.products;
            const catName = product?.categories?.name || '';
            const imgSrc = product?.image_url || CATEGORY_IMAGES[cleanCategoryName(catName)] || '/categories/vegetables.png';
            return (
              <div key={item.id} style={{
                background: 'var(--surface-lowest)', borderRadius: 18,
                padding: 14, display: 'flex', gap: 14, alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 14,
                  background: 'var(--surface-low)',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  <img src={imgSrc} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--outline)', marginTop: 2 }}>{product?.unit_label || ''}</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>₹{product?.price}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => navigate(`/product/${product?.id}`)} style={{
                    background: 'var(--primary)', border: 'none', borderRadius: 10,
                    color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px', cursor: 'pointer',
                  }}>View</button>
                  <button onClick={() => removeItem(item.id)} style={{
                    background: '#ffeaea', border: 'none', borderRadius: 10,
                    color: '#ba1a1a', fontSize: 12, fontWeight: 700, padding: '8px 14px', cursor: 'pointer',
                  }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
