import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getNearbyRestaurants, getAllRestaurants } from '../services/api';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cuisine, setCuisine] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllRestaurants();
      setRestaurants(res.data);
    } catch {
      toast.error('Failed to load restaurants');
    } finally { setLoading(false); }
  };

  const findNearby = () => {
    setLocationStatus('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus('Finding nearby restaurants...');
        try {
          const res = await getNearbyRestaurants(
            pos.coords.latitude, pos.coords.longitude, 10, cuisine);
          setRestaurants(res.data);
          setLocationStatus(`Found ${res.data.length} restaurants near you`);
        } catch {
          toast.error('Location search failed');
          setLocationStatus('');
        }
      },
      () => { toast.error('Location access denied'); setLocationStatus(''); }
    );
  };

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Order Food. Book Tables. Discover More.</h1>
        <p style={styles.heroSub}>Your complete food & dining experience in one place</p>
        <div style={styles.searchBar}>
          <select value={cuisine} onChange={e => setCuisine(e.target.value)} style={styles.select}>
            <option value="">All Cuisines</option>
            <option value="Indian">Indian</option>
            <option value="Chinese">Chinese</option>
            <option value="Italian">Italian</option>
            <option value="Fast Food">Fast Food</option>
            <option value="South Indian">South Indian</option>
          </select>
          <button onClick={findNearby} style={styles.nearbyBtn}>📍 Find Near Me</button>
          <button onClick={fetchAll} style={styles.allBtn}>View All</button>
        </div>
        {locationStatus && <p style={styles.locationStatus}>{locationStatus}</p>}
      </div>

      {/* Restaurant Grid */}
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          {restaurants.length} Restaurants Available
        </h2>
        {loading ? (
          <div style={styles.center}>Loading restaurants...</div>
        ) : (
          <div style={styles.grid}>
            {restaurants.map(r => (
              <Link to={`/restaurant/${r.id}`} key={r.id} style={styles.cardLink}>
                <div style={styles.card}>
                  <div style={styles.cardImg}>
                    {r.imageUrl
                      ? <img src={r.imageUrl} alt={r.name} style={styles.img} />
                      : <div style={styles.imgPlaceholder}>🍽️</div>
                    }
                    <span style={{
                      ...styles.badge,
                      background: r.isOpen ? '#22c55e' : '#ef4444'
                    }}>{r.isOpen ? 'Open' : 'Closed'}</span>
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{r.name}</h3>
                    <p style={styles.cardCuisine}>{r.cuisineType} • {r.category}</p>
                    <p style={styles.cardDesc}>{r.description?.substring(0, 60)}...</p>
                    <div style={styles.cardMeta}>
                      <span>⭐ {r.averageRating || 'New'}</span>
                      <span>🕒 {r.averageDeliveryTime} min</span>
                      <span>₹{r.deliveryFee} delivery</span>
                    </div>
                    <p style={styles.minOrder}>Min. ₹{r.minimumOrderAmount}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && restaurants.length === 0 && (
          <div style={styles.empty}>
            <p>No restaurants found. Try expanding your search radius.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb' },
  hero: {
    background: 'linear-gradient(135deg, #ff4500, #ff6b35)',
    color: '#fff', textAlign: 'center', padding: '60px 20px'
  },
  heroTitle: { fontSize: 36, fontWeight: 700, marginBottom: 8 },
  heroSub: { fontSize: 18, opacity: 0.9, marginBottom: 32 },
  searchBar: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  select: {
    padding: '12px 16px', borderRadius: 10, border: 'none',
    fontSize: 15, minWidth: 180, cursor: 'pointer'
  },
  nearbyBtn: {
    background: '#fff', color: '#ff4500', border: 'none', borderRadius: 10,
    padding: '12px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer'
  },
  allBtn: {
    background: 'transparent', color: '#fff', border: '2px solid #fff',
    borderRadius: 10, padding: '12px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer'
  },
  locationStatus: { marginTop: 16, fontSize: 14, opacity: 0.9 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 16px' },
  sectionTitle: { fontSize: 22, fontWeight: 600, marginBottom: 24, color: '#1f2937' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  cardLink: { textDecoration: 'none' },
  card: {
    background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  cardImg: { position: 'relative', height: 160, background: '#f3f4f6' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', fontSize: 48
  },
  badge: {
    position: 'absolute', top: 10, right: 10, color: '#fff',
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600
  },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  cardCuisine: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#4b5563', marginBottom: 10 },
  cardMeta: { display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 6 },
  minOrder: { fontSize: 11, color: '#9ca3af' },
  center: { textAlign: 'center', padding: 40, color: '#6b7280' },
  empty: { textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 16 }
};
