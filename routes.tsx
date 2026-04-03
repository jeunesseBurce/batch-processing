import { createBrowserRouter, Outlet } from 'react-router';
import { DashboardLayout } from './pages/dashboard';
import DashboardPage from './pages/dashboard-page';
import TransactionsPage from './pages/transactions-page';
import AnalyticsPage from './pages/analytics-page';
import { Navigate } from 'react-router';

function RootLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);