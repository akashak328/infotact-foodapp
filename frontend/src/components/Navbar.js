import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🍽️ Infotact Food</Link>
      <div style={styles.links}>
        {user ? (
          <>
            {user.role === 'RESTAURANT_PARTNER' && (
              <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            )}
            {user.role === 'CONSUMER' && (
              <>
                <Link to="/orders" style={styles.link}>My Orders</Link>
                <Link to="/reservations" style={styles.link}>Reservations</Link>
                <Link to="/cart" style={styles.link}>
                  🛒 Cart {totalItems > 0 && <span style={styles.badge}>{totalItems}</span>}
                </Link>
              </>
            )}
            <Link to="/profile" style={styles.link}>
              👤 {user.name} | ⭐ {user.loyaltyPoints} pts
            </Link>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 32px', background: '#ff4500', color: '#fff',
    position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  brand: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 22 },
  links: { display: 'flex', alignItems: 'center', gap: 16 },
  link: { color: '#fff', textDecoration: 'none', fontSize: 14 },
  btn: {
    background: '#fff', color: '#ff4500', border: 'none', borderRadius: 8,
    padding: '6px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14
  },
  badge: {
    background: '#fff', color: '#ff4500', borderRadius: '50%',
    padding: '1px 6px', fontSize: 11, fontWeight: 700, marginLeft: 4
  }
};
