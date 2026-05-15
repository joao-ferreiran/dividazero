import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DebtList from './pages/DebtList';
import Reports from './pages/Reports';
import AddDebt from './pages/AddDebt';
import Login from './pages/Login';
import { DebtProvider } from './contexts/DebtContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <DebtProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dividas" element={<DebtList />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/adicionar" element={<AddDebt />} />
          <Route path="/editar/:id" element={<AddDebt />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </DebtProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
