import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../store/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data);
      toast.success('Welcome back, ' + res.data.name + '! 👋');
      if (res.data.role === 'RESTAURANT_PARTNER') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🍽️</div>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.sub}>Sign in to your Infotact account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input type="email" required placeholder="you@example.com" style={styles.input}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" required placeholder="••••••••" style={styles.input}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} style={styles.link}>Register here</span>
        </p>

        {/* Demo accounts hint */}
        <div style={styles.hint}>
          <p style={styles.hintTitle}>Demo Accounts (after seeding)</p>
          <p style={styles.hintText}>Customer: customer@demo.com / demo123</p>
          <p style={styles.hintText}>Restaurant: partner@demo.com / demo123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', background: '#f9fafb', padding: 16 },
  card: { background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
  logo: { textAlign: 'center', fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 700, textAlign: 'center', color: '#1f2937', marginBottom: 4 },
  sub: { color: '#6b7280', textAlign: 'center', marginBottom: 28, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none', transition: 'border 0.2s' },
  btn: { background: '#ff4500', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
  link: { color: '#ff4500', cursor: 'pointer', fontWeight: 600 },
  hint: { marginTop: 24, background: '#f9fafb', borderRadius: 10, padding: 14, border: '1px dashed #e5e7eb' },
  hintTitle: { fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase' },
  hintText: { fontSize: 12, color: '#6b7280', margin: '2px 0' }
};
