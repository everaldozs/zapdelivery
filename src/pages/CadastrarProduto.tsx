import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';

const CadastrarProduto: React.FC = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco: '',
    descricao: '',
    disponivel: true,
  });

  const categorias = ['Hamburguers', 'Pizzas', 'Bebidas', 'Espetinhos', 'Sobremesas', 'Acompanhamentos'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do produto:', formData);
    // Simular salvamento
    alert('Produto cadastrado com sucesso!');
    setFormData({ nome: '', categoria: '', preco: '', descricao: '', disponivel: true });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Cadastrar Produto
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Adicione novos produtos ao seu cardápio
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className={clsx(
                'text-xl font-semibold mb-4',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Informações Básicas
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
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
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    )}
                    placeholder="Ex: Hamburguer Artesanal"
                  />
                </div>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Categoria *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Preço *
                  </label>
                  <input
                    type="number"
                    name="preco"
                    value={formData.preco}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    )}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
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
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    )}
                    placeholder="Descreva os ingredientes e características do produto..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="disponivel"
                    checked={formData.disponivel}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className={clsx(
                    'ml-2 text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Produto disponível
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Imagem */}
          <div className="space-y-6">
            <Card>
              <h2 className={clsx(
                'text-xl font-semibold mb-4',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Imagem do Produto
              </h2>
              
              <div className={clsx(
                'border-2 border-dashed rounded-lg p-6 text-center',
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              )}>
                <PhotoIcon className={clsx(
                  'mx-auto h-12 w-12 mb-4',
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                )} />
                <p className={clsx(
                  'text-sm mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                )}>
                  Clique para fazer upload
                </p>
                <p className={clsx(
                  'text-xs',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>
                  PNG, JPG até 2MB
                </p>
                <Button type="button" variant="secondary" className="mt-3">
                  Escolher Arquivo
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className={clsx(
                'text-xl font-semibold mb-4',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Ações
              </h2>
              
              <div className="space-y-3">
                <Button type="submit" variant="primary" className="w-full">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Cadastrar Produto
                </Button>
                <Button type="button" variant="secondary" className="w-full">
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CadastrarProduto;
