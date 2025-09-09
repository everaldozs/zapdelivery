import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

interface DashboardData {
  tipo: 'Administrator' | 'Estabelecimento' | 'Atendente';
  cards: {
    [key: string]: number;
  };
  estabelecimentos?: any[];
  atendentes?: any[];
  graficos?: {
    [key: string]: any[];
  };
  estabelecimento?: any;
}

const DashboardEspecifico: React.FC = () => {
  const { user, profile, session } = useAuth();
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !profile) return;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/dashboard-especifico', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setDashboardData(result.data);
        } else {
          const error = await response.json();
          setError(error.error || 'Erro ao carregar dados do dashboard');
        }
        
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setError('Erro de conexão ao carregar dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, profile]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

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
          <ChartBarIcon className={clsx(
            'h-12 w-12 mx-auto mb-4',
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          )} />
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

  if (!dashboardData) return null;

  // DASHBOARD ADMIN GERAL
  if (dashboardData.tipo === 'Administrator') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={clsx(
              'text-3xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Dashboard Global
            </h1>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Visão geral de todos os estabelecimentos da plataforma
            </p>
          </div>
        </div>

        {/* Cards de Métricas Globais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Total de Estabelecimentos
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.totalEstabelecimentos)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BuildingStorefrontIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Total de Pedidos
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.totalPedidos)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <ShoppingBagIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Total de Atendentes
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.totalAtendentes)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Faturamento Total
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatCurrency(dashboardData.cards.faturamentoTotal)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Estabelecimentos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={clsx(
              'text-xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Estabelecimentos Recentes
            </h2>
            <Button variant="secondary" size="sm">
              Ver Todos
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={clsx(
                'border-b',
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              )}>
                <tr>
                  <th className={clsx(
                    'text-left py-3 px-4 font-medium text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Estabelecimento
                  </th>
                  <th className={clsx(
                    'text-left py-3 px-4 font-medium text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Pedidos
                  </th>
                  <th className={clsx(
                    'text-left py-3 px-4 font-medium text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Faturamento
                  </th>
                  <th className={clsx(
                    'text-left py-3 px-4 font-medium text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Atendentes
                  </th>
                  <th className={clsx(
                    'text-right py-3 px-4 font-medium text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className={clsx(
                'divide-y',
                theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              )}>
                {dashboardData.estabelecimentos?.slice(0, 5).map((estabelecimento) => (
                  <tr key={estabelecimento.codigo} className={clsx(
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'transition-colors'
                  )}>
                    <td className="py-4 px-4">
                      <div>
                        <p className={clsx(
                          'font-medium',
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}>
                          {estabelecimento.nome}
                        </p>
                        <p className={clsx(
                          'text-sm',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        )}>
                          {estabelecimento.email}
                        </p>
                      </div>
                    </td>
                    <td className={clsx(
                      'py-4 px-4',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    )}>
                      {formatNumber(estabelecimento.totalPedidos)}
                    </td>
                    <td className={clsx(
                      'py-4 px-4 font-medium',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    )}>
                      {formatCurrency(estabelecimento.faturamento)}
                    </td>
                    <td className={clsx(
                      'py-4 px-4',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    )}>
                      {formatNumber(estabelecimento.totalAtendentes)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // DASHBOARD ESTABELECIMENTO
  if (dashboardData.tipo === 'Estabelecimento') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={clsx(
              'text-3xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Dashboard do Estabelecimento
            </h1>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {dashboardData.estabelecimento?.nome || profile?.estabelecimento_nome}
            </p>
          </div>
          <Link to="/atendentes">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Convidar Atendente
            </Button>
          </Link>
        </div>

        {/* Cards de Métricas do Estabelecimento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Total de Pedidos
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.totalPedidos)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <ShoppingBagIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Atendentes
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.totalAtendentes)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Produtos
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.totalProdutos)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <ChartBarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Faturamento
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatCurrency(dashboardData.cards.faturamento)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Atendentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={clsx(
                'text-xl font-bold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Atendentes Ativos
              </h2>
              <Link to="/atendentes">
                <Button variant="secondary" size="sm">
                  Gerenciar
                </Button>
              </Link>
            </div>
            
            {dashboardData.atendentes && dashboardData.atendentes.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.atendentes.slice(0, 3).map((atendente) => (
                  <div key={atendente.id} className={clsx(
                    'flex items-center justify-between p-3 rounded-lg',
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'h-10 w-10 rounded-full flex items-center justify-center',
                        'bg-green-100 dark:bg-green-900'
                      )}>
                        <UserGroupIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className={clsx(
                          'font-medium',
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}>
                          {atendente.nome}
                        </p>
                        <p className={clsx(
                          'text-sm',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        )}>
                          {atendente.ativo ? 'Ativo' : 'Inativo'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className={clsx(
                  'h-12 w-12 mx-auto mb-4',
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                )} />
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Nenhum atendente cadastrado
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className={clsx(
              'text-xl font-bold mb-6',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Pedidos por Status
            </h2>
            
            {dashboardData.graficos?.pedidosPorStatus && dashboardData.graficos.pedidosPorStatus.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.graficos.pedidosPorStatus.map((item, index) => (
                  <div key={index} className={clsx(
                    'flex items-center justify-between p-3 rounded-lg',
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  )}>
                    <span className={clsx(
                      'font-medium',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.name}
                    </span>
                    <span className={clsx(
                      'text-lg font-bold',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className={clsx(
                  'h-12 w-12 mx-auto mb-4',
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                )} />
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Nenhum pedido encontrado
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // DASHBOARD ATENDENTE (Simplificado)
  if (dashboardData.tipo === 'Atendente') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={clsx(
            'text-3xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Painel do Atendente
          </h1>
          <p className={clsx(
            'text-sm mt-1',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Resumo dos pedidos de hoje
          </p>
        </div>

        {/* Cards Simplificados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Pedidos Hoje
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.pedidosHoje)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <ShoppingBagIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Pendentes
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.pedidosPendentes)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <ArrowTrendingUpIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Em Preparo
                </p>
                <p className={clsx(
                  'text-3xl font-bold mt-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {formatNumber(dashboardData.cards.pedidosEmPreparo)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <ArrowTrendingDownIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Link para Pedidos */}
        <Card className="p-8 text-center">
          <h2 className={clsx(
            'text-xl font-bold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Gerenciar Pedidos
          </h2>
          <p className={clsx(
            'text-sm mb-6',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Acesse o kanban de pedidos para visualizar e alterar status dos pedidos
          </p>
          <Link to="/pedidos">
            <Button variant="primary" size="lg">
              Acessar Kanban de Pedidos
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return null;
};

export default DashboardEspecifico;