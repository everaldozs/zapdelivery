import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { Cliente, ClienteStats, clientesService } from '../services/clientesService';

const ListarClientes: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [estatisticas, setEstatisticas] = useState<ClienteStats>({
    total: 0,
    ativos: 0,
    inativos: 0,
    cidadesAtendidas: 0,
    pedidosPorCliente: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para confirmação de exclusão
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [loadingExclusao, setLoadingExclusao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [profile]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clientesData, statsData] = await Promise.all([
        clientesService.listarClientes(profile),
        clientesService.obterEstatisticas(profile)
      ]);
      
      setClientes(clientesData);
      setEstatisticas(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const confirmarExclusao = (cliente: Cliente) => {
    setClienteParaExcluir(cliente);
    setModalExclusao(true);
  };

  const handleExcluirCliente = async () => {
    if (!clienteParaExcluir) return;
    
    try {
      setLoadingExclusao(true);
      await clientesService.excluirCliente(clienteParaExcluir.id, profile);
      
      setClientes(prev => prev.filter(c => c.id !== clienteParaExcluir.id));
      setModalExclusao(false);
      setClienteParaExcluir(null);
      
      // Recarregar estatísticas
      const novasStats = await clientesService.obterEstatisticas(profile);
      setEstatisticas(novasStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cliente');
    } finally {
      setLoadingExclusao(false);
      setModalExclusao(false);
      setClienteParaExcluir(null);
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className={clsx(
          'text-lg',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          Carregando clientes...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Listar Clientes
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Gerencie todos os clientes cadastrados ({clientesFiltrados.length} encontrados)
          </p>
        </div>
        <Button variant="primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            )}>
              {estatisticas.ativos}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Clientes Ativos
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            )}>
              {estatisticas.total}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Total de Clientes
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            )}>
              {estatisticas.inativos}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Clientes Inativos
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            )}>
              {estatisticas.cidadesAtendidas}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Cidades Atendidas
            </p>
          </div>
        </Card>
      </div>

      {error && (
        <Card padding="md">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erro</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-red-600 dark:text-red-400"
                onClick={() => setError(null)}
              >
                Dispensar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filtros */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className={clsx(
                'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={clsx(
                  'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Buscar por nome, email ou cidade..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Filtrar</Button>
            <Button variant="secondary">Exportar</Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={clsx(
                'border-b',
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              )}>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Cliente
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Contato
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Localização
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Pedidos
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Último Pedido
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Status
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className={clsx(
                    'py-8 px-4 text-center',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    <div className="flex flex-col items-center gap-4">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium mb-2">
                          {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                        </p>
                        <p className="text-sm">
                          {searchTerm 
                            ? 'Tente ajustar os termos da busca.'
                            : 'Comece criando seu primeiro cliente.'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className={clsx(
                  'border-b transition-colors',
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}>
                  <td className="py-3 px-4">
                    <div>
                      <p className={clsx(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {cliente.nome}
                      </p>
                      <p className={clsx(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        ID: {cliente.id}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className={clsx(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      )}>
                        {cliente.email}
                      </p>
                      <p className={clsx(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {cliente.telefone}
                      </p>
                    </div>
                  </td>
                  <td className={clsx(
                    'py-3 px-4',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    {cliente.cidade}
                  </td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'font-medium',
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    )}>
                      {cliente.totalPedidos}
                    </span>
                  </td>
                  <td className={clsx(
                    'py-3 px-4 text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    {formatarData(cliente.ultimoPedido)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      cliente.status === 'Ativo'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    )}>
                      {cliente.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" title="Visualizar">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Editar">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        title="Excluir"
                        onClick={() => confirmarExclusao(cliente)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={modalExclusao}
        onClose={() => setModalExclusao(false)}
        title="Excluir Cliente"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className={clsx(
                'font-medium',
                theme === 'dark' ? 'text-red-400' : 'text-red-800'
              )}>
                Atenção! Esta ação não pode ser desfeita.
              </p>
              <p className={clsx(
                'text-sm mt-1',
                theme === 'dark' ? 'text-red-300' : 'text-red-700'
              )}>
                Tem certeza que deseja excluir o cliente "{clienteParaExcluir?.nome}"?
              </p>
              <p className={clsx(
                'text-xs mt-2',
                theme === 'dark' ? 'text-red-300' : 'text-red-700'
              )}>
                Email: {clienteParaExcluir?.email}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setModalExclusao(false)}
              disabled={loadingExclusao}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleExcluirCliente}
              disabled={loadingExclusao}
            >
              {loadingExclusao ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Excluindo...</span>
                </div>
              ) : (
                'Excluir Cliente'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListarClientes;
