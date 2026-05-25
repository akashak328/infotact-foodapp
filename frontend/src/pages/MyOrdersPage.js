import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyOrders } from '../services/api';

const STATUS_COLORS = {
  DELIVERED: '#dcfce7', CANCELLED: '#fee2e2', PENDING: '#fef3c7',
  CONFIRMED: '#dbeafe', PREPARING: '#e0e7ff', READY: '#d1fae5',
  COURIER_ASSIGNED: '#ede9fe', PICKED_UP: '#fce7f3', IN_TRANSIT: '#ede9fe'
};
const STATUS_TEXT = {
  DELIVERED: '#16a34a', CANCELLED: '#dc2626', PENDING: '#d97706',
  CONFIRMED: '#2563eb', PREPARING: '#4338ca', READY: '#059669',
  COURIER_ASSIGNED: '#7c3aed', PICKED_UP: '#be185d', IN_TRANSIT: '#7c3aed'
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.center}>Loading your orders...</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Orders</h1>
      <p style={styles.sub}>{orders.length} total orders</p>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: 48 }}>📋</p>
          <h3>No orders yet</h3>
          <p style={{ color: '#9ca3af' }}>Your order history will appear here</p>
          <button onClick={() => navigate('/')} style={styles.primaryBtn}>Browse Restaurants</button>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map(order => (
            <div key={order.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.restaurantName}>{order.restaurantName}</h3>
                  <p style={styles.orderId}>#{order.id?.slice(-8).toUpperCase()}</p>
                  <p style={styles.date}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: STATUS_COLORS[order.status] || '#f3f4f6',
                  color: STATUS_TEXT[order.status] || '#374151'
                }}>
                  {order.status}
                </span>
              </div>

              <p style={styles.items}>
                {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' • ')}
              </p>

              <div style={styles.cardBottom}>
                <div>
                  <span style={styles.total}>₹{order.totalAmount?.toFixed(2)}</span>
                  <span style={styles.payMethod}> • {order.paymentMethod} • {order.orderType}</span>
                </div>
                <div style={styles.btnGroup}>
                  {!['DELIVERED','CANCELLED'].includes(order.status) && (
                    <button onClick={() => navigate(`/order/${order.id}/track`)} style={styles.trackBtn}>
                      🔴 Track Live
                    </button>
                  )}
                  {order.status === 'DELIVERED' && !order.reviewSubmitted && (
                    <button onClick={() => navigate(`/order/${order.id}/review`)} style={styles.reviewBtn}>
                      ⭐ Review
                    </button>
                  )}
                  {order.status === 'DELIVERED' && order.reviewSubmitted && (
                    <span style={styles.reviewed}>✅ Reviewed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  sub: { color: '#9ca3af', marginBottom: 24, fontSize: 14 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: 18, color: '#6b7280' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  restaurantName: { fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 2 },
  orderId: { fontSize: 12, color: '#9ca3af' },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statusBadge: { padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  items: { fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  total: { fontSize: 16, fontWeight: 700, color: '#1f2937' },
  payMethod: { fontSize: 12, color: '#9ca3af' },
  btnGroup: { display: 'flex', gap: 8, alignItems: 'center' },
  trackBtn: { background: '#fff5f2', color: '#ff4500', border: '1px solid #fed7aa', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  reviewBtn: { background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  reviewed: { fontSize: 12, color: '#16a34a', fontWeight: 600 },
  empty: { textAlign: 'center', padding: 60 },
  primaryBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', marginTop: 16 }
};
