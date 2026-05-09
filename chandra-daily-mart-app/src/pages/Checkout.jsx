import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { isOpen, minOrderValue, deliveryCharge, handlingCharge } = useStore();
  

  const [address, setAddress] = useState({ 
    id: null,
    name: profile?.full_name || '', 
    phone: profile?.phone || '', 
    line1: '', 
    landmark: '',
    city: 'Vinay Nagar', 
    pincode: '' 
  });
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [payMethod, setPayMethod] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const finalDeliveryFee = totalPrice >= 199 ? 0 : deliveryCharge;
  const grandTotal = totalPrice + finalDeliveryFee + Number(handlingCharge || 0);

  // Mark as initialized once auth is ready
  useEffect(() => {
    if (!authLoading) {
      setInitialized(true);
      // Only redirect on initial load if cart is empty
      if (cartItems.length === 0) {
        toast.error('Your cart is empty');
        navigate('/');
      }
    }
  }, [authLoading]);

  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  async function fetchSavedAddresses() {
    try {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (data && data.length > 0) {
        setSavedAddresses(data);
        const defaultAddr = data[0];
        setSelectedAddressId(defaultAddr.id);
        setAddress({
          id: defaultAddr.id,
          name: defaultAddr.full_name,
          phone: defaultAddr.phone,
          line1: defaultAddr.address_line,
          landmark: defaultAddr.landmark || '',
          city: defaultAddr.city,
          pincode: defaultAddr.pincode
        });
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Fetch Address Error:', err);
    }
  }

  const getCurrentLocation = () => {
    setFetchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            setAddress(prev => ({
              ...prev,
              pincode: addr.postcode || prev.pincode
            }));
            toast.success("Pincode fetched from location!");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          toast.error("Could not get pincode from location");
        } finally {
          setFetchingLocation(false);
        }
      }, (err) => {
        toast.error("Permission denied or location unavailable");
        setFetchingLocation(false);
      });
    } else {
      toast.error("Geolocation not supported");
      setFetchingLocation(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!address.name) newErrors.name = true;
    if (!address.phone) newErrors.phone = true;
    if (!address.line1) newErrors.line1 = true;
    if (!address.pincode) newErrors.pincode = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function placeOrder() {
    console.log("Place Order initiated...", { user, cartItems });
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login?redirect=checkout');
      return;
    }
    if (!isOpen) { 
      toast.error('Store is currently closed'); 
      return; 
    }
    
    if (totalPrice < minOrderValue) {
      toast.error(`Minimum order value is ₹${minOrderValue}`);
      return;
    }

    if (isEditing && !validate()) { 
      toast.error('Please fill all required fields'); 
      return; 
    }

    setIsPlacingOrder(true);
    try {
      let finalAddressId = selectedAddressId;
      const fullAddressString = `${address.line1}${address.landmark ? ', ' + address.landmark : ''}, ${address.city} - ${address.pincode}`;

      // 1. Save address if new or editing
      if (isEditing || !finalAddressId) {
        const addrPayload = {
          user_id: user.id,
          full_name: address.name,
          phone: address.phone,
          address_line: address.line1,
          landmark: address.landmark,
          city: address.city,
          pincode: address.pincode,
          is_default: savedAddresses.length === 0
        };

        if (finalAddressId) {
          await supabase.from('addresses').update(addrPayload).eq('id', finalAddressId);
        } else {
          const { data: newAddr, error: addrError } = await supabase
            .from('addresses')
            .insert(addrPayload)
            .select()
            .single();
          if (addrError) throw addrError;
          finalAddressId = newAddr.id;
        }
      }

      // 2. Place Order
      const orderNumber = `CDM-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const orderData = {
        order_number: orderNumber,
        user_id: user.id,
        address_id: finalAddressId,
        subtotal: totalPrice,
        delivery_charge: finalDeliveryFee,
        total_price: grandTotal,
        status: 'pending',
        payment_method: payMethod,
        payment_status: payMethod === 'cod' ? 'pending' : 'paid',
        customer_name: address.name,
        customer_phone: address.phone,
        delivery_address: fullAddressString
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      if (orderError) throw orderError;

      // 3. Insert Items
      const orderItemsData = cartItems.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.products?.name,
        product_image: i.products?.image_url,
        quantity: i.quantity,
        price: i.products?.price,
        mrp: i.products?.mrp
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
      if (itemsError) throw itemsError;

      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success/${order.id}`, { state: { order } });

    } catch (err) {
      console.error('Place order failed:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  }

  if (authLoading || !initialized) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ background: '#f8f9fa', paddingBottom: 120 }}>
      <div className="top-header" style={{ background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: '#f5f5f7', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Checkout</h1>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Address Section */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              📍 Delivery Address
            </h3>
            {(savedAddresses.length > 0) && (
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {isEditing ? 'Cancel' : 'Change'}
              </button>
            )}
          </div>

          {!isEditing && address.line1 ? (
            <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: 12, border: '1px solid #eee' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{address.name}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                {address.line1}<br />
                {address.landmark && `${address.landmark}, `}{address.city} - {address.pincode}<br />
                Phone: {address.phone}
              </div>
            </div>
          ) : (
            <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button 
                onClick={getCurrentLocation}
                disabled={fetchingLocation}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', 
                  borderRadius: 12, border: '1px solid var(--primary)', background: 'rgba(0,110,36,0.05)', 
                  color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 18 }}>📍</span>
                {fetchingLocation ? 'Fetching...' : 'Use Current Location'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: errors.name ? '#FF3B30' : '#666', fontWeight: 700, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Full Name</label>
                  <input 
                    className={`input-field ${errors.name ? 'error-border' : ''}`}
                    style={{ padding: 12, borderRadius: 12, border: '1.5px solid #eee', width: '100%', fontSize: 14 }}
                    value={address.name} 
                    onChange={e => { setAddress(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: false })) }} 
                    placeholder="Enter name" 
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: errors.phone ? '#FF3B30' : '#666', fontWeight: 700, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Phone</label>
                  <input 
                    className={`input-field ${errors.phone ? 'error-border' : ''}`}
                    style={{ padding: 12, borderRadius: 12, border: '1.5px solid #eee', width: '100%', fontSize: 14 }}
                    value={address.phone} 
                    onChange={e => { setAddress(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: false })) }} 
                    placeholder="Phone" 
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: 11, color: errors.line1 ? '#FF3B30' : '#666', fontWeight: 700, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>House / Flat / Street</label>
                <input 
                  className={`input-field ${errors.line1 ? 'error-border' : ''}`}
                  style={{ padding: 12, borderRadius: 12, border: '1.5px solid #eee', width: '100%', fontSize: 14 }}
                  value={address.line1} 
                  onChange={e => { setAddress(p => ({ ...p, line1: e.target.value })); setErrors(p => ({ ...p, line1: false })) }} 
                  placeholder="House no, Street, Area" 
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: 11, color: '#666', fontWeight: 700, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Landmark (Optional)</label>
                <input 
                  style={{ padding: 12, borderRadius: 12, border: '1.5px solid #eee', width: '100%', fontSize: 14 }}
                  value={address.landmark} 
                  onChange={e => setAddress(p => ({ ...p, landmark: e.target.value }))} 
                  placeholder="E.g. Near City Park" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: '#666', fontWeight: 700, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>City</label>
                  <input 
                    style={{ padding: 12, borderRadius: 12, border: '1.5px solid #eee', width: '100%', fontSize: 14, background: '#f5f5f5' }}
                    value={address.city} 
                    readOnly 
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: 11, color: errors.pincode ? '#FF3B30' : '#666', fontWeight: 700, marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Pincode</label>
                  <input 
                    className={`input-field ${errors.pincode ? 'error-border' : ''}`}
                    style={{ padding: 12, borderRadius: 12, border: '1.5px solid #eee', width: '100%', fontSize: 14 }}
                    value={address.pincode} 
                    onChange={e => { setAddress(p => ({ ...p, pincode: e.target.value })); setErrors(p => ({ ...p, pincode: false })) }} 
                    placeholder="6 digit PIN" 
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💳 Payment Method</h3>
          {[
            { id: 'cod', label: 'Cash on Delivery', icon: '💵', sub: 'Pay when delivered' },
            { id: 'upi', label: 'UPI / GPay', icon: '📱', sub: 'PhonePe, GPay, Paytm' },
          ].map(m => (
            <div key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, border: `1.5px solid ${payMethod === m.id ? 'var(--primary)' : '#f0f0f0'}`, marginBottom: 10, cursor: 'pointer', background: payMethod === m.id ? 'rgba(0,110,36,0.03)' : 'transparent', transition: 'all 0.2s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{m.sub}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${payMethod === m.id ? 'var(--primary)' : '#ddd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {payMethod === m.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bill-card" style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Bill Summary</h3>
          {cartItems.map(i => (
            <div key={i.id} className="bill-row" style={{ fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: '#444' }}>{i.products?.name} × {i.quantity}</span>
              <span style={{ fontWeight: 600 }}>₹{(i.products?.price * i.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
          <div className="bill-row"><span>Delivery</span><span>{finalDeliveryFee === 0 ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span> : `₹${finalDeliveryFee}`}</span></div>
          {handlingCharge > 0 && <div className="bill-row"><span>Handling Charge</span><span>₹{handlingCharge}</span></div>}
          <div className="bill-row total" style={{ marginTop: 12, borderTop: 'none', paddingTop: 0 }}>
            <span style={{ fontSize: 18 }}>Total Amount</span>
            <span style={{ color: 'var(--primary)', fontSize: 18 }}>₹{grandTotal.toFixed(0)}</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="btn-primary" 
          onClick={placeOrder} 
          disabled={isPlacingOrder || !isOpen || totalPrice < minOrderValue}
          style={{ 
            height: 56, fontSize: 16, borderRadius: 18, 
            boxShadow: (isOpen && totalPrice >= minOrderValue) ? '0 10px 20px rgba(0,110,36,0.2)' : 'none',
            background: (!isOpen || totalPrice < minOrderValue) ? '#ccc' : undefined 
          }}
        >
          {isPlacingOrder ? 'Processing...' : !isOpen ? 'Store Closed' : totalPrice < minOrderValue ? `Add ₹${(minOrderValue - totalPrice).toFixed(0)} more` : `Place Order · ₹${grandTotal.toFixed(0)}`}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .error-border { border-color: #FF3B30 !important; background: rgba(255,59,48,0.03) !important; }
        .input-field:focus { border-color: var(--primary) !important; outline: none; }
      `}} />
    </div>
  );
}
