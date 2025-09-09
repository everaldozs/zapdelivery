import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { Pedido } from '../../types';
import { 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface PedidosListaProps {
  pedidos: Pedido[];
  onPedidoClick: (pedido: Pedido) => void;
  onStatusChange?: (pedidoId: number, novoStatus: Pedido['status']) => void;
}

const PedidosLista: React.FC<PedidosListaProps> = ({ 
  pedidos, 
  onPedidoClick,
  onStatusChange
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pedindo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600';
      case 'Aguardando Pagamento':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-600';
      case 'Pagamento Confirmado':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-600';
      case 'Em preparação':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-600';
      case 'Pedido Pronto':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600';
      case 'Saiu para entrega':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-600';
      case 'Pedido Entregue':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-600';
      case 'Cancelado Pelo Estabelecimento':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600';
      case 'Cancelado pelo Cliente':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pedindo':
        return <ClockIcon className="h-4 w-4" />;
      case 'Aguardando Pagamento':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'Pagamento Confirmado':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Em preparação':
        return <ClockIcon className="h-4 w-4" />;
      case 'Pedido Pronto':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Saiu para entrega':
        return <TruckIcon className="h-4 w-4" />;
      case 'Pedido Entregue':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Cancelado Pelo Estabelecimento':
        return <XCircleIcon className="h-4 w-4" />;
      case 'Cancelado pelo Cliente':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (pedidos.length === 0) {
    return (
      <div className={clsx(
        'bg-white rounded-lg shadow border p-8 text-center',
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <div className="text-center py-8">
          <div className={clsx(
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4',
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          )}>
            <ClockIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className={clsx(
            'text-lg mb-2',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Nenhum pedido encontrado
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Os pedidos aparecerão aqui quando criados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow border overflow-hidden',
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    )}>
      {/* Header da Tabela */}
      <div className={clsx(
        'px-6 py-3 border-b grid grid-cols-12 gap-4 font-medium text-sm',
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600 text-gray-300' 
          : 'bg-gray-50 border-gray-200 text-gray-700'
      )}>
        <div className="col-span-2">Pedido</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-4">Cliente</div>
        <div className="col-span-3">Valor Total</div>
        <div className="col-span-1">Ações</div>
      </div>

      {/* Lista de Pedidos */}
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {pedidos.map((pedido) => {
          const isUrgente = pedido.prioridade === 'Urgente';
          const tempoDecorrido = new Date().getTime() - new Date(pedido.dataPedido).getTime();
          const isAtrasado = tempoDecorrido > 60 * 60 * 1000; // 1 hora

          return (
            <div
              key={pedido.id}
              className={clsx(
                'px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer',
                isUrgente && 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-400',
                isAtrasado && !isUrgente && 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-400'
              )}
              onClick={() => onPedidoClick(pedido)}
            >
              {/* Número do Pedido */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'font-semibold text-sm',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    #{pedido.id}
                  </span>
                  {isUrgente && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  )}
                  {isAtrasado && !isUrgente && (
                    <ClockIcon className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={clsx(
                  'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium',
                  getStatusColor(pedido.status)
                )}>
                  {getStatusIcon(pedido.status)}
                  <span className="hidden sm:inline">{pedido.status}</span>
                </span>
              </div>

              {/* Cliente */}
              <div className="col-span-4">
                <p className={clsx(
                  'font-medium text-sm truncate',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {pedido.cliente.nome}
                </p>
              </div>

              {/* Valor Total */}
              <div className="col-span-3">
                <div className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className={clsx(
                    'font-semibold text-sm',
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  )}>
                    R$ {pedido.valores.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="col-span-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPedidoClick(pedido);
                  }}
                  className={clsx(
                    'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  )}
                  title="Ver detalhes"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={clsx(
        'px-6 py-3 border-t text-xs',
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600 text-gray-400' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      )}>
        Total de {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default PedidosLista;