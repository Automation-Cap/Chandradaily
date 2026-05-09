import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

import { CATEGORY_IMAGES, cleanCategoryName } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, updateQty, getQty, getCartItem, totalItems, totalPrice } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProductData() {
      const { data: prod } = await supabase.from('products').select('*, categories(name)').eq('id', id).single();
      if (prod) {
        setProduct(prod);
        const { data: related } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('category_id', prod.category_id)
          .neq('id', prod.id)
          .limit(10);
        setRelatedProducts(related || []);
      }
      setLoading(false);
    }
    getProductData();
  }, [id]);

  const qty = product ? getQty(product.id) : 0;
  const cartItem = product ? getCartItem(product.id) : null;
  const discount = product ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const catName = product?.categories?.name || '';

  async function handleAdd() {
    await addToCart(product);
    toast.success('Added to cart!', { icon: '🛒' });
  }

  if (loading) return (
    <div className="page">
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 16, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 24, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, borderRadius: 8, width: '60%' }} />
      </div>
    </div>
  );

  if (!product) return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--outline)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <h3>Product not found</h3>
      <button className="btn-primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Go Back</button>
    </div>
  );

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-lowest)' }}>
      {/* Back Button */}
      <div style={{ padding: '16px 16px 0', position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-lowest)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      {/* Product Image */}
      <div className="pd-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <img src={CATEGORY_IMAGES[cleanCategoryName(catName)] || '/categories/vegetables.png'} alt={catName} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0 16px' }}>
        {discount > 0 && <span className="status-badge delivered" style={{ marginBottom: 8, display: 'inline-flex' }}>{discount}% OFF</span>}
        <h1 style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 4 }}>{product.name}</h1>
        <div className="pd-unit">
          {product.weight_value ? `${product.weight_value} ${product.weight_unit}` : (product.unit_label || '1 unit')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>₹{product.price}</span>
          {product.mrp > product.price && (
            <span style={{ fontSize: 16, color: 'var(--outline)', textDecoration: 'line-through' }}>₹{product.mrp}</span>
          )}
        </div>

        {/* Delivery Badge */}
        <div style={{ background: 'rgba(0,110,36,0.08)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>30-Min Delivery</div>
            <div style={{ fontSize: 11, color: 'var(--outline)' }}>To Vinay Nagar, Faridabad</div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Product Details</h3>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Product Specifications</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--outline-variant)' }}>
              <span style={{ fontSize: 13, color: 'var(--outline)' }}>Unit</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{product.weight_value ? `${product.weight_value} ${product.weight_unit}` : (product.unit_label || '1 unit')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--outline-variant)' }}>
              <span style={{ fontSize: 13, color: 'var(--outline)' }}>Category</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{cleanCategoryName(catName)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--outline-variant)' }}>
              <span style={{ fontSize: 13, color: 'var(--outline)' }}>Shelf Life</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>As per packaging</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--outline-variant)' }}>
              <span style={{ fontSize: 13, color: 'var(--outline)' }}>Seller</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Chandra Daily Mart</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="section-header" style={{ padding: 0, marginBottom: 12 }}>
              <span className="section-title" style={{ fontSize: 16 }}>Related Products</span>
            </div>
            <div className="products-scroll" style={{ marginLeft: -16, marginRight: -16, paddingLeft: 16 }}>
              {relatedProducts.map(p => (
                <div key={p.id} style={{ minWidth: 150, marginRight: 12 }}>
                  <ProductCard product={p} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Sticky Bar */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '100%', 
          maxWidth: 430, 
          padding: '16px 20px 24px', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--outline-variant)', 
          zIndex: 100,
          boxShadow: '0 -10px 20px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--outline)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Price</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16, marginTop: 4 }}>₹</span>{product.price}
              </div>
            </div>
            {qty === 0 ? (
              <button 
                className="btn-primary" 
                style={{ width: 'auto', flex: 2, height: 52, borderRadius: 16, fontSize: 16, fontWeight: 700 }} 
                onClick={handleAdd}
              >
                Add to Cart
              </button>
            ) : (
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="stepper" style={{ height: 52, borderRadius: 16, background: 'var(--primary-container)', width: '100%' }}>
                  <button onClick={() => updateQty(cartItem.id, qty - 1)} style={{ fontSize: 20 }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 18 }}>{qty}</span>
                  <button onClick={() => updateQty(cartItem.id, qty + 1)} style={{ fontSize: 20 }}>+</button>
                </div>
              </div>
            )}
          </div>
          
          {totalItems > 0 && (
            <button 
              onClick={() => navigate('/cart')}
              style={{ 
                width: '100%', 
                height: 48, 
                background: 'var(--on-surface)', 
                color: 'var(--surface)', 
                border: 'none', 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              View Cart ({totalItems} items) • ₹{totalPrice}
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 90 }} />
    </div>
  );
}
