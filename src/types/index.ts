export interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path?: string;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  title: string;
  path: string;
}

export interface DashboardCard {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

export interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path?: string;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  title: string;
  path: string;
}

export interface DashboardCard {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

export interface Pedido {
  id: number;
  codigo?: string; // UUID do Supabase
  numeroPedidoOriginal?: string; // Número original do pedido para exclusão
  cliente: {
    nome: string;
    telefone: string;
    endereco: {
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      complemento?: string;
    };
  };
  itens: {
    produto: string;
    quantidade: number;
    preco: number;
    observacoes?: string;
  }[];
  valores: {
    subtotal: number;
    taxaEntrega: number;
    desconto: number;
    total: number;
  };
  status: 'Pedindo' | 'Aguardando Pagamento' | 'Pagamento Confirmado' | 'Em preparação' | 'Pedido Pronto' | 'Saiu para entrega' | 'Pedido Entregue' | 'Cancelado Pelo Estabelecimento' | 'Cancelado pelo Cliente';
  dataPedido: string;
  pagamento: {
    metodo: string;
    status: 'Pendente' | 'Pago' | 'Falhou';
  };
  entregador?: {
    nome: string;
    telefone: string;
  };
  observacoes?: string;
  historico: {
    status: string;
    data: string;
    usuario: string;
  }[];
  prioridade: 'Normal' | 'Urgente';
  tempoEstimado?: number; // minutos
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: Pedido['status'];
  color: string;
  icon: React.ComponentType<any>;
  pedidos: Pedido[];
}
