import React, { useEffect, useState } from 'react';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import SimplePieChart from '../components/charts/SimplePieChart';
import { 
  UserGroupIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  BuildingStorefrontIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50"
         style={{
           backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
           border: `1px solid ${theme === 'dark' ? '#4B5563' : '#E5E7EB'}`
         }}>
      <a href="#" className={clsx(
        'block px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500',
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      )} onClick={onClose}>
        <UserIcon className="h-4 w-4 inline mr-2" />
        Minha Conta
      </a>
      <a href="#" className={clsx(
        'block px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500',
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      )} onClick={onClose}>
        <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
        Perfil
      </a>
      <a href="#" className={clsx(
        'block px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500',
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      )} onClick={onClose}>
        <QuestionMarkCircleIcon className="h-4 w-4 inline mr-2" />
        Ajuda
      </a>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { metrics, loading, error, refetch } = useDashboardMetrics();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Controle de acesso - APENAS everaldozs@gmail.com ou admins
  const hasAccess = user?.email === 'everaldozs@gmail.com' || 
                   profile?.role_name === 'Administrator';

  // Atualizar hora em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Atualizar dados automaticamente a cada 30 segundos
  useEffect(() => {
    if (hasAccess && metrics) {
      const interval = setInterval(refetch, 30000);
      return () => clearInterval(interval);
    }
  }, [hasAccess, metrics, refetch]);

  // Se não tem acesso, mostrar mensagem de não autorizado
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={clsx(
          'text-center p-8 rounded-lg border',
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        )}>
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-lg mb-4">Esta dashboard é exclusiva para administradores.</p>
          <p className="text-sm opacity-70">
            Usuário atual: {user?.email || 'Não identificado'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={clsx(
          'text-center p-8 rounded-lg border',
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        )}>
          <h1 className="text-2xl font-bold mb-4 text-red-500">Erro</h1>
          <p className="text-lg mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Empresas Cadastradas',
      value: metrics?.estabelecimentos || 0,
      icon: BuildingStorefrontIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Pedidos Realizados',
      value: metrics?.pedidos || 0,
      icon: ShoppingBagIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Receita Total',
      value: `R$ ${(metrics?.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: 'Clientes Cadastrados',
      value: metrics?.clientes || 0,
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const productDistribution = metrics?.salesByCategory?.map(item => ({
    name: item.name,
    value: Math.round((item.value / (metrics?.salesByCategory?.reduce((sum, cat) => sum + cat.value, 0) || 1)) * 100),
    color: item.color
  })) || [];

  return (
    <div className={clsx(
      'min-h-screen transition-colors duration-300',
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      {/* Cabeçalho Superior */}
      <header className={clsx(
        'sticky top-0 z-40 border-b transition-colors duration-300',
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Lado Esquerdo - Saudação */}
            <div>
              <h1 className={clsx(
                'text-xl font-semibold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Olá, Everaldo
              </h1>
            </div>

            {/* Lado Direito - Data/Hora e Usuário */}
            <div className="flex items-center space-x-4">
              {/* Data e Hora */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className={clsx(
                  'h-5 w-5',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )} />
                <span className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {format(currentTime, "dd/MM/yyyy", { locale: ptBR })}
                </span>
                
                <ClockIcon className={clsx(
                  'h-5 w-5 ml-4',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )} />
                <span className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {format(currentTime, "HH:mm", { locale: ptBR })}
                </span>
              </div>

              {/* Toggle Dark/Light Mode */}
              <button
                onClick={toggleTheme}
                className={clsx(
                  'p-2 rounded-lg transition-colors duration-200',
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Área do Usuário */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={clsx(
                    'flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200',
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Everaldo</span>
                </button>
                
                <UserMenu 
                  isOpen={userMenuOpen} 
                  onClose={() => setUserMenuOpen(false)} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título da Página */}
        <div className="mb-8">
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Dashboard Administrativa
          </h1>
          <p className={clsx(
            'text-sm mt-2',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Visão geral completa do sistema ZapDelivery
          </p>
        </div>

        {/* Cartões de Informação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
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
                  <div className={clsx('p-3 rounded-full', card.bgColor)}>
                    <IconComponent className={clsx('h-6 w-6', card.color)} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Gráfico de Barras e Notificações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Vendas por Categoria */}
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
                Dados reais das categorias mais vendidas
              </p>
            </div>
            
            <SimpleBarChart 
              data={metrics?.salesByCategory || []} 
              theme={theme} 
            />
          </Card>

          {/* Painel de Notificações */}
          <Card>
            <div className="mb-6">
              <h2 className={clsx(
                'text-xl font-bold flex items-center',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <BellIcon className="h-6 w-6 mr-2" />
                Notificações Recentes
              </h2>
              <p className={clsx(
                'text-sm mt-1',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Atividades em tempo real do sistema
              </p>
            </div>
            
            <div className="space-y-4">
              {metrics?.notificacoes && metrics.notificacoes.length > 0 ? (
                metrics.notificacoes.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className={clsx(
                      'p-2 rounded-full flex-shrink-0',
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    )}>
                      <ShoppingBagIcon className={clsx('h-4 w-4', notification.color)} />
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
                ))
              ) : (
                <div className="text-center py-8">
                  <BellIcon className={clsx(
                    'h-12 w-12 mx-auto mb-4',
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  )} />
                  <p className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    Nenhuma notificação recente
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Seções Adicionais no Rodapé */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição de Produtos */}
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
                Percentual de vendas por categoria
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center">
              {productDistribution.length > 0 ? (
                <>
                  <SimplePieChart 
                    data={productDistribution} 
                    theme={theme} 
                  />
                  
                  <div className="space-y-3 lg:ml-6 mt-4 lg:mt-0">
                    {productDistribution.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className={clsx(
                          'text-sm',
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        )}>
                          {item.name} ({item.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-8">
                  <div className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    Nenhum dado de distribuição disponível
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Calendário de Eventos */}
          <Card>
            <div className="mb-6">
              <h2 className={clsx(
                'text-xl font-bold flex items-center',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <CalendarIcon className="h-6 w-6 mr-2" />
                Calendário de Eventos
              </h2>
              <p className={clsx(
                'text-sm mt-1',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Próximos eventos e lembretes do sistema
              </p>
            </div>
            
            <div className="space-y-4">
              <div className={clsx(
                'flex items-center space-x-3 p-4 rounded-lg',
                theme === 'dark' 
                  ? 'bg-blue-900/20 border border-blue-800' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
              )}>
                <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className={clsx(
                    'font-medium',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    Relatório Mensal
                  </p>
                  <p className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    15/09/2025 às 09:00
                  </p>
                </div>
              </div>
              
              <div className={clsx(
                'flex items-center space-x-3 p-4 rounded-lg',
                theme === 'dark' 
                  ? 'bg-green-900/20 border border-green-800' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              )}>
                <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className={clsx(
                    'font-medium',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    Atualização do Sistema
                  </p>
                  <p className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    20/09/2025 às 02:00
                  </p>
                </div>
              </div>
              
              <div className={clsx(
                'flex items-center space-x-3 p-4 rounded-lg',
                theme === 'dark' 
                  ? 'bg-yellow-900/20 border border-yellow-800' 
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
              )}>
                <CalendarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className={clsx(
                    'font-medium',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    Lembrete: Atualizar Preços
                  </p>
                  <p className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Hoje às 16:00
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;