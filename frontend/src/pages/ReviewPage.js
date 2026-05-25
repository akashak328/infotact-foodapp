import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submitReview, getOrder } from '../services/api';

const FOOD_KEYWORDS = ['delicious','fresh','hot','crispy','flavorful','tasty','excellent',
  'amazing','fast','quick','prompt','courteous','packaging','hygienic','value','recommend',
  'authentic','spicy','juicy','tender','aromatic','generous','well-cooked','presentable'];

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    orderId: id, foodRating: 5, deliveryRating: 5,
    overallRating: 5, reviewText: '', imageUrls: []
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectedKw, setDetectedKw] = useState([]);

  useEffect(() => {
    getOrder(id).then(r => setOrder(r.data)).catch(() => toast.error('Order not found'));
  }, [id]);

  const analyzeText = (text) => {
    const lower = text.toLowerCase();
    const found = FOOD_KEYWORDS.filter(kw => lower.includes(kw));
    setDetectedKw(found);
  };

  const estimatePoints = () => {
    let pts = 10;
    const words = form.reviewText.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 50) pts += 20;
    else if (words >= 30) pts += 10;
    else if (words >= 15) pts += 5;
    if (form.overallRating === 5) pts += 5;
    pts += Math.min(detectedKw.length * 3, 15);
    return pts;
  };

  const StarRating = ({ field, label }) => (
    <div style={styles.starField}>
      <label style={styles.label}>{label}</label>
      <div style={styles.stars}>
        {[1,2,3,4,5].map(n => (
          <span key={n} onClick={() => setForm({ ...form, [field]: n })}
            style={{ ...styles.star, color: n <= form[field] ? '#f59e0b' : '#d1d5db' }}>
            ★
          </span>
        ))}
        <span style={styles.ratingNum}>{form[field]}/5</span>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.reviewText.trim().length < 20) {
      toast.error('Review must be at least 20 characters'); return;
    }
    setLoading(true);
    try {
      const res = await submitReview(form);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  if (result) return (
    <div style={styles.successPage}>
      <div style={styles.successCard}>
        <div style={styles.confetti}>🎉</div>
        <h1 style={styles.successTitle}>Review Submitted!</h1>
        <p style={styles.successSub}>Thank you for sharing your experience</p>
        <div style={styles.pointsBox}>
          <p style={styles.pointsNum}>+{result.pointsEarned}</p>
          <p style={styles.pointsLabel}>Loyalty Points Earned</p>
        </div>
        <div style={styles.breakdownBox}>
          <p style={styles.breakdownTitle}>Points Breakdown</p>
          <p style={styles.breakdownText}>{result.pointsBreakdown}</p>
        </div>
        <p style={styles.totalPts}>Your Total Points: <strong>{result.newTotalPoints} ⭐</strong></p>
        <div style={styles.btnRow}>
          <button onClick={() => navigate('/orders')} style={styles.secondaryBtn}>My Orders</button>
          <button onClick={() => navigate('/')} style={styles.primaryBtn}>Order More Food</button>
        </div>
      </div>
    </div>
  );

  const wordCount = form.reviewText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedPts = estimatePoints();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Write a Review</h1>
      {order && <p style={styles.sub}>for your order from <strong>{order.restaurantName}</strong></p>}

      {/* Points hint */}
      <div style={styles.hintBox}>
        <span style={styles.hintIcon}>💡</span>
        <div>
          <p style={styles.hintTitle}>Earn loyalty points for detailed reviews!</p>
          <p style={styles.hintText}>Base 10pts + up to 20pts for word count + 15pts for keywords + 15pts for photos</p>
        </div>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Ratings */}
          <div style={styles.ratingGrid}>
            <StarRating field="foodRating" label="Food Quality" />
            <StarRating field="deliveryRating" label="Delivery Service" />
            <StarRating field="overallRating" label="Overall Experience" />
          </div>

          {/* Review text */}
          <div style={styles.field}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Your Review *</label>
              <span style={{ fontSize: 12, color: wordCount >= 30 ? '#22c55e' : '#9ca3af' }}>
                {wordCount} words
              </span>
            </div>
            <textarea required style={styles.textarea}
              placeholder="Tell others about the food quality, delivery experience, packaging, taste... (longer reviews earn more points!)"
              value={form.reviewText}
              onChange={e => { setForm({ ...form, reviewText: e.target.value }); analyzeText(e.target.value); }} />
          </div>

          {/* Detected keywords */}
          {detectedKw.length > 0 && (
            <div style={styles.kwBox}>
              <p style={styles.kwTitle}>✅ Quality keywords detected ({detectedKw.length})</p>
              <div style={styles.kwList}>
                {detectedKw.map(kw => (
                  <span key={kw} style={styles.kwBadge}>{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested keywords */}
          <div style={styles.suggestBox}>
            <p style={styles.kwTitle}>💬 Suggested keywords (click to add)</p>
            <div style={styles.kwList}>
              {FOOD_KEYWORDS.filter(k => !detectedKw.includes(k)).slice(0, 8).map(kw => (
                <span key={kw} style={styles.kwSuggest}
                  onClick={() => {
                    const updated = form.reviewText + (form.reviewText ? ' ' : '') + kw;
                    setForm({ ...form, reviewText: updated });
                    analyzeText(updated);
                  }}>{kw} +</span>
              ))}
            </div>
          </div>

          {/* Estimated points */}
          <div style={styles.estBox}>
            <span>⭐ Estimated points you'll earn:</span>
            <strong style={{ color: '#ff4500', fontSize: 18 }}>{estimatedPts} pts</strong>
          </div>

          <button type="submit" disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting...' : '🎉 Submit Review & Earn Points'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 680, margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  sub: { color: '#6b7280', marginBottom: 16, fontSize: 14 },
  hintBox: { display: 'flex', gap: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 14, marginBottom: 20, alignItems: 'flex-start' },
  hintIcon: { fontSize: 20 },
  hintTitle: { fontWeight: 600, fontSize: 13, color: '#92400e', marginBottom: 2 },
  hintText: { fontSize: 12, color: '#b45309' },
  card: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  ratingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  starField: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  stars: { display: 'flex', alignItems: 'center', gap: 4 },
  star: { fontSize: 28, cursor: 'pointer', transition: 'color 0.1s' },
  ratingNum: { fontSize: 13, color: '#6b7280', marginLeft: 6 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  textarea: { padding: '12px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none', resize: 'vertical', height: 120, lineHeight: 1.6 },
  kwBox: { background: '#f0fdf4', borderRadius: 10, padding: 12, border: '1px solid #bbf7d0' },
  suggestBox: { background: '#f9fafb', borderRadius: 10, padding: 12 },
  kwTitle: { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 },
  kwList: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  kwBadge: { background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  kwSuggest: { background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid #e5e7eb' },
  estBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#92400e' },
  submitBtn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer' },
  successPage: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f9fafb', padding: 16 },
  successCard: { background: '#fff', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
  confetti: { fontSize: 64, marginBottom: 12 },
  successTitle: { fontSize: 26, fontWeight: 700, color: '#1f2937', marginBottom: 4 },
  successSub: { color: '#6b7280', marginBottom: 24 },
  pointsBox: { background: '#fff7ed', borderRadius: 16, padding: 20, marginBottom: 16 },
  pointsNum: { fontSize: 52, fontWeight: 800, color: '#ff4500' },
  pointsLabel: { color: '#92400e', fontWeight: 600 },
  breakdownBox: { background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'left' },
  breakdownTitle: { fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' },
  breakdownText: { fontSize: 12, color: '#6b7280' },
  totalPts: { fontSize: 15, color: '#374151', marginBottom: 24 },
  btnRow: { display: 'flex', gap: 10 },
  primaryBtn: { flex: 1, background: '#ff4500', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 500, cursor: 'pointer' }
};
