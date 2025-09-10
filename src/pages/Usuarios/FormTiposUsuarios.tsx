import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { userTypesService, CreateUserTypeRequest, UpdateUserTypeRequest, UserType } from '../../services/userTypesService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

const FormTiposUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    role_name: '',
    role_display_name: '',
    description: '',
    permissions: {
      all: false,
      manage_own_establishment: false,
      manage_orders: false,
      manage_products: false,
      manage_staff: false,
      view_orders: false,
      update_orders: false,
      manage_customers: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [originalData, setOriginalData] = useState<UserType | null>(null);
  
  const { isAdmin } = useAuth();
  const { theme } = useTheme();

  // Redirecionar se não for admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
  }, [isAdmin, navigate]);

  // Carregar dados para edição
  useEffect(() => {
    if (isEditing && id) {
      loadUserType(parseInt(id));
    }
  }, [isEditing, id]);

  const loadUserType = async (typeId: number) => {
    try {
      setLoadingData(true);
      const userType = await userTypesService.getUserTypeById(typeId);
      
      if (!userType) {
        setError('Tipo de usuário não encontrado');
        return;
      }
      
      setOriginalData(userType);
      setFormData({
        role_name: userType.role_name,
        role_display_name: userType.role_display_name,
        description: userType.description || '',
        permissions: {
          all: userType.permissions?.all || false,
          manage_own_establishment: userType.permissions?.manage_own_establishment || false,
          manage_orders: userType.permissions?.manage_orders || false,
          manage_products: userType.permissions?.manage_products || false,
          manage_staff: userType.permissions?.manage_staff || false,
          view_orders: userType.permissions?.view_orders || false,
          update_orders: userType.permissions?.update_orders || false,
          manage_customers: userType.permissions?.manage_customers || false
        }
      });
    } catch (err: any) {
      console.error('Erro ao carregar tipo de usuário:', err);
      setError(err.message || 'Erro ao carregar dados do tipo de usuário');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('permissions.')) {
      const permissionKey = field.replace('permissions.', '');
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.role_display_name.trim()) {
      return 'Nome de exibição é obrigatório';
    }
    if (!formData.role_name.trim()) {
      return 'Nome interno é obrigatório';
    }
    if (!/^[a-z_]+$/.test(formData.role_name)) {
      return 'Nome interno deve conter apenas letras minúsculas e underscores';
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
      
      const permissions = Object.keys(formData.permissions)
        .filter(key => formData.permissions[key as keyof typeof formData.permissions])
        .reduce((acc, key) => ({ ...acc, [key]: true }), {});
      
      if (isEditing && id) {
        const updateData: UpdateUserTypeRequest = {
          role_display_name: formData.role_display_name,
          description: formData.description || undefined,
          permissions: Object.keys(permissions).length > 0 ? permissions : undefined
        };
        
        await userTypesService.updateUserType(parseInt(id), updateData);
      } else {
        const createData: CreateUserTypeRequest = {
          role_name: formData.role_name,
          role_display_name: formData.role_display_name,
          description: formData.description || undefined,
          permissions: Object.keys(permissions).length > 0 ? permissions : undefined
        };
        
        await userTypesService.createUserType(createData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/usuarios/tipos');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao salvar tipo de usuário:', err);
      setError(err.message || 'Erro ao salvar tipo de usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isSystemRole = (roleName: string) => {
    return ['admin_geral', 'estabelecimento', 'atendente'].includes(roleName);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tipo de usuário {isEditing ? 'atualizado' : 'criado'} com sucesso!
          </h3>
          <p className="text-gray-600">Redirecionando para a lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/usuarios/tipos">
          <Button variant="secondary">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Editar informações' : 'Informações do tipo'}
          </h3>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome de Exibição */}
              <div className="space-y-2">
                <label htmlFor="role_display_name" className="block text-sm font-medium text-gray-700">
                  Nome de Exibição *
                </label>
                <input
                  id="role_display_name"
                  type="text"
                  value={formData.role_display_name}
                  onChange={(e) => handleInputChange('role_display_name', e.target.value)}
                  placeholder="Ex: Gerente de Vendas"
                  disabled={loading}
                  required
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                    'border-gray-300',
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                  )}
                />
              </div>

              {/* Nome Interno */}
              <div className="space-y-2">
                <label htmlFor="role_name" className="block text-sm font-medium text-gray-700">
                  Nome Interno * 
                  <span className="text-xs text-gray-500">(apenas minúsculas e _)</span>
                </label>
                <input
                  id="role_name"
                  type="text"
                  value={formData.role_name}
                  onChange={(e) => handleInputChange('role_name', e.target.value.toLowerCase())}
                  placeholder="Ex: gerente_vendas"
                  disabled={loading || (isEditing && isSystemRole(originalData?.role_name || ''))}
                  required
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                    'border-gray-300',
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900',
                    (isEditing && isSystemRole(originalData?.role_name || '')) && 'opacity-50 cursor-not-allowed'
                  )}
                />
                {isEditing && isSystemRole(originalData?.role_name || '') && (
                  <p className="text-xs text-gray-500">Nome interno não pode ser alterado em tipos do sistema</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva as responsabilidades e características deste tipo de usuário..."
                disabled={loading}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500',
                  'border-gray-300',
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900'
                )}
              />
            </div>

            {/* Permissões */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Permissões</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Acesso Total */}
                <div className="col-span-full">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.all}
                      onChange={(e) => handleInputChange('permissions.all', e.target.checked)}
                      disabled={loading}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">Acesso Total ao Sistema</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-7">Concede todas as permissões disponíveis</p>
                </div>

                {!formData.permissions.all && (
                  <>
                    {/* Gerenciamento */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700">Gerenciamento</h5>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.manage_own_establishment}
                          onChange={(e) => handleInputChange('permissions.manage_own_establishment', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Gerenciar Estabelecimento</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.manage_orders}
                          onChange={(e) => handleInputChange('permissions.manage_orders', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Gerenciar Pedidos</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.manage_products}
                          onChange={(e) => handleInputChange('permissions.manage_products', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Gerenciar Produtos</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.manage_staff}
                          onChange={(e) => handleInputChange('permissions.manage_staff', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Gerenciar Funcionários</span>
                      </label>
                    </div>

                    {/* Visualização e Ações */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700">Visualização e Ações</h5>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.view_orders}
                          onChange={(e) => handleInputChange('permissions.view_orders', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Visualizar Pedidos</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.update_orders}
                          onChange={(e) => handleInputChange('permissions.update_orders', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Atualizar Pedidos</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.manage_customers}
                          onChange={(e) => handleInputChange('permissions.manage_customers', e.target.checked)}
                          disabled={loading}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900">Gerenciar Clientes</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link to="/usuarios/tipos">
                <Button variant="secondary" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Atualizando...' : 'Criando...'}
                  </>
                ) : (
                  isEditing ? 'Atualizar Tipo' : 'Criar Tipo'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default FormTiposUsuarios;