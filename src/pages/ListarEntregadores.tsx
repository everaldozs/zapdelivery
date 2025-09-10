import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, UserIcon, PhoneIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { entregadoresService, EntregadorSimples } from '../services/entregadoresService';

const ListarEntregadores: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [entregadores, setEntregadores] = useState<EntregadorSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para confirmação de exclusão
  const [entregadorParaExcluir, setEntregadorParaExcluir] = useState<EntregadorSimples | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [loadingExclusao, setLoadingExclusao] = useState(false);

  const carregarEntregadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await entregadoresService.listarEntregadores(profile);
      setEntregadores(dados);
    } catch (err) {
      console.error('Erro ao carregar entregadores:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEntregadores();
  }, [profile]);

  const entregadoresFiltrados = entregadores.filter(entregador =>
    entregador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entregador.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const confirmarExclusao = (entregador: EntregadorSimples) => {
    setEntregadorParaExcluir(entregador);
    setModalExclusao(true);
  };

  const handleExcluirEntregador = async () => {
    if (!entregadorParaExcluir) return;
    
    try {
      setLoadingExclusao(true);
      await entregadoresService.excluirEntregador(entregadorParaExcluir.codigo, profile);
      
      setEntregadores(prev => prev.filter(e => e.codigo !== entregadorParaExcluir.codigo));
      setModalExclusao(false);
      setEntregadorParaExcluir(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir entregador');
    } finally {
      setLoadingExclusao(false);
      setModalExclusao(false);
      setEntregadorParaExcluir(null);
    }
  };

  const handleAlterarStatus = async (codigo: string, novoStatus: boolean) => {
    try {
      await entregadoresService.alterarStatus(codigo, novoStatus, profile);
      await carregarEntregadores();
      alert(`Entregador ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar status do entregador');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Carregando entregadores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={clsx(
          'text-red-500 text-center',
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        )}>
          <p>Erro ao carregar entregadores:</p>
          <p className="font-mono text-sm mt-2">{error}</p>
          <Button 
            onClick={carregarEntregadores}
            className="mt-4"
            variant="primary"
          >
            Tentar Novamente
          </Button>
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
            Listar Entregadores
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Gerencie todos os entregadores cadastrados ({entregadoresFiltrados.length} encontrados)
          </p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/entregadores/cadastrar'}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Entregador
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            )}>
              {entregadores.filter(e => e.ativo).length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Entregadores Ativos
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            )}>
              {entregadores.length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Total de Entregadores
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            )}>
              {entregadores.filter(e => !e.ativo).length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Inativos
            </p>
          </div>
        </Card>
      </div>

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
                placeholder="Buscar por nome ou telefone..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={carregarEntregadores}>Atualizar</Button>
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
                  Entregador
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
                  Data Cadastro
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
              {entregadoresFiltrados.map((entregador) => (
                <tr key={entregador.codigo} className={clsx(
                  'border-b transition-colors',
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={clsx(
                        'p-2 rounded-full',
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      )}>
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={clsx(
                          'font-medium',
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}>
                          {entregador.nome}
                        </p>
                        <p className={clsx(
                          'text-sm',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        )}>
                          ID: {entregador.codigo.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span className={clsx(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      )}>
                        {entregador.telefone || 'Não informado'}
                      </span>
                    </div>
                  </td>
                  <td className={clsx(
                    'py-3 px-4 text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    {formatarData(entregador.data_criacao)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleAlterarStatus(entregador.codigo, !entregador.ativo)}
                      className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium transition-colors',
                        entregador.ativo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                      )}
                      title={`Clique para ${entregador.ativo ? 'desativar' : 'ativar'}`}
                    >
                      {entregador.ativo ? 'Ativo' : 'Inativo'}
                    </button>
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
                        onClick={() => confirmarExclusao(entregador)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {entregadoresFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className={clsx(
                'text-gray-500',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                {searchTerm ? 'Nenhum entregador encontrado com os critérios de busca.' : 'Nenhum entregador cadastrado.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={modalExclusao}
        onClose={() => setModalExclusao(false)}
        title="Excluir Entregador"
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
                Tem certeza que deseja excluir o entregador "{entregadorParaExcluir?.nome}"?
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
              onClick={handleExcluirEntregador}
              disabled={loadingExclusao}
            >
              {loadingExclusao ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Excluindo...</span>
                </div>
              ) : (
                'Excluir Entregador'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListarEntregadores;
