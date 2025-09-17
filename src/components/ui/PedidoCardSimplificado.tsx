import React, { useState } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { Pedido } from '../../types';
import { 
  EyeIcon,
  PencilIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface PedidoCardSimplificadoProps {
  pedido: Pedido;
  onClick: () => void;
  onEditClick?: () => void;
  onStatusChange: (novoStatus: Pedido['status']) => void;
  isDragging?: boolean;
}

const PedidoCardSimplificado: React.FC<PedidoCardSimplificadoProps> = ({ 
  pedido, 
  onClick, 
  onEditClick,
  onStatusChange,
  isDragging 
}) => {
  const { theme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  // Todos os 9 status disponíveis
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

  const handleStatusChange = (e: React.MouseEvent, novoStatus: Pedido['status']) => {
    e.stopPropagation(); // Prevenir navegação do card
    onStatusChange(novoStatus);
    setShowDropdown(false);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir navegação do card
    setShowDropdown(!showDropdown);
  };

  const handleCardClick = () => {
    onClick(); // Navegar para detalhes do pedido
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(); // Navegar para detalhes
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(); // Abrir modal em modo de edição
    } else {
      onClick(); // Fallback para compatibilidade
    }
  };

  return (
    <div className="relative">
      {/* Card do pedido - LAYOUT EXATO DA IMAGEM */}
      <div
        onClick={handleCardClick}
        className={clsx(
          'bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md relative',
          'dark:bg-gray-800 dark:border-gray-700',
          isDragging && 'opacity-50 transform rotate-1 shadow-lg',
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        )}
        draggable
      >
        {/* 1. Número do Pedido (Topo, bem destacado) */}
        <div className="mb-3">
          <span className={clsx(
            'font-bold text-lg',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            #{pedido.id}
          </span>
        </div>

        {/* 2. Dropdown de Status (Segunda linha) */}
        <div className="mb-4 relative">
          <button
            onClick={handleDropdownClick}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            )}
          >
            <span className="font-medium">{pedido.status}</span>
            <ChevronDownIcon className={clsx(
              'h-4 w-4 transition-transform',
              showDropdown && 'transform rotate-180'
            )} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Overlay para fechar */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className={clsx(
                'absolute top-full left-0 right-0 mt-1 rounded-md shadow-xl z-20 border max-h-60 overflow-y-auto',
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              )}>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => handleStatusChange(e, status)}
                    className={clsx(
                      'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                      pedido.status === status && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3. Nome do Cliente (Terceira linha) */}
        <div className="mb-4">
          <p className={clsx(
            'font-medium text-sm',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {pedido.cliente.nome}
          </p>
        </div>

        {/* 4. Preço (Quarta linha, em verde) */}
        <div className="mb-4">
          <p className="font-bold text-lg text-green-600 dark:text-green-400">
            R$ {pedido.valores.total.toFixed(2)}
          </p>
        </div>

        {/* 5. Botões "Ver" e "Editar" (Linha inferior) */}
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewClick}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <EyeIcon className="h-4 w-4" />
            Ver
          </button>
          <button
            onClick={handleEditClick}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PedidoCardSimplificado;