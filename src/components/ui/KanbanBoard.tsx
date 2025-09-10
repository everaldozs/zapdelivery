import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { Pedido, KanbanColumn } from '../../types';
import PedidoCardSimplificado from './PedidoCardSimplificado';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  CogIcon,
  FireIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface KanbanBoardProps {
  pedidos: Pedido[];
  onPedidoClick: (pedido: Pedido) => void;
  onPedidoEditClick?: (pedido: Pedido) => void;
  onStatusChange: (pedidoId: number, novoStatus: Pedido['status']) => void;
  filtroStatus: string;
  searchTerm: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  pedidos,
  onPedidoClick,
  onPedidoEditClick,
  onStatusChange,
  filtroStatus,
  searchTerm
}) => {
  const { theme } = useTheme();
  const [draggedPedido, setDraggedPedido] = useState<Pedido | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Definição das colunas do Kanban - TODAS AS 9 COLUNAS
  const colunas: KanbanColumn[] = [
    {
      id: 'pedindo',
      title: 'Pedindo',
      status: 'Pedindo',
      color: 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/10',
      icon: ClockIcon,
      pedidos: []
    },
    {
      id: 'aguardando-pagamento',
      title: 'Aguardando Pagamento',
      status: 'Aguardando Pagamento',
      color: 'border-yellow-200 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/10',
      icon: CurrencyDollarIcon,
      pedidos: []
    },
    {
      id: 'pagamento-confirmado',
      title: 'Pagamento Confirmado',
      status: 'Pagamento Confirmado',
      color: 'border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/10',
      icon: CheckCircleIcon,
      pedidos: []
    },
    {
      id: 'em-preparacao',
      title: 'Em preparação',
      status: 'Em preparação',
      color: 'border-blue-200 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/10',
      icon: CogIcon,
      pedidos: []
    },
    {
      id: 'pedido-pronto',
      title: 'Pedido Pronto',
      status: 'Pedido Pronto',
      color: 'border-purple-200 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/10',
      icon: CheckCircleIcon,
      pedidos: []
    },
    {
      id: 'saiu-entrega',
      title: 'Saiu para entrega',
      status: 'Saiu para entrega',
      color: 'border-indigo-200 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/10',
      icon: TruckIcon,
      pedidos: []
    },
    {
      id: 'pedido-entregue',
      title: 'Pedido Entregue',
      status: 'Pedido Entregue',
      color: 'border-emerald-200 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/10',
      icon: CheckCircleIcon,
      pedidos: []
    },
    {
      id: 'cancelado-estabelecimento',
      title: 'Cancelado Pelo Estabelecimento',
      status: 'Cancelado Pelo Estabelecimento',
      color: 'border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/10',
      icon: XCircleIcon,
      pedidos: []
    },
    {
      id: 'cancelado-cliente',
      title: 'Cancelado pelo Cliente',
      status: 'Cancelado pelo Cliente',
      color: 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/10',
      icon: XCircleIcon,
      pedidos: []
    }
  ];

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchSearch = searchTerm === '' || 
      pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id.toString().includes(searchTerm);
    const matchStatus = filtroStatus === '' || pedido.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  // Agrupar pedidos por status
  const colunasComPedidos = colunas.map(coluna => ({
    ...coluna,
    pedidos: pedidosFiltrados.filter(pedido => pedido.status === coluna.status)
  }));

  // Funções de Drag & Drop
  const handleDragStart = useCallback((e: React.DragEvent, pedido: Pedido) => {
    setDraggedPedido(pedido);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colunaId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(colunaId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, novoStatus: Pedido['status']) => {
    e.preventDefault();
    if (draggedPedido && draggedPedido.status !== novoStatus) {
      onStatusChange(draggedPedido.id, novoStatus);
    }
    setDraggedPedido(null);
    setDragOverColumn(null);
  }, [draggedPedido, onStatusChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedPedido(null);
    setDragOverColumn(null);
  }, []);

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const total = pedidosFiltrados.length;
    const valorTotal = pedidosFiltrados.reduce((sum, p) => sum + p.valores.total, 0);
    const pendentes = pedidosFiltrados.filter(p => p.status === 'Pedindo' || p.status === 'Aguardando Pagamento').length;
    const urgentes = pedidosFiltrados.filter(p => p.prioridade === 'Urgente').length;
    
    return { total, valorTotal, pendentes, urgentes };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="space-y-6">
      {/* Board Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: '2400px' }}>
          {colunasComPedidos.map((coluna) => {
            const IconComponent = coluna.icon;
            const isOver = dragOverColumn === coluna.id;
            
            return (
              <div
                key={coluna.id}
                className={clsx(
                  'flex-1 min-w-60 max-w-72',
                  'border-2 border-dashed rounded-lg transition-all duration-200',
                  coluna.color,
                  isOver && 'ring-2 ring-blue-500 border-blue-300 dark:border-blue-600'
                )}
                onDragOver={(e) => handleDragOver(e, coluna.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, coluna.status)}
              >
                {/* Header da Coluna */}
                <div className={clsx(
                  'p-4 border-b sticky top-0 z-10',
                  theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-600 backdrop-blur'
                    : 'bg-white/95 border-gray-200 backdrop-blur'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h3 className={clsx(
                        'font-semibold text-sm',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {coluna.title}
                      </h3>
                    </div>
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {coluna.pedidos.length}
                    </span>
                  </div>
                </div>

                {/* Cards dos Pedidos */}
                <div className="p-4 space-y-3 min-h-96 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {coluna.pedidos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className={clsx(
                        'w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3',
                        theme === 'dark'
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                      )}>
                        <IconComponent className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhum pedido {coluna.title.toLowerCase()}
                      </p>
                    </div>
                  ) : (
                    coluna.pedidos.map((pedido) => (
                      <div
                        key={pedido.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pedido)}
                        onDragEnd={handleDragEnd}
                      >
                        <PedidoCardSimplificado
                          pedido={pedido}
                          onClick={() => onPedidoClick(pedido)}
                          onEditClick={onPedidoEditClick ? () => onPedidoEditClick(pedido) : undefined}
                          onStatusChange={(novoStatus) => onStatusChange(pedido.id, novoStatus)}
                          isDragging={draggedPedido?.id === pedido.id}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;