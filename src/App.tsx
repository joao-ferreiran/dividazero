import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DebtList from './pages/DebtList';
import Reports from './pages/Reports';
import AddDebt from './pages/AddDebt';
import { DebtProvider } from './contexts/DebtContext';

export default function App() {
  return (
    <DebtProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dividas" element={<DebtList />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/adicionar" element={<AddDebt />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DebtProvider>
  );
}

