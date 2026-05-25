import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const tax = Math.round(subtotal * 0.05 * 100) / 100;

  if (cart.items.length === 0) return (
    <div style={styles.empty}>
      <p style={{ fontSize: 48 }}>🛒</p>
      <h2>Your cart is empty</h2>
      <button onClick={() => navigate('/')} style={styles.primaryBtn}>Browse Restaurants</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Your Cart</h1>
      <p style={styles.sub}>from <strong>{cart.restaurantName}</strong></p>
      <div style={styles.card}>
        {cart.items.map(item => (
          <div key={item.menuItemId} style={styles.row}>
            <div>
              <p style={styles.itemName}>{item.name}</p>
              <p style={styles.itemPrice}>₹{item.price} each</p>
            </div>
            <div style={styles.qtyRow}>
              <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} style={styles.qtyBtn}>-</button>
              <span style={styles.qty}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={styles.qtyBtn}>+</button>
              <span style={styles.totalPrice}>₹{item.totalPrice.toFixed(2)}</span>
              <button onClick={() => removeItem(item.menuItemId)} style={styles.removeBtn}>🗑️</button>
            </div>
          </div>
        ))}
        <div style={styles.divider} />
        <div style={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div style={styles.summaryRow}><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
        <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 17 }}>
          <span>Estimated Total</span><span>₹{(subtotal + tax).toFixed(2)}</span>
        </div>
        <div style={styles.btnRow}>
          <button onClick={clearCart} style={styles.clearBtn}>Clear Cart</button>
          <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>Proceed to Checkout →</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 700, margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4, color: '#1f2937' },
  sub: { color: '#6b7280', marginBottom: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 10 },
  qtyBtn: { background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontWeight: 700, fontSize: 16 },
  qty: { width: 24, textAlign: 'center', fontWeight: 600 },
  totalPrice: { fontWeight: 600, color: '#1f2937', minWidth: 70, textAlign: 'right' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
  divider: { borderTop: '1px solid #e5e7eb', margin: '16px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: '#374151' },
  btnRow: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  clearBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 500 },
  checkoutBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  empty: { textAlign: 'center', padding: 80 },
  primaryBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', marginTop: 16 },
  itemName: { fontWeight: 600, color: '#1f2937' },
  itemPrice: { fontSize: 12, color: '#9ca3af' }
};
