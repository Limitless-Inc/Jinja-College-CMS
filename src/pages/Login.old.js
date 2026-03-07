import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../utils/supabase';
import logo from '../assets/logo.jpg';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({ staff_id: '', password: '' });
  const [signupData, setSignupData] = useState({
    staff_id: '',
    name: '',
    phone: '',
    subjects: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('staff_id', loginData.staff_id)
        .single();

      if (error || !data) {
        setError('Invalid Staff ID or password');
        setLoading(false);
        return;
      }

      if (!data.approved) {
        setError('⚠️ ACCOUNT PENDING APPROVAL\n\nYour account is waiting for administrator approval. You cannot login at this time.\n\nYou will be notified when approved.');
        setLoading(false);
        return;
      }

      if (data.password_hash === loginData.password) {
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
      } else {
        setError('Invalid Staff ID or password');
      }
    } catch (err) {
      setError('Login failed');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!signupData.staff_id || !signupData.name || !signupData.phone || !signupData.subjects || !signupData.password || !signupData.confirmPassword) {
      setError('⚠️ All fields are required. Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('⚠️ Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('⚠️ Passwords do not match. Please re-enter.');
      setLoading(false);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('teachers')
        .select('staff_id')
        .eq('staff_id', signupData.staff_id)
        .single();

      if (existing) {
        setError('⚠️ Staff ID already exists. Please choose a different Staff ID.');
        setLoading(false);
        return;
      }

      const { data: allUsers, count } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      const isFirstUser = count === 0;

      const { error: insertError } = await supabase
        .from('teachers')
        .insert({
          staff_id: signupData.staff_id,
          name: signupData.name,
          phone: signupData.phone,
          subjects: signupData.subjects,
          password_hash: signupData.password,
          role: isFirstUser ? 'admin' : 'teacher',
          approved: isFirstUser ? true : false,
          class_assigned: null
        });

      if (insertError) throw insertError;

      if (isFirstUser) {
        setSuccess('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!\n\nYou are the first user of this system. You have been automatically set as the SYSTEM ADMINISTRATOR.\n\nYou can now login with your credentials.\n\nRedirecting to login page...');
        setTimeout(() => setIsSignup(false), 5000);
      } else {
        setSuccess('✅ REGISTRATION SUBMITTED SUCCESSFULLY!\n\nYour account has been created and is now PENDING ADMINISTRATOR APPROVAL.\n\nYou will receive notification once an administrator approves your account.\n\nYOU CANNOT LOGIN UNTIL APPROVED.\n\nRedirecting to login page...');
        setTimeout(() => setIsSignup(false), 10000);
      }

      setSignupData({ staff_id: '', name: '', phone: '', subjects: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src={logo} alt="Jinja College" />
          </div>
          <h1 className="login-title">Jinja College</h1>
          <p className="login-subtitle">Class Monitoring System</p>
          {!isSignup && (
            <p className="login-instruction">Enter your credentials to access the admin dashboard</p>
          )}
        </div>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            whiteSpace: 'pre-line',
            lineHeight: '1.6'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}

        {!isSignup ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className="form-input"
                value={loginData.staff_id}
                onChange={(e) => setLoginData({...loginData, staff_id: e.target.value})}
                placeholder="admin@jinjacollege.edu"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              <LogIn size={18} />
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
              This is a secure admin-only system. Unauthorized access is prohibited.
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-gray)' }}>
              New teacher?{' '}
              <span onClick={() => setIsSignup(true)} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>
                Create account
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Create Teacher Account</h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                placeholder="John Mukasa"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={signupData.phone}
                onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                placeholder="+256701234567"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Staff ID</label>
              <input
                type="text"
                className="form-input"
                value={signupData.staff_id}
                onChange={(e) => setSignupData({...signupData, staff_id: e.target.value})}
                placeholder="TCH045"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subjects Taught</label>
              <input
                type="text"
                className="form-input"
                value={signupData.subjects}
                onChange={(e) => setSignupData({...signupData, subjects: e.target.value})}
                placeholder="Mathematics, Physics"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-gray)' }}>
              Already have an account?{' '}
              <span onClick={() => setIsSignup(false)} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>
                Sign in
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
