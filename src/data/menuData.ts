import {
  HomeIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  TagIcon,
  CubeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: 'admin-dashboard',
    title: 'Dashboard Administrativa',
    icon: ChartBarIcon,
    path: '/admin-dashboard',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard',
  },
  {
    id: 'cardapio',
    title: 'Cardápio',
    icon: ClipboardDocumentListIcon,
    submenu: [
      { id: 'ver-cardapio', title: 'Ver Cardápio', path: '/cardapio/ver' },
    ],
  },
  {
    id: 'pedidos',
    title: 'Pedidos',
    icon: ShoppingCartIcon,
    submenu: [
      { id: 'cadastrar-pedido', title: 'Cadastrar Pedido', path: '/pedidos/cadastrar' },
      { id: 'listar-pedidos', title: 'Listar Pedidos', path: '/pedidos/listar' },
    ],
  },
  {
    id: 'categorias',
    title: 'Categorias',
    icon: TagIcon,
    submenu: [
      { id: 'cadastrar-categoria', title: 'Cadastrar Categoria', path: '/categorias/cadastrar' },
      { id: 'listar-categorias', title: 'Listar Categorias', path: '/categorias/listar' },
    ],
  },
  {
    id: 'produtos',
    title: 'Produtos',
    icon: CubeIcon,
    submenu: [
      { id: 'cadastrar-produto', title: 'Cadastrar Produto', path: '/produtos/cadastrar' },
      { id: 'listar-produtos', title: 'Listar Produtos', path: '/produtos/listar' },
    ],
  },
  {
    id: 'clientes',
    title: 'Clientes',
    icon: UsersIcon,
    submenu: [
      { id: 'cadastrar-cliente', title: 'Cadastrar Cliente', path: '/clientes/cadastrar' },
      { id: 'listar-clientes', title: 'Listar Clientes', path: '/clientes/listar' },
    ],
  },
  {
    id: 'empresas',
    title: 'Empresas',
    icon: BuildingOfficeIcon,
    submenu: [
      { id: 'cadastrar-empresa', title: 'Cadastrar Empresa', path: '/empresas/cadastrar' },
      { id: 'listar-empresas', title: 'Listar Empresas', path: '/empresas/listar' },
    ],
  },
  {
    id: 'entregadores',
    title: 'Entregadores',
    icon: TruckIcon,
    submenu: [
      { id: 'cadastrar-entregadores', title: 'Cadastrar Entregadores', path: '/entregadores/cadastrar' },
      { id: 'listar-entregadores', title: 'Listar Entregadores', path: '/entregadores/listar' },
    ],
  },
  {
    id: 'fornecedores',
    title: 'Fornecedores',
    icon: BuildingStorefrontIcon,
    submenu: [
      { id: 'cadastrar-fornecedores', title: 'Cadastrar Fornecedores', path: '/fornecedores/cadastrar' },
      { id: 'listar-fornecedores', title: 'Listar Fornecedores', path: '/fornecedores/listar' },
    ],
  },
  {
    id: 'usuarios',
    title: 'Usuários',
    icon: UserIcon,
    submenu: [
      { id: 'cadastrar-usuario', title: 'Cadastrar Usuário', path: '/usuarios/cadastrar' },
      { id: 'listar-usuarios', title: 'Listar Usuários', path: '/usuarios/listar' },
      { id: 'tipos-usuarios', title: 'Tipos de Usuários', path: '/usuarios/tipos' },
    ],
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    icon: CogIcon,
    submenu: [
      { id: 'dados-empresa', title: 'Dados da Empresa', path: '/configuracoes/dados-empresa' },
      { id: 'apis', title: 'APIs', path: '/configuracoes/apis' },
      { id: 'formas-pagamento', title: 'Formas de Pagamento', path: '/configuracoes/formas-pagamento' },
      { id: 'taxas-entrega', title: 'Taxas de Entrega', path: '/configuracoes/taxas-entrega' },
      { id: 'horario-funcionamento', title: 'Horário de Funcionamento', path: '/configuracoes/horario-funcionamento' },
      { id: 'integracoes', title: 'Integrações', path: '/configuracoes/integracoes' },
      { id: 'backup-sistema', title: 'Backup do Sistema', path: '/configuracoes/backup-sistema' },
    ],
  },
];

export const bottomMenuItem: MenuItem = {
  id: 'sair',
  title: 'Sair',
  icon: ArrowRightOnRectangleIcon,
  path: '/logout',
};
