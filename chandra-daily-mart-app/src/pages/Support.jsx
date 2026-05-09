import { useNavigate } from 'react-router-dom';

export default function Support() {
  const navigate = useNavigate();

  const faqs = [
    {
      q: "How fast is the delivery?",
      a: "We deliver within 30 minutes in Vinay Nagar and surrounding areas of Faridabad. For morning milk, orders must be placed before 10 PM for 7 AM delivery."
    },
    {
      q: "What are the delivery charges?",
      a: "Delivery is free for orders above ₹299. For orders below ₹299, a nominal delivery fee of ₹15-₹30 applies depending on distance."
    },
    {
      q: "How can I track my order?",
      a: "Once you place an order, you can see the status in 'My Orders' section. You'll also receive updates via WhatsApp."
    },
    {
      q: "Can I return products?",
      a: "Yes, for fresh items like vegetables and milk, we have a 'no-questions-asked' return policy at the time of delivery. For other items, returns are accepted within 24 hours if the seal is intact."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all UPI payments (Google Pay, PhonePe, Paytm), Credit/Debit cards, and Cash on Delivery (COD)."
    }
  ];

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)' }}>
      <div style={{ padding: '16px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-low)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
            Back
          </button>
          <h1 style={{ fontSize: 20 }}>Help & Support</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Contact Support */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #006e2e)', borderRadius: 24, padding: 24, color: 'white', marginBottom: 24, boxShadow: '0 8px 24px rgba(0, 110, 46, 0.15)' }}>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Need quick help?</h2>
          <p style={{ opacity: 0.9, fontSize: 14, marginBottom: 20 }}>Our support team is available from 7 AM to 10 PM daily.</p>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="https://wa.me/919999999999" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '12px', borderRadius: 12, textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>WhatsApp</a>
            <a href="tel:+919999999999" style={{ flex: 1, background: 'white', color: 'var(--primary)', padding: '12px', borderRadius: 12, textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Call Now</a>
          </div>
        </div>

        {/* FAQs */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingLeft: 4 }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'var(--surface-lowest)', borderRadius: 16, padding: 16, border: '1px solid var(--outline-variant)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--on-surface)' }}>{faq.q}</div>
              <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{faq.a}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 20, textAlign: 'center', color: 'var(--outline)' }}>
          <p style={{ fontSize: 12 }}>© 2026 Chandra Daily Mart. All rights reserved.</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>Faridabad, Haryana, India</p>
        </div>
      </div>
    </div>
  );
}
