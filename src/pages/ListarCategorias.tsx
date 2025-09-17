import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRoleCheck } from '../hooks/useAuthorization';
import { clsx } from 'clsx';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TagIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { CategoriaSimples, CategoriaFormData, categoriasService } from '../services/categoriasService';

const ListarCategorias: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { canManageProducts, isReadOnlyUser } = useRoleCheck();
  const navigate = useNavigate();
  
  const [categorias, setCategorias] = useState<CategoriaSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para edição
  const [categoriaEdicao, setCategoriaEdicao] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  
  // Estados para confirmação de exclusão
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<CategoriaSimples | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, [profile]);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await categoriasService.listarCategorias(profile);
      setCategorias(resultado);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const abrirNovaCategoria = () => {
    navigate('/categorias/cadastrar');
  };

  const iniciarEdicao = (categoria: CategoriaSimples) => {
    setCategoriaEdicao(categoria.codigo);
    setNomeEdicao(categoria.nome);
  };

  const cancelarEdicao = () => {
    setCategoriaEdicao(null);
    setNomeEdicao('');
  };

  const salvarEdicao = async () => {
    if (!categoriaEdicao || !nomeEdicao.trim()) return;
    
    try {
      const categoriaAtualizada = await categoriasService.atualizarCategoria(
        categoriaEdicao, 
        { nome: nomeEdicao.trim() }, 
        profile
      );
      
      setCategorias(prev => 
        prev.map(c => c.codigo === categoriaEdicao ? categoriaAtualizada : c)
      );
      
      setCategoriaEdicao(null);
      setNomeEdicao('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
    }
  };

  const confirmarExclusao = (categoria: CategoriaSimples) => {
    setCategoriaParaExcluir(categoria);
    setModalExclusao(true);
  };

  const handleExcluirCategoria = async () => {
    if (!categoriaParaExcluir) return;
    
    try {
      await categoriasService.excluirCategoria(categoriaParaExcluir.codigo, profile);
      setCategorias(prev => prev.filter(c => c.codigo !== categoriaParaExcluir.codigo));
      setModalExclusao(false);
      setCategoriaParaExcluir(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      setModalExclusao(false);
      setCategoriaParaExcluir(null);
    }
  };

  const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className={clsx(
          'text-lg',
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          Carregando categorias...
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
            Listar Categorias
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Gerencie as categorias dos seus produtos ({categorias.length} categorias)
          </p>
        </div>
        {/* Remover verificação de permissão temporariamente para debug */}
        {/* {canManageProducts() && ( */}
          <Button variant="primary" onClick={abrirNovaCategoria}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Cadastrar Categoria
          </Button>
        {/* )} */}
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
                  Nome da Categoria
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
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={3} className={clsx(
                    'py-8 px-4 text-center',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    <div className="flex flex-col items-center gap-4">
                      <TagIcon className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium mb-2">
                          Nenhuma categoria encontrada
                        </p>
                        <p className="text-sm">
                          Comece criando sua primeira categoria.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr key={categoria.codigo} className={clsx(
                    'border-b transition-colors',
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <td className={clsx(
                      'py-3 px-4',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {categoriaEdicao === categoria.codigo ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={nomeEdicao}
                            onChange={(e) => setNomeEdicao(e.target.value)}
                            className={clsx(
                              'flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent',
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            )}
                            maxLength={100}
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={salvarEdicao}
                              disabled={!nomeEdicao.trim()}
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
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{categoria.nome}</span>
                        </div>
                      )}
                    </td>
                    <td className={clsx(
                      'py-3 px-4 text-sm',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {formatarData(categoria.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {categoriaEdicao === categoria.codigo ? null : (
                        <div className="flex space-x-2">
                          {/* Remover verificação de permissão temporariamente para debug */}
                          {/* {canManageProducts() && ( */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => iniciarEdicao(categoria)}
                              title="Editar categoria"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          {/* )} */}
                          
                          {/* {canManageProducts() && !isReadOnlyUser() && ( */}
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => confirmarExclusao(categoria)}
                              title="Excluir categoria"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          {/* )} */}
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
        title="Excluir Categoria"
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
                Tem certeza que deseja excluir a categoria "{categoriaParaExcluir?.nome}"?
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setModalExclusao(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleExcluirCategoria}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Categoria
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListarCategorias;
