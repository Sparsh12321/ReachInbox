import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginForm } from '../hooks/useLoginForm';
import { useLoginSubmit } from '../hooks/useLoginSubmit';
import { InputField } from '../components/InputField';
import { FormError } from '../components/FormError';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddingAccount = searchParams.get('addAccount') === 'true';

  const { formData, errors, setErrors, handleChange, validateForm } = useLoginForm();
  const { submitLogin, isLoggingIn, loginError } = useLoginSubmit();

  useEffect(() => {
    if (!isAddingAccount && submitLogin) {
      // Redirect if already logged in
      // Could enhance: useAuth hook can provide `isAuthenticated`
      // navigate('/home');
    }
  }, [isAddingAccount, submitLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await submitLogin(formData);
      navigate('/home');
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || err.message || 'Login failed' });
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
          <FormError message={errors.submit} />

          <InputField 
            label="Email Address"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <InputField 
            label="Password"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

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
