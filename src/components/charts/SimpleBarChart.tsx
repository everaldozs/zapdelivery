import React from 'react';
import { clsx } from 'clsx';

interface SimpleBarChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  theme: 'light' | 'dark';
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, theme }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <span className={clsx(
          'text-sm',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Nenhum dado disponível
        </span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="h-[300px] p-4">
      {/* Título do eixo Y */}
      <div className="mb-4">
        <span className={clsx(
          'text-xs font-medium',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Quantidade de Vendas
        </span>
      </div>

      {/* Container do gráfico */}
      <div className="flex items-end justify-center h-52 space-x-4">
        {data.map((item, index) => {
          const heightPercentage = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center group">
              {/* Valor no topo da barra */}
              <div className={clsx(
                'text-xs font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {item.value}
              </div>
              
              {/* Barra */}
              <div 
                className="w-12 bg-gradient-to-t from-opacity-80 to-opacity-60 rounded-t-md transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  height: `${heightPercentage}%`,
                  backgroundColor: item.color,
                  minHeight: '8px'
                }}
                title={`${item.name}: ${item.value} vendas`}
              />
              
              {/* Label da categoria */}
              <div className={clsx(
                'text-xs font-medium mt-2 text-center max-w-16',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Linha de base */}
      <div className={clsx(
        'h-px mt-2',
        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
      )} />
      
      {/* Legenda */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className={clsx(
              'text-xs',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;