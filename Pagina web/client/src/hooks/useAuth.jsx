import { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext to provide authentication state and actions
 */
const AuthContext = createContext();

/**
 * AuthProvider component to wrap the application
 * @param {Object} props - React props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // Initialize all states together to ensure consistency
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
    initialized: false  // New flag to track initial load
  });

  // Update all related states together
  const updateAuthState = (updates) => {
    setAuthState(prev => ({
      ...prev,
      ...updates,
      initialized: true  // Mark as initialized once we get first response
    }));
  };

  const fetchAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        updateAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false
        });
      } else {
        updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching auth status:', error);
      updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  const refreshAuth = async () => {
    updateAuthState({ loading: true });
    await fetchAuthStatus();
  };

  /**
   * Logs out the user by calling the logout API endpoint
   */
  const logout = async () => {
    try {
      // Set loading state while logging out
      updateAuthState({ loading: true });
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        updateAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
        window.location.href = '/';
      } else {
        const error = await response.json();
        console.error('Failed to log out:', error);
        // Reset loading state on error
        updateAuthState({ loading: false });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Reset loading state on error
      updateAuthState({ loading: false });
    }
  };

  // Don't render children until we have completed initial auth check
  if (!authState.initialized) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading: authState.loading,
        logout,
        refreshAuth 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * @returns {Object} Authentication state and actions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 