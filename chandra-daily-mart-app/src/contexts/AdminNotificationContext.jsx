import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AdminNotificationContext = createContext(null);

export function AdminNotificationProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const [newOrder, setNewOrder] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const channelRef = useRef(null);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const showNativeNotification = (title, body) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/logo192.png' });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  const triggerNotification = async (orderId, customerName, totalPrice) => {
    console.log('Triggering notification for:', orderId);
    
    // 1. Audio alerts
    if (audioEnabled) {
      playBeep();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop any current speaking
        // Start with the specific phrase the user requested
        const msg = new SpeechSynthesisUtterance(`Order Received! New order from ${customerName}. Total amount ${totalPrice} rupees.`);
        msg.rate = 1.0;
        msg.pitch = 1.0;
        msg.lang = 'en-IN'; // Set to Indian English for better accent
        window.speechSynthesis.speak(msg);
      }
    }

    // 2. Native OS Notification
    showNativeNotification("New Order Received! 🛍️", `From ${customerName} - Total ₹${totalPrice}`);

    // 3. UI Toast
    toast.success(`New Order: ₹${totalPrice} from ${customerName}`, {
      duration: 10000,
      icon: '🔔',
      position: 'top-right'
    });

    // 4. Fetch details for Global Modal
    if (orderId && orderId !== 'test') {
      try {
        // Wait a bit for order_items to be inserted by the client
        await new Promise(r => setTimeout(r, 2000)); 
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();
        
        if (error) {
          console.error('Error fetching new order details:', error);
          // Still show basic info if detailed fetch fails
          setNewOrder({
            id: orderId,
            customer_name: customerName,
            total_price: totalPrice,
            order_number: 'NEW ORDER'
          });
        } else if (data) {
          setNewOrder(data);
        }
      } catch (err) {
        console.error('Fetch detail catch:', err);
      }
    } else if (orderId === 'test') {
      // Mock data for testing
      setNewOrder({
        id: 'test',
        order_number: 'TEST-123456',
        customer_name: 'Test Customer',
        customer_phone: '+91 9876543210',
        total_price: 999,
        order_items: [{ id: 1, product_name: 'Test Product', quantity: 2, price: 499.5 }]
      });
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      if (channelRef.current) {
        console.log('Not admin, removing channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    console.log('Global Admin Realtime: Initializing channel...');
    
    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel('admin-orders-realtime');
    
    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        console.log('REALTIME INSERT DETECTED:', payload);
        triggerNotification(
          payload.new.id, 
          payload.new.customer_name || 'New Customer', 
          payload.new.total_price
        );
      })
      .subscribe((status) => {
        console.log('Realtime Subscription Status:', status);
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : status === 'CHANNEL_ERROR' ? 'error' : 'connecting');
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to order changes!');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isAdmin]);

  const enableAudio = () => {
    // Legacy function, voice is now default
    setAudioEnabled(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      toast.success(`Order accepted!`);
      setNewOrder(null);
      // Trigger a window event so other pages know to refresh
      window.dispatchEvent(new Event('orderUpdated'));
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  return (
    <AdminNotificationContext.Provider value={{ 
      newOrder, 
      setNewOrder, 
      realtimeStatus, 
      audioEnabled, 
      enableAudio, 
      triggerNotification,
      updateOrderStatus,
      triggerTestAlert: () => triggerNotification('test', 'Test Customer', '999')
    }}>
      {children}
      


      {/* Global New Order Modal */}
      {newOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, zIndex: 9999, backdropFilter: 'blur(15px)'
        }}>
          <div style={{
            background: 'white', borderRadius: 32, width: '100%', maxWidth: 450,
            maxHeight: '90vh', overflowY: 'auto', padding: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            animation: 'modalBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 64, marginBottom: 16, animation: 'ring 2s infinite' }}>🔔</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>New Order Received!</h2>
              <p style={{ color: '#007AFF', fontWeight: 800, fontSize: 18, marginTop: 8 }}>
                Order #{newOrder.order_number}
              </p>
            </div>

            <div style={{ background: '#f8f9fa', borderRadius: 24, padding: 20, marginBottom: 24, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#666' }}>Customer:</span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{newOrder.customer_name}</span>
              </div>
              {newOrder.customer_phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: '#666' }}>Phone:</span>
                  <span style={{ fontWeight: 800 }}>{newOrder.customer_phone}</span>
                </div>
              )}
              
              <div style={{ borderTop: '1px solid #eee', margin: '16px 0', paddingTop: 16 }}>
                <p style={{ fontWeight: 800, marginBottom: 12, fontSize: 15 }}>🛒 Order Items:</p>
                {newOrder.order_items?.length > 0 ? (
                  newOrder.order_items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 8 }}>
                      <span style={{ color: '#444' }}>{item.product_name} <span style={{ color: '#999', fontWeight: 700 }}>×{item.quantity}</span></span>
                      <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#999', fontSize: 13, fontStyle: 'italic' }}>Loading items...</div>
                )}
              </div>
              
              <div style={{ borderTop: '2px solid #eee', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 900 }}>Total Amount:</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#006e24' }}>₹{newOrder.total_price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => updateOrderStatus(newOrder.id, 'confirmed')}
                style={{ 
                  background: '#006e24', color: 'white', border: 'none', 
                  padding: '22px', borderRadius: 20, fontSize: 18, fontWeight: 900,
                  cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,110,36,0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                Accept Order
              </button>
              <button 
                onClick={() => setNewOrder(null)}
                style={{ 
                  background: '#f0f0f0', color: '#666', border: 'none', 
                  padding: '16px', borderRadius: 20, fontSize: 15, fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalBounce {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes ring {
          0% { transform: rotate(0); }
          5% { transform: rotate(15deg); }
          10% { transform: rotate(-15deg); }
          15% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          25% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
      `}} />
    </AdminNotificationContext.Provider>
  );
}

export const useAdminNotification = () => useContext(AdminNotificationContext);
