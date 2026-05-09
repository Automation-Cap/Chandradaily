import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_IMAGES, cleanCategoryName } from '../utils/format';
import toast from 'react-hot-toast';

const DAILY_CATEGORY_NAMES = [
  'milk', 'dairy', 'egg', 'protein', 'bread', 'bakery', 'vegetables', 'veggies', 'vegetable'
];

function isDailyCategory(catName = '') {
  const lower = catName.toLowerCase();
  return DAILY_CATEGORY_NAMES.some(k => lower.includes(k));
}

export default function ScheduleDelivery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { productId: { ...product, quantity: 0 } }
  const [activeTab, setActiveTab] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  // Use local date parts to avoid UTC offset issues with toISOString
  const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  useEffect(() => { fetchDailyProducts(); }, []);

  async function fetchDailyProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true)
      .order('name');
    const daily = (data || []).filter(p => isDailyCategory(p.categories?.name || ''));
    setProducts(daily);
    setLoading(false);
  }

  const updateQty = (product, delta) => {
    setSelected(prev => {
      const current = prev[product.id] || { ...product, quantity: 0 };
      const newQty = Math.max(0, current.quantity + delta);
      
      const newSelected = { ...prev };
      if (newQty === 0) {
        delete newSelected[product.id];
      } else {
        newSelected[product.id] = { ...current, quantity: newQty };
      }
      return newSelected;
    });
  };

  async function handleConfirm() {
    if (!user) { 
      toast.error('Please login first'); 
      navigate('/login'); 
      return; 
    }
    
    const selectedList = Object.values(selected).filter(p => p.quantity > 0);
    if (selectedList.length === 0) { 
      toast.error('Select at least one product'); 
      return; 
    }

    console.log('Attempting to schedule:', {
      userId: user.id,
      date: tomorrowISO,
      items: selectedList.map(p => ({ id: p.id, name: p.name, qty: p.quantity }))
    });

    setSubmitting(true);
    try {
      // 1. Delete existing pending schedules for this user and date
      const { error: deleteError } = await supabase
        .from('scheduled_deliveries')
        .delete()
        .eq('user_id', user.id)
        .eq('delivery_date', tomorrowISO)
        .eq('status', 'pending');

      if (deleteError) throw deleteError;

      // 2. Insert new selections
      const { error: insertError } = await supabase
        .from('scheduled_deliveries')
        .insert(selectedList.map(item => ({
          user_id: user.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          delivery_date: tomorrowISO,
          status: 'pending'
        })));

      if (insertError) {
        console.error('Insert error details:', insertError);
        toast.error(`Failed to save schedule: ${insertError.message}`);
        return;
      }

      toast.success(`🎉 Scheduled for ${tomorrowStr} by 7 AM!`);
      setSelected({});
      navigate('/scheduled-orders');
    } catch (error) {
      toast.error('Failed to save schedule. Try again.');
      console.error('Schedule Error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const categories = [...new Set(products.map(p => cleanCategoryName(p.categories?.name || 'Other')))];
  const filtered = activeTab === 'all' ? products : products.filter(p => cleanCategoryName(p.categories?.name || '') === activeTab);

  return (
    <div className="page fade-in" style={{ background: '#f8fafc', paddingBottom: Object.values(selected).some(i => i.quantity > 0) ? 140 : 100 }}>
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderBottom: '1px solid #f1f5f9' }}>
        <button onClick={() => navigate(-1)} style={{
          background: '#f1f5f9', border: 'none', borderRadius: 12,
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>Schedule Morning</h1>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 600 }}>Deliveries by 7:00 AM</p>
        </div>
      </div>

      {/* Hero Info */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          borderRadius: 24, padding: 20, color: '#fff',
          boxShadow: '0 10px 25px rgba(30, 58, 138, 0.2)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>Next Morning Delivery</p>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: '4px 0' }}>{tomorrowStr}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
               <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                 Order before 11 PM
               </span>
            </div>
          </div>
          <div style={{ position: 'absolute', right: -10, bottom: -10, fontSize: 80, opacity: 0.1 }}>☀️</div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 10, padding: '0 16px 20px', scrollbarWidth: 'none' }}>
        {['all', ...categories].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flexShrink: 0, padding: '10px 18px', borderRadius: 14, border: 'none',
            background: activeTab === tab ? '#1e3a8a' : 'white',
            color: activeTab === tab ? '#fff' : '#64748b',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', 
            boxShadow: activeTab === tab ? '0 4px 12px rgba(30, 58, 138, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s'
          }}>
            {tab === 'all' ? 'All Items' : tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner-small" style={{ width: 30, height: 30 }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {filtered.map(p => {
              const item = selected[p.id];
              const qty = item ? item.quantity : 0;
              const isSelected = qty > 0;
              
              return (
                <div key={p.id} style={{
                  background: 'white',
                  borderRadius: 24, padding: 12, 
                  border: `2px solid ${isSelected ? '#1e3a8a' : 'transparent'}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                  boxShadow: isSelected ? '0 8px 20px rgba(30, 58, 138, 0.1)' : '0 4px 15px rgba(0,0,0,0.03)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  position: 'relative'
                }}>
                  <div style={{ width: '100%', aspectRatio: 1, borderRadius: 18, overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
                    <img src={p.image_url || '/placeholder.png'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.3, marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{p.weight_value} {p.weight_unit}</p>
                    <p style={{ fontSize: 16, fontWeight: 900, color: '#1e3a8a' }}>₹{p.price}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
                    {qty === 0 ? (
                      <button 
                        onClick={() => {
                          console.log('Adding product:', p.name);
                          updateQty(p, 1);
                        }}
                        style={{
                          width: '100%', padding: '10px 0', borderRadius: 14, border: 'none',
                          background: '#f1f5f9', color: '#1e3a8a', fontWeight: 800, fontSize: 13,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.2s'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        ADD
                      </button>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        background: '#1e3a8a', 
                        borderRadius: 14, 
                        padding: '2px',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                      }}>
                        <button 
                          onClick={() => {
                            console.log('Decreasing qty for:', p.name);
                            updateQty(p, -1);
                          }} 
                          style={{ 
                            width: 32, height: 32, borderRadius: 12, border: 'none', 
                            background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 900, fontSize: 18,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >−</button>
                        <span style={{ fontWeight: 900, fontSize: 15, color: 'white' }}>{qty}</span>
                        <button 
                          onClick={() => {
                            console.log('Increasing qty for:', p.name);
                            updateQty(p, 1);
                          }} 
                          style={{ 
                            width: 32, height: 32, borderRadius: 12, border: 'none', 
                            background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 900, fontSize: 18,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Confirm */}
      {Object.values(selected).some(i => i.quantity > 0) && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          padding: '16px 20px 32px',
          borderTop: '1px solid #f1f5f9', zIndex: 100,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
             <div>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 700, margin: 0 }}>SCHEDULE SUMMARY</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>{Object.values(selected).filter(i => i.quantity > 0).length} Items Selected</p>
             </div>
             <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 700, margin: 0 }}>TOTAL</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
                  ₹{Object.values(selected).reduce((sum, i) => sum + (i.price * i.quantity), 0)}
                </p>
             </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              width: '100%', height: 58, borderRadius: 18, border: 'none',
              background: '#1e3a8a', color: '#fff', fontSize: 16, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              cursor: 'pointer', boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? (
              <div className="spinner-small" style={{ borderTopColor: 'white' }} />
            ) : (
              <>
                <span>Confirm Schedule Order</span>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

