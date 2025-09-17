import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('abt_auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('abt_auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem('abt_auth', JSON.stringify(authData));
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('abt_auth');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    const authData = { user: updatedUser, token };
    localStorage.setItem('abt_auth', JSON.stringify(authData));
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isGovernmentUser = () => {
    return hasRole(['GOVERNMENT_ADMIN', 'GOVERNMENT_OFFICER']);
  };

  const isContractor = () => {
    return hasRole('CONTRACTOR');
  };

  const isMEOfficer = () => {
    return hasRole('ME_OFFICER');
  };

  const canAccessAdminFeatures = () => {
    return hasRole('GOVERNMENT_ADMIN');
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signOut,
    updateUser,
    isAuthenticated,
    hasRole,
    isGovernmentUser,
    isContractor,
    isMEOfficer,
    canAccessAdminFeatures,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
