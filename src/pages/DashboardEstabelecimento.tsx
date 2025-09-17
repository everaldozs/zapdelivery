import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import KanbanBoard from '../components/ui/KanbanBoard';
import DetalhePedidoModal from '../components/ui/DetalhePedidoModal';
import PedidosService from '../services/pedidosService';
import WebhookService from '../services/webhookService';
import type { PedidoSupabase, StatusPedidoSupabase, ItemPedidoSupabase } from '../types/supabase';
import { Pedido } from '../types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Tipos para os cards de status
interface StatusCard {
  status: StatusPedidoSupabase;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

const DashboardEstabelecimento: React.FC = () => {
  const { user, profile, session } = useAuth();
  const { theme } = useTheme();
  const [pedidos, setPedidos] = useState<PedidoSupabase[]>([]);
  const [itensPedidos, setItensPedidos] = useState<{ [codigoPedido: string]: ItemPedidoSupabase[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  
  // Estados para o modal de detalhes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Status disponíveis para alteração
  const statusOptions: StatusPedidoSupabase[] = [
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

  useEffect(() => {
    if (!user || !profile) {
      console.log('Dashboard: aguardando user/profile...');
      return;
    }
    console.log('Dashboard: carregando pedidos para', profile.name);
    loadPedidos();
  }, [user?.id, profile?.id, profile?.role_name]); // Dependências específicas

  const loadPedidos = async () => {
    if (!profile) {
      console.log('Dashboard: profile não disponível para carregar pedidos');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Dashboard: buscando pedidos...');
      const dadosPedidos = await PedidosService.buscarPedidos(profile);
      console.log('Dashboard: pedidos carregados:', dadosPedidos.length);
      setPedidos(dadosPedidos);
      
      // Buscar itens de todos os pedidos
      if (dadosPedidos.length > 0) {
        const codigosPedidos = dadosPedidos.map(p => p.codigo);
        const itensData = await PedidosService.buscarItensMultiplosPedidos(codigosPedidos);
        setItensPedidos(itensData);
        console.log('Dashboard: itens carregados para', Object.keys(itensData).length, 'pedidos');
      } else {
        setItensPedidos({});
      }
    } catch (error) {
      console.error('Dashboard: erro ao carregar pedidos:', error);
      setError('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (codigoPedido: string, novoStatus: StatusPedidoSupabase) => {
    try {
      console.log('🔄 Atualizando status no banco:', codigoPedido, novoStatus);
      setIsUpdatingStatus(codigoPedido);
      
      await PedidosService.atualizarStatusPedido(codigoPedido, novoStatus);
      console.log('✅ Status atualizado com sucesso no banco');
      
      // Atualizar pedidos localmente
      setPedidos(prev => prev.map(pedido => 
        pedido.codigo === codigoPedido 
          ? { ...pedido, status: novoStatus }
          : pedido
      ));
      
      toast.success('Status do pedido atualizado com sucesso!');
      
      // NOVA FUNCIONALIDADE: Disparar webhook após atualização bem-sucedida
      const pedidoAtualizado = pedidos.find(p => p.codigo === codigoPedido);
      if (pedidoAtualizado) {
        console.log('📡 Disparando webhook para notificação externa...');
        // Webhook é disparado de forma assíncrona para não bloquear a interface
        WebhookService.notificarMudancaStatus(
          pedidoAtualizado.numero_pedido,
          novoStatus,
          profile
        ).catch(error => {
          // Erro do webhook já é tratado internamente no service
          console.log('ℹ️ Webhook processado (resultado já logado no service)');
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      toast.error('Erro ao atualizar status do pedido');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Função para contar pedidos por status - TODOS OS 9 STATUS
  const getStatusCounts = (): StatusCard[] => {
    const counts = pedidos.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {} as Record<StatusPedidoSupabase, number>);

    return [
      {
        status: 'Pedindo',
        label: 'Pedindo',
        count: counts['Pedindo'] || 0,
        color: 'text-gray-600',
        bgColor: 'border-gray-300'
      },
      {
        status: 'Aguardando Pagamento',
        label: 'Aguardando Pagamento',
        count: counts['Aguardando Pagamento'] || 0,
        color: 'text-yellow-600',
        bgColor: 'border-yellow-300'
      },
      {
        status: 'Pagamento Confirmado',
        label: 'Pagamento Confirmado',
        count: counts['Pagamento Confirmado'] || 0,
        color: 'text-green-600',
        bgColor: 'border-green-300'
      },
      {
        status: 'Em preparação',
        label: 'Em preparação',
        count: counts['Em preparação'] || 0,
        color: 'text-blue-600',
        bgColor: 'border-blue-300'
      },
      {
        status: 'Pedido Pronto',
        label: 'Pedido Pronto',
        count: counts['Pedido Pronto'] || 0,
        color: 'text-purple-600',
        bgColor: 'border-purple-300'
      },
      {
        status: 'Saiu para entrega',
        label: 'Saiu para entrega',
        count: counts['Saiu para entrega'] || 0,
        color: 'text-indigo-600',
        bgColor: 'border-indigo-300'
      },
      {
        status: 'Pedido Entregue',
        label: 'Pedido Entregue',
        count: counts['Pedido Entregue'] || 0,
        color: 'text-emerald-600',
        bgColor: 'border-emerald-300'
      },
      {
        status: 'Cancelado Pelo Estabelecimento',
        label: 'Cancelado Pelo Estabelecimento',
        count: counts['Cancelado Pelo Estabelecimento'] || 0,
        color: 'text-red-600',
        bgColor: 'border-red-300'
      },
      {
        status: 'Cancelado pelo Cliente',
        label: 'Cancelado pelo Cliente',
        count: counts['Cancelado pelo Cliente'] || 0,
        color: 'text-gray-600',
        bgColor: 'border-gray-300'
      }
    ];
  };

  // Função para obter a cor do círculo de status - TODOS OS 9 STATUS
  const getStatusCircleColor = (status: StatusPedidoSupabase): string => {
    const colorMap = {
      'Pedindo': 'border-gray-400 bg-transparent',
      'Aguardando Pagamento': 'border-yellow-400 bg-yellow-400',
      'Pagamento Confirmado': 'border-green-400 bg-green-400',
      'Em preparação': 'border-blue-400 bg-blue-400',
      'Pedido Pronto': 'border-purple-400 bg-purple-400',
      'Saiu para entrega': 'border-indigo-400 bg-indigo-400',
      'Pedido Entregue': 'border-emerald-400 bg-emerald-400',
      'Cancelado Pelo Estabelecimento': 'border-red-400 bg-red-400',
      'Cancelado pelo Cliente': 'border-gray-400 bg-gray-400'
    };
    return colorMap[status] || 'border-gray-400 bg-transparent';
  };

  // Converter pedidos do Supabase para formato do Kanban
  const convertPedidosToKanban = (pedidosSupabase: PedidoSupabase[]): Pedido[] => {
    return pedidosSupabase.map(pedido => {
      // Buscar itens deste pedido
      const itensDoPedido = itensPedidos[pedido.codigo] || [];
      
      // Converter itens para o formato esperado
      const itensConvertidos = itensDoPedido.map(item => ({
        produto: item.nome_item,
        quantidade: item.qtde_item,
        preco: item.valor_item,
        observacoes: '' // Se houver observações por item, adicionar aqui
      }));
      
      // Calcular subtotal baseado nos itens
      const subtotalCalculado = itensDoPedido.reduce((acc, item) => acc + item.total_produto, 0);
      
      return {
        id: parseInt(pedido.numero_pedido) || 0,
        codigo: pedido.codigo,
        cliente: {
          nome: `${pedido.cliente_nome || ''} ${pedido.cliente_sobrenome || ''}`.trim() || 'Cliente',
          telefone: pedido.cliente_whatsapp || '',
          endereco: {
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            complemento: ''
          }
        },
        itens: itensConvertidos,
        valores: {
          subtotal: subtotalCalculado > 0 ? subtotalCalculado : pedido.total_pedido - pedido.valor_entrega,
          taxaEntrega: pedido.valor_entrega,
          desconto: 0,
          total: pedido.total_pedido
        },
        status: pedido.status as Pedido['status'],
        dataPedido: pedido.data_criacao,
        pagamento: {
          metodo: pedido.forma_pagamento || 'Não informado',
          status: 'Pendente' as 'Pendente' | 'Pago' | 'Falhou'
        },
        observacoes: pedido.observacao_pedido || '',
        historico: [],
        prioridade: 'Normal' as 'Normal' | 'Urgente',
        tempoEstimado: 30
      };
    });
  };

  // Handlers para o Kanban
  const handlePedidoClick = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handlePedidoEditClick = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPedido(null);
    setIsEditMode(false);
  };

  const handleStatusChangeFromModal = async (pedidoId: number, novoStatus: Pedido['status']) => {
    const pedidoCodigo = pedidos.find(p => parseInt(p.codigo) === pedidoId)?.codigo;
    if (pedidoCodigo) {
      await handleStatusChange(pedidoCodigo, novoStatus as StatusPedidoSupabase);
      // Atualizar o pedido selecionado também
      if (selectedPedido && selectedPedido.id === pedidoId) {
        setSelectedPedido(prev => prev ? { ...prev, status: novoStatus } : null);
      }
    }
  };

  const handlePedidoUpdate = async (dadosAtualizados: Partial<Pedido>) => {
    if (!selectedPedido) return;
    
    try {
      // Aqui você implementaria a atualização no Supabase
      // Por enquanto, vou simular uma atualização local
      
      // Encontrar o pedido no estado
      const pedidoCodigo = selectedPedido.codigo;
      const pedidoIndex = pedidos.findIndex(p => p.codigo === pedidoCodigo);
      
      if (pedidoIndex !== -1) {
        // Atualizar pedidos localmente (simulação)
        const novoPedido = {
          ...pedidos[pedidoIndex],
          cliente_nome: dadosAtualizados.cliente?.nome.split(' ')[0] || pedidos[pedidoIndex].cliente_nome,
          cliente_sobrenome: dadosAtualizados.cliente?.nome.split(' ').slice(1).join(' ') || pedidos[pedidoIndex].cliente_sobrenome,
          cliente_whatsapp: dadosAtualizados.cliente?.telefone || pedidos[pedidoIndex].cliente_whatsapp,
          observacao_pedido: dadosAtualizados.observacoes || pedidos[pedidoIndex].observacao_pedido,
          status: dadosAtualizados.status || pedidos[pedidoIndex].status
        };
        
        const novosPedidos = [...pedidos];
        novosPedidos[pedidoIndex] = novoPedido;
        setPedidos(novosPedidos);
        
        // Atualizar também o pedido selecionado
        const pedidoAtualizado = {
          ...selectedPedido,
          ...dadosAtualizados
        };
        setSelectedPedido(pedidoAtualizado);
        
        toast.success('Pedido atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      toast.error('Erro ao atualizar o pedido. Tente novamente.');
      throw error;
    }
  };

  const handlePedidoDelete = async (pedidoId: number) => {
    console.log('\n=== DEBUG DASHBOARD HANDLEPED1DODELETE INICIADO ===');
    console.log('🗑️ [Dashboard-handlePedidoDelete] Iniciando exclusão do pedido ID:', pedidoId);
    console.log('📊 [Dashboard-handlePedidoDelete] Tipo do pedidoId:', typeof pedidoId);
    
    // Buscar pedido com base no ID
    const pedido = pedidos.find(p => {
      const matchPorId = parseInt(p.numero_pedido) === pedidoId;
      const matchPorIdString = String(p.numero_pedido) === String(pedidoId);
      const matchPorIdNumber = Number(p.numero_pedido) === pedidoId;
      
      console.log(`🔍 [Dashboard-handlePedidoDelete] Verificando pedido ${p.numero_pedido}:`);
      console.log(`  - ID igual: ${matchPorId}`);
      console.log(`  - ID como string: ${matchPorIdString}`);
      console.log(`  - ID como number: ${matchPorIdNumber}`);
      
      return matchPorId || matchPorIdString || matchPorIdNumber;
    });
    
    console.log('🔍 [Dashboard-handlePedidoDelete] Pedido encontrado:', !!pedido);
    
    if (!pedido) {
      console.error('❌ [Dashboard-handlePedidoDelete] Pedido não encontrado na lista local');
      console.error('📊 [Dashboard-handlePedidoDelete] pedidoId procurado:', pedidoId);
      console.error('📊 [Dashboard-handlePedidoDelete] IDs disponíveis:', pedidos.map(p => ({ numero: p.numero_pedido, codigo: p.codigo })));
      toast.error('Pedido não encontrado na lista local.');
      return;
    }
    
    console.log('📋 [Dashboard-handlePedidoDelete] Pedido encontrado:', {
      numero_pedido: pedido.numero_pedido,
      codigo: pedido.codigo,
      tipo_numero: typeof pedido.numero_pedido,
      tipo_codigo: typeof pedido.codigo
    });
    
    if (!pedido.codigo && !pedido.numero_pedido) {
      console.error('❌ [Dashboard-handlePedidoDelete] Código do pedido inválido:', { codigo: pedido.codigo, numero: pedido.numero_pedido });
      toast.error('Código do pedido inválido. Não é possível excluir.');
      return;
    }

    try {
      console.log('🚀 [Dashboard-handlePedidoDelete] Iniciando processo de exclusão...');
      setIsUpdatingStatus(pedido.codigo);
      
      // Toast de progresso
      toast.loading(`Excluindo pedido #${pedidoId}...`, { 
        id: `delete-${pedidoId}`,
        description: 'Removendo do banco de dados...'
      });
      
      console.log('🖺 [Dashboard-handlePedidoDelete] Chamando serviço de exclusão...');
      console.log('📋 [Dashboard-handlePedidoDelete] Parâmetros: codigo =', pedido.codigo, 'numero =', pedido.numero_pedido);
      
      // Usar o endpoint de exclusão controlada - enviar o número do pedido correto
      const numeroPedidoReal = pedido.numero_pedido || pedido.codigo;
      console.log('📋 [Dashboard-handlePedidoDelete] Enviando numeroPedido:', numeroPedidoReal);
      console.log('📋 [Dashboard-handlePedidoDelete] Tipo do numeroPedido:', typeof numeroPedidoReal);
      
      // Importar supabase
      const { supabase } = await import('../lib/supabase');
      
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
      
      console.log('✅ [Dashboard-handlePedidoDelete] Exclusão no backend concluída');
      
      // Remover da lista local usando tanto código quanto número
      console.log('🔄 [Dashboard-handlePedidoDelete] Atualizando estado local...');
      setPedidos(prev => prev.filter(p => 
        p.codigo !== pedido.codigo && 
        parseInt(p.numero_pedido) !== pedidoId
      ));
      
      // Remover itens do pedido excluído
      setItensPedidos(prev => {
        const novosItens = { ...prev };
        delete novosItens[pedido.codigo];
        return novosItens;
      });
      
      // Toast de sucesso
      toast.success(`Pedido #${pedidoId} excluído com sucesso!`, { 
        id: `delete-${pedidoId}`,
        duration: 4000,
        description: 'O pedido foi removido do sistema.'
      });
      
      console.log('🎉 [Dashboard-handlePedidoDelete] Exclusão completa com sucesso');
      
    } catch (err) {
      console.error('💥 [Dashboard-handlePedidoDelete] Erro durante exclusão:', err);
      
      let mensagemErro = 'Erro ao excluir pedido. Tente novamente.';
      
      if (err instanceof Error) {
        mensagemErro = err.message;
        console.error('📝 [Dashboard-handlePedidoDelete] Mensagem:', err.message);
        
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
      setIsUpdatingStatus(null);
      console.log('🏁 [Dashboard-handlePedidoDelete] Processo finalizado');
      console.log('=== DEBUG DASHBOARD HANDLEPED1DODELETE FINALIZADO ===\n');
    }
  };

  const handleKanbanStatusChange = async (pedidoId: number, novoStatus: Pedido['status']) => {
    console.log('🔄 Alterando status do pedido:', pedidoId, 'para:', novoStatus);
    const pedidoEncontrado = pedidos.find(p => parseInt(p.numero_pedido) === pedidoId);
    
    if (pedidoEncontrado) {
      console.log('✅ Pedido encontrado:', pedidoEncontrado.codigo);
      await handleStatusChange(pedidoEncontrado.codigo, novoStatus as StatusPedidoSupabase);
      
      // Recarregar dados para atualizar o kanban
      await loadPedidos();
    } else {
      console.error('❌ Pedido não encontrado para ID:', pedidoId);
    }
  };



  // Calcular valor total dos pedidos
  const valorTotalPedidos = pedidos.reduce((acc, pedido) => acc + pedido.total_pedido, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className={clsx(
            'h-8 rounded',
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={clsx(
                'h-32 rounded-lg',
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              )} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className={clsx(
            'text-lg font-medium mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Erro ao Carregar Dashboard
          </h3>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const statusCards = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Dashboard do Estabelecimento
          </h1>
          <p className={clsx(
            'text-lg mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {profile?.estabelecimento_nome || 'Estabelecimento'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Card Valor Total */}
          <Card className="p-4 min-w-[200px]">
            <div className="text-center">
              <p className={clsx(
                'text-sm font-medium',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Valor Total de Pedidos
              </p>
              <p className={clsx(
                'text-2xl font-bold mt-1 text-green-600'
              )}>
                R$ {valorTotalPedidos.toFixed(2)}
              </p>
            </div>
          </Card>
          
          {/* Botão Convidar Atendente */}
          <Link to="/atendentes">
            <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
              <PlusIcon className="h-5 w-5" />
              Convidar Atendente
            </Button>
          </Link>
        </div>
      </div>

      {/* PRIMEIRA LINHA DE CARDS DE STATUS - 5 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statusCards.slice(0, 5).map((card) => (
          <Card key={card.status} className={clsx(
            'p-6 border-2',
            card.bgColor
          )}>
            <div className="flex items-center gap-4">
              {/* Círculo de Status */}
              <div className={clsx(
                'w-6 h-6 rounded-full border-2 flex-shrink-0',
                getStatusCircleColor(card.status)
              )} />
              
              {/* Conteúdo */}
              <div className="flex-1">
                <div className={clsx(
                  'text-3xl font-bold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {card.count}
                </div>
                <div className={clsx(
                  'text-sm font-medium mt-1',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {card.label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SEGUNDA LINHA DE CARDS DE STATUS - 4 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.slice(5, 9).map((card) => (
          <Card key={card.status} className={clsx(
            'p-6 border-2',
            card.bgColor
          )}>
            <div className="flex items-center gap-4">
              {/* Círculo de Status */}
              <div className={clsx(
                'w-6 h-6 rounded-full border-2 flex-shrink-0',
                getStatusCircleColor(card.status)
              )} />
              
              {/* Conteúdo */}
              <div className="flex-1">
                <div className={clsx(
                  'text-3xl font-bold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {card.count}
                </div>
                <div className={clsx(
                  'text-sm font-medium mt-1',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {card.label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* KANBAN BOARD */}
      <div className="mt-8">
        <KanbanBoard
          pedidos={convertPedidosToKanban(pedidos)}
          onPedidoClick={handlePedidoClick}
          onPedidoEditClick={handlePedidoEditClick}
          onStatusChange={handleKanbanStatusChange}
          filtroStatus=""
          searchTerm=""
        />
      </div>
      
      {/* Modal de Detalhes do Pedido */}
      {selectedPedido && (
        <DetalhePedidoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pedido={selectedPedido}
          onStatusChange={handleStatusChangeFromModal}
          editMode={isEditMode}
          onPedidoUpdate={handlePedidoUpdate}
          onDelete={handlePedidoDelete}
        />
      )}
    </div>
  );
};

export default DashboardEstabelecimento;