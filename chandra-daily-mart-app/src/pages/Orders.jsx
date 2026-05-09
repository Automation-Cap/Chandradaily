import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG = {
  pending: { label: 'Order Placed', color: '#856404', bg: '#fff3cd', icon: '🕐' },
  confirmed: { label: 'Confirmed', color: '#0c5460', bg: '#d1ecf1', icon: '✅' },
  preparing: { label: 'Preparing', color: '#6f42c1', bg: '#f3f0ff', icon: '👨‍🍳' },
  out_for_delivery: { label: 'On the way', color: '#994700', bg: '#fff4e5', icon: '🚴' },
  delivered: { label: 'Delivered', color: '#155724', bg: '#d4edda', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: '#721c24', bg: '#f8d7da', icon: '❌' },
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function fetchOrders() {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return (
    <div className="page" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!user && !authLoading) return (
    <div className="page">
      <div className="top-header"><h1 style={{ fontSize: 20 }}>My Orders</h1></div>
      <div className="empty-state">
        <span className="emoji">📦</span>
        <h3>Login to see orders</h3>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Login</button>
      </div>
    </div>
  );

  return (
    <div className="page fade-in">
      <div className="top-header">
        <h1 style={{ fontSize: 20 }}>My Orders</h1>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">📦</span>
          <h3>No orders yet</h3>
          <p>Your completed orders will appear here</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px' }}>
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <div key={order.id} style={{ background: 'var(--surface-lowest)', borderRadius: 16, marginBottom: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {/* Order Header */}
                <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--outline)', fontWeight: 500 }}>
                      Order #{order.order_number || order.id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 2 }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                {/* Items */}
                <div style={{ padding: '0 16px', borderTop: '1px solid var(--outline-variant)' }}>
                  {order.order_items?.slice(0, 2).map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: '1px solid var(--surface-container)' }}>
                      <span>{item.product_name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  {order.order_items?.length > 2 && (
                    <div style={{ fontSize: 12, color: 'var(--outline)', padding: '6px 0' }}>+{order.order_items.length - 2} more items</div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 16px', background: 'var(--surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--outline)' }}>Total: </span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>₹{order.total_price}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--outline)', background: 'var(--surface-container)', padding: '4px 10px', borderRadius: 999 }}>
                    {order.payment_method?.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
