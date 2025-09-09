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
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface PedidoCardProps {
  pedido: Pedido;
  onClick: () => void;
  onStatusChange?: (novoStatus: Pedido['status']) => void;
  isDragging?: boolean;
}

const PedidoCard: React.FC<PedidoCardProps> = ({ 
  pedido, 
  onClick, 
  onStatusChange, 
  isDragging 
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600';
      case 'Confirmado':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-600';
      case 'Em Preparo':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-600';
      case 'Pronto':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-600';
      case 'Saiu para Entrega':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-600';
      case 'Entregue':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <ClockIcon className="h-4 w-4" />;
      case 'Confirmado':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Em Preparo':
        return <ClockIcon className="h-4 w-4" />;
      case 'Pronto':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Saiu para Entrega':
        return <TruckIcon className="h-4 w-4" />;
      case 'Entregue':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Cancelado':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatarTempo = (data: string) => {
    const agora = new Date();
    const dataPedido = new Date(data);
    const diffMinutos = Math.floor((agora.getTime() - dataPedido.getTime()) / (1000 * 60));
    
    if (diffMinutos < 60) {
      return `${diffMinutos}min`;
    } else {
      const horas = Math.floor(diffMinutos / 60);
      return `${horas}h${diffMinutos % 60 > 0 ? ` ${diffMinutos % 60}min` : ''}`;
    }
  };

  const isUrgente = pedido.prioridade === 'Urgente';
  const tempoDecorrido = new Date().getTime() - new Date(pedido.dataPedido).getTime();
  const isAtrasado = tempoDecorrido > 60 * 60 * 1000; // 1 hora

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md',
        'dark:bg-gray-800 dark:border-gray-700',
        isDragging && 'opacity-50 transform rotate-3 shadow-lg',
        isUrgente && 'ring-2 ring-red-400',
        isAtrasado && !isUrgente && 'ring-2 ring-orange-400'
      )}
      draggable
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'font-bold text-sm',
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
        <span className={clsx(
          'text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1',
          getStatusColor(pedido.status)
        )}>
          {getStatusIcon(pedido.status)}
          {pedido.status}
        </span>
      </div>

      {/* Cliente */}
      <div className="mb-3">
        <p className={clsx(
          'font-medium text-sm mb-1',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {pedido.cliente.nome}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <PhoneIcon className="h-3 w-3" />
          <span>{pedido.cliente.telefone}</span>
        </div>
      </div>

      {/* Endereço */}
      <div className="mb-3">
        <div className="flex items-start gap-1">
          <MapPinIcon className="h-3 w-3 mt-0.5 text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {pedido.cliente.endereco.rua}, {pedido.cliente.endereco.numero} - {pedido.cliente.endereco.bairro}
          </p>
        </div>
      </div>

      {/* Itens */}
      <div className="mb-3">
        <div className="space-y-1">
          {pedido.itens.slice(0, 2).map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {item.quantidade}x {item.produto}
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                R$ {item.preco.toFixed(2)}
              </span>
            </div>
          ))}
          {pedido.itens.length > 2 && (
            <p className="text-xs text-gray-400">
              +{pedido.itens.length - 2} itens
            </p>
          )}
        </div>
      </div>

      {/* Valor Total e Tempo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
          <span className={clsx(
            'font-bold text-sm',
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          )}>
            R$ {pedido.valores.total.toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatarTempo(pedido.dataPedido)}
        </div>
      </div>

      {/* Entregador */}
      {pedido.entregador && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <TruckIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pedido.entregador.nome}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidoCard;