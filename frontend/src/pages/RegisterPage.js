import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../store/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'CONSUMER', address: '', latitude: 0, longitude: 0
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data);
      toast.success('Account created! Welcome, ' + res.data.name + ' 🎉');
      if (res.data.role === 'RESTAURANT_PARTNER') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed');
    } finally { setLoading(false); }
  };

  const ROLES = [
    { value: 'CONSUMER', label: '🧑 Customer', desc: 'Order food & book tables' },
    { value: 'RESTAURANT_PARTNER', label: '🏪 Restaurant Partner', desc: 'List & manage your restaurant' },
    { value: 'DELIVERY_COURIER', label: '🛵 Delivery Courier', desc: 'Deliver orders & earn' }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🍽️</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.sub}>Join Infotact Food Platform</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Role Selector */}
          <div style={styles.field}>
            <label style={styles.label}>I am a...</label>
            <div style={styles.roleGrid}>
              {ROLES.map(r => (
                <div key={r.value}
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{ ...styles.roleCard, borderColor: form.role === r.value ? '#ff4500' : '#e5e7eb', background: form.role === r.value ? '#fff5f2' : '#fff' }}>
                  <span style={styles.roleLabel}>{r.label}</span>
                  <span style={styles.roleDesc}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name *</label>
              <input required placeholder="Akash A" style={styles.input}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input placeholder="+91 9000000000" style={styles.input}
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address *</label>
            <input type="email" required placeholder="you@example.com" style={styles.input}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password * (min 6 characters)</label>
            <input type="password" required placeholder="••••••••" style={styles.input}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Address</label>
            <input placeholder="Your city / area" style={styles.input}
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>

          <button type="submit" disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={styles.link}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '85vh', background: '#f9fafb', padding: '32px 16px' },
  card: { background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 520, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
  logo: { textAlign: 'center', fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 700, textAlign: 'center', color: '#1f2937', marginBottom: 4 },
  sub: { color: '#6b7280', textAlign: 'center', marginBottom: 24, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none' },
  gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  roleCard: { padding: '10px 14px', borderRadius: 10, border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  roleLabel: { display: 'block', fontWeight: 600, fontSize: 13, color: '#1f2937' },
  roleDesc: { display: 'block', fontSize: 11, color: '#6b7280', marginTop: 2 },
  btn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
  link: { color: '#ff4500', cursor: 'pointer', fontWeight: 600 }
};
