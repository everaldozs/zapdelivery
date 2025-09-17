import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Empresa, EmpresaStats, EmpresaFormData, empresasService } from '../services/empresasService';

const ListarEmpresas: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estatisticas, setEstatisticas] = useState<EmpresaStats>({
    total: 0,
    ativas: 0,
    inativas: 0,
    cidadesAtendidas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para edição inline
  const [empresaEdicao, setEmpresaEdicao] = useState<string | null>(null);
  const [dadosEdicao, setDadosEdicao] = useState<Partial<EmpresaFormData>>({});
  
  // Estados para confirmação de exclusão
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [loadingExclusao, setLoadingExclusao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [profile]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [empresasData, statsData] = await Promise.all([
        empresasService.listarEmpresas(profile),
        empresasService.obterEstatisticas(profile)
      ]);
      
      setEmpresas(empresasData);
      setEstatisticas(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const abrirNovaEmpresa = () => {
    navigate('/empresas/cadastrar');
  };

  const iniciarEdicao = (empresa: Empresa) => {
    setEmpresaEdicao(empresa.id);
    setDadosEdicao({
      nome: empresa.nome,
      email: empresa.email,
      telefone: empresa.telefone,
      status: empresa.status
    });
  };

  const cancelarEdicao = () => {
    setEmpresaEdicao(null);
    setDadosEdicao({});
  };

  const salvarEdicao = async () => {
    if (!empresaEdicao || !dadosEdicao.nome?.trim()) return;
    
    try {
      const empresaOriginal = empresas.find(e => e.id === empresaEdicao);
      if (!empresaOriginal) return;
      
      const dadosCompletos: EmpresaFormData = {
        ...empresaOriginal,
        ...dadosEdicao
      } as EmpresaFormData;
      
      const empresaAtualizada = await empresasService.atualizarEmpresa(
        empresaEdicao, 
        dadosCompletos, 
        profile
      );
      
      setEmpresas(prev => 
        prev.map(e => e.id === empresaEdicao ? empresaAtualizada : e)
      );
      
      setEmpresaEdicao(null);
      setDadosEdicao({});
      
      // Recarregar estatísticas
      const novasStats = await empresasService.obterEstatisticas(profile);
      setEstatisticas(novasStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar empresa');
    }
  };

  const confirmarExclusao = (empresa: Empresa) => {
    setEmpresaParaExcluir(empresa);
    setModalExclusao(true);
  };

  const handleExcluirEmpresa = async () => {
    if (!empresaParaExcluir) return;
    
    try {
      setLoadingExclusao(true);
      await empresasService.excluirEmpresa(empresaParaExcluir.id, profile);
      
      setEmpresas(prev => prev.filter(e => e.id !== empresaParaExcluir.id));
      setModalExclusao(false);
      setEmpresaParaExcluir(null);
      
      // Recarregar estatísticas
      const novasStats = await empresasService.obterEstatisticas(profile);
      setEstatisticas(novasStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir empresa');
    } finally {
      setLoadingExclusao(false);
      setModalExclusao(false);
      setEmpresaParaExcluir(null);
    }
  };

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm) ||
    empresa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.endereco_cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleInputEdicao = (field: keyof EmpresaFormData, value: string) => {
    setDadosEdicao(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className={clsx(
          'text-lg',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          Carregando empresas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Listar Empresas
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Gerencie todas as empresas cadastradas ({empresasFiltradas.length} encontradas)
          </p>
        </div>
        <Button variant="primary" onClick={abrirNovaEmpresa}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            )}>
              {estatisticas.total}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Total de Empresas
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            )}>
              {estatisticas.ativas}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Empresas Ativas
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            )}>
              {estatisticas.inativas}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Empresas Inativas
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
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
                placeholder="Buscar por nome, CNPJ, email ou cidade..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Filtrar</Button>
            <Button variant="secondary">Exportar</Button>
          </div>
        </div>
      </Card>

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

      {/* Tabela */}
      <Card>
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
                  Empresa
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  CNPJ
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
                  Status
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Criada em
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
              {empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className={clsx(
                    'py-8 px-4 text-center',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    <div className="flex flex-col items-center gap-4">
                      <BuildingOffice2Icon className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium mb-2">
                          {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
                        </p>
                        <p className="text-sm">
                          {searchTerm 
                            ? 'Tente ajustar os termos da busca.'
                            : 'Comece criando sua primeira empresa.'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((empresa) => (
                  <tr key={empresa.id} className={clsx(
                    'border-b transition-colors',
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <td className="py-3 px-4">
                      {empresaEdicao === empresa.id ? (
                        <input
                          type="text"
                          value={dadosEdicao.nome || ''}
                          onChange={(e) => handleInputEdicao('nome', e.target.value)}
                          className={clsx(
                            'w-full px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent',
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          )}
                          maxLength={255}
                          autoFocus
                        />
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <BuildingOffice2Icon className="h-4 w-4 text-blue-500" />
                            <p className={clsx(
                              'font-medium',
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            )}>
                              {empresa.nome}
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className={clsx(
                      'py-3 px-4 text-sm font-mono',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {empresa.cnpj}
                    </td>
                    <td className="py-3 px-4">
                      {empresaEdicao === empresa.id ? (
                        <div className="space-y-1">
                          <input
                            type="email"
                            value={dadosEdicao.email || ''}
                            onChange={(e) => handleInputEdicao('email', e.target.value)}
                            className={clsx(
                              'w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent',
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            )}
                            maxLength={255}
                          />
                          <input
                            type="text"
                            value={dadosEdicao.telefone || ''}
                            onChange={(e) => handleInputEdicao('telefone', e.target.value)}
                            className={clsx(
                              'w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent',
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            )}
                            maxLength={20}
                          />
                        </div>
                      ) : (
                        <div>
                          <p className={clsx(
                            'text-sm',
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          )}>
                            {empresa.email}
                          </p>
                          <p className={clsx(
                            'text-sm',
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          )}>
                            {empresa.telefone}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className={clsx(
                      'py-3 px-4 text-sm',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      <div>
                        <p>{empresa.endereco_cidade}</p>
                        <p className={clsx(
                          'text-xs',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        )}>
                          {empresa.endereco_estado}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {empresaEdicao === empresa.id ? (
                        <select
                          value={dadosEdicao.status || empresa.status}
                          onChange={(e) => handleInputEdicao('status', e.target.value as 'Ativo' | 'Inativo')}
                          className={clsx(
                            'px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent',
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          )}
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      ) : (
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          empresa.status === 'Ativo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        )}>
                          {empresa.status}
                        </span>
                      )}
                    </td>
                    <td className={clsx(
                      'py-3 px-4 text-sm',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {formatarData(empresa.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {empresaEdicao === empresa.id ? (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={salvarEdicao}
                            disabled={!dadosEdicao.nome?.trim()}
                            title="Salvar"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={cancelarEdicao}
                            title="Cancelar"
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" title="Visualizar">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Editar"
                            onClick={() => iniciarEdicao(empresa)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            title="Excluir"
                            onClick={() => confirmarExclusao(empresa)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
        title="Excluir Empresa"
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
                Tem certeza que deseja excluir a empresa "{empresaParaExcluir?.nome}"?
              </p>
              <p className={clsx(
                'text-xs mt-2',
                theme === 'dark' ? 'text-red-300' : 'text-red-700'
              )}>
                CNPJ: {empresaParaExcluir?.cnpj}
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
              variant="primary" 
              onClick={handleExcluirEmpresa}
              disabled={loadingExclusao}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loadingExclusao ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Excluindo...</span>
                </div>
              ) : (
                'Excluir Empresa'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListarEmpresas;
