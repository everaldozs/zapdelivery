import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProdutoModal from '../components/ui/ProdutoModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRoleCheck } from '../hooks/useAuthorization';
import { clsx } from 'clsx';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Produto, Categoria, produtosService } from '../services/produtosService';

const ListarProdutos: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { canManageProducts, isReadOnlyUser } = useRoleCheck();
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<'todos' | 'disponivel' | 'indisponivel'>('todos');
  
  // Estados do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEdicao, setProdutoEdicao] = useState<Produto | null>(null);
  
  // Estados para confirmação de exclusão
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [loadingExclusao, setLoadingExclusao] = useState(false);

  useEffect(() => {
    if (profile) {
      carregarDados();
    }
  }, [profile?.id, profile?.role_name]); // Dependências específicas

  const carregarDados = async () => {
    if (!profile) {
      console.log('Profile não disponível, aguardando...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando produtos e categorias...');
      const [produtosData, categoriasData] = await Promise.all([
        produtosService.listarProdutos(profile),
        produtosService.listarCategorias(profile)
      ]);
      
      console.log('Dados carregados:', { produtos: produtosData.length, categorias: categoriasData.length });
      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const buscarProdutos = async (termo: string) => {
    if (!termo.trim()) {
      carregarDados();
      return;
    }
    
    try {
      setLoading(true);
      const resultado = await produtosService.buscarProdutos(termo, profile);
      setProdutos(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    buscarProdutos(termoBusca);
  };

  const formatarPreco = (preco: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const abrirModalNovoProduto = () => {
    setProdutoEdicao(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = (produto: Produto) => {
    setProdutoEdicao(produto);
    setModalAberto(true);
  };

  const handleSalvarProduto = (produtoSalvo: Produto) => {
    if (produtoEdicao) {
      setProdutos(prev => 
        prev.map(p => p.codigo === produtoSalvo.codigo ? produtoSalvo : p)
      );
    } else {
      setProdutos(prev => [produtoSalvo, ...prev]);
    }
  };

  const confirmarExclusaoProduto = (produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusao(true);
  };

  const handleDeletarProduto = async () => {
    if (!produtoParaExcluir) return;
    
    try {
      setLoadingExclusao(true);
      await produtosService.deletarProduto(produtoParaExcluir.codigo, profile);
      
      setProdutos(prev => prev.filter(p => p.codigo !== produtoParaExcluir.codigo));
      setModalExclusao(false);
      setProdutoParaExcluir(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto');
    } finally {
      setLoadingExclusao(false);
      setModalExclusao(false);
      setProdutoParaExcluir(null);
    }
  };

  const handleAlternarDisponibilidade = async (produto: Produto) => {
    try {
      const produtoAtualizado = await produtosService.alternarDisponibilidade(produto.codigo, profile);
      setProdutos(prev => 
        prev.map(p => p.codigo === produto.codigo ? produtoAtualizado : p)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar disponibilidade');
    }
  };

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = !filtroCategoria || produto.codigo_categoria === filtroCategoria;
    const matchDisponibilidade = 
      filtroDisponibilidade === 'todos' ||
      (filtroDisponibilidade === 'disponivel' && produto.disponivel) ||
      (filtroDisponibilidade === 'indisponivel' && !produto.disponivel);
    
    return matchCategoria && matchDisponibilidade;
  });

  if (loading && produtos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className={clsx(
          'text-lg',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          Carregando produtos...
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
            Gerenciar Produtos
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Gerencie todos os produtos do seu cardápio ({produtosFiltrados.length} produtos)
          </p>
        </div>
        {canManageProducts() && (
          <Button variant="primary" onClick={abrirModalNovoProduto}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <form onSubmit={handleBuscar} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar produtos por nome..."
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
            </div>
            <Button type="submit" variant="secondary">
              <MagnifyingGlassIcon className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-wrap gap-4">
            <div className="min-w-48">
              <label className={clsx(
                'block text-sm font-medium mb-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Filtrar por categoria:
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria.codigo} value={categoria.codigo}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-48">
              <label className={clsx(
                'block text-sm font-medium mb-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Filtrar por status:
              </label>
              <select
                value={filtroDisponibilidade}
                onChange={(e) => setFiltroDisponibilidade(e.target.value as any)}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
              >
                <option value="todos">Todos</option>
                <option value="disponivel">Disponível</option>
                <option value="indisponivel">Indisponível</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

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
                  Nome
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Categoria
                </th>
                <th className={clsx(
                  'text-left py-3 px-4 font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Preço
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
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className={clsx(
                    'py-8 px-4 text-center',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {loading ? 'Carregando...' : 'Nenhum produto encontrado'}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.codigo} className={clsx(
                    'border-b transition-colors',
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <td className={clsx(
                      'py-3 px-4',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      <div>
                        <div className="font-medium">{produto.nome}</div>
                        {produto.descricao && (
                          <div className={clsx(
                            'text-sm',
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          )}>
                            {produto.descricao}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={clsx(
                      'py-3 px-4',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {produto.categoria_nome || 'Sem categoria'}
                    </td>
                    <td className={clsx(
                      'py-3 px-4 font-medium',
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    )}>
                      {formatarPreco(produto.preco)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        produto.disponivel
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      )}>
                        {produto.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAlternarDisponibilidade(produto)}
                          title={produto.disponivel ? 'Marcar como indisponível' : 'Marcar como disponível'}
                        >
                          {produto.disponivel ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {canManageProducts() && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => abrirModalEdicao(produto)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {canManageProducts() && !isReadOnlyUser() && (
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => confirmarExclusaoProduto(produto)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ProdutoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvarProduto}
        produto={produtoEdicao}
        categorias={categorias}
      />

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={modalExclusao}
        onClose={() => setModalExclusao(false)}
        title="Excluir Produto"
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
                Tem certeza que deseja excluir o produto "{produtoParaExcluir?.nome}"?
              </p>
              <p className={clsx(
                'text-xs mt-2',
                theme === 'dark' ? 'text-red-300' : 'text-red-700'
              )}>
                Preço: {produtoParaExcluir && formatarPreco(produtoParaExcluir.preco)}
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
              onClick={handleDeletarProduto}
              disabled={loadingExclusao}
            >
              {loadingExclusao ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Excluindo...</span>
                </div>
              ) : (
                'Excluir Produto'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListarProdutos;
