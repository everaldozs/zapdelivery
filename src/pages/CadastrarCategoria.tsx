import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRoleCheck } from '../hooks/useAuthorization';
import { clsx } from 'clsx';
import { TagIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { CategoriaFormData, categoriasService } from '../services/categoriasService';

const CadastrarCategoria: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { canManageProducts } = useRoleCheck();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CategoriaFormData>({
    nome: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar mensagens ao modificar campos
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await categoriasService.criarCategoria(formData, profile);
      setSuccess('Categoria criada com sucesso!');
      
      // Limpar formulário após criar
      setFormData({ nome: '' });
      
      // Redirecionar após sucesso (com delay para mostrar mensagem)
      setTimeout(() => {
        navigate('/categorias/listar');
      }, 1500);
      
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate('/categorias/listar');
  };

  // Remover verificação de permissão temporariamente para debug
  // if (!canManageProducts()) {
  //   return (
  //     <div className="flex items-center justify-center min-h-64">
  //       <div className="text-center">
  //         <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
  //         <p className={clsx(
  //           'text-lg font-medium',
  //           theme === 'dark' ? 'text-white' : 'text-gray-900'
  //         )}>
  //           Acesso negado
  //         </p>
  //         <p className={clsx(
  //           'text-sm mt-1',
  //           theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  //         )}>
  //           Você não tem permissão para gerenciar categorias.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Cadastrar Categoria
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Crie uma nova categoria para organizar seus produtos
        </p>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Card padding="md">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Mensagem de Sucesso */}
      {success && (
        <Card padding="md">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <CheckIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Sucesso</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <h2 className={clsx(
            'text-xl font-semibold mb-6 flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <TagIcon className="h-5 w-5" />
            Informações da Categoria
          </h2>
          
          <div className="space-y-6">
            {/* Nome */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Nome da Categoria *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                maxLength={100}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Ex: Hamburguers, Bebidas, Sobremesas..."
                disabled={loading}
              />
              <p className={clsx(
                'text-xs mt-1',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Máximo 100 caracteres
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 sm:flex-initial"
                disabled={loading || !formData.nome.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    <span>Salvar</span>
                  </div>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancelar}
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CadastrarCategoria;
