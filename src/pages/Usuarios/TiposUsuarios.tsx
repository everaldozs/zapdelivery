import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ShieldCheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { userTypesService, UserType } from '../../services/userTypesService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

interface UserTypeWithStats extends UserType {
  user_count?: number;
}

const TiposUsuarios: React.FC = () => {
  const [userTypes, setUserTypes] = useState<UserTypeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete'>('create');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { isAdmin } = useAuth();
  const { theme } = useTheme();

  // Redirecionar se não for admin
  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/dashboard';
      return;
    }
  }, [isAdmin]);

  useEffect(() => {
    loadUserTypes();
  }, []);

  const loadUserTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro tentar apenas carregar os tipos básicos
      const types = await userTypesService.getUserTypes();
      
      // Depois tentar carregar estatísticas (se der erro, continuar sem)
      let stats: any[] = [];
      try {
        stats = await userTypesService.getUserTypeUsageStats();
      } catch (statsError) {
        console.warn('Erro ao carregar estatísticas, continuando sem elas:', statsError);
      }
      
      // Combinar dados dos tipos com estatísticas de uso
      const typesWithStats = types.map(type => {
        const stat = stats.find(s => s.id === type.id);
        return {
          ...type,
          user_count: stat?.user_count || 0
        };
      });
      
      setUserTypes(typesWithStats);
    } catch (err: any) {
      console.error('Erro ao carregar tipos de usuários:', err);
      const errorMsg = err?.message || 'Erro ao carregar a lista de tipos de usuários. Tente novamente.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userType: UserType) => {
    setSelectedType(userType);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedType) return;
    
    try {
      setDeleteLoading(true);
      await userTypesService.deleteUserType(selectedType.id);
      setShowModal(false);
      setSelectedType(null);
      await loadUserTypes(); // Recarregar a lista
    } catch (err: any) {
      console.error('Erro ao deletar tipo de usuário:', err);
      setError(err.message || 'Erro ao deletar tipo de usuário. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionSummary = (permissions: Record<string, any> | null) => {
    if (!permissions) return 'Nenhuma permissão definida';
    
    if (permissions.all) return 'Acesso total';
    
    const permissionLabels = {
      manage_own_establishment: 'Gerenciar estabelecimento',
      manage_orders: 'Gerenciar pedidos',
      manage_products: 'Gerenciar produtos',
      manage_staff: 'Gerenciar funcionários',
      view_orders: 'Visualizar pedidos',
      update_orders: 'Atualizar pedidos',
      manage_customers: 'Gerenciar clientes'
    };
    
    const activePermissions = Object.keys(permissions)
      .filter(key => permissions[key] === true)
      .map(key => permissionLabels[key as keyof typeof permissionLabels] || key)
      .filter(Boolean);
    
    return activePermissions.length > 0 ? activePermissions.slice(0, 2).join(', ') + 
      (activePermissions.length > 2 ? ` e mais ${activePermissions.length - 2}` : '') 
      : 'Nenhuma permissão ativa';
  };

  const isSystemRole = (roleName: string) => {
    return ['admin_geral', 'estabelecimento', 'atendente'].includes(roleName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tipos de usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Usuários</h1>
        </div>
        <Link to="/usuarios/tipos/novo">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Novo Tipo</span>
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <Button 
            onClick={() => setError(null)} 
            variant="secondary" 
            className="mt-2 text-sm"
          >
            Dispensar
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Tipos</p>
              <p className="text-2xl font-bold text-gray-900">{userTypes.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tipos do Sistema</p>
              <p className="text-2xl font-bold text-gray-900">
                {userTypes.filter(ut => isSystemRole(ut.role_name)).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tipos Customizados</p>
              <p className="text-2xl font-bold text-gray-900">
                {userTypes.filter(ut => !isSystemRole(ut.role_name)).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* User Types Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lista de Tipos de Usuários</h3>
        </div>
        <div className="p-6">
          {userTypes.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum tipo de usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuários
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userTypes.map((userType) => (
                    <tr key={userType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userType.role_display_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userType.role_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {userType.description || 'Sem descrição'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {getPermissionSummary(userType.permissions)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {userType.user_count || 0} usuário(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userType.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link to={`/usuarios/tipos/${userType.id}/editar`}>
                            <Button variant="secondary" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!isSystemRole(userType.role_name) && (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleDelete(userType)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showModal && modalType === 'delete' && selectedType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o tipo de usuário <strong>"{selectedType.role_display_name}"</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiposUsuarios;