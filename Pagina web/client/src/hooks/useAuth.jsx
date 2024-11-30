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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract the fetch auth status logic into a named function
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
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  // Update refreshAuth to use the fetchAuthStatus function
  const refreshAuth = async () => {
    setLoading(true);
    await fetchAuthStatus();
  };

  /**
   * Logs out the user by calling the logout API endpoint
   */
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Send an empty object to avoid the empty body error
        body: JSON.stringify({})
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/';
      } else {
        const error = await response.json();
        console.error('Failed to log out:', error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, logout, refreshAuth }}>
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