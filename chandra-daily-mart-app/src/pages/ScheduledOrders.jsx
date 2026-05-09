import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ScheduledOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchScheduled();
    else setLoading(false);
  }, [user]);

  async function fetchScheduled() {
    setLoading(true);
    const { data, error } = await supabase
      .from('scheduled_deliveries')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
    if (!error) setScheduled(data || []);
    setLoading(false);
  }

  async function cancelSchedule(id) {
    const { error } = await supabase
      .from('scheduled_deliveries')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (!error) {
      setScheduled(prev => prev.filter(s => s.id !== id));
      toast.success('Schedule cancelled');
    } else {
      toast.error('Could not cancel. Try again.');
    }
  }

  const BackBtn = () => (
    <button onClick={() => navigate(-1)} style={{
      background: 'var(--surface-container)', border: 'none', borderRadius: 10,
      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );

  if (!user) return (
    <div className="page" style={{ background: 'var(--surface-low)' }}>
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackBtn />
        <h1 style={{ fontSize: 20 }}>Scheduled Orders</h1>
      </div>
      <div className="empty-state">
        <div style={{ fontSize: 56 }}>📅</div>
        <h3>Login to view scheduled orders</h3>
        <button className="btn-primary" style={{ marginTop: 16, maxWidth: 200 }} onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)' }}>
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackBtn />
        <h1 style={{ fontSize: 20, flex: 1 }}>Scheduled Orders</h1>
        <button
          onClick={() => navigate('/schedule-delivery')}
          style={{
            background: 'var(--primary)', border: 'none', borderRadius: 10,
            padding: '8px 14px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          + New
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : scheduled.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64 }}>📅</div>
          <h3>No scheduled orders yet</h3>
          <p>Schedule daily essentials like milk, eggs & more for next-morning delivery</p>
          <button className="btn-primary" style={{ marginTop: 16, maxWidth: 260 }} onClick={() => navigate('/schedule-delivery')}>
            🥛 Schedule Daily Products
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {scheduled.map(order => (
            <div key={order.id} style={{
              background: 'var(--surface-lowest)', borderRadius: 20,
              padding: 16, boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--on-surface)' }}>📅 {order.delivery_date}</p>
                  <p style={{ fontSize: 12, color: 'var(--outline)', marginTop: 3 }}>
                    {order.products?.length} item{order.products?.length > 1 ? 's' : ''} · Delivers by 7 AM
                  </p>
                </div>
                <span style={{
                  background: '#e8f5e9', color: '#2e7d32',
                  borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 800,
                }}>CONFIRMED ✓</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {(order.products || []).map((p, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--surface-low)', borderRadius: 12, padding: '8px 12px',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: 'var(--surface-container)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🥛'}
                    </div>
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{p.name}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                      {p.quantity > 1 ? `${p.quantity} × ` : ''}₹{p.price}
                    </p>
                  </div>
                ))}
              </div>

              <button onClick={() => cancelSchedule(order.id)} style={{
                width: '100%', background: '#ffeaea', border: 'none', borderRadius: 12,
                color: '#ba1a1a', fontWeight: 700, fontSize: 13, padding: '11px 0', cursor: 'pointer',
              }}>
                Cancel Schedule
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
