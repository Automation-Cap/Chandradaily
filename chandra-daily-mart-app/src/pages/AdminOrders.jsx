import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAdminNotification } from '../contexts/AdminNotificationContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#FF9500', bg: '#FFF9F2' },
  { value: 'confirmed', label: 'Confirmed', color: '#007AFF', bg: '#F2F8FF' },
  { value: 'packed', label: 'Packed', color: '#5856D6', bg: '#F6F5FF' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#AF52DE', bg: '#FAF5FF' },
  { value: 'delivered', label: 'Delivered', color: '#34C759', bg: '#F2F8FF' },
  { value: 'cancelled', label: 'Cancelled', color: '#FF3B30', bg: '#FFF2F2' },
];

export default function AdminOrders() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { audioEnabled } = useAdminNotification();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'
  
  useEffect(() => {
    if (authLoading) return;
    
    if (user && !isAdmin) {
      navigate('/');
      return;
    }
    
    if (isAdmin) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin, authLoading, navigate]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_name,
            quantity,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  }



  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') return !['delivered', 'cancelled'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  if (authLoading) return <div className="loader"><div className="spinner" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="page fade-in" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        background: 'white', 
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => navigate('/admin')}
            style={{ background: 'none', border: 'none', fontSize: 18, color: '#1a1a1a', cursor: 'pointer', padding: '4px 8px' }}
          >
            Back
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Orders</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {audioEnabled && (
            <div style={{ fontSize: 14, background: '#F2F8FF', padding: '6px 10px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#007AFF' }}>AUDIO ON</span>
              <span>🔊</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        padding: '12px 20px', 
        gap: 8, 
        background: 'white', 
        borderBottom: '1px solid #eee' 
      }}>
        {['active', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: activeTab === tab ? '#1a1a1a' : '#f0f0f0',
              color: activeTab === tab ? 'white' : '#666',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" style={{ width: 30, height: 30, border: '3px solid #eee', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
          <p>No {activeTab} orders found</p>
        </div>
      ) : (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ 
              background: 'white', 
              borderRadius: 24, 
              padding: 20, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid #f0f0f0'
            }}>
              {/* Order Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>#{order.order_number || order.id.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>
                    {new Date(order.created_at).toLocaleString('en-IN', { 
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
                <div style={{ 
                  background: STATUS_OPTIONS.find(s => s.value === order.status)?.bg || '#f0f0f0',
                  color: STATUS_OPTIONS.find(s => s.value === order.status)?.color || '#666',
                  padding: '6px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Customer Details */}
              <div style={{ marginBottom: 16, padding: '12px', background: '#f8f9fa', borderRadius: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{order.customer_name || 'Guest User'}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{order.customer_phone}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.4 }}>{order.delivery_address}</div>
              </div>

              {/* Items */}
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 }}>
                {order.order_items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#444' }}>{item.product_name} <span style={{ color: '#999' }}>×{item.quantity}</span></span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Total & Payment */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#888' }}>Total Amount</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>₹{order.total_price}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>Payment</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: order.payment_status === 'paid' ? '#34C759' : '#FF9500' }}>
                    {order.payment_method?.toUpperCase()} • {order.payment_status?.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: 14,
                      border: '1px solid #eee',
                      background: '#f8f9fa',
                      fontSize: 14,
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  
                  {/* Quick Shortcut Buttons for common next steps */}
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 14, fontWeight: 600 }}
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'packed')}
                      style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 14, fontWeight: 600 }}
                    >
                      Mark Packed
                    </button>
                  )}
                  {order.status === 'packed' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                      style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 14, fontWeight: 600 }}
                    >
                      Out for Delivery
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      style={{ background: '#34C759', color: 'white', border: 'none', borderRadius: 14, fontWeight: 600 }}
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
