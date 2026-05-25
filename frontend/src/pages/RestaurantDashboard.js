import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getActiveOrders, updateOrderStatus,
  getRestaurantReservations, updateReservationStatus,
  createRestaurant, getRestaurantOrders
} from '../services/api';
import { connectWebSocket, subscribeToRestaurantOrders, disconnectWebSocket } from '../services/websocket';
import { useAuth } from '../store/AuthContext';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '', description: '', cuisineType: 'Indian', category: 'Casual',
    address: '', city: '', phone: '', openTime: '09:00', closeTime: '22:00',
    deliveryFee: 30, minimumOrderAmount: 100, averageDeliveryTime: 30,
    location: [80.2707, 13.0827] // default Chennai
  });
  const stompRef = useRef(null);
  const restaurantId = user?.restaurantId;

  useEffect(() => {
    if (!restaurantId) return;
    loadOrders();
    getRestaurantReservations(restaurantId).then(r => setReservations(r.data));
    stompRef.current = connectWebSocket(() => {
      subscribeToRestaurantOrders(restaurantId, (msg) => {
        if (msg.event === 'NEW_ORDER') {
          setOrders(prev => [msg.order, ...prev]);
          toast.success('🔔 New order received!');
        }
      });
    });
    return () => disconnectWebSocket();
  }, [restaurantId]);

  const loadOrders = () => {
    getActiveOrders(restaurantId).then(r => setOrders(r.data)).catch(() => {});
  };

  const NEXT_STATUS = {
    PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING',
    PREPARING: 'READY', READY: 'COURIER_ASSIGNED'
  };
  const NEXT_LABEL = {
    PENDING: '✅ Confirm', CONFIRMED: '👨‍🍳 Start Preparing',
    PREPARING: '📦 Mark Ready', READY: '🛵 Assign Courier'
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order updated → ' + newStatus);
    } catch (err) { toast.error(err.response?.data || 'Update failed'); }
  };

  const handleReservation = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Reservation ' + status.toLowerCase());
    } catch { toast.error('Failed to update'); }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const res = await createRestaurant(newRestaurant);
      setRestaurant(res.data);
      toast.success('Restaurant created! Refresh to see orders.');
      setShowCreate(false);
    } catch (err) { toast.error(err.response?.data || 'Failed to create restaurant'); }
  };

  const STATUS_COLOR = { PENDING:'#f59e0b', CONFIRMED:'#3b82f6', PREPARING:'#8b5cf6', READY:'#22c55e', COURIER_ASSIGNED:'#06b6d4' };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Restaurant Dashboard</h1>
          <p style={styles.sub}>Welcome, {user?.name}</p>
        </div>
        {!restaurantId && (
          <button onClick={() => setShowCreate(true)} style={styles.createBtn}>+ Create Restaurant</button>
        )}
      </div>

      {/* Create restaurant form */}
      {showCreate && (
        <div style={styles.createCard}>
          <h3 style={styles.sectionHead}>Create Your Restaurant</h3>
          <form onSubmit={handleCreateRestaurant} style={styles.createForm}>
            <div style={styles.twoCol}>
              {[['name','Restaurant Name *','text'],['phone','Phone *','text'],['city','City *','text'],['address','Full Address *','text']].map(([key,ph,type]) => (
                <input key={key} type={type} required placeholder={ph} style={styles.input}
                  value={newRestaurant[key]}
                  onChange={e => setNewRestaurant({...newRestaurant, [key]: e.target.value})} />
              ))}
              <select style={styles.input} value={newRestaurant.cuisineType}
                onChange={e => setNewRestaurant({...newRestaurant, cuisineType: e.target.value})}>
                {['Indian','Chinese','Italian','Fast Food','South Indian','Continental','Mexican'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={styles.input} value={newRestaurant.category}
                onChange={e => setNewRestaurant({...newRestaurant, category: e.target.value})}>
                {['Casual','Fine Dining','Fast Food','Cafe','Street Food'].map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Delivery Fee (₹)" style={styles.input}
                value={newRestaurant.deliveryFee}
                onChange={e => setNewRestaurant({...newRestaurant, deliveryFee: +e.target.value})} />
              <input type="number" placeholder="Min Order Amount (₹)" style={styles.input}
                value={newRestaurant.minimumOrderAmount}
                onChange={e => setNewRestaurant({...newRestaurant, minimumOrderAmount: +e.target.value})} />
            </div>
            <textarea placeholder="Restaurant description..." style={{ ...styles.input, height: 70 }}
              value={newRestaurant.description}
              onChange={e => setNewRestaurant({...newRestaurant, description: e.target.value})} />
            <p style={styles.hint}>📍 Default location set to Chennai. Contact admin to update coordinates.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={styles.createBtn}>Create Restaurant</button>
              <button type="button" onClick={() => setShowCreate(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!restaurantId && !showCreate && (
        <div style={styles.noRestaurant}>
          <p style={{ fontSize: 48 }}>🏪</p>
          <h3>No restaurant linked to your account</h3>
          <p style={{ color: '#9ca3af' }}>Create your restaurant to start receiving orders</p>
          <button onClick={() => setShowCreate(true)} style={styles.createBtn}>Create Restaurant</button>
        </div>
      )}

      {restaurantId && (
        <>
          {/* Stats */}
          <div style={styles.statsGrid}>
            {[
              ['📦', 'Active Orders', orders.length],
              ['📅', 'Pending Reservations', reservations.filter(r => r.status === 'PENDING').length],
              ['✅', 'Confirmed Reservations', reservations.filter(r => r.status === 'CONFIRMED').length],
              ['🔴', 'Live Tracking', 'WebSocket Active']
            ].map(([icon, label, val]) => (
              <div key={label} style={styles.statCard}>
                <span style={styles.statIcon}>{icon}</span>
                <p style={styles.statVal}>{val}</p>
                <p style={styles.statLabel}>{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {[['orders','📦 Active Orders'],['reservations','📅 Reservations'],['history','📜 Order History']].map(([t, label]) => (
              <button key={t} onClick={() => { setActiveTab(t); if (t === 'history') getRestaurantOrders(restaurantId).then(r => setOrders(r.data)); }}
                style={{ ...styles.tab, ...(activeTab === t ? styles.activeTab : {}) }}>
                {label}
              </button>
            ))}
          </div>

          {/* Active Orders */}
          {activeTab === 'orders' && (
            <div style={styles.list}>
              {orders.length === 0 && <div style={styles.empty}><p>🎉 No active orders right now</p></div>}
              {orders.map(o => (
                <div key={o.id} style={styles.orderCard}>
                  <div style={styles.orderTop}>
                    <div>
                      <p style={styles.customerName}>{o.customerName}</p>
                      <p style={styles.orderId}>#{o.id?.slice(-8).toUpperCase()} • ₹{o.totalAmount?.toFixed(2)} • {o.orderType}</p>
                      <p style={styles.orderTime}>{o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : ''}</p>
                    </div>
                    <span style={{ ...styles.statusBadge, background: STATUS_COLOR[o.status] || '#6b7280' }}>
                      {o.status}
                    </span>
                  </div>
                  <p style={styles.items}>{o.items?.map(i => `${i.name} ×${i.quantity}`).join(' • ')}</p>
                  {o.deliveryAddress && <p style={styles.address}>📍 {o.deliveryAddress}</p>}
                  {o.specialInstructions && <p style={styles.special}>📝 {o.specialInstructions}</p>}
                  {NEXT_STATUS[o.status] && (
                    <button onClick={() => handleStatusUpdate(o.id, NEXT_STATUS[o.status])}
                      style={styles.actionBtn}>
                      {NEXT_LABEL[o.status]}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reservations */}
          {activeTab === 'reservations' && (
            <div style={styles.list}>
              {reservations.length === 0 && <div style={styles.empty}><p>No reservations yet</p></div>}
              {reservations.map(r => (
                <div key={r.id} style={styles.orderCard}>
                  <div style={styles.orderTop}>
                    <div>
                      <p style={styles.customerName}>{r.customerName}</p>
                      <p style={styles.orderId}>
                        📅 {r.reservationDateTime ? new Date(r.reservationDateTime).toLocaleString() : 'N/A'} • {r.numberOfGuests} guests
                      </p>
                      {r.specialRequests && <p style={styles.special}>📝 {r.specialRequests}</p>}
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      background: r.status === 'CONFIRMED' ? '#22c55e'
                        : r.status === 'CANCELLED' ? '#ef4444' : '#f59e0b'
                    }}>{r.status}</span>
                  </div>
                  {r.status === 'PENDING' && (
                    <div style={styles.btnRow}>
                      <button onClick={() => handleReservation(r.id, 'CONFIRMED')} style={styles.confirmBtn}>✅ Confirm</button>
                      <button onClick={() => handleReservation(r.id, 'CANCELLED')} style={styles.declineBtn}>❌ Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div style={styles.list}>
              {orders.map(o => (
                <div key={o.id} style={{ ...styles.orderCard, opacity: ['DELIVERED','CANCELLED'].includes(o.status) ? 0.8 : 1 }}>
                  <div style={styles.orderTop}>
                    <div>
                      <p style={styles.customerName}>{o.customerName}</p>
                      <p style={styles.orderId}>#{o.id?.slice(-8).toUpperCase()} • ₹{o.totalAmount?.toFixed(2)}</p>
                      <p style={styles.orderTime}>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</p>
                    </div>
                    <span style={{ ...styles.statusBadge, background: STATUS_COLOR[o.status] || '#6b7280' }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1000, margin: '0 auto', padding: '32px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  sub: { color: '#6b7280', fontSize: 14 },
  createBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' },
  createCard: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  createForm: { display: 'flex', flexDirection: 'column', gap: 10 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' },
  hint: { fontSize: 12, color: '#6b7280' },
  noRestaurant: { textAlign: 'center', padding: 60 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: 28 },
  statVal: { fontSize: 22, fontWeight: 700, color: '#1f2937', margin: '6px 0 2px' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: { padding: '10px 18px', borderRadius: 10, border: '2px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14 },
  activeTab: { background: '#ff4500', color: '#fff', borderColor: '#ff4500' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  orderCard: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 2 },
  orderId: { fontSize: 12, color: '#6b7280' },
  orderTime: { fontSize: 12, color: '#9ca3af' },
  statusBadge: { color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  items: { fontSize: 13, color: '#4b5563', marginBottom: 6 },
  address: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  special: { fontSize: 12, color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: 6, marginBottom: 8 },
  actionBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginTop: 8 },
  btnRow: { display: 'flex', gap: 8, marginTop: 10 },
  confirmBtn: { background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 },
  declineBtn: { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 },
  sectionHead: { fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 },
  empty: { textAlign: 'center', padding: 40, color: '#9ca3af' }
};
