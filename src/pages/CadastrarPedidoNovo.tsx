import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { 
  PlusIcon, 
  MinusIcon, 
  ShoppingCartIcon, 
  XMarkIcon, 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { Produto, produtosService } from '../services/produtosService';
import PedidosService from '../services/pedidosService';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
}

const CadastrarPedidoNovo: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados do formulário do cliente
  const [nomeCliente, setNomeCliente] = useState('');
  const [sobrenomeCliente, setSobrenomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [enderecoRua, setEnderecoRua] = useState('');
  const [enderecoNumero, setEnderecoNumero] = useState('');
  const [enderecoBairro, setEnderecoBairro] = useState('');
  const [enderecoCidade, setEnderecoCidade] = useState('');
  
  // Estados do pedido
  const [formaPagamento, setFormaPagamento] = useState('');
  const [formaEntrega, setFormaEntrega] = useState('Entrega');
  const [valorEntrega, setValorEntrega] = useState(0);
  const [observacoesPedido, setObservacoesPedido] = useState('');
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  
  const formasPagamento = [
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Pix',
    'Vale Refeição'
  ];

  const formasEntrega = [
    'Entrega',
    'Retirada'
  ];

  useEffect(() => {
    carregarProdutos();
  }, [profile]);

  const carregarProdutos = async () => {
    try {
      console.log('🔄 Carregando produtos para novo pedido...');
      setLoading(true);
      setError(null);
      const produtosData = await produtosService.listarProdutos(profile);
      const produtosDisponiveis = produtosData.filter(p => p.disponivel);
      console.log('✅ Produtos carregados:', produtosDisponiveis.length);
      setProdutos(produtosDisponiveis);
    } catch (err) {
      console.error('❌ Erro ao carregar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [...new Set(produtos.map(p => p.categoria_nome).filter(Boolean))];
  
  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = !filtroCategoria || produto.categoria_nome === filtroCategoria;
    const matchBusca = !buscaProduto || produto.nome.toLowerCase().includes(buscaProduto.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const adicionarItem = (produto: Produto) => {
    const itemExistente = itens.find(item => item.produto.codigo === produto.codigo);
    if (itemExistente) {
      setItens(itens.map(item => 
        item.produto.codigo === produto.codigo 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setItens([...itens, { produto, quantidade: 1 }]);
    }
    console.log('🛒 Item adicionado ao carrinho:', produto.nome);
  };
  
  const removerItem = (produtoCodigo: string) => {
    const itemExistente = itens.find(item => item.produto.codigo === produtoCodigo);
    if (itemExistente && itemExistente.quantidade > 1) {
      setItens(itens.map(item => 
        item.produto.codigo === produtoCodigo 
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      ));
    } else {
      setItens(itens.filter(item => item.produto.codigo !== produtoCodigo));
    }
  };
  
  const removerItemCompleto = (produtoCodigo: string) => {
    setItens(itens.filter(item => item.produto.codigo !== produtoCodigo));
    console.log('🗑️ Item removido do carrinho');
  };
  
  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + (formaEntrega === 'Entrega' ? valorEntrega : 0);
  };

  const formatarPreco = (preco: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  // Criar cliente primeiro
  const criarCliente = async () => {
    try {
      console.log('👤 Criando cliente...');
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          nome: nomeCliente.trim(),
          sobrenome: sobrenomeCliente.trim(),
          whatsapp: telefoneCliente.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente criado:', data.codigo);
      return data.codigo;
    } catch (error) {
      console.error('💥 Erro crítico ao criar cliente:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Iniciando criação do pedido...');
    
    // Validações
    if (itens.length === 0) {
      alert('Adicione pelo menos um item ao pedido!');
      return;
    }

    if (!nomeCliente.trim()) {
      alert('Digite o nome do cliente!');
      return;
    }

    if (!formaPagamento) {
      alert('Selecione a forma de pagamento!');
      return;
    }

    if (!formaEntrega) {
      alert('Selecione a forma de entrega!');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);

      // 1. Criar cliente
      const clienteId = await criarCliente();

      // 2. Preparar dados do pedido
      const dadosPedido = {
        codigo_cliente: clienteId,
        total_pedido: calcularTotal(),
        forma_pagamento: formaPagamento,
        forma_entrega: formaEntrega,
        valor_entrega: formaEntrega === 'Entrega' ? valorEntrega : 0,
        observacao_pedido: observacoesPedido?.trim() || undefined
      };

      // 3. Preparar itens do pedido
      const itensParaCriar = itens.map(item => ({
        codigo_produto: item.produto.codigo,
        nome_item: item.produto.nome,
        qtde_item: item.quantidade,
        valor_item: item.produto.preco,
        total_produto: item.produto.preco * item.quantidade
      }));

      console.log('💾 Dados do pedido:', dadosPedido);
      console.log('📦 Itens do pedido:', itensParaCriar.length);

      // 4. Criar pedido
      const resultado = await PedidosService.criarPedido(dadosPedido, itensParaCriar, profile);

      console.log('🎉 Pedido criado com sucesso:', resultado.pedido.numero_pedido);
      alert(`Pedido criado com sucesso!\nNúmero: ${resultado.pedido.numero_pedido}\nCliente: ${nomeCliente}\nTotal: ${formatarPreco(calcularTotal())}`);
      
      // 5. Limpar formulário
      setNomeCliente('');
      setSobrenomeCliente('');
      setTelefoneCliente('');
      setEnderecoRua('');
      setEnderecoNumero('');
      setEnderecoBairro('');
      setEnderecoCidade('');
      setFormaPagamento('');
      setFormaEntrega('Entrega');
      setValorEntrega(0);
      setObservacoesPedido('');
      setItens([]);
      
      // 6. Redirecionar para a lista de pedidos
      navigate('/pedidos');
      
    } catch (err) {
      console.error('💥 Erro ao criar pedido:', err);
      const mensagem = err instanceof Error ? err.message : 'Erro ao criar pedido';
      setError(mensagem);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={clsx(
            'text-lg',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Carregando produtos...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/pedidos')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className={clsx(
              'text-3xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Novo Pedido
            </h1>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Crie um novo pedido selecionando produtos e preenchendo os dados
            </p>
          </div>
        </div>
        
        {/* Resumo do Carrinho */}
        {itens.length > 0 && (
          <div className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-lg',
            theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
          )}>
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="font-medium">{itens.length} itens • {formatarPreco(calcularTotal())}</span>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <p className="font-medium">Erro ao criar pedido</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Produtos e Carrinho */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Produtos Disponíveis */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className={clsx(
                'text-xl font-semibold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Produtos Disponíveis
              </h2>
              <span className={clsx(
                'text-sm px-2 py-1 rounded',
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              )}>
                {produtosFiltrados.length} produtos
              </span>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar produto..."
                className={clsx(
                  'px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={clsx(
                  'px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
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

            {/* Lista de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {produtosFiltrados.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className={clsx(
                    'text-lg mb-2',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    Nenhum produto encontrado
                  </p>
                  <p className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  )}>
                    Ajuste os filtros ou adicione produtos ao estabelecimento
                  </p>
                </div>
              ) : (
                produtosFiltrados.map(produto => {
                  const itemNoCarrinho = itens.find(item => item.produto.codigo === produto.codigo);
                  return (
                    <div key={produto.codigo} className={clsx(
                      'p-4 rounded-lg border transition-all hover:shadow-md',
                      theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    )}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className={clsx(
                            'font-medium text-sm',
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          )}>
                            {produto.nome}
                          </h4>
                          {produto.descricao && (
                            <p className={clsx(
                              'text-xs mt-1 line-clamp-2',
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            )}>
                              {produto.descricao}
                            </p>
                          )}
                          {produto.categoria_nome && (
                            <span className={clsx(
                              'inline-block px-2 py-1 rounded text-xs mt-2',
                              theme === 'dark'
                                ? 'bg-blue-900/20 text-blue-400'
                                : 'bg-blue-100 text-blue-800'
                            )}>
                              {produto.categoria_nome}
                            </span>
                          )}
                        </div>
                        <span className={clsx(
                          'font-bold text-sm ml-2',
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        )}>
                          {formatarPreco(produto.preco)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {itemNoCarrinho ? (
                          <div className="flex items-center space-x-2 w-full">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removerItem(produto.codigo)}
                              className="p-1"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            
                            <span className={clsx(
                              'font-medium px-3 py-1 rounded text-sm min-w-[2rem] text-center',
                              theme === 'dark'
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-100 text-gray-900'
                            )}>
                              {itemNoCarrinho.quantidade}
                            </span>
                            
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => adicionarItem(produto)}
                              className="p-1"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removerItemCompleto(produto.codigo)}
                              className="ml-auto p-1 text-red-600 hover:text-red-700"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            type="button" 
                            variant="primary" 
                            size="sm"
                            onClick={() => adicionarItem(produto)}
                            className="w-full"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
          
          {/* Carrinho */}
          {itens.length > 0 && (
            <Card>
              <h3 className={clsx(
                'text-lg font-semibold mb-4 flex items-center',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Itens do Pedido ({itens.length})
              </h3>
              
              <div className="space-y-3">
                {itens.map(item => (
                  <div key={item.produto.codigo} className={clsx(
                    'flex items-center justify-between p-3 rounded-lg',
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                  )}>
                    <div className="flex-1">
                      <h4 className={clsx(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {item.produto.nome}
                      </h4>
                      <p className={clsx(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        {formatarPreco(item.produto.preco)} × {item.quantidade}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={clsx(
                        'font-bold',
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      )}>
                        {formatarPreco(item.produto.preco * item.quantidade)}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removerItem(item.produto.codigo)}
                          className="p-1"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        
                        <span className={clsx(
                          'px-2 py-1 rounded text-sm min-w-[2rem] text-center',
                          theme === 'dark'
                            ? 'bg-gray-700 text-white'
                            : 'bg-white text-gray-900'
                        )}>
                          {item.quantidade}
                        </span>
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => adicionarItem(item.produto)}
                          className="p-1"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removerItemCompleto(item.produto.codigo)}
                          className="p-1 text-red-600 hover:text-red-700 ml-2"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Resumo do Carrinho */}
                <div className={clsx(
                  'border-t pt-3 space-y-2',
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                )}>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Subtotal ({itens.reduce((acc, item) => acc + item.quantidade, 0)} itens):
                    </span>
                    <span className={clsx(
                      'font-medium',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {formatarPreco(calcularSubtotal())}
                    </span>
                  </div>
                  
                  {formaEntrega === 'Entrega' && valorEntrega > 0 && (
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Taxa de entrega:
                      </span>
                      <span className={clsx(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {formatarPreco(valorEntrega)}
                      </span>
                    </div>
                  )}
                  
                  <div className={clsx(
                    'flex justify-between text-lg font-bold border-t pt-2',
                    theme === 'dark' ? 'border-gray-700 text-green-400' : 'border-gray-200 text-green-600'
                  )}>
                    <span>Total:</span>
                    <span>{formatarPreco(calcularTotal())}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Coluna 3: Formulário */}
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className={clsx(
                'text-lg font-semibold mb-4 flex items-center',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <UserIcon className="h-5 w-5 mr-2" />
                Dados do Cliente
              </h3>
              
              {/* Nome e Sobrenome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-1',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    required
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-1',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={sobrenomeCliente}
                    onChange={(e) => setSobrenomeCliente(e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Sobrenome do cliente"
                  />
                </div>
              </div>
              
              {/* Telefone */}
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-1 flex items-center',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                  required
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              {/* Endereço */}
              <div className="space-y-3">
                <label className={clsx(
                  'block text-sm font-medium flex items-center',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Endereço de Entrega
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={enderecoRua}
                    onChange={(e) => setEnderecoRua(e.target.value)}
                    className={clsx(
                      'col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Rua/Av"
                  />
                  <input
                    type="text"
                    value={enderecoNumero}
                    onChange={(e) => setEnderecoNumero(e.target.value)}
                    className={clsx(
                      'px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Nº"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={enderecoBairro}
                    onChange={(e) => setEnderecoBairro(e.target.value)}
                    className={clsx(
                      'px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Bairro"
                  />
                  <input
                    type="text"
                    value={enderecoCidade}
                    onChange={(e) => setEnderecoCidade(e.target.value)}
                    className={clsx(
                      'px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Cidade"
                  />
                </div>
              </div>
              
              {/* Dados do Pedido */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className={clsx(
                  'text-md font-medium mb-3 flex items-center',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Dados do Pedido
                </h4>
                
                {/* Forma de Pagamento */}
                <div className="mb-4">
                  <label className={clsx(
                    'block text-sm font-medium mb-1',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Forma de Pagamento *
                  </label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    required
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                  >
                    <option value="">Selecione...</option>
                    {formasPagamento.map(forma => (
                      <option key={forma} value={forma}>{forma}</option>
                    ))}
                  </select>
                </div>
                
                {/* Forma de Entrega */}
                <div className="mb-4">
                  <label className={clsx(
                    'block text-sm font-medium mb-1 flex items-center',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    <TruckIcon className="h-4 w-4 mr-1" />
                    Forma de Entrega *
                  </label>
                  <select
                    value={formaEntrega}
                    onChange={(e) => {
                      setFormaEntrega(e.target.value);
                      if (e.target.value === 'Retirada') {
                        setValorEntrega(0);
                      }
                    }}
                    required
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                  >
                    {formasEntrega.map(forma => (
                      <option key={forma} value={forma}>{forma}</option>
                    ))}
                  </select>
                </div>
                
                {/* Taxa de Entrega */}
                {formaEntrega === 'Entrega' && (
                  <div className="mb-4">
                    <label className={clsx(
                      'block text-sm font-medium mb-1',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>
                      Taxa de Entrega
                    </label>
                    <input
                      type="number"
                      value={valorEntrega}
                      onChange={(e) => setValorEntrega(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={clsx(
                        'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                      placeholder="0,00"
                    />
                  </div>
                )}
                
                {/* Observações */}
                <div className="mb-4">
                  <label className={clsx(
                    'block text-sm font-medium mb-1 flex items-center',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                    Observações
                  </label>
                  <textarea
                    value={observacoesPedido}
                    onChange={(e) => setObservacoesPedido(e.target.value)}
                    rows={3}
                    className={clsx(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none',
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                    placeholder="Observações especiais do pedido..."
                  />
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => navigate('/pedidos')}
                  className="flex-1"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={saving || itens.length === 0}
                  className="flex-1"
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando...
                    </div>
                  ) : (
                    <>Criar Pedido • {formatarPreco(calcularTotal())}</>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CadastrarPedidoNovo;