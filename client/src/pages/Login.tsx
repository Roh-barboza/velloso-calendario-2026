import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular delay de autenticação
    setTimeout(() => {
      setIsLoading(false);
      navigate('/intranet');
    }, 1000);
  };

  const handleForgotPassword = () => {
    // TODO: Implementar fluxo de recuperação de senha
    alert('Funcionalidade de recuperação de senha em breve!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/globo_transparent_214d48ec.png" 
              alt="Globo Velloso" 
              className="h-16 w-auto"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-2">VELLOSO</h1>
          <p className="text-sm text-muted-foreground tracking-widest mb-8">CIDADANIA</p>
          
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-8"></div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>
          <p className="text-muted-foreground">Acesse sua conta para continuar</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-white accent-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">Lembrar-me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Esqueci a senha
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Alternative Login */}
        <button
          type="button"
          className="w-full py-3 bg-white border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all duration-200"
        >
          Entrar com Google
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Solicite acesso
            </button>
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Velloso Cidadania. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right side decoration (visible on larger screens) */}
      <div className="hidden lg:flex absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent -z-10"></div>
    </div>
  );
}
