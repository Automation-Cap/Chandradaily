import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Terms of Service",
      content: "By using Chandra Daily Mart, you agree to our terms of service. We provide grocery delivery services in Faridabad. We reserve the right to refuse service to anyone at any time."
    },
    {
      title: "2. Privacy Policy",
      content: "Your privacy is important to us. We collect your name, phone number, and address to facilitate deliveries. We do not sell your data to third parties. Your payment information is processed securely by our payment partners."
    },
    {
      title: "3. Order & Cancellation",
      content: "Orders can be cancelled within 2 minutes of placing them. For fresh items like milk and vegetables, cancellations are not allowed once the order is out for delivery. Refunds for cancelled orders will be processed within 5-7 business days."
    },
    {
      title: "4. Pricing & Availability",
      content: "While we strive for accuracy, prices and availability are subject to change without notice. In case an item is out of stock, we will contact you for a replacement or issue a refund."
    },
    {
      title: "5. Delivery Terms",
      content: "We aim for 30-minute delivery, but external factors like traffic or weather may cause delays. Our delivery partners will call you if they cannot find your address."
    }
  ];

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)' }}>
      <div style={{ padding: '16px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-low)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
            Back
          </button>
          <h1 style={{ fontSize: 20 }}>Terms & Privacy</h1>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--outline-variant)' }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 24, lineHeight: 1.6 }}>
            Last updated: April 23, 2026. Please read these terms carefully before using our services.
          </p>

          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--primary)' }}>{section.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{section.content}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 20, textAlign: 'center', color: 'var(--outline)' }}>
          <p style={{ fontSize: 12 }}>For detailed legal documents, please contact legal@chandradailymart.com</p>
        </div>
      </div>
    </div>
  );
}
