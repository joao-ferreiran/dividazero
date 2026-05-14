import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, LayoutDashboard, ListTodo, PlusCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dividas', label: 'Dívidas', icon: ListTodo },
  { path: '/adicionar', label: 'Adicionar', icon: PlusCircle },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-outline-variant h-16 flex items-center px-4 md:px-8 justify-between">
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

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-24 md:pb-8 container mx-auto px-4 max-w-[1200px]">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-outline-variant md:hidden flex justify-around items-center px-2 pb-safe shadow-[0_-2px-10px_rgba(0,0,0,0.05)]">
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
