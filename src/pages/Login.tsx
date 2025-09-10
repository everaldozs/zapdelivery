import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import { clsx } from 'clsx';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  TruckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Função para obter rota padrão baseada no role
  const getDefaultRouteForRole = (profile: any) => {
    if (!profile) return '/dashboard';
    
    switch (profile.role_name) {
      case 'Administrator':
        return '/dashboard';
      case 'Estabelecimento':
        return '/dashboard';
      case 'Atendente':
        return '/pedidos';
      default:
        return '/dashboard';
    }
  };
  
  // Redirecionar se já estiver logado - AGUARDAR PROFILE
  useEffect(() => {
    console.log('🔄 [Login] useEffect - User:', !!user, 'Profile:', !!profile, 'AuthLoading:', authLoading);
    
    // AGUARDAR USER + PROFILE + AUTH_LOADING FINALIZADO
    if (user && profile && !authLoading) {
      console.log('✅ [Login] Redirecionando - User e Profile carregados');
      const targetRoute = location.state?.from?.pathname || getDefaultRouteForRole(profile);
      console.log('🎯 [Login] Rota de destino:', targetRoute);
      navigate(targetRoute, { replace: true });
    }
  }, [user, profile, authLoading, navigate, location]);
  
  // Validação de campos
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.');
        } else {
          setError(signInError.message || 'Erro ao fazer login. Tente novamente.');
        }
        return;
      }
      
      if (data?.user) {
        console.log('✅ [Login] Sucesso do signIn - aguardando profile');
        setSuccess('Login realizado com sucesso! Aguarde o carregamento...');
        
        // NÃO REDIRECIONAR AQUI - deixar o useEffect cuidar disso
        // Aguardar o AuthContext carregar o profile automaticamente
        
        // Fallback mais longo para casos extremos
        setTimeout(() => {
          console.log('⚠️ [Login] Fallback - verificando estado após 5s');
          // Redirecionar mesmo sem profile se usuário está logado há muito tempo
          if (data.user && !profile) {
            console.log('🚨 [Login] Fallback: redirecionando sem profile');
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
          }
        }, 5000); // Aumentei para 5 segundos
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erros quando o usuário começar a digitar
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleTestData = () => {
    setFormData({
      email: 'admin@zapdelivery.com',
      password: 'admin123'
    });
    setErrors({});
    setError('');
    setSuccess('');
  };

  // Loading da autenticação ou redirecionamento - VERSÃO MELHORADA
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }
  
  // Se user E profile estão carregados, mostrar loading de redirecionamento
  if (user && profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8',
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-green-50 via-blue-50 to-green-50'
    )}>
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <TruckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className={clsx(
            'mt-6 text-3xl font-bold tracking-tight',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Zap Delivery
          </h2>
          <p className={clsx(
            'mt-2 text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Faça login para acessar o painel administrativo
          </p>
        </div>

        {/* Formulário */}
        <div className={clsx(
          'bg-white rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-sm',
          theme === 'dark' && 'bg-gray-800/90 border border-gray-700'
        )}>
          {/* Alertas */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Erro de Login</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Sucesso!</p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">{success}</p>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className={clsx(
                    'h-5 w-5',
                    errors.email
                      ? 'text-red-400'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  )} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={clsx(
                    'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200',
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={clsx(
                    'h-5 w-5',
                    errors.password
                      ? 'text-red-400'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  )} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={clsx(
                    'w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200',
                    errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className={clsx(
                      'h-5 w-5',
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-500'
                    )} />
                  ) : (
                    <EyeIcon className={clsx(
                      'h-5 w-5',
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-500'
                    )} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Checkbox Lembrar-me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className={clsx(
                  'ml-2 text-sm',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Lembrar de mim
                </label>
              </div>
              <button
                type="button"
                className={clsx(
                  'text-sm font-medium transition-colors duration-200',
                  theme === 'dark'
                    ? 'text-green-400 hover:text-green-300'
                    : 'text-green-600 hover:text-green-500'
                )}
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base font-medium transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Seção de desenvolvimento */}
          <div className="space-y-4">
            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={clsx(
                  'w-full border-t',
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                )} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={clsx(
                  'px-2 text-xs',
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-white text-gray-500'
                )}>
                  Para desenvolvimento
                </span>
              </div>
            </div>

            {/* Botão de dados de teste */}
            <Button
              type="button"
              variant="secondary"
              className="w-full py-2 text-sm"
              onClick={handleTestData}
              disabled={isLoading}
            >
              Preencher dados de teste
            </Button>
            
            <p className={clsx(
              'text-xs text-center',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              Email: admin@zapdelivery.com | Senha: admin123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className={clsx(
            'text-xs',
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          )}>
            © 2025 Zap Delivery. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;