import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRestaurant, getMenu, createReservation } from '../services/api';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, totalItems, cart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [activeCategory, setActiveCategory] = useState('All');
  const [reservation, setReservation] = useState({
    reservationDateTime: '', numberOfGuests: 2, specialRequests: ''
  });

  useEffect(() => {
    getRestaurant(id).then(r => setRestaurant(r.data)).catch(() => toast.error('Restaurant not found'));
    getMenu(id).then(r => setMenu(r.data));
  }, [id]);

  const categories = ['All', ...new Set(menu.map(i => i.category))];
  const filtered = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  const handleAddItem = (item) => {
    if (!user) { toast.error('Please login to add items'); navigate('/login'); return; }
    const result = addItem(id, restaurant.name, item);
    if (result?.error) { toast.error(result.message); return; }
    toast.success(`${item.name} added to cart!`);
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await createReservation({ ...reservation, restaurantId: id, customerPhone: user.phone });
      toast.success('Reservation request sent! Restaurant will confirm shortly.');
      setActiveTab('menu');
    } catch (err) {
      toast.error(err.response?.data || 'Reservation failed');
    }
  };

  if (!restaurant) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.name}>{restaurant.name}</h1>
          <p style={styles.meta}>{restaurant.cuisineType} • {restaurant.category} • {restaurant.city}</p>
          <p style={styles.desc}>{restaurant.description}</p>
          <div style={styles.stats}>
            <span>⭐ {restaurant.averageRating || 'New'} ({restaurant.totalReviews} reviews)</span>
            <span>🕒 {restaurant.averageDeliveryTime} min delivery</span>
            <span>₹{restaurant.deliveryFee} delivery fee</span>
            <span style={{ color: restaurant.isOpen ? '#22c55e' : '#ef4444' }}>
              {restaurant.isOpen ? '✅ Open Now' : '❌ Closed'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Tabs */}
        <div style={styles.tabs}>
          {['menu', 'reserve', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}>
              {tab === 'menu' ? '🍽️ Menu' : tab === 'reserve' ? '📅 Reserve Table' : '⭐ Reviews'}
            </button>
          ))}
          {totalItems > 0 && (
            <button onClick={() => navigate('/cart')} style={styles.cartBtn}>
              🛒 View Cart ({totalItems})
            </button>
          )}
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <div style={styles.categories}>
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  style={{ ...styles.catBtn, ...(activeCategory === c ? styles.activeCat : {}) }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={styles.menuGrid}>
              {filtered.map(item => (
                <div key={item.id} style={styles.menuCard}>
                  <div style={styles.menuInfo}>
                    <span style={{ ...styles.vegBadge, color: item.isVeg ? '#22c55e' : '#ef4444' }}>
                      {item.isVeg ? '🟢' : '🔴'}
                    </span>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <p style={styles.itemDesc}>{item.description}</p>
                    <div style={styles.itemMeta}>
                      <span style={styles.price}>₹{item.price}</span>
                      <span style={styles.prepTime}>🕒 {item.preparationTime} min</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddItem(item)}
                    disabled={!item.isAvailable}
                    style={{ ...styles.addBtn, opacity: item.isAvailable ? 1 : 0.5 }}>
                    {item.isAvailable ? '+ Add' : 'Unavailable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reserve Tab */}
        {activeTab === 'reserve' && (
          <div style={styles.reserveBox}>
            <h2 style={styles.sectionTitle}>Book a Table at {restaurant.name}</h2>
            {!restaurant.acceptingReservations ? (
              <p style={{ color: '#ef4444' }}>This restaurant is not accepting reservations right now.</p>
            ) : (
              <form onSubmit={handleReservation} style={styles.form}>
                <label style={styles.label}>Date & Time</label>
                <input type="datetime-local" required style={styles.input}
                  value={reservation.reservationDateTime}
                  onChange={e => setReservation({ ...reservation, reservationDateTime: e.target.value })} />
                <label style={styles.label}>Number of Guests</label>
                <input type="number" min="1" max="20" required style={styles.input}
                  value={reservation.numberOfGuests}
                  onChange={e => setReservation({ ...reservation, numberOfGuests: parseInt(e.target.value) })} />
                <label style={styles.label}>Special Requests (optional)</label>
                <textarea style={{ ...styles.input, height: 80 }}
                  value={reservation.specialRequests}
                  onChange={e => setReservation({ ...reservation, specialRequests: e.target.value })}
                  placeholder="Allergies, celebrations, seating preferences..." />
                <button type="submit" style={styles.submitBtn}>Confirm Reservation</button>
              </form>
            )}
          </div>
        )}

        {/* Reviews tab placeholder */}
        {activeTab === 'reviews' && (
          <div style={styles.reviewsTab}>
            <h2 style={styles.sectionTitle}>Customer Reviews</h2>
            <p style={{ color: '#6b7280' }}>Reviews visible after visiting the restaurant.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb' },
  loading: { display: 'flex', justifyContent: 'center', padding: 80, fontSize: 18 },
  header: { background: 'linear-gradient(135deg, #1f2937, #374151)', color: '#fff', padding: '32px 0' },
  headerContent: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' },
  name: { fontSize: 32, fontWeight: 700, marginBottom: 6 },
  meta: { color: '#9ca3af', marginBottom: 8 },
  desc: { color: '#d1d5db', marginBottom: 16, maxWidth: 600 },
  stats: { display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  tab: {
    padding: '10px 20px', borderRadius: 10, border: '2px solid #e5e7eb',
    background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 14
  },
  activeTab: { background: '#ff4500', color: '#fff', borderColor: '#ff4500' },
  cartBtn: {
    marginLeft: 'auto', background: '#ff4500', color: '#fff', border: 'none',
    borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer'
  },
  categories: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  catBtn: {
    padding: '6px 16px', borderRadius: 20, border: '1px solid #e5e7eb',
    background: '#fff', cursor: 'pointer', fontSize: 13
  },
  activeCat: { background: '#ff4500', color: '#fff', borderColor: '#ff4500' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 },
  menuCard: {
    background: '#fff', borderRadius: 12, padding: 16,
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
  },
  menuInfo: { flex: 1, marginRight: 16 },
  vegBadge: { fontSize: 12, marginBottom: 4, display: 'block' },
  itemName: { fontSize: 15, fontWeight: 600, color: '#1f2937', marginBottom: 4 },
  itemDesc: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  itemMeta: { display: 'flex', alignItems: 'center', gap: 12 },
  price: { fontSize: 16, fontWeight: 700, color: '#ff4500' },
  prepTime: { fontSize: 11, color: '#9ca3af' },
  addBtn: {
    background: '#ff4500', color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 16px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap'
  },
  reserveBox: { background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520 },
  sectionTitle: { fontSize: 20, fontWeight: 600, marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: {
    padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db',
    fontSize: 14, outline: 'none', resize: 'vertical'
  },
  submitBtn: {
    background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10,
    padding: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8
  },
  reviewsTab: { background: '#fff', borderRadius: 16, padding: 32 }
};
