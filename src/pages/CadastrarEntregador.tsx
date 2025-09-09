import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { UserPlusIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import { entregadoresService, EntregadorFormData } from '../services/entregadoresService';
import { useNavigate } from 'react-router-dom';

const CadastrarEntregador: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EntregadorFormData>({
    nome: '',
    telefone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('O nome do entregador é obrigatório!');
      return;
    }

    try {
      setLoading(true);
      await entregadoresService.criarEntregador(formData, profile);
      
      alert('Entregador cadastrado com sucesso!');
      
      // Resetar o formulário
      setFormData({
        nome: '',
        telefone: '',
      });
      
      // Navegar para a listagem
      navigate('/entregadores/listar');
    } catch (err) {
      console.error('Erro ao cadastrar entregador:', err);
      alert(err instanceof Error ? err.message : 'Erro desconhecido ao cadastrar entregador');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/entregadores/listar');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Cadastrar Entregador
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Adicione um novo entregador ao sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Entregador */}
        <Card>
          <h2 className={clsx(
            'text-xl font-semibold mb-4 flex items-center',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <UserIcon className="h-5 w-5 mr-2" />
            Dados do Entregador
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
                placeholder="Ex: João Silva Santos"
              />
            </div>

            <div className="md:col-span-2">
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                disabled={loading}
                className={clsx(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
                placeholder="(11) 99999-9999"
              />
              <p className={clsx(
                'text-xs mt-1',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Número de contato do entregador (opcional)
              </p>
            </div>
          </div>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <h2 className={clsx(
            'text-xl font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Informações do Sistema
          </h2>
          
          <div className="space-y-3">
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            )}>
              <h3 className={clsx(
                'font-medium mb-2',
                theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
              )}>
                Status Inicial
              </h3>
              <p className={clsx(
                'text-sm',
                theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
              )}>
                O entregador será cadastrado com status "Ativo" automaticamente.
              </p>
            </div>
            
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            )}>
              <h3 className={clsx(
                'font-medium mb-2',
                theme === 'dark' ? 'text-green-300' : 'text-green-800'
              )}>
                Estabelecimento
              </h3>
              <p className={clsx(
                'text-sm',
                theme === 'dark' ? 'text-green-200' : 'text-green-700'
              )}>
                O entregador será vinculado ao seu estabelecimento atual.
              </p>
            </div>
          </div>
        </Card>

        {/* Botões */}
        <Card>
          <div className="flex flex-col md:flex-row gap-3 md:justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              className="md:w-auto"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="md:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Cadastrar Entregador
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CadastrarEntregador;
