import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navs = [
    { id: 'home', path: '/', label: 'Home', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { id: 'categories', path: '/categories', label: 'Categories', icon: <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 3h6m-3-3v6" /> },
    { id: 'cart', path: '/cart', label: 'Cart', icon: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18" /> },
    { id: 'orders', path: '/orders', label: 'Orders', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" /> },
    { 
      id: 'profile', 
      path: isAdmin ? '/admin' : '/profile', 
      label: isAdmin ? 'Admin' : 'Account', 
      icon: isAdmin ? (
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4m0 4h.01" />
      ) : (
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      ) 
    },
  ];

  return (
    <div className="bottom-nav">
      {navs.map(n => {
        const isActive = location.pathname === n.path;
        return (
          <button 
            key={n.id} 
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
              {n.icon}
            </svg>
            <span>{n.label}</span>
            {isActive && <div style={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, background: 'var(--primary)' }} />}
          </button>
        );
      })}
    </div>
  );
}
