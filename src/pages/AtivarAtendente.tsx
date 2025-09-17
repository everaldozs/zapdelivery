import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import { clsx } from 'clsx';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface FormData {
  senha: string;
  confirmarSenha: string;
}

interface ConviteInfo {
  email: string;
  nome_convidado: string;
  estabelecimento_nome?: string;
  expires_at: string;
  valid: boolean;
}

const AtivarAtendente: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [conviteInfo, setConviteInfo] = useState<ConviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    senha: '',
    confirmarSenha: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido');
      setIsLoading(false);
      return;
    }

    // Validar token via API real
    const validateToken = async () => {
      try {
        const response = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/sistema-convites?action=validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          setConviteInfo({
            email: result.data.email,
            nome_convidado: result.data.nome_convidado,
            estabelecimento_nome: result.data.estabelecimento_nome,
            expires_at: result.data.expires_at,
            valid: true
          });
        } else {
          setError(result.error || 'Token inválido ou expirado');
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
        setError('Erro ao validar convite');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'Senhas não coincidem';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/sistema-convites?action=activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          senha: formData.senha
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Erro ao ativar conta');
      }
      
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConviteExpirado = () => {
    if (!conviteInfo) return false;
    return new Date(conviteInfo.expires_at) < new Date();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={clsx(
        'min-h-screen flex items-center justify-center p-4',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Validando convite...
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className={clsx(
        'min-h-screen flex items-center justify-center p-4',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'
      )}>
        <div className={clsx(
          'max-w-md w-full text-center p-8 rounded-2xl shadow-xl',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}>
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className={clsx(
            'text-2xl font-bold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Conta Ativada!
          </h2>
          <p className={clsx(
            'mb-6 text-sm',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Sua conta de atendente foi ativada com sucesso! Você já pode fazer login no sistema.
          </p>
          <Button
            onClick={() => navigate('/login')}
            variant="primary"
            className="w-full"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  // Error state (token inválido, expirado, etc.)
  if (!conviteInfo || !conviteInfo.valid || isConviteExpirado()) {
    return (
      <div className={clsx(
        'min-h-screen flex items-center justify-center p-4',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-red-50 to-orange-50'
      )}>
        <div className={clsx(
          'max-w-md w-full text-center p-8 rounded-2xl shadow-xl',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}>
          <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className={clsx(
            'text-2xl font-bold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Convite Inválido
          </h2>
          <p className={clsx(
            'mb-6 text-sm',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            {isConviteExpirado() 
              ? 'Este convite expirou. Entre em contato com o administrador do estabelecimento para solicitar um novo convite.'
              : error || 'Este link de convite é inválido ou já foi usado. Verifique o link ou entre em contato com quem enviou o convite.'
            }
          </p>
          <Button
            onClick={() => navigate('/login')}
            variant="secondary"
            className="w-full"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className={clsx(
      'min-h-screen flex items-center justify-center p-4',
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'
    )}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <TruckIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className={clsx(
            'text-3xl font-bold mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Ativar Conta de Atendente
          </h1>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Configure sua senha para acessar o sistema
          </p>
        </div>

        {/* Convite Info */}
        <div className={clsx(
          'bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500',
          theme === 'dark' && 'bg-gray-800'
        )}>
          <div className="flex items-start gap-4">
            <div className={clsx(
              'p-2 rounded-lg',
              'bg-green-100 dark:bg-green-900'
            )}>
              <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className={clsx(
                'font-semibold mb-1',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Olá, {conviteInfo.nome_convidado}!
              </h3>
              <p className={clsx(
                'text-sm mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                Você foi convidado para ser atendente em:
              </p>
              <p className={clsx(
                'font-medium text-green-600 dark:text-green-400',
                'text-sm'
              )}>
                {conviteInfo.estabelecimento_nome || 'Estabelecimento'}
              </p>
              <div className={clsx(
                'flex items-center gap-2 mt-3 text-xs',
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              )}>
                <ClockIcon className="h-4 w-4" />
                <span>Email: {conviteInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={clsx(
          'bg-white rounded-2xl shadow-xl p-8',
          theme === 'dark' && 'bg-gray-800'
        )}>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Criar Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                    formErrors.senha
                      ? 'border-red-300 focus:ring-red-500'
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300'
                  )}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {formErrors.senha && (
                <p className="mt-1 text-sm text-red-600">{formErrors.senha}</p>
              )}
            </div>

            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                    formErrors.confirmarSenha
                      ? 'border-red-300 focus:ring-red-500'
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300'
                  )}
                  placeholder="Confirme sua senha"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {formErrors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmarSenha}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-3 text-base font-medium transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ativando Conta...</span>
                </div>
              ) : (
                'Ativar Conta'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className={clsx(
              'text-xs',
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            )}>
              Ao ativar sua conta, você concorda com os termos de uso do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtivarAtendente;