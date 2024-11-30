import { createLazyFileRoute } from '@tanstack/react-router';
import ProtectedRoute from '../components/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute>
      <h1>Dashboard</h1>
    </ProtectedRoute>
  );
}

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardPage
}); 