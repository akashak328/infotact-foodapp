import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOrder, payOrder } from '../services/api';
import { useCart } from '../store/CartContext';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    deliveryAddress: '', deliveryLatitude: 0, deliveryLongitude: 0,
    orderType: 'DELIVERY', paymentMethod: 'CASH', specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = form.orderType === 'DINE_IN' ? 0 : 30;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.restaurantId) { toast.error('Cart is empty'); return; }
    if (form.orderType === 'DELIVERY' && !form.deliveryAddress.trim()) {
      toast.error('Please enter your delivery address'); return;
    }
    setLoading(true);
    try {
      const orderPayload = {
        restaurantId: cart.restaurantId,
        items: cart.items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, specialNote: '' })),
        deliveryAddress: form.deliveryAddress,
        deliveryLatitude: form.deliveryLatitude,
        deliveryLongitude: form.deliveryLongitude,
        orderType: form.orderType,
        paymentMethod: form.paymentMethod,
        specialInstructions: form.specialInstructions
      };
      const res = await createOrder(orderPayload);
      const orderId = res.data.id;
      await payOrder(orderId, { paymentMethod: form.paymentMethod, transactionId: 'TXN-' + Date.now() });
      clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/order/${orderId}/track`);
    } catch (err) {
      toast.error(err.response?.data || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Checkout</h1>
      <div style={styles.grid}>
        {/* Left: Form */}
        <form onSubmit={handleSubmit} style={styles.card}>
          <h3 style={styles.sectionHead}>Order Type</h3>
          <div style={styles.radioGroup}>
            {[['DELIVERY','🛵 Home Delivery'],['DINE_IN','🍽️ Dine In']].map(([val,label]) => (
              <label key={val} style={{ ...styles.radioLabel, background: form.orderType === val ? '#fff5f2' : '#f9fafb', borderColor: form.orderType === val ? '#ff4500' : '#e5e7eb' }}>
                <input type="radio" value={val} checked={form.orderType === val}
                  onChange={e => setForm({...form, orderType: e.target.value})} style={{ marginRight: 8 }} />
                {label}
              </label>
            ))}
          </div>

          {form.orderType === 'DELIVERY' && (
            <>
              <h3 style={styles.sectionHead}>Delivery Address</h3>
              <input placeholder="Full delivery address *" required style={styles.input}
                value={form.deliveryAddress}
                onChange={e => setForm({...form, deliveryAddress: e.target.value})} />
            </>
          )}

          <h3 style={styles.sectionHead}>Payment Method</h3>
          <div style={styles.radioGroup}>
            {[['CASH','💵 Cash on Delivery'],['CARD','💳 Card'],['UPI','📱 UPI']].map(([val,label]) => (
              <label key={val} style={{ ...styles.radioLabel, background: form.paymentMethod === val ? '#fff5f2' : '#f9fafb', borderColor: form.paymentMethod === val ? '#ff4500' : '#e5e7eb' }}>
                <input type="radio" value={val} checked={form.paymentMethod === val}
                  onChange={e => setForm({...form, paymentMethod: e.target.value})} style={{ marginRight: 8 }} />
                {label}
              </label>
            ))}
          </div>

          <h3 style={styles.sectionHead}>Special Instructions</h3>
          <textarea placeholder="Any special requests? (optional)" style={{ ...styles.input, height: 70 }}
            value={form.specialInstructions}
            onChange={e => setForm({...form, specialInstructions: e.target.value})} />

          <button type="submit" disabled={loading} style={{ ...styles.placeBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Placing Order...' : `Place Order  •  ₹${total.toFixed(2)}`}
          </button>
        </form>

        {/* Right: Summary */}
        <div style={styles.card}>
          <h3 style={styles.sectionHead}>Order Summary</h3>
          <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 12 }}>from {cart.restaurantName}</p>
          {cart.items.map(i => (
            <div key={i.menuItemId} style={styles.summaryItem}>
              <span>{i.name} <span style={{ color: '#9ca3af' }}>×{i.quantity}</span></span>
              <span>₹{i.totalPrice.toFixed(2)}</span>
            </div>
          ))}
          <div style={styles.divider} />
          <div style={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div style={styles.summaryRow}><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div style={styles.summaryRow}>
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? <span style={{ color: '#22c55e' }}>FREE</span> : `₹${deliveryFee}`}</span>
          </div>
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 17, borderTop: '2px solid #e5e7eb', paddingTop: 12, marginTop: 4 }}>
            <span>Total</span><span style={{ color: '#ff4500' }}>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1000, margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 24, color: '#1f2937' },
  grid: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 },
  card: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 8 },
  sectionHead: { fontSize: 15, fontWeight: 600, color: '#374151', marginTop: 8, marginBottom: 6 },
  radioGroup: { display: 'flex', gap: 10, marginBottom: 4, flexWrap: 'wrap' },
  radioLabel: { display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: 10, border: '2px solid', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' },
  placeBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 },
  summaryItem: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: '#374151' },
  divider: { borderTop: '1px solid #e5e7eb', margin: '12px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: '#374151' }
};
