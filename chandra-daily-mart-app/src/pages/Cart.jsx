import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQty, removeFromCart, totalItems, totalPrice } = useCart();
  const { isOpen, minOrderValue, deliveryCharge, handlingCharge } = useStore();

  const finalDeliveryFee = totalPrice >= 199 ? 0 : deliveryCharge; 
  const discount = totalPrice >= 299 ? 20 : 0;
  const grandTotal = totalPrice + finalDeliveryFee + handlingCharge - discount;

  const handleProceed = () => {
    if (!user) {
      toast.error('Please login to place your order');
      navigate('/login?redirect=checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="page fade-in">
      {/* Header */}
      <div className="top-header">
        <div className="flex-between">
          <h1 style={{ fontSize: 20 }}>My Cart</h1>
          {cartItems.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--outline)' }}>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Delivery Strip */}
      {cartItems.length > 0 && (
        <div style={{ background: 'rgba(0,110,36,0.08)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
            Delivery in 30 mins to Vinay Nagar
          </span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Add items to get started with your grocery order</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 12 }}>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img" style={{ fontSize: 32, overflow: 'hidden' }}>
                  {item.products?.image_url ? (
                    <img src={item.products?.image_url} alt={item.products?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '🛒'
                  )}
                </div>
                <div className="cart-item-info" onClick={() => navigate(`/product/${item.product_id}`)} style={{ cursor: 'pointer' }}>
                  <div className="cart-item-name">{item.products?.name}</div>
                  <div className="cart-item-unit">
                    {item.products?.weight_value ? `${item.products?.weight_value} ${item.products?.weight_unit}` : (item.products?.unit_label || '1 unit')}
                  </div>
                  <div className="cart-item-price">₹{item.products?.price}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <div className="stepper">
                    <button onClick={() => { if (item.quantity === 1) removeFromCart(item.id); else updateQty(item.id, item.quantity - 1); }}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={{ fontSize: 12, textAlign: 'center', marginTop: 4, color: 'var(--outline)' }}>
                    ₹{(item.products?.price * item.quantity).toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary */}
          <div className="bill-card">
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Bill Summary</h3>
            <div className="bill-row"><span>Item Total</span><span>₹{totalPrice.toFixed(0)}</span></div>
            <div className="bill-row"><span>Delivery</span><span>{finalDeliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${finalDeliveryFee}`}</span></div>
            {handlingCharge > 0 && <div className="bill-row"><span>Handling Charge</span><span>₹{handlingCharge}</span></div>}
            {discount > 0 && <div className="bill-row discount"><span>Discount Applied</span><span>-₹{discount}</span></div>}
            <div className="bill-row total"><span>Grand Total</span><span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(0)}</span></div>
            {finalDeliveryFee > 0 && (
              <div style={{ background: 'rgba(0,110,36,0.08)', borderRadius: 8, padding: '8px', fontSize: 12, color: 'var(--primary)', marginTop: 4, fontWeight: 600 }}>
                Add ₹{(199 - totalPrice).toFixed(0)} more for FREE delivery!
              </div>
            )}
          </div>

          {/* Store Closed Notice */}
          {!isOpen && (
            <div style={{ margin: '0 16px 12px', padding: '12px', background: 'rgba(255,59,48,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,59,48,0.2)' }}>
              <span style={{ fontSize: 20 }}>🛑</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FF3B30' }}>Store is currently closed</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>You can still add items to cart, but ordering is disabled.</div>
              </div>
            </div>
          )}

          {/* Min Order Warning */}
          {isOpen && totalPrice < minOrderValue && (
            <div style={{ margin: '0 16px 12px', padding: '12px', background: 'rgba(255,149,0,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,149,0,0.2)' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FF9500' }}>Minimum order ₹{minOrderValue}</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Add items worth ₹{(minOrderValue - totalPrice).toFixed(0)} more to checkout.</div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <div style={{ padding: '0 16px 16px' }}>
            <button 
              className="btn-primary" 
              onClick={handleProceed}
              disabled={!isOpen || totalPrice < minOrderValue}
              style={{ background: (!isOpen || totalPrice < minOrderValue) ? 'var(--outline)' : undefined }}
            >
              {!isOpen ? 'Ordering Disabled' : totalPrice < minOrderValue ? `Add ₹${(minOrderValue - totalPrice).toFixed(0)} more` : `Proceed to Checkout · ₹${grandTotal.toFixed(0)}`}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
