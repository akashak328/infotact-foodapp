import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder } from '../services/api';
import { connectWebSocket, subscribeToOrder, disconnectWebSocket } from '../services/websocket';

const STATUS_STEPS = [
  { key: 'PENDING',          icon: '🕐', label: 'Order Placed' },
  { key: 'CONFIRMED',        icon: '✅', label: 'Confirmed' },
  { key: 'PREPARING',        icon: '👨‍🍳', label: 'Preparing' },
  { key: 'READY',            icon: '📦', label: 'Ready' },
  { key: 'COURIER_ASSIGNED', icon: '🛵', label: 'Courier Assigned' },
  { key: 'PICKED_UP',        icon: '🚀', label: 'Picked Up' },
  { key: 'IN_TRANSIT',       icon: '🗺️', label: 'On the Way' },
  { key: 'DELIVERED',        icon: '🎉', label: 'Delivered' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const stompRef = useRef(null);

  useEffect(() => {
    getOrder(id)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => { toast.error('Order not found'); setLoading(false); });

    stompRef.current = connectWebSocket(() => {
      subscribeToOrder(id, (msg) => {
        if (msg.status) {
          setOrder(prev => ({ ...prev, status: msg.status }));
          if (msg.status === 'DELIVERED')   toast.success('Your order has been delivered! 🎉');
          if (msg.status === 'PREPARING')   toast('Chef is cooking your food 👨‍🍳');
          if (msg.status === 'IN_TRANSIT')  toast('Your order is on the way! 🛵');
        }
      });
    });
    return () => disconnectWebSocket();
  }, [id]);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order?.status);

  if (loading) return <div style={s.loading}>Loading order details...</div>;
  if (!order)  return <div style={s.loading}>Order not found.</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Live Order Tracking</h1>
        <p style={s.sub}>Order # <strong>{order.id?.slice(-8).toUpperCase()}</strong></p>
      </div>

      {/* Step tracker */}
      <div style={s.card}>
        <h3 style={s.sh}>Order Progress</h3>
        <div style={s.steps}>
          {STATUS_STEPS.map((step, i) => {
            const done   = i < currentStep;
            const active = i === currentStep;
            const pend   = i > currentStep;
            return (
              <div key={step.key} style={s.stepRow}>
                <div style={s.stepCol}>
                  <div style={{
                    ...s.dot,
                    background: done ? '#22c55e' : active ? '#ff4500' : '#e5e7eb',
                    color: pend ? '#9ca3af' : '#fff',
                    boxShadow: active ? '0 0 0 5px rgba(255,69,0,0.15)' : 'none',
                  }}>
                    {done ? '✓' : step.icon}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ ...s.line, background: done ? '#22c55e' : '#e5e7eb' }} />
                  )}
                </div>
                <div style={s.stepBody}>
                  <p style={{ ...s.stepName, color: pend ? '#9ca3af' : '#1f2937', fontWeight: active ? 700 : 500 }}>
                    {step.label}
                  </p>
                  {active && <p style={s.activeTxt}>In progress…</p>}
                  {done   && <p style={s.doneTxt}>✓ Done</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div style={s.card}>
        <h3 style={s.sh}>Order Details</h3>
        <div style={s.grid2}>
          {[
            ['Restaurant', order.restaurantName],
            ['Order Type', order.orderType],
            ['Payment', `${order.paymentMethod} — ${order.paymentStatus}`],
            ['Est. Delivery', order.estimatedDeliveryTime
              ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'N/A'],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={s.dlabel}>{label}</p>
              <p style={s.dvalue}>{value}</p>
            </div>
          ))}
        </div>

        <div style={s.divider} />
        <h4 style={{ marginBottom: 10, color: '#374151', fontSize: 14 }}>Items</h4>
        {order.items?.map((item, i) => (
          <div key={i} style={s.itemRow}>
            <span>{item.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span></span>
            <span style={{ fontWeight: 600 }}>₹{item.totalPrice?.toFixed(2)}</span>
          </div>
        ))}
        <div style={s.divider} />
        {[
          ['Subtotal',     `₹${order.subtotal?.toFixed(2)}`],
          ['Delivery Fee', `₹${order.deliveryFee?.toFixed(2)}`],
          ['Taxes',        `₹${order.taxes?.toFixed(2)}`],
        ].map(([k, v]) => (
          <div key={k} style={s.sumRow}><span>{k}</span><span>{v}</span></div>
        ))}
        <div style={{ ...s.sumRow, fontWeight: 700, fontSize: 17, marginTop: 8 }}>
          <span>Total Paid</span>
          <span style={{ color: '#ff4500' }}>₹{order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      <div style={s.actions}>
        <button onClick={() => navigate('/orders')} style={s.secBtn}>← My Orders</button>
        {order.status === 'DELIVERED' && !order.reviewSubmitted && (
          <button onClick={() => navigate(`/order/${id}/review`)} style={s.revBtn}>
            ⭐ Write a Review & Earn Points
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  page:    { maxWidth: 660, margin: '0 auto', padding: '32px 16px' },
  loading: { textAlign: 'center', padding: 80, fontSize: 18, color: '#6b7280' },
  header:  { marginBottom: 24 },
  title:   { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  sub:     { color: '#6b7280', fontSize: 14 },
  card:    { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20 },
  sh:      { fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 20 },
  steps:   { display: 'flex', flexDirection: 'column' },
  stepRow: { display: 'flex', gap: 14 },
  stepCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 42 },
  dot:     { width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  line:    { width: 3, flex: 1, minHeight: 28, borderRadius: 2, margin: '3px 0' },
  stepBody:   { paddingTop: 8, paddingBottom: 20 },
  stepName:   { fontSize: 14, marginBottom: 2 },
  activeTxt:  { fontSize: 12, color: '#ff4500', fontWeight: 500 },
  doneTxt:    { fontSize: 12, color: '#22c55e' },
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 },
  dlabel:  { fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 2 },
  dvalue:  { fontSize: 14, color: '#1f2937', fontWeight: 500 },
  divider: { borderTop: '1px solid #e5e7eb', margin: '16px 0' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0', color: '#374151' },
  sumRow:  { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', color: '#374151' },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  secBtn:  { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 },
  revBtn:  { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 700 },
};
