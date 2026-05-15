import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, ListTodo, PlusCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dividas', label: 'Dívidas', icon: ListTodo },
  { path: '/adicionar', label: 'Adicionar', icon: PlusCircle },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const userName = (user?.user_metadata?.name as string) || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="print:hidden fixed top-0 w-full z-50 bg-white border-b border-outline-variant h-16 flex items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-primary font-bold text-2xl tracking-tight">
            DívidaZero
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 h-full">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  location.pathname === item.path 
                    ? "text-primary" 
                    : "text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm font-medium text-on-surface-variant">Olá, <span className="font-bold text-on-surface">{userName}</span></span>
          <button 
            onClick={signOut}
            className="p-2 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors" 
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-24 md:pt-24 md:pb-8 container mx-auto px-4 max-w-[1200px] print:pt-0 print:pb-0">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="print:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-outline-variant md:hidden flex justify-around items-center px-2 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all",
                isActive 
                  ? "bg-secondary-container text-on-secondary-container scale-105" 
                  : "text-on-surface-variant"
              )}
            >
              <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
