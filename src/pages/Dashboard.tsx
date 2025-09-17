import React from 'react';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import SimplePieChart from '../components/charts/SimplePieChart';
import Card from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';
import { dashboardCards, chartData, notifications, productDistribution } from '../data/dashboardData';
import { clsx } from 'clsx';
import { CalendarIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  // Custom tooltip para o gráfico de barras
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={clsx(
          'p-3 rounded-lg shadow-lg border',
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        )}>
          <p className="font-medium">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`Vendas: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Dashboard
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Visão geral do seu negócio
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className={clsx(
                    'text-sm font-medium',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {card.title}
                  </p>
                  <p className={clsx(
                    'text-2xl font-bold mt-2',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {card.value}
                  </p>
                </div>
                <div className={clsx(
                  'p-3 rounded-full',
                  theme === 'dark' ? card.bgColor.replace('50', '800') : card.bgColor
                )}>
                  <IconComponent className={clsx('h-6 w-6', card.color)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <div className="mb-6">
            <h2 className={clsx(
              'text-xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Vendas por Categoria
            </h2>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Performance das categorias mais vendidas
            </p>
          </div>
          
          <SimpleBarChart data={chartData} theme={theme} />
        </Card>

        {/* Notifications */}
        <Card>
          <div className="mb-6">
            <h2 className={clsx(
              'text-xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Notificações Recentes
            </h2>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Acompanhe as últimas atividades
            </p>
          </div>
          
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div key={notification.id} className="flex items-start space-x-3">
                  <div className={clsx(
                    'p-2 rounded-full flex-shrink-0',
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  )}>
                    <IconComponent className={clsx('h-4 w-4', notification.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      'text-sm',
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    )}>
                      {notification.message}
                    </p>
                    <p className={clsx(
                      'text-xs mt-1',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Distribution */}
        <Card>
          <div className="mb-6">
            <h2 className={clsx(
              'text-xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Distribuição de Produtos
            </h2>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Percentage de produtos por categoria
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center">
            <SimplePieChart data={productDistribution} theme={theme} />
          </div>
        </Card>

        {/* Calendar/Events */}
        <Card>
          <div className="mb-6">
            <h2 className={clsx(
              'text-xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Calendário de Eventos
            </h2>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Próximos eventos e lembretes
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className={clsx(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Reunião de vendas
                </p>
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                )}>
                  Hoje às 14:00
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className={clsx(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Atualização do sistema
                </p>
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                )}>
                  Amanhã às 10:00
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className={clsx(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Treinamento da equipe
                </p>
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                )}>
                  Sexta-feira às 09:00
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
