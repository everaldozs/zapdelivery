import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { Produto, ProdutoFormData, Categoria, produtosService } from '../../services/produtosService';

interface ProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produto: Produto) => void;
  produto?: Produto | null;
  categorias: Categoria[];
}

const ProdutoModal: React.FC<ProdutoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  produto = null,
  categorias
}) => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const isEditing = !!produto;

  const [formData, setFormData] = useState<ProdutoFormData>({
    nome: '',
    descricao: '',
    preco: 0,
    codigo_categoria: '',
    disponivel: true,
    imagem_url: '',
    tempo_preparo_min: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetar formulário quando modal abrir/fechar ou produto mudar
  useEffect(() => {
    if (isOpen) {
      if (produto) {
        setFormData({
          nome: produto.nome,
          descricao: produto.descricao || '',
          preco: produto.preco,
          codigo_categoria: produto.codigo_categoria || '',
          disponivel: produto.disponivel,
          imagem_url: produto.imagem_url || '',
          tempo_preparo_min: produto.tempo_preparo_min || undefined,
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          preco: 0,
          codigo_categoria: '',
          disponivel: true,
          imagem_url: '',
          tempo_preparo_min: undefined,
        });
      }
      setError(null);
    }
  }, [isOpen, produto]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? (value === '' ? 0 : parseFloat(value)) 
        : type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        throw new Error('Nome do produto é obrigatório');
      }
      
      if (formData.preco <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }

      let produtoSalvo: Produto;
      
      if (isEditing && produto) {
        produtoSalvo = await produtosService.atualizarProduto(produto.codigo, formData, profile);
      } else {
        produtoSalvo = await produtosService.criarProduto(formData, profile);
      }

      onSave(produtoSalvo);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // Fechar modal apenas ao clicar no backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={clsx(
          'w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}
        onClick={(e) => {
          // Evitar propagação do clique no modal
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={clsx(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            )}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Nome do Produto *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              className={clsx(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
              placeholder="Digite o nome do produto"
            />
          </div>

          <div>
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              rows={3}
              className={clsx(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
              placeholder="Descrição do produto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Preço *
              </label>
              <input
                type="number"
                name="preco"
                value={formData.preco}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={clsx(
                'block text-sm font-medium mb-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Categoria
              </label>
              <select
                name="codigo_categoria"
                value={formData.codigo_categoria}
                onChange={handleInputChange}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria.codigo} value={categoria.codigo}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              URL da Imagem
            </label>
            <input
              type="url"
              name="imagem_url"
              value={formData.imagem_url}
              onChange={handleInputChange}
              className={clsx(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className={clsx(
              'block text-sm font-medium mb-1',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Tempo de Preparo (minutos)
            </label>
            <input
              type="number"
              name="tempo_preparo_min"
              value={formData.tempo_preparo_min || ''}
              onChange={handleInputChange}
              min="0"
              className={clsx(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
              placeholder="Ex: 15"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="disponivel"
              checked={formData.disponivel}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className={clsx(
              'ml-2 block text-sm font-medium',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Produto disponível
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoModal;
