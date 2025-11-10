import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProviderContent = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('recipehub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Fetch user info from Google
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const userData = {
            id: data.id,
            email: data.email,
            name: data.name,
            picture: data.picture,
            accessToken: tokenResponse.access_token,
          };
          setUser(userData);
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
          alert('Failed to fetch user information. Please try again.');
        });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      if (error.error === 'popup_closed_by_user') {
        // User closed the popup, don't show error
        return;
      }
      
      let errorMessage = 'Login failed. ';
      if (error.error === 'access_denied') {
        errorMessage += 'You denied access to your Google account.';
      } else if (error.error === 'invalid_client') {
        errorMessage += 'Invalid Google OAuth Client ID. Please check your .env file and make sure VITE_GOOGLE_CLIENT_ID is set correctly.';
      } else if (error.error === 'redirect_uri_mismatch') {
        errorMessage += 'Redirect URI mismatch. Please add http://localhost:5173 to Authorized JavaScript origins in Google Cloud Console.';
      } else {
        errorMessage += `Error: ${error.error || 'Unknown error'}. Please check your Google OAuth configuration.`;
      }
      alert(errorMessage);
    },
    scope: 'openid email profile',
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('recipehub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('recipehub_user');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children, clientId }) => {
  // Validate client ID
  if (!clientId || clientId === 'your_google_oauth_client_id_here' || clientId === 'dummy-client-id') {
    console.error('Invalid Google OAuth Client ID. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
  }

  return (
    <GoogleOAuthProvider clientId={clientId || 'dummy-client-id'}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </GoogleOAuthProvider>
  );
};

