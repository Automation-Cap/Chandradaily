import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminMorningDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDeliveries();
  }, [filterDate]);

  async function fetchDeliveries() {
    setLoading(true);
    // Fetch individual product rows joined with products and profiles
    const { data, error } = await supabase
      .from('scheduled_deliveries')
      .select(`
        *,
        products:product_id (
          id,
          name,
          price,
          image_url
        ),
        profiles:user_id (
          full_name,
          phone,
          wallet_balance
        )
      `)
      .eq('status', 'pending')
      .eq('delivery_date', filterDate);

    if (!error) {
      setDeliveries(data || []);
    } else {
      console.error(error);
      toast.error('Failed to fetch deliveries');
    }
    setLoading(false);
  }

  // Group deliveries by user_id
  const getGroupedDeliveries = () => {
    const groups = {};
    deliveries.forEach(d => {
      if (!groups[d.user_id]) {
        groups[d.user_id] = {
          user_id: d.user_id,
          profile: d.profiles,
          items: [],
          totalAmount: 0,
          recordIds: []
        };
      }
      const product = d.products || { name: 'Unknown', price: 0 };
      groups[d.user_id].items.push({
        ...product,
        quantity: d.quantity,
        recordId: d.id
      });
      groups[d.user_id].totalAmount += (product.price * (d.quantity || 1));
      groups[d.user_id].recordIds.push(d.id);
    });
    return Object.values(groups);
  };

  const aggregateItems = () => {
    const totals = {};
    deliveries.forEach(d => {
      const p = d.products;
      if (!p) return;
      if (!totals[p.id]) {
        totals[p.id] = { name: p.name, quantity: 0, image_url: p.image_url };
      }
      totals[p.id].quantity += (d.quantity || 1);
    });
    return Object.values(totals);
  };

  const markAsDelivered = async (group) => {
    const totalAmount = group.totalAmount;
    const currentBalance = group.profile?.wallet_balance || 0;
    const newBalance = currentBalance - totalAmount;
    const customerName = group.profile?.full_name || 'Customer';

    if (!confirm(`Are you sure you want to mark delivery for ${customerName}? This will deduct ₹${totalAmount} from their wallet.`)) {
      return;
    }

    if (newBalance < 0) {
      if (!confirm(`User has insufficient balance (₹${currentBalance}). Total order is ₹${totalAmount}. Deduct anyway?`)) {
        return;
      }
    }

    try {
      // 1. Update wallet balance
      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', group.user_id);

      if (walletError) throw walletError;

      // 2. Mark all related rows as delivered
      const { error: deliveryError } = await supabase
        .from('scheduled_deliveries')
        .update({ status: 'delivered' })
        .in('id', group.recordIds);

      if (deliveryError) throw deliveryError;

      // 3. Open WhatsApp
      sendWhatsApp(group, totalAmount, newBalance);

      toast.success('Marked as delivered and wallet updated!');
      fetchDeliveries();
    } catch (err) {
      console.error(err);
      toast.error('Transaction failed. Check logs.');
    }
  };

  const sendWhatsApp = (group, amount, balance) => {
    const name = group.profile?.full_name || 'Customer';
    const phone = group.profile?.phone;
    if (!phone) return toast.error('Phone number missing');

    const itemList = group.items
      .map(p => `• *${p.name}* (x${p.quantity || 1})`)
      .join('\n');

    const msg = `*Greetings from Chandra Daily Mart!* 🚚🥛\n\nHello *${name}*,\n\nYour morning scheduled items have been delivered successfully!\n\n*Items Delivered:*\n${itemList}\n\n*Total Amount:* ₹${amount}\n*New Wallet Balance:* ₹${balance.toFixed(2)}\n\nThank you for choosing Chandra Daily Mart! 🙏\n_Have a wonderful day!_`;
    
    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/91${phone}?text=${encodedMsg}`, '_blank');
  };

  const BackBtn = () => (
    <button onClick={() => navigate('/admin')} style={{
      background: 'var(--surface-container)', border: 'none', borderRadius: 10,
      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );

  const totals = aggregateItems();

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)', paddingBottom: 40 }}>
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackBtn />
        <h1 style={{ fontSize: 20, flex: 1 }}>Morning Deliveries</h1>
        <input 
          type="date" 
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)',
            fontSize: 13, fontWeight: 600, background: 'var(--surface-lowest)'
          }}
        />
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Aggregated Inventory Summary - Enhanced */}
        {!loading && totals.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', 
            color: '#fff',
            padding: '24px 20px', borderRadius: 28, marginBottom: 28, 
            boxShadow: '0 12px 30px rgba(30, 58, 175, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>📊</span> Overall Preparation List
                </h3>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>
                  {totals.reduce((acc, t) => acc + t.quantity, 0)} Items Total
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {totals.map((t, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '16px', 
                    borderRadius: 20,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: 8, color: '#bfdbfe' }}>{t.name}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: '#fcd34d' }}>{t.quantity}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>PKTS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Background pattern */}
            <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.05 }}>🚚</div>
          </div>
        )}

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : getGroupedDeliveries().length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🚛</div>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>No Pending Deliveries</h3>
            <p style={{ color: '#666' }}>All morning schedules for {filterDate} are cleared.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Deliver to ({getGroupedDeliveries().length} People)</h3>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-container)', padding: '4px 10px', borderRadius: 20 }}>
                Live Feed
              </span>
            </div>
            
            {getGroupedDeliveries().map(group => {
              const orderTotal = group.totalAmount;
              const currentBalance = group.profile?.wallet_balance || 0;
              const hasInsufficientFunds = currentBalance < orderTotal;

              return (
                <div key={group.user_id} style={{
                  background: 'white', borderRadius: 24,
                  padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: `1.5px solid ${hasInsufficientFunds ? '#fee2e2' : '#f0f0f0'}`,
                  position: 'relative'
                }}>
                  {hasInsufficientFunds && (
                    <div style={{ 
                      position: 'absolute', top: -10, right: 20, 
                      background: '#ef4444', color: 'white', 
                      padding: '2px 10px', borderRadius: 8, 
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      Low Balance
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>{group.profile?.full_name || 'Customer'}</h4>
                      <p style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {group.profile?.phone}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 2 }}>Wallet Balance</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: hasInsufficientFunds ? '#ef4444' : '#10b981' }}>
                        ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                    {group.items.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{p.quantity} × {p.name}</span>
                        <span style={{ fontWeight: 700, color: '#1a1a1a' }}>₹{p.price * (p.quantity || 1)}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#64748b', fontSize: 13 }}>TOTAL TO DEDUCT</span>
                      <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 18 }}>₹{orderTotal}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => markAsDelivered(group)}
                    style={{
                      width: '100%', background: hasInsufficientFunds ? '#ef4444' : 'var(--primary)', color: '#fff',
                      border: 'none', borderRadius: 16, padding: '16px',
                      fontSize: 15, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span>🚀 Deliver Order</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 12, fontWeight: 600 }}>
                    Clicking will deduct wallet & send WhatsApp update
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
