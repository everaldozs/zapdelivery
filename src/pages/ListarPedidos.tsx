import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import KanbanBoard from '../components/ui/KanbanBoard';
import PedidosLista from '../components/ui/PedidosLista';
import DetalhePedidoModal from '../components/ui/DetalhePedidoModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Pedido } from '../types';
import { clsx } from 'clsx';
import { convertPedidoFromSupabase } from '../types/supabase';
import PedidosService from '../services/pedidosService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ListarPedidos: React.FC = () => {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalModoEdicao, setModalModoEdicao] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'kanban' | 'lista'>('kanban');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroEntregador, setFiltroEntregador] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroData, setFiltroData] = useState('');
  
  // Estados para integração com Supabase
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [excluindoPedido, setExcluindoPedido] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  const statusOptions: Pedido['status'][] = [
    'Pedindo',
    'Aguardando Pagamento',
    'Pagamento Confirmado',
    'Em preparação',
    'Pedido Pronto',
    'Saiu para entrega',
    'Pedido Entregue',
    'Cancelado Pelo Estabelecimento',
    'Cancelado pelo Cliente'
  ];

  const entregadores = ['Carlos Santos', 'Ana Costa', 'Roberto Lima'];
  const prioridades = ['Normal', 'Urgente'];

  // Carregar pedidos do Supabase
  const carregarPedidos = async () => {
    if (!profile) {
      console.log('⚠️ Profile não disponível para carregar pedidos');
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Iniciando carregamento de pedidos...');
      setError('');
      setLoading(true);
      
      // Buscar pedidos
      const pedidosSupabase = await PedidosService.buscarPedidos(profile);
      console.log('📋 Pedidos recebidos do serviço:', pedidosSupabase.length);
      
      if (pedidosSupabase.length === 0) {
        console.log('📭 Nenhum pedido encontrado');
        setPedidos([]);
        setLoading(false);
        return;
      }
      
      // Buscar todos os itens dos pedidos
      console.log('🔍 Buscando itens dos pedidos...');
      const codigosPedidos = pedidosSupabase.map(p => p.codigo);
      const itensPorPedido = await PedidosService.buscarItensMultiplosPedidos(codigosPedidos);
      console.log('📦 Itens carregados para', Object.keys(itensPorPedido).length, 'pedidos');
      
      // Converter dados para formato do frontend
      const pedidosConvertidos = pedidosSupabase.map(pedidoSupabase => {
        const itens = itensPorPedido[pedidoSupabase.codigo] || [];
        const pedidoConvertido = convertPedidoFromSupabase(pedidoSupabase, itens);
        
        // Manter o código original do Supabase E o número original do pedido
        return {
          ...pedidoConvertido,
          codigo: pedidoSupabase.codigo, // Usar o código original diretamente
          numeroPedidoOriginal: pedidoSupabase.numero_pedido // Preservar número original
        };
      });
      
      console.log('📝 [DEBUG] Pedidos convertidos com códigos:');
      pedidosConvertidos.forEach((p, index) => {
        console.log(`  Pedido ${index + 1}: id=${p.id}, codigo=${p.codigo}`);
      });
      
      console.log('✅ Pedidos processados com sucesso:', pedidosConvertidos.length);
      setPedidos(pedidosConvertidos);
    } catch (err) {
      console.error('💥 Erro detalhado ao carregar pedidos:', err);
      
      let mensagemErro = 'Erro ao carregar pedidos. Tente novamente.';
      
      if (err instanceof Error) {
        mensagemErro = err.message;
        console.error('📄 Stack trace:', err.stack);
      }
      
      setError(mensagemErro);
    } finally {
      setLoading(false);
      console.log('🏁 Carregamento de pedidos finalizado');
    }
  };

  // Carregar pedidos quando o componente for montado
  useEffect(() => {
    console.log('🔄 useEffect: carregando pedidos, profile:', {
      profile: profile ? {
        nome: profile.name,
        role: profile.role_name,
        estabelecimento_id: profile.estabelecimento_id
      } : null
    });
    
    if (profile && profile.name) {
      carregarPedidos();
    } else {
      console.log('⏳ Aguardando profile ser carregado completamente...');
    }
  }, [profile?.name, profile?.role_name]); // Dependências mais específicas para evitar loop

  // Aplicar todos os filtros
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchSearch = searchTerm === '' || 
      pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id.toString().includes(searchTerm);
    const matchStatus = filtroStatus === '' || pedido.status === filtroStatus;
    const matchEntregador = filtroEntregador === '' || 
      (pedido.entregador && pedido.entregador.nome === filtroEntregador);
    const matchPrioridade = filtroPrioridade === '' || pedido.prioridade === filtroPrioridade;
    
    let matchData = true;
    if (filtroData) {
      const hoje = new Date();
      const dataPedido = new Date(pedido.dataPedido);
      
      switch (filtroData) {
        case 'hoje':
          matchData = dataPedido.toDateString() === hoje.toDateString();
          break;
        case 'ontem':
          const ontem = new Date(hoje);
          ontem.setDate(hoje.getDate() - 1);
          matchData = dataPedido.toDateString() === ontem.toDateString();
          break;
        case 'semana':
          const semanaAtras = new Date(hoje);
          semanaAtras.setDate(hoje.getDate() - 7);
          matchData = dataPedido >= semanaAtras;
          break;
      }
    }
    
    return matchSearch && matchStatus && matchEntregador && matchPrioridade && matchData;
  });

  const handlePedidoClick = async (pedido: Pedido) => {
    try {
      // Se já tem itens, mostrar direto
      if (pedido.itens && pedido.itens.length > 0) {
        setPedidoSelecionado(pedido);
        setModalModoEdicao(false);
        setModalDetalhes(true);
        return;
      }
      
      // Buscar detalhes completos do pedido se necessário
      if (pedido.codigo) {
        const resultado = await PedidosService.buscarPedidoPorCodigo(pedido.codigo);
        if (resultado) {
          const pedidoCompleto = convertPedidoFromSupabase(resultado.pedido, resultado.itens);
          setPedidoSelecionado({ ...pedidoCompleto, codigo: pedido.codigo });
          setModalModoEdicao(false);
          setModalDetalhes(true);
        }
      } else {
        setPedidoSelecionado(pedido);
        setModalModoEdicao(false);
        setModalDetalhes(true);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do pedido:', err);
      setError('Erro ao carregar detalhes do pedido.');
    }
  };

  const handlePedidoEditClick = async (pedido: Pedido) => {
    try {
      // Se já tem itens, mostrar direto em modo edição
      if (pedido.itens && pedido.itens.length > 0) {
        setPedidoSelecionado(pedido);
        setModalModoEdicao(true);
        setModalDetalhes(true);
        return;
      }
      
      // Buscar detalhes completos do pedido se necessário
      if (pedido.codigo) {
        const resultado = await PedidosService.buscarPedidoPorCodigo(pedido.codigo);
        if (resultado) {
          const pedidoCompleto = convertPedidoFromSupabase(resultado.pedido, resultado.itens);
          setPedidoSelecionado({ ...pedidoCompleto, codigo: pedido.codigo });
          setModalModoEdicao(true);
          setModalDetalhes(true);
        }
      } else {
        setPedidoSelecionado(pedido);
        setModalModoEdicao(true);
        setModalDetalhes(true);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do pedido para edição:', err);
      setError('Erro ao carregar detalhes do pedido para edição.');
    }
  };

  const handleStatusChange = async (pedidoId: number, novoStatus: Pedido['status']) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido?.codigo) {
      setError('Não foi possível encontrar o código do pedido.');
      return;
    }

    try {
      setAtualizandoStatus(true);
      setError('');
      
      // Converter status para o formato do banco
      const statusBanco = PedidosService.converterStatusParaBanco(novoStatus);
      
      // Atualizar no Supabase
      await PedidosService.atualizarStatusPedido(pedido.codigo, statusBanco);
      
      // Atualizar localmente
      setPedidos(pedidos => 
        pedidos.map(p => {
          if (p.id === pedidoId) {
            const novoHistorico = [...p.historico, {
              status: novoStatus,
              data: new Date().toISOString(),
              usuario: user?.email || 'Usuário Atual'
            }];
            
            return {
              ...p,
              status: novoStatus,
              historico: novoHistorico
            };
          }
          return p;
        })
      );
      
      // Atualizar pedido selecionado se for o mesmo
      if (pedidoSelecionado?.id === pedidoId) {
        setPedidoSelecionado(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: novoStatus,
            historico: [...prev.historico, {
              status: novoStatus,
              data: new Date().toISOString(),
              usuario: user?.email || 'Usuário Atual'
            }]
          };
        });
      }
      
      // Notificação de sucesso
      toast.success('Status do pedido atualizado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status do pedido. Tente novamente.');
      setError('Erro ao atualizar status do pedido. Tente novamente.');
    } finally {
      setAtualizandoStatus(false);
    }
  };

  const handlePedidoUpdate = async (dadosAtualizados: Partial<Pedido>) => {
    if (!pedidoSelecionado?.codigo) {
      throw new Error('Não foi possível encontrar o código do pedido.');
    }

    try {
      console.log('💾 Atualizando pedido:', pedidoSelecionado.id, 'dados:', dadosAtualizados);
      
      // Atualizar o pedido localmente
      const pedidoAtualizado = {
        ...pedidoSelecionado,
        ...dadosAtualizados
      };
      
      // Atualizar na lista local
      setPedidos(pedidos => 
        pedidos.map(p => 
          p.id === pedidoSelecionado.id ? pedidoAtualizado : p
        )
      );
      
      // Atualizar o pedido selecionado
      setPedidoSelecionado(pedidoAtualizado);
      
      // Exibir mensagem de sucesso
      setMensagemSucesso(`Pedido #${pedidoSelecionado.id} atualizado com sucesso!`);
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setMensagemSucesso('');
      }, 5000);
      
      console.log('✅ Pedido atualizado com sucesso');
    } catch (err) {
      console.error('💥 Erro ao atualizar pedido:', err);
      throw err;
    }
  };

  const handlePedidoDelete = async (pedidoId: number) => {
    console.log('\n=== DEBUG HANDLEPED1DODELETE INICIADO ===');
    console.log('🗑️ [handlePedidoDelete] Iniciando exclusão do pedido ID:', pedidoId);
    console.log('📊 [handlePedidoDelete] Tipo do pedidoId:', typeof pedidoId);
    console.log('📊 [handlePedidoDelete] Lista de pedidos disponíveis:', pedidos.map(p => ({ id: p.id, tipo: typeof p.id, codigo: p.codigo })));
    
    // Buscar pedido com base no ID
    const pedido = pedidos.find(p => {
      const matchPorId = p.id === pedidoId;
      const matchPorIdString = String(p.id) === String(pedidoId);
      const matchPorIdNumber = Number(p.id) === pedidoId;
      
      console.log(`🔍 [handlePedidoDelete] Verificando pedido ${p.id}:`);
      console.log(`  - ID igual: ${matchPorId}`);
      console.log(`  - ID como string: ${matchPorIdString}`);
      console.log(`  - ID como number: ${matchPorIdNumber}`);
      
      return matchPorId || matchPorIdString || matchPorIdNumber;
    });
    
    console.log('🔍 [handlePedidoDelete] Pedido encontrado:', !!pedido);
    
    if (!pedido) {
      console.error('❌ [handlePedidoDelete] Pedido não encontrado na lista local');
      console.error('📊 [handlePedidoDelete] pedidoId procurado:', pedidoId);
      console.error('📊 [handlePedidoDelete] IDs disponíveis:', pedidos.map(p => ({ id: p.id, tipo: typeof p.id })));
      toast.error('Pedido não encontrado na lista local.');
      return;
    }
    
    console.log('📋 [handlePedidoDelete] Pedido encontrado:', {
      id: pedido.id,
      codigo: pedido.codigo,
      tipo_id: typeof pedido.id,
      tipo_codigo: typeof pedido.codigo
    });
    
    if (!pedido.codigo) {
      console.error('❌ [handlePedidoDelete] Código do pedido inválido:', pedido.codigo);
      toast.error('Código do pedido inválido. Não é possível excluir.');
      return;
    }

    console.log('📋 [handlePedidoDelete] Dados do pedido:', {
      id: pedido.id,
      codigo: pedido.codigo,
      cliente: pedido.cliente?.nome
    });

    try {
      console.log('🚀 [handlePedidoDelete] Iniciando processo de exclusão...');
      setExcluindoPedido(true);
      setError('');
      setMensagemSucesso('');
      
      // Toast de progresso
      toast.loading(`Excluindo pedido #${pedidoId}...`, { 
        id: `delete-${pedidoId}`,
        description: 'Removendo do banco de dados...'
      });
      
      console.log('🖺 [handlePedidoDelete] Chamando serviço de exclusão...');
      console.log('📋 [handlePedidoDelete] Parâmetros: codigo =', pedido.codigo, 'tipo =', typeof pedido.codigo);
      
      // Usar o endpoint de exclusão controlada - enviar o número do pedido correto
      const numeroPedidoReal = (pedido as any).numeroPedidoOriginal || pedido.id.toString();
      console.log('📋 [handlePedidoDelete] Enviando numeroPedido:', numeroPedidoReal);
      console.log('📋 [handlePedidoDelete] Tipo do numeroPedido:', typeof numeroPedidoReal);
      
      const response = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/delete-pedido-teste', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numeroPedido: numeroPedidoReal
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao excluir pedido');
      }
      
      console.log('✅ [handlePedidoDelete] Exclusão no backend concluída');
      
      // Remover da lista local usando tanto ID quanto código para garantir remoção
      console.log('🔄 [handlePedidoDelete] Atualizando estado local...');
      setPedidos(prev => prev.filter(p => p.id !== pedidoId && p.codigo !== pedido.codigo));
      
      // Fechar modal se necessário
      if (pedidoSelecionado?.id === pedidoId || pedidoSelecionado?.codigo === pedido.codigo) {
        setModalDetalhes(false);
        setPedidoSelecionado(null);
      }
      
      // Toast de sucesso
      toast.success(`Pedido #${pedidoId} excluído com sucesso!`, { 
        id: `delete-${pedidoId}`,
        duration: 4000,
        description: 'O pedido foi removido do sistema.'
      });
      
      setMensagemSucesso(`Pedido #${pedidoId} excluído com sucesso!`);
      setTimeout(() => setMensagemSucesso(''), 5000);
      
      console.log('🎉 [handlePedidoDelete] Exclusão completa com sucesso');
      
    } catch (err) {
      console.error('💥 [handlePedidoDelete] Erro durante exclusão:', err);
      
      let mensagemErro = 'Erro ao excluir pedido. Tente novamente.';
      
      if (err instanceof Error) {
        mensagemErro = err.message;
        console.error('📝 [handlePedidoDelete] Mensagem:', err.message);
        
        // Verificar erros de permissão
        if (err.message.includes('permissão') || err.message.includes('policy') || err.message.includes('RLS')) {
          mensagemErro = 'Erro de permissão: Usuário não tem acesso para excluir pedidos.';
        }
      }
      
      setError(mensagemErro);
      
      // Toast de erro
      toast.error(`Erro ao excluir pedido #${pedidoId}`, { 
        id: `delete-${pedidoId}`,
        description: mensagemErro,
        duration: 6000
      });
      
    } finally {
      setExcluindoPedido(false);
      console.log('🏁 [handlePedidoDelete] Processo finalizado');
      console.log('=== DEBUG HANDLEPED1DODELETE FINALIZADO ===\n');
    }
  };

  const handleExportar = () => {
    const dados = pedidosFiltrados.map(pedido => ({
      id: pedido.id,
      cliente: pedido.cliente.nome,
      telefone: pedido.cliente.telefone,
      endereco: `${pedido.cliente.endereco.rua}, ${pedido.cliente.endereco.numero} - ${pedido.cliente.endereco.bairro}`,
      itens: pedido.itens.map(item => `${item.quantidade}x ${item.produto}`).join('; '),
      total: pedido.valores.total,
      status: pedido.status,
      dataPedido: new Date(pedido.dataPedido).toLocaleString('pt-BR'),
      pagamento: pedido.pagamento.metodo,
      entregador: pedido.entregador?.nome || 'Não atribuído',
      prioridade: pedido.prioridade
    }));
    
    const csv = [
      Object.keys(dados[0]).join(','),
      ...dados.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const limparFiltros = () => {
    setFiltroStatus('');
    setFiltroEntregador('');
    setFiltroPrioridade('');
    setFiltroData('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={clsx(
            'text-lg',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Carregando pedidos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Pedidos
          </h1>

        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={carregarPedidos}
            disabled={loading || atualizandoStatus || excluindoPedido}
          >
            <ArrowPathIcon className={clsx('h-4 w-4 mr-1', loading && 'animate-spin')} />
            Atualizar
          </Button>
          <Button 
            variant={visualizacao === 'kanban' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setVisualizacao('kanban')}
          >
            <ViewColumnsIcon className="h-4 w-4 mr-1" />
            Kanban
          </Button>
          <Button 
            variant={visualizacao === 'lista' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setVisualizacao('lista')}
          >
            <ListBulletIcon className="h-4 w-4 mr-1" />
            Lista
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/cadastrar-pedido')}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Alerta de Erro */}
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
                onClick={() => setError('')}
              >
                Dispensar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Alerta de Sucesso */}
      {mensagemSucesso && (
        <Card padding="md">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Sucesso</p>
              <p className="text-sm">{mensagemSucesso}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-green-600 dark:text-green-400"
                onClick={() => setMensagemSucesso('')}
              >
                Dispensar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filtros */}
      <Card padding="md">
        <div className="space-y-4">
          {/* Barra de busca e controles principais */}
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
                  placeholder="Buscar por cliente, número do pedido..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={mostrarFiltros ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportar}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros avançados */}
          {mostrarFiltros && (
            <div className={clsx(
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg border',
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-50 border-gray-200'
            )}>
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="">Todos os Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Entregador
                </label>
                <select
                  value={filtroEntregador}
                  onChange={(e) => setFiltroEntregador(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="">Todos os Entregadores</option>
                  {entregadores.map(entregador => (
                    <option key={entregador} value={entregador}>{entregador}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Prioridade
                </label>
                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="">Todas as Prioridades</option>
                  {prioridades.map(prioridade => (
                    <option key={prioridade} value={prioridade}>{prioridade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-1',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Período
                </label>
                <select
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="">Todos os Períodos</option>
                  <option value="hoje">Hoje</option>
                  <option value="ontem">Ontem</option>
                  <option value="semana">Última Semana</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="secondary" size="sm" onClick={limparFiltros}>
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Board Kanban ou mensagem vazio */}
      {pedidosFiltrados.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <ViewColumnsIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className={clsx(
              'text-lg mb-2',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}>
              {pedidos.length === 0 ? 'Nenhum pedido encontrado' : 'Nenhum pedido corresponde aos filtros'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pedidos.length === 0 ? 'Os pedidos aparecerão aqui quando criados.' : 'Ajuste os filtros para ver mais resultados.'}
            </p>
            {pedidos.length === 0 && (
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={carregarPedidos}
                disabled={loading}
              >
                <ArrowPathIcon className={clsx('h-4 w-4 mr-2', loading && 'animate-spin')} />
                Recarregar
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {visualizacao === 'kanban' ? (
            <KanbanBoard
              pedidos={pedidosFiltrados}
              onPedidoClick={handlePedidoClick}
              onPedidoEditClick={handlePedidoEditClick}
              onStatusChange={handleStatusChange}
              filtroStatus={filtroStatus}
              searchTerm={searchTerm}
            />
          ) : (
            <PedidosLista
              pedidos={pedidosFiltrados}
              onPedidoClick={handlePedidoClick}
              onStatusChange={handleStatusChange}
            />
          )}
        </>
      )}

      {/* Loading overlay para atualizações */}
      {(atualizandoStatus || excluindoPedido) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={clsx(
            'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center gap-3',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            <span>
              {atualizandoStatus && 'Atualizando status do pedido...'}
              {excluindoPedido && 'Excluindo pedido...'}
            </span>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      <DetalhePedidoModal
        isOpen={modalDetalhes}
        onClose={() => {
          setModalDetalhes(false);
          setPedidoSelecionado(null);
          setModalModoEdicao(false);
        }}
        pedido={pedidoSelecionado}
        editMode={modalModoEdicao}
        onStatusChange={handleStatusChange}
        onPedidoUpdate={handlePedidoUpdate}
        onDelete={async (pedidoId) => {
          console.log('🔗 [WRAPPER] Iniciando wrapper onDelete');
          console.log('🔗 [WRAPPER] ID recebido:', pedidoId, 'tipo:', typeof pedidoId);
          console.log('🔗 [WRAPPER] Função handlePedidoDelete:', typeof handlePedidoDelete);
          
          try {
            console.log('🚀 [WRAPPER] Chamando handlePedidoDelete...');
            const resultado = await handlePedidoDelete(pedidoId);
            console.log('✅ [WRAPPER] handlePedidoDelete concluído:', resultado);
            return resultado;
          } catch (error) {
            console.error('💥 [WRAPPER] Erro em handlePedidoDelete:', error);
            throw error;
          }
        }}
      />
    </div>
  );
};

export default ListarPedidos;