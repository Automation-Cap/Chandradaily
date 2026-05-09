import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import toast from 'react-hot-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, profile } = useAuth();
  const { isCurrentlyOpen } = useStore();
  const [orders, setOrders] = useState([]);
  const [morningSummary, setMorningSummary] = useState({ people: 0, items: 0 });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today'); // 'today', 'yesterday', 'month'

  useEffect(() => {
    // Strict admin check
    if (user && !isAdmin) {
      navigate('/');
      toast.error('Access Denied: Admin privileges required');
      return;
    }
    
    if (isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin, navigate]);

  async function fetchAdminData() {
    setLoading(true);
    try {
      // 1. Fetch Orders for Stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('created_at, total_price, user_id, status')
        .gte('created_at', startOfMonth);

      if (orderError) throw orderError;
      setOrders(orderData || []);

      // 2. Fetch Morning Delivery Summary (for tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data: morningData, error: morningError } = await supabase
        .from('scheduled_deliveries')
        .select('user_id, quantity')
        .eq('delivery_date', tomorrowStr)
        .eq('status', 'pending');

      if (!morningError && morningData) {
        const uniquePeople = new Set(morningData.map(d => d.user_id)).size;
        const totalItems = morningData.reduce((sum, d) => sum + (d.quantity || 1), 0);
        setMorningSummary({ people: uniquePeople, items: totalItems });
      }

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStats = () => {
    // Use local date for accurate reporting in user's timezone (IST)
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    const filtered = orders.filter(order => {
      const orderDateStr = new Date(order.created_at).toLocaleDateString('en-CA');
      
      if (period === 'today') return orderDateStr === todayStr;
      if (period === 'yesterday') return orderDateStr === yesterdayStr;
      if (period === 'month') return true; // orders is already filtered for startOfMonth
      return false;
    });

    const revenue = filtered
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    
    const activeCount = filtered.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

    return {
      count: filtered.length,
      revenue: revenue,
      active: activeCount
    };
  };

  const stats = getStats();

  const adminActions = [
    { id: 'toggle', label: 'Operational Hub (Settings)', icon: '⚙️', color: '#8E8E93' },
    { id: 'morning', label: 'Morning Delivery', icon: '☀️', color: '#FF9500' },
    { id: 'orders', label: 'Order Received', icon: '🛍️', color: '#34C759' },
    { id: 'inventory', label: 'Inventory', icon: '📦', color: '#5856D6' },
    { id: 'products', label: 'Product Listing', icon: '📝', color: '#007AFF' },
    { id: 'users', label: 'User Management', icon: '👥', color: '#AF52DE' },
  ];

  if (!isAdmin) return null;

  return (
    <div className="page fade-in" style={{ 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      paddingBottom: 80 
    }}>
      {/* Premium Header */}
      <div style={{ 
        padding: '30px 20px', 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Admin Panel</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Welcome back, {profile?.full_name || 'Admin'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div 
              onClick={() => navigate('/admin/store-status')}
              style={{ 
                background: isCurrentlyOpen ? '#34C759' : '#FF3B30', 
                color: 'white',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isCurrentlyOpen ? '0 4px 12px rgba(52, 199, 89, 0.3)' : '0 4px 12px rgba(255, 59, 48, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />
              {isCurrentlyOpen ? 'Shop Open' : 'Shop Closed'}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', opacity: 0.6 }}>SUPER ADMIN</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Morning Delivery Snapshot - NEW */}
        <div 
          onClick={() => navigate('/admin/morning')}
          style={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
            borderRadius: 24, 
            padding: 20, 
            marginBottom: 20, 
            color: '#fff',
            boxShadow: '0 10px 20px rgba(30, 58, 138, 0.2)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Morning Deliveries (Tomorrow)</p>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0' }}>{morningSummary.people} People Ordered</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: 14, fontSize: 12, fontWeight: 700 }}>
                {morningSummary.items} Items Total
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ opacity: 0.8 }}>Click to view packing list & schedule</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 100, opacity: 0.1 }}>☀️</div>
        </div>

        {/* Period Selector */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 16,
          background: 'rgba(0,0,0,0.05)',
          padding: 4,
          borderRadius: 14
        }}>
          {['today', 'yesterday', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                border: 'none',
                background: period === p ? 'white' : 'transparent',
                color: period === p ? '#1a1a1a' : '#666',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: period === p ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Real Stats */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: 20, 
          marginBottom: 24, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
          position: 'relative'
        }}>
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, zIndex: 5 }}>
               <div className="spinner-small" style={{ width: 20, height: 20, border: '2px solid #eee', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>{period === 'month' ? 'This Month' : period === 'yesterday' ? 'Yesterday' : "Today's"} Orders</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{stats.count}</div>
          </div>
          <div style={{ width: 1, background: '#eee' }} />
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#34C759' }}>₹{stats.revenue.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: '#eee' }} />
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Active Now</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FF9500' }}>{stats.active}</div>
          </div>
        </div>

        {/* 6 Square Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 16 
        }}>
          {adminActions.map(action => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === 'toggle') navigate('/admin/store-status');
                else if (action.id === 'morning') navigate('/admin/morning');
                else if (action.id === 'orders') navigate('/admin/orders');
                else if (action.id === 'inventory') navigate('/admin/inventory');
                else if (action.id === 'products') navigate('/admin/products');
                else if (action.id === 'users') navigate('/admin/users');
                else toast.success(`Opening ${action.label}...`);
              }}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: 24,
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                padding: 16,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
              }}
            >
              {/* Subtle background glow */}
              <div style={{
                position: 'absolute',
                width: '60%',
                height: '60%',
                background: action.color,
                filter: 'blur(40px)',
                opacity: 0.05,
                zIndex: 0
              }} />

              <div style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                zIndex: 1
              }}>
                {action.icon}
              </div>
              <span style={{ 
                fontSize: 13, 
                fontWeight: 700, 
                color: '#1a1a1a',
                textAlign: 'center',
                zIndex: 1,
                lineHeight: 1.2
              }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Logout Option */}
        <button 
          onClick={() => navigate('/profile')}
          style={{
            marginTop: 30,
            width: '100%',
            padding: '16px',
            borderRadius: 20,
            background: 'white',
            border: '1px solid #eee',
            color: '#666',
            fontWeight: 600,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Go to User Profile
        </button>
      </div>
    </div>
  );
}
