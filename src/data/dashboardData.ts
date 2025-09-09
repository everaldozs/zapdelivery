import {
  BuildingOfficeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { DashboardCard, ChartData, Notification } from '../types';

export const dashboardCards: DashboardCard[] = [
  {
    title: 'Empresas Cadastradas',
    value: '28',
    icon: BuildingOfficeIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Pedidos Realizados',
    value: '1.500',
    icon: ShoppingCartIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Receita Total',
    value: 'R$ 12.579,40',
    icon: CurrencyDollarIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Clientes Cadastrados',
    value: '2.000',
    icon: UsersIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export const chartData: ChartData[] = [
  { name: 'Hamburguers', value: 450, color: '#F97F51' },
  { name: 'Pizzas', value: 380, color: '#00B894' },
  { name: 'Bebidas', value: 320, color: '#74B9FF' },
  { name: 'Espetinhos', value: 290, color: '#FD79A8' },
];

export const notifications: Notification[] = [
  {
    id: '1',
    message: 'Novo item popular: Risoto de Cogumelos',
    time: '2h atrás',
    icon: ArrowTrendingUpIcon,
    color: 'text-green-600',
  },
  {
    id: '2',
    message: 'Categoria Sobremesas cresceu 15%',
    time: '5h atrás',
    icon: ArrowTrendingUpIcon,
    color: 'text-blue-600',
  },
  {
    id: '3',
    message: 'Lembrete: Atualizar preços',
    time: '1d atrás',
    icon: ClockIcon,
    color: 'text-orange-600',
  },
];

export const productDistribution = [
  { name: 'Pratos Principais', value: 35, color: '#00B894' },
  { name: 'Bebidas', value: 25, color: '#74B9FF' },
  { name: 'Sobremesas', value: 20, color: '#F97F51' },
  { name: 'Acompanhamentos', value: 20, color: '#FD79A8' },
];
