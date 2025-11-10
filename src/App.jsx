import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecipeProvider } from './context/RecipeContext';
import { StoriesProvider } from './context/StoriesContext';
import Home from './components/Home/Home';
import RecipeFinder from './components/RecipeFinder/RecipeFinder';
import Stories from './components/Stories/Stories';
import './App.css';

function Navigation() {
    const location = useLocation();
    const { user, login, logout } = useAuth();
    
    return (
        <nav className="main-navigation">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    🍳 RecipeHub
                </Link>
                <div className="nav-links">
                    <Link 
                        to="/" 
                        className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
                    >
                        My Recipes
                    </Link>
                    {user && (
                        <Link 
                            to="/finder" 
                            className={location.pathname === '/finder' ? 'nav-link active' : 'nav-link'}
                        >
                            Find Recipes
                        </Link>
                    )}
                    {user && (
                        <Link 
                            to="/stories" 
                            className={location.pathname === '/stories' ? 'nav-link active' : 'nav-link'}
                        >
                            Stories
                        </Link>
                    )}
                    <div className="auth-section">
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {user.picture && (
                                    <img 
                                        src={user.picture} 
                                        alt={user.name} 
                                        style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%',
                                            border: '2px solid #FFD60A'
                                        }} 
                                    />
                                )}
                                <span style={{ color: '#2C2416', fontWeight: '500' }}>{user.name}</span>
                                <button 
                                    onClick={logout}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={login}
                                style={{
                                    background: '#4285F4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#fff" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.951H.957C.348 6.174 0 7.55 0 9s.348 2.826.957 4.049l3.007-2.342z"/>
                                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.951L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                                </svg>
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/" replace />;
}

function AppContent() {
    return (
        <Router>
            <div className="app-wrapper">
                <Navigation />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/finder" 
                        element={
                            <ProtectedRoute>
                                <RecipeFinder />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/stories" 
                        element={
                            <ProtectedRoute>
                                <Stories />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default function App() {
    // Get Google OAuth Client ID from environment variable
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    if (!clientId || clientId === 'your_google_oauth_client_id_here') {
        console.warn('VITE_GOOGLE_CLIENT_ID not set or using placeholder. Google login will not work.');
        console.warn('Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    }

    return (
        <AuthProvider clientId={clientId || 'dummy-client-id'}>
            <RecipeProvider>
                <StoriesProvider>
                    <AppContent />
                </StoriesProvider>
            </RecipeProvider>
        </AuthProvider>
    );
}
