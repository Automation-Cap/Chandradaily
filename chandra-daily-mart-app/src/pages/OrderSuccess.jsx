import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, order]);

  async function fetchOrder() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error('Fetch order error:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ fontWeight: 600, color: '#666' }}>Confirming your order...</p>
      </div>
    );
  }

  const orderTotal = order?.total_amount || order?.total_price || 0;

  return (
    <div className="page fade-in" style={{ background: 'white', minHeight: '100vh' }}>
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ 
          width: 80, height: 80, background: 'rgba(0,110,36,0.1)', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>Order Placed!</h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 32px' }}>
          Your order #{String(orderId).slice(-6).toUpperCase()} has been successfully placed.
        </p>

        {/* Delivery Timeline */}
        <div style={{ 
          background: 'linear-gradient(135deg, #006e24 0%, #38b44e 100%)', 
          borderRadius: 24, padding: '24px 20px', color: 'white', position: 'relative',
          boxShadow: '0 12px 24px rgba(0,110,36,0.2)', marginBottom: 32
        }}>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8, fontWeight: 600 }}>ESTIMATED DELIVERY IN</div>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>
            Our delivery partner is on the way!
          </div>
          
          <div style={{ 
            marginTop: 20, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${((1800 - timeLeft) / 1800) * 100}%`, height: '100%', 
              background: 'white', borderRadius: 2, transition: 'width 1s linear'
            }} />
          </div>
        </div>

        {/* Order Details */}
        <div style={{ textAlign: 'left', background: '#f8f9fa', borderRadius: 24, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#666' }}>Amount Paid</span>
              <span style={{ fontWeight: 700 }}>₹{orderTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#666' }}>Payment</span>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{order?.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#666' }}>Order Time</span>
              <span style={{ fontWeight: 700 }}>{new Date(order?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ height: 1, background: '#eee', margin: '4px 0' }} />
            <div style={{ fontSize: 14 }}>
              <span style={{ color: '#666', display: 'block', marginBottom: 4 }}>Delivery to</span>
              <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{order?.delivery_address}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/')}
            style={{ height: 56, borderRadius: 18 }}
          >
            Back to Home
          </button>
          <button 
            style={{ 
              background: 'none', border: 'none', color: '#666', fontWeight: 600, 
              fontSize: 14, cursor: 'pointer', padding: '12px' 
            }}
            onClick={() => navigate('/orders')}
          >
            Track My Orders
          </button>
        </div>
      </div>
    </div>
  );
}
