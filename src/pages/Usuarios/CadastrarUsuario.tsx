import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { userService, CreateUserRequest } from '../../services/userService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

interface Estabelecimento {
  codigo: string;
  nome: string;
}

const CadastrarUsuario: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    estabelecimento_id: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEstabelecimentos, setLoadingEstabelecimentos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadEstabelecimentos();
  }, []);

  const loadEstabelecimentos = async () => {
    try {
      setLoadingEstabelecimentos(true);
      const data = await userService.getEstabelecimentos();
      setEstabelecimentos(data);
    } catch (err) {
      console.error('Erro ao carregar estabelecimentos:', err);
      setError('Erro ao carregar estabelecimentos. Tente novamente.');
    } finally {
      setLoadingEstabelecimentos(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      return 'Email é obrigatório';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Email inválido';
    }
    if (!formData.password) {
      return 'Senha é obrigatória';
    }
    if (formData.password.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    if (formData.password !== confirmPassword) {
      return 'Confirmação de senha não confere';
    }
    if (!formData.estabelecimento_id) {
      return 'Selecione um estabelecimento';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await userService.createUser(formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/usuarios/listar');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao cadastrar usuário:', err);
      setError(
        err.message || 'Erro ao cadastrar usuário. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Usuário cadastrado com sucesso!</h3>
          <p className="text-gray-600">Redirecionando para a lista de usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/usuarios/listar">
          <Button variant="secondary">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <UserPlusIcon className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Usuário</h1>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Informações do Usuário</h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo do usuário"
                disabled={loading}
                required
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                  'border-gray-300',
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                )}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite o email do usuário"
                disabled={loading}
                required
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                  'border-gray-300',
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                )}
              />
            </div>

            {/* Estabelecimento */}
            <div className="space-y-2">
              <label htmlFor="Estabelecimento" className="block text-sm font-medium text-gray-700">
                Estabelecimento *
              </label>
              {loadingEstabelecimentos ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm text-gray-500">Carregando estabelecimentos...</span>
                </div>
              ) : (
                <select
                  value={formData.estabelecimento_id}
                  onChange={(e) => handleInputChange('estabelecimento_id', e.target.value)}
                  disabled={loading}
                  required
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                    'border-gray-300',
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                  )}
                >
                  <option value="">Selecione um estabelecimento</option>
                  {estabelecimentos.map((estabelecimento) => (
                    <option key={estabelecimento.codigo} value={estabelecimento.codigo}>
                      {estabelecimento.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Digite a senha (mínimo 6 caracteres)"
                disabled={loading}
                required
                minLength={6}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                  'border-gray-300',
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                )}
              />
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                disabled={loading}
                required
                minLength={6}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                  'border-gray-300',
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                )}
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link to="/usuarios/listar">
                <Button variant="secondary" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading || loadingEstabelecimentos}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Usuário'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CadastrarUsuario;
