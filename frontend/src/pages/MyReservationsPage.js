import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyReservations, updateReservationStatus } from '../services/api';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyReservations()
      .then(r => setReservations(r.data))
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await updateReservationStatus(id, 'CANCELLED');
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
      toast.success('Reservation cancelled');
    } catch { toast.error('Failed to cancel reservation'); }
  };

  const STATUS_STYLE = {
    CONFIRMED: { background: '#dcfce7', color: '#16a34a' },
    PENDING:   { background: '#fef3c7', color: '#d97706' },
    CANCELLED: { background: '#fee2e2', color: '#dc2626' },
    COMPLETED: { background: '#dbeafe', color: '#2563eb' }
  };

  if (loading) return <div style={styles.center}>Loading reservations...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Reservations</h1>
          <p style={styles.sub}>{reservations.length} total reservations</p>
        </div>
        <button onClick={() => navigate('/')} style={styles.newBtn}>+ New Reservation</button>
      </div>

      {reservations.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: 48 }}>📅</p>
          <h3>No reservations yet</h3>
          <p style={{ color: '#9ca3af' }}>Book a table at your favourite restaurant</p>
          <button onClick={() => navigate('/')} style={styles.primaryBtn}>Find Restaurants</button>
        </div>
      ) : (
        <div style={styles.list}>
          {reservations.map(r => (
            <div key={r.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.restaurantName}>{r.restaurantName}</h3>
                  <p style={styles.reservId}>#{r.id?.slice(-8).toUpperCase()}</p>
                </div>
                <span style={{ ...styles.statusBadge, ...(STATUS_STYLE[r.status] || {}) }}>
                  {r.status}
                </span>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>📅</span>
                  <div>
                    <p style={styles.detailLabel}>Date & Time</p>
                    <p style={styles.detailVal}>{r.reservationDateTime ? new Date(r.reservationDateTime).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>👥</span>
                  <div>
                    <p style={styles.detailLabel}>Guests</p>
                    <p style={styles.detailVal}>{r.numberOfGuests} person{r.numberOfGuests > 1 ? 's' : ''}</p>
                  </div>
                </div>
                {r.tableNumber && (
                  <div style={styles.detailItem}>
                    <span style={styles.detailIcon}>🪑</span>
                    <div>
                      <p style={styles.detailLabel}>Table</p>
                      <p style={styles.detailVal}>{r.tableNumber}</p>
                    </div>
                  </div>
                )}
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>📞</span>
                  <div>
                    <p style={styles.detailLabel}>Contact</p>
                    <p style={styles.detailVal}>{r.customerPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {r.specialRequests && (
                <div style={styles.specialBox}>
                  <span style={styles.detailLabel}>Special Requests: </span>
                  <span style={styles.detailVal}>{r.specialRequests}</span>
                </div>
              )}

              <div style={styles.cardFooter}>
                <p style={styles.bookedOn}>Booked on {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</p>
                {r.status === 'PENDING' && (
                  <button onClick={() => handleCancel(r.id)} style={styles.cancelBtn}>Cancel Reservation</button>
                )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  sub: { color: '#9ca3af', fontSize: 14 },
  newBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: 18, color: '#6b7280' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: { background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  restaurantName: { fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 2 },
  reservId: { fontSize: 12, color: '#9ca3af' },
  statusBadge: { padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 12 },
  detailItem: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  detailIcon: { fontSize: 20, marginTop: 2 },
  detailLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 },
  detailVal: { fontSize: 14, color: '#1f2937', fontWeight: 500 },
  specialBox: { background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 12 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 12 },
  bookedOn: { fontSize: 12, color: '#9ca3af' },
  cancelBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  empty: { textAlign: 'center', padding: 60 },
  primaryBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', marginTop: 16 }
};
