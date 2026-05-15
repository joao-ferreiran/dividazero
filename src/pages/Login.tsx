import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError('E-mail ou senha inválidos.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-primary font-bold text-4xl tracking-tight">DívidaZero</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Controle suas dívidas com inteligência.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-outline-variant shadow-lg p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-on-surface mb-2">Entrar</h2>
          <p className="text-on-surface-variant text-sm mb-8">Acesse sua conta para gerenciar suas dívidas.</p>

          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
              <Lock size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant" htmlFor="email">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant" htmlFor="password">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={22} /> Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-on-surface-variant text-xs mt-8">
          Seus dados financeiros estão seguros e criptografados.
        </p>
      </div>
    </div>
  );
}
