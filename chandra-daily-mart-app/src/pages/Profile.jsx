import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/* ── ICONS ── */
const Icon = ({ d, size = 20, color = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ChevronRight = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--outline)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ── WALLET CARD ── */
function WalletCard({ balance = 0 }) {
  return (
    <div style={{
      margin: '0 16px 20px',
      borderRadius: 28,
      background: 'linear-gradient(135deg, #004d1a 0%, #006e24 50%, #1e3a8a 120%)',
      padding: '24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0,110,36,0.3)',
    }}>
      {/* decorative elements */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>CDM Digital Wallet</p>
          <p style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
            ₹{balance.toFixed(2)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>Safe & Secure Balance</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, position: 'relative', zIndex: 1 }}>
        <button style={{
          flex: 1, background: '#fff', border: 'none', borderRadius: 14,
          color: '#006e24', fontWeight: 800, fontSize: 14, padding: '12px 0',
          cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }} onClick={() => toast('Recharge coming soon!')}>
          Add Money
        </button>
        <button style={{
          flex: 1, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14,
          color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 0',
          cursor: 'pointer', backdropFilter: 'blur(10px)',
        }} onClick={() => toast('Transactions coming soon!')}>
          History
        </button>
      </div>
    </div>
  );
}

/* ── MENU ITEM ── */
function MenuItem({ icon, label, sublabel, onClick, iconBg = '#f0f4f8', iconColor = '#006e24', danger = false }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderRadius: 18,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-low)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: danger ? '#ffeaea' : iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
      }}>
        <span style={{ color: danger ? '#ba1a1a' : iconColor, display: 'flex' }}>{icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: danger ? '#ba1a1a' : 'var(--on-surface)', lineHeight: 1 }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: 'var(--outline)', marginTop: 4 }}>{sublabel}</p>}
      </div>
      {!danger && <ChevronRight />}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();

  if (authLoading) return (
    <div className="page" style={{ background: 'var(--surface-low)' }}>
      <div className="loader"><div className="spinner" /></div>
    </div>
  );

  if (!user) return (
    <div className="page" style={{ background: 'var(--surface-low)' }}>
      <div className="top-header">
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Account</h1>
      </div>
      <div className="empty-state" style={{ padding: '40px 20px' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>👤</div>
        <h3 style={{ fontSize: 20, fontWeight: 800 }}>Welcome!</h3>
        <p style={{ color: 'var(--outline)', maxWidth: 240, margin: '8px auto 24px' }}>Login to unlock wallet, schedules, wishlist and personalized offers.</p>
        <button className="btn-primary" style={{ height: 54, borderRadius: 18, fontSize: 16, fontWeight: 800 }} onClick={() => navigate('/login')}>
          Login / Sign Up
        </button>
      </div>
    </div>
  );

  const displayName = profile?.full_name || 'Valued Customer';
  const phoneDisplay = profile?.phone || user?.phoneNumber || '—';
  const emailDisplay = user?.email || 'No email added';
  const initial = displayName[0]?.toUpperCase() || 'C';

  async function handleLogout() {
    await signOut();
    navigate('/');
    toast.success('Logged out successfully');
  }

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)', paddingBottom: 110 }}>
      {/* Premium Header */}
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--on-surface)', letterSpacing: '-0.5px' }}>Account</h1>
          <p style={{ fontSize: 12, color: 'var(--outline)', fontWeight: 600 }}>Welcome back, {displayName.split(' ')[0]}</p>
        </div>
        {isAdmin && (
          <div style={{
            background: 'linear-gradient(135deg, #006e24, #1e3a8a)',
            color: '#fff', borderRadius: 12, padding: '6px 12px', fontSize: 11, fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0,110,36,0.2)',
          }}>ADMIN</div>
        )}
      </div>

      {/* ── User Brief Card ── */}
      <div style={{ padding: '12px 16px 20px' }}>
        <div style={{
          background: 'var(--surface-lowest)', borderRadius: 24,
          padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 22,
            background: 'linear-gradient(135deg, var(--primary), #38b44e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 900,
            boxShadow: '0 8px 16px rgba(0,110,36,0.2)',
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 19, fontWeight: 850, color: 'var(--on-surface)', marginBottom: 4 }}>{displayName}</p>
            <p style={{ fontSize: 13, color: 'var(--outline)', fontWeight: 500 }}>{phoneDisplay}</p>
          </div>
          <button onClick={() => navigate('/profile/edit')} style={{
            width: 40, height: 40, borderRadius: 14, background: 'var(--surface-low)',
            border: 'none', color: 'var(--primary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" size={18} />
          </button>
        </div>
      </div>

      {/* ── Wallet ── */}
      <WalletCard balance={profile?.wallet_balance || 0} />

      {/* ── Action Buttons ── */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button 
            onClick={() => navigate('/schedule-delivery')}
            style={{
              background: '#f3f0ff', border: 'none', borderRadius: 20, padding: '20px 16px',
              display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>📅</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#4c1d95' }}>Schedules</p>
              <p style={{ fontSize: 11, color: '#7c3aed', opacity: 0.8 }}>Daily Essentials</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/wishlist')}
            style={{
              background: '#fff1f2', border: 'none', borderRadius: 20, padding: '20px 16px',
              display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>❤️</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#881337' }}>Wishlist</p>
              <p style={{ fontSize: 11, color: '#e11d48', opacity: 0.8 }}>Saved Items</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── User Information (Profile Section) ── */}
      <div style={{ padding: '0 16px 20px' }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4, marginBottom: 10 }}>Personal Information</p>
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <MenuItem
            icon={<Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />}
            iconBg="#eef2ff" iconColor="#4338ca"
            label="My Profile"
            sublabel={`${displayName} · ${emailDisplay}`}
            onClick={() => navigate('/profile/edit')}
          />
          <div style={{ height: 1, background: 'var(--surface-container)', margin: '0 16px' }} />
          <MenuItem
            icon={<Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />}
            iconBg="#ecfdf5" iconColor="#059669"
            label="Saved Addresses"
            sublabel="Manage delivery locations"
            onClick={() => navigate('/profile/addresses')}
          />
          <div style={{ height: 1, background: 'var(--surface-container)', margin: '0 16px' }} />
          <MenuItem
            icon={<Icon d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6M12 11h.01M12 15h.01M12 19h.01" />}
            iconBg="#fffbeb" iconColor="#d97706"
            label="Order History"
            sublabel="Track & view past orders"
            onClick={() => navigate('/orders')}
          />
        </div>
      </div>

      {/* ── More Section ── */}
      <div style={{ padding: '0 16px 20px' }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4, marginBottom: 10 }}>Settings & Support</p>
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <MenuItem
            icon={<Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
            iconBg="#eff6ff" iconColor="#2563eb"
            label="Help & Support"
            onClick={() => navigate('/support')}
          />
          <div style={{ height: 1, background: 'var(--surface-container)', margin: '0 16px' }} />
          <MenuItem
            icon={<Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
            iconBg="#fafafa" iconColor="#4b5563"
            label="Terms & Privacy"
            onClick={() => navigate('/terms')}
          />
          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--surface-container)', margin: '0 16px' }} />
              <MenuItem
                icon={<Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />}
                iconBg="#f5f3ff" iconColor="#7c3aed"
                label="Admin Dashboard"
                sublabel="Store Management"
                onClick={() => navigate('/admin')}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Logout ── */}
      <div style={{ padding: '0 16px' }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%', background: 'var(--surface-lowest)', border: '1px solid #fee2e2',
            borderRadius: 20, padding: '16px', color: '#dc2626', fontWeight: 800,
            fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 12px rgba(220,38,38,0.05)',
          }}
        >
          <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" size={20} />
          Logout Account
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--outline)', marginTop: 32, fontWeight: 600 }}>
        Chandra Daily Mart v1.2 · Faridabad's Favorite 🛒
      </p>
    </div>
  );
}
