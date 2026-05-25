import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function ProfilePage() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const ROLE_INFO = {
    CONSUMER: { icon: '🧑', label: 'Customer', color: '#3b82f6' },
    RESTAURANT_PARTNER: { icon: '🏪', label: 'Restaurant Partner', color: '#f59e0b' },
    DELIVERY_COURIER: { icon: '🛵', label: 'Delivery Courier', color: '#22c55e' },
    ADMIN: { icon: '⚙️', label: 'Administrator', color: '#8b5cf6' }
  };
  const roleInfo = ROLE_INFO[user.role] || ROLE_INFO.CONSUMER;
  const TIER = user.loyaltyPoints >= 500 ? { name: 'Gold', color: '#f59e0b', icon: '🥇' }
    : user.loyaltyPoints >= 200 ? { name: 'Silver', color: '#6b7280', icon: '🥈' }
    : { name: 'Bronze', color: '#b45309', icon: '🥉' };
  const nextTierPts = user.loyaltyPoints >= 500 ? null : user.loyaltyPoints >= 200 ? 500 : 200;

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <div style={styles.page}>
      <div style={styles.profileCard}>
        {/* Avatar */}
        <div style={{ ...styles.avatar, background: roleInfo.color }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={styles.name}>{user.name}</h1>
        <p style={styles.email}>{user.email}</p>
        <span style={{ ...styles.roleBadge, background: roleInfo.color + '20', color: roleInfo.color }}>
          {roleInfo.icon} {roleInfo.label}
        </span>
      </div>

      {/* Loyalty Points Card */}
      <div style={styles.loyaltyCard}>
        <div style={styles.loyaltyHeader}>
          <div>
            <p style={styles.loyaltyTitle}>Loyalty Points</p>
            <p style={styles.loyaltyPoints}>{TIER.icon} {user.loyaltyPoints} pts</p>
          </div>
          <div style={styles.tierBadge}>
            <p style={{ ...styles.tierName, color: TIER.color }}>{TIER.name} Member</p>
          </div>
        </div>
        {nextTierPts && (
          <div style={styles.progressBox}>
            <div style={styles.progressLabel}>
              <span>{user.loyaltyPoints} pts</span>
              <span>{nextTierPts} pts for next tier</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${Math.min((user.loyaltyPoints / nextTierPts) * 100, 100)}%`
              }} />
            </div>
          </div>
        )}
        <p style={styles.loyaltyTip}>💡 Write reviews to earn more points!</p>
      </div>

      {/* Info */}
      <div style={styles.infoCard}>
        <h3 style={styles.sectionHead}>Account Details</h3>
        {[
          ['📧', 'Email', user.email],
          ['📞', 'Phone', user.phone || 'Not provided'],
          ['📍', 'Address', user.address || 'Not provided'],
          ['🔖', 'Member Since', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A']
        ].map(([icon, label, value]) => (
          <div key={label} style={styles.infoRow}>
            <span style={styles.infoIcon}>{icon}</span>
            <div>
              <p style={styles.infoLabel}>{label}</p>
              <p style={styles.infoValue}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={styles.actionsCard}>
        {user.role === 'CONSUMER' && (
          <>
            <button onClick={() => navigate('/orders')} style={styles.actionBtn}>📦 My Orders</button>
            <button onClick={() => navigate('/reservations')} style={styles.actionBtn}>📅 My Reservations</button>
          </>
        )}
        {user.role === 'RESTAURANT_PARTNER' && (
          <button onClick={() => navigate('/dashboard')} style={styles.actionBtn}>🏪 Restaurant Dashboard</button>
        )}
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Sign Out</button>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 520, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 16 },
  profileCard: { background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  avatar: { width: 88, height: 88, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, margin: '0 auto 16px' },
  name: { fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  email: { color: '#6b7280', fontSize: 14, marginBottom: 12 },
  roleBadge: { display: 'inline-block', padding: '5px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  loyaltyCard: { background: 'linear-gradient(135deg, #ff4500, #ff6b35)', borderRadius: 16, padding: 24, color: '#fff' },
  loyaltyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  loyaltyTitle: { fontSize: 13, opacity: 0.85, marginBottom: 4 },
  loyaltyPoints: { fontSize: 28, fontWeight: 800 },
  tierBadge: { background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px' },
  tierName: { fontWeight: 700, fontSize: 14 },
  progressBox: { marginBottom: 12 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85, marginBottom: 6 },
  progressBar: { background: 'rgba(255,255,255,0.3)', borderRadius: 10, height: 8 },
  progressFill: { background: '#fff', borderRadius: 10, height: '100%', transition: 'width 0.5s' },
  loyaltyTip: { fontSize: 12, opacity: 0.85 },
  infoCard: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  sectionHead: { fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 },
  infoRow: { display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#1f2937' },
  actionsCard: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 10 },
  actionBtn: { background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 500, fontSize: 14, textAlign: 'left' },
  logoutBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }
};
