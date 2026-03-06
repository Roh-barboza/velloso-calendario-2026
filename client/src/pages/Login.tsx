import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulação de login
    setTimeout(() => {
      setIsLoading(false);
      // Aqui você conectaria com a autenticação real
      console.log('Login:', { email, password, rememberMe });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f6] via-white to-[#f5ede8] flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#592343]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00924a]/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/globo_transparente_b89ad2b6.png"
              alt="Globo Velloso"
              className="h-16 w-auto"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(89, 35, 67, 0.1))' }}
            />
          </div>
          <h1 className="text-4xl font-bold text-[#592343] mb-1">VELLOSO</h1>
          <p className="text-sm tracking-widest text-[#8b6b7d]">CIDADANIA</p>
          <p className="text-slate-500 text-sm mt-4">Painel de Acesso Interno</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#592343]/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#592343] focus:border-transparent bg-slate-50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#592343]/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#592343] focus:border-transparent bg-slate-50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#592343] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#592343] focus:ring-[#592343] cursor-pointer"
                />
                <span className="text-slate-600">Lembrar-me</span>
              </label>
              <a href="#" className="text-[#592343] hover:text-[#4a1d35] font-semibold transition-colors">
                Esqueci a senha
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#592343] to-[#7a2f52] hover:from-[#4a1d35] hover:to-[#6a2544] text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">ou</span>
            </div>
          </div>

          {/* OAuth Button */}
          <button
            type="button"
            className="w-full border-2 border-slate-200 hover:border-[#592343] text-slate-700 hover:text-[#592343] font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Globe className="w-5 h-5" />
            Entrar com Manus OAuth
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>
            Acesso restrito à equipe Velloso Cidadania.
            <br />
            Para suporte, entre em contato com o administrador.
          </p>
        </div>

        {/* Italian Flag Accent */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 rounded-full bg-green-600"></div>
          <div className="w-2 h-2 rounded-full bg-white border border-slate-200"></div>
          <div className="w-2 h-2 rounded-full bg-red-600"></div>
        </div>
      </div>
    </div>
  );
}
