import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../../../configs/firebase';
import api from '../../../../utils/axiosConfig';
import './LoginPage.css';

// SVG Icons for social buttons
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2" />
    </svg>
);

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handle social login with Firebase
     * @param {GoogleAuthProvider | FacebookAuthProvider} provider - Firebase auth provider
     * @param {string} providerName - Name for display in error messages
     */
    const handleSocialLogin = async (provider, providerName) => {
        setLoading(true);
        setError(null);

        try {
            // Step 1: Sign in with Firebase popup
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Step 2: Get the Firebase ID Token (NOT the provider's access token)
            // CRITICAL: Use user.getIdToken() to get the JWT for backend verification
            const firebaseIdToken = await user.getIdToken();

            console.log(`[LoginPage] ${providerName} login successful, sending token to backend...`);

            // Step 3: Send Firebase ID Token to backend
            const response = await api.post('/auth/outbound/social-login', {
                token: firebaseIdToken,
            });

            // Step 4: Handle successful response
            // Note: HttpOnly cookies (access_token, refresh_token) are automatically 
            // stored by the browser due to withCredentials: true
            if (response.data) {
                console.log('[LoginPage] Backend authentication successful:', response.data.message);
                console.log('[LoginPage] Force reloading to /home...');

                // Force reload using replace to clean history
                window.location.replace('/home');
            }
        } catch (err) {
            console.error(`[LoginPage] ${providerName} login failed:`, err);

            // Handle different error types
            if (err.code) {
                // Firebase Auth errors
                switch (err.code) {
                    case 'auth/popup-closed-by-user':
                        setError('Login cancelled. Please try again.');
                        break;
                    case 'auth/popup-blocked':
                        setError('Popup was blocked by your browser. Please enable popups and try again.');
                        break;
                    case 'auth/account-exists-with-different-credential':
                        setError('An account already exists with the same email. Try logging in with a different method.');
                        break;
                    case 'auth/network-request-failed':
                        setError('Network error. Please check your internet connection.');
                        break;
                    default:
                        setError(`Authentication failed: ${err.message}`);
                }
            } else if (err.response) {
                // Backend API errors
                const errorMessage = err.response.data?.message || 'Server error occurred';
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        handleSocialLogin(googleProvider, 'Google');
    };

    const handleFacebookLogin = () => {
        handleSocialLogin(facebookProvider, 'Facebook');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo/Brand Section */}
                <div className="login-header">
                    <div className="logo-icon">🍽️</div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to continue to Food Ordering</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {/* Social Login Buttons */}
                <div className="social-buttons">
                    <button
                        className="social-button google-button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <GoogleIcon />
                        <span>Continue with Google</span>
                    </button>

                    <button
                        className="social-button facebook-button"
                        onClick={handleFacebookLogin}
                        disabled={loading}
                    >
                        <FacebookIcon />
                        <span>Continue with Facebook</span>
                    </button>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Signing you in...</p>
                    </div>
                )}

                {/* Divider */}
                <div className="login-divider">
                    <span>or</span>
                </div>

                {/* Alternative Actions */}
                <div className="login-footer">
                    <p className="footer-text">
                        Don't have an account?{' '}
                        <button className="link-button" onClick={() => navigate('/register')}>
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
