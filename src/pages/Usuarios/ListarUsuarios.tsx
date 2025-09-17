import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { userService, SystemUser } from '../../services/userService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

const ListarUsuarios: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar a lista de usuários. Tente novamente.');
    } finally {
      setLoading(false);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'operador':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Estabelecimento':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Atendente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadUsers}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Usuários do Sistema</h1>
        </div>
        <Link to="/usuarios/cadastrar">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Cadastrar Usuário</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Admins Gerais</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role_name === 'Administrator').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Estabelecimentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role_name === 'Estabelecimento').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Atendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role_name === 'Atendente').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lista de Usuários</h3>
        </div>
        <div className="p-6">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
              <Link to="/usuarios/cadastrar">
                <Button className="mt-4">
                  Cadastrar Primeiro Usuário
                </Button>
              </Link>
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ/Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          getRoleBadgeColor(user.role_name)
                        )}>
                          {user.role_name === 'Administrator' && 'Admin Geral'}
                          {user.role_name === 'admin' && 'Admin'}
                          {user.role_name === 'Estabelecimento' && 'Estabelecimento'}
                          {user.role_name === 'Atendente' && 'Atendente'}
                          {user.role_name === 'operador' && 'Operador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.user_type === 'Estabelecimento' ? (
                          <div className="text-xs">
                            {user.cnpj && <div><strong>CNPJ:</strong> {user.cnpj}</div>}
                            {user.telefone && <div><strong>Tel:</strong> {user.telefone}</div>}
                          </div>
                        ) : (
                          user.estabelecimento?.nome || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ListarUsuarios;
