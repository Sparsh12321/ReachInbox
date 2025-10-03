import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { addAccountToList, setActiveAccount } from '../store/slices/accountsSlice';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isAddingAccount = searchParams.get('addAccount') === 'true';
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated (but not when adding a new account)
  useEffect(() => {
    if (isAuthenticated && !isAddingAccount) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate, isAddingAccount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      // Add account to Redux store
      if (result?.account) {
        const accountData = {
          id: result.account._id,
          name: result.account.imap_user.split('@')[0],
          email: result.account.imap_user,
          avatar: result.account.imap_user.charAt(0).toUpperCase(),
          isActive: true,
        };
        dispatch(addAccountToList(accountData));
        dispatch(setActiveAccount(accountData.id));
      }
      
      navigate('/home');
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || error.message || 'Login failed. Please check your credentials.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ReachInbox</h1>
          <p>{isAddingAccount ? 'Add a new account to your workspace.' : 'Welcome back! Please login to your account.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && (
            <div style={{ 
              padding: '12px', 
              background: '#fee', 
              borderRadius: '8px', 
              color: '#c00',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {errors.submit}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="auth-button" disabled={isLoggingIn}>
            {isLoggingIn ? (isAddingAccount ? 'Adding Account...' : 'Logging in...') : (isAddingAccount ? 'Add Account' : 'Login')}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to={isAddingAccount ? "/register?addAccount=true" : "/register"}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

