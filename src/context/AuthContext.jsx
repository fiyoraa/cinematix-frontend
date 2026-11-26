import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  apiRequest,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  storeAuthSession,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loadingAuth, setLoadingAuth] = useState(() => Boolean(getStoredToken()));

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    async function verifySession() {
      const savedToken = getStoredToken();
      if (!savedToken) {
        setLoadingAuth(false);
        return;
      }

      try {
        const profile = await apiRequest('/auth/me', { token: savedToken });
        if (active) {
          const normalizedUser = {
            id: profile._id || profile.id,
            username: profile.username,
            email: profile.email,
            role: profile.role,
          };
          setUser(normalizedUser);
          storeAuthSession(savedToken, normalizedUser);
        }
      } catch (err) {
        if (active && (err.status === 401 || err.status === 404)) {
          logout();
        }
      } finally {
        if (active) {
          setLoadingAuth(false);
        }
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, [logout]);

  const login = async (username, password) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
      token: null,
    });
    storeAuthSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  };

  const register = async (username, email, password) => {
    const created = await apiRequest('/auth/register', {
      method: 'POST',
      body: { username, email, password },
      token: null,
    });
    return created;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
        loadingAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipanggil di dalam AuthProvider');
  }
  return ctx;
}
