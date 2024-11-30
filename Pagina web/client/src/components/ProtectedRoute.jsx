import { useAuth } from '../hooks/useAuth.jsx';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

/**
 * ProtectedRoute component to guard protected pages
 * @param {Object} props - React props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} Rendered child components or redirects
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute; 