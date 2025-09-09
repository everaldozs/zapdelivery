import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon,
  EyeIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagem?: string;
  ingredientes: string[];
}

const VerCardapio: React.FC = () => {
  const { theme } = useTheme();
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarIndisponiveis, setMostrarIndisponiveis] = useState(true);
  
  const [produtos] = useState<Produto[]>([
    {
      id: 1,
      nome: 'Hamburguer Clássico',
      descricao: 'Hamburguer artesanal com carne bovina, alface, tomate, cebola e molho especial.',
      preco: 25.90,
      categoria: 'Hamburguers',
      disponivel: true,
      ingredientes: ['Carne bovina 150g', 'Pão artesanal', 'Alface', 'Tomate', 'Cebola', 'Molho especial']
    },
    {
      id: 2,
      nome: 'Pizza Margherita',
      descricao: 'Pizza tradicional com molho de tomate, mozzarella e manjericão fresco.',
      preco: 32.00,
      categoria: 'Pizzas',
      disponivel: true,
      ingredientes: ['Massa artesanal', 'Molho de tomate', 'Mozzarella', 'Manjericão', 'Azeite']
    },
    {
      id: 3,
      nome: 'Coca-Cola 350ml',
      descricao: 'Refrigerante tradicional gelado.',
      preco: 5.50,
      categoria: 'Bebidas',
      disponivel: false,
      ingredientes: ['Refrigerante Coca-Cola 350ml']
    },
    {
      id: 4,
      nome: 'Espetinho de Carne',
      descricao: 'Espetinho de carne bovina temperada na brasa.',
      preco: 12.90,
      categoria: 'Espetinhos',
      disponivel: true,
      ingredientes: ['Carne bovina em cubos', 'Temperos especiais', 'Sal grosso']
    },
    {
      id: 5,
      nome: 'Batata Frita',
      descricao: 'Porção de batatas fritas crocantes com sal.',
      preco: 15.00,
      categoria: 'Acompanhamentos',
      disponivel: true,
      ingredientes: ['Batata inglesa', 'Sal', 'Óleo vegetal']
    },
    {
      id: 6,
      nome: 'Pizza Calabresa',
      descricao: 'Pizza com calabresa, cebola, azeitonas e queijo mozzarella.',
      preco: 35.00,
      categoria: 'Pizzas',
      disponivel: true,
      ingredientes: ['Massa artesanal', 'Calabresa', 'Cebola', 'Azeitonas', 'Mozzarella']
    },
    {
      id: 7,
      nome: 'Suco de Laranja',
      descricao: 'Suco natural de laranja sem conservantes.',
      preco: 8.50,
      categoria: 'Bebidas',
      disponivel: true,
      ingredientes: ['Laranja natural', 'Gelo']
    },
    {
      id: 8,
      nome: 'Sobremesa Pudim',
      descricao: 'Pudim de leite condensado cremoso com calda de caramelo.',
      preco: 12.00,
      categoria: 'Sobremesas',
      disponivel: false,
      ingredientes: ['Leite condensado', 'Ovos', 'Leite', 'Açúcar', 'Caramelo']
    }
  ]);
  
  const categorias = [...new Set(produtos.map(p => p.categoria))];
  
  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = categoriaFiltro === '' || produto.categoria === categoriaFiltro;
    const matchSearch = searchTerm === '' || 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisponibilidade = mostrarIndisponiveis || produto.disponivel;
    
    return matchCategoria && matchSearch && matchDisponibilidade;
  });
  
  const produtosPorCategoria = categorias.map(categoria => ({
    categoria,
    produtos: produtosFiltrados.filter(p => p.categoria === categoria)
  })).filter(grupo => grupo.produtos.length > 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Ver Cardápio
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Visualize todos os produtos disponíveis ({produtosFiltrados.length} produtos)
          </p>
        </div>
        <Button variant="primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className={clsx(
              'block text-sm font-medium mb-2',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Buscar produtos
            </label>
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
                placeholder="Nome, descrição ou ingredientes..."
              />
            </div>
          </div>
          
          <div className="md:col-span-3">
            <label className={clsx(
              'block text-sm font-medium mb-2',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Categoria
            </label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className={clsx(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              <option value="">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                id="mostrarIndisponiveis"
                checked={mostrarIndisponiveis}
                onChange={(e) => setMostrarIndisponiveis(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="mostrarIndisponiveis"
                className={clsx(
                  'ml-2 text-sm',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Mostrar indisponíveis
              </label>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Button variant="secondary" className="w-full">
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Produtos por Categoria */}
      <div className="space-y-8">
        {produtosPorCategoria.map(({ categoria, produtos }) => (
          <div key={categoria}>
            <h2 className={clsx(
              'text-2xl font-bold mb-4',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {categoria}
              <span className={clsx(
                'ml-2 text-sm font-normal',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                ({produtos.length} produtos)
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos.map(produto => (
                <Card key={produto.id} className={clsx(
                  'hover:shadow-lg transition-shadow duration-200',
                  !produto.disponivel && 'opacity-75'
                )}>
                  {/* Header do Card */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className={clsx(
                        'text-lg font-semibold',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {produto.nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx(
                          'text-xl font-bold',
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        )}>
                          R$ {produto.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          produto.disponivel
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        )}>
                          {produto.disponivel ? 'Disponível' : 'Indisponível'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  <p className={clsx(
                    'text-sm mb-4',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    {produto.descricao}
                  </p>
                  
                  {/* Ingredientes */}
                  <div className="mb-4">
                    <h4 className={clsx(
                      'text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    )}>
                      Ingredientes:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {produto.ingredientes.slice(0, 4).map((ingrediente, index) => (
                        <span key={index} className={clsx(
                          'px-2 py-1 rounded-full text-xs',
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          {ingrediente}
                        </span>
                      ))}
                      {produto.ingredientes.length > 4 && (
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        )}>
                          +{produto.ingredientes.length - 4} mais
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Ações */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" title="Visualizar detalhes">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Editar produto">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title={produto.disponivel ? 'Tornar indisponível' : 'Tornar disponível'}
                      >
                        <ArchiveBoxXMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button variant="secondary" size="sm">
                      {produto.disponivel ? 'Adicionar ao Pedido' : 'Indisponível'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Estatísticas do Cardápio */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {produtos.length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Total de Produtos
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            )}>
              {produtos.filter(p => p.disponivel).length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Disponíveis
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            )}>
              {produtos.filter(p => !p.disponivel).length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Indisponíveis
            </p>
          </div>
        </Card>
        
        <Card padding="md">
          <div className="text-center">
            <p className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            )}>
              {categorias.length}
            </p>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Categorias
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerCardapio;
