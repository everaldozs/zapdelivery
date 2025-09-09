// Tipos para integração com Supabase
export interface PedidoSupabase {
  codigo: string;
  numero_pedido: string;
  codigo_estabelecimento?: string;
  codigo_cliente?: string;
  status: StatusPedidoSupabase;
  total_pedido: number;
  data_criacao: string;
  data_ultima_alteracao?: string;
  forma_pagamento?: string;
  forma_entrega?: string;
  valor_entrega?: number;
  observacao_pedido?: string;
  
  // Dados do cliente (vem do JOIN)
  cliente_nome?: string;
  cliente_sobrenome?: string;
  cliente_whatsapp?: string;
}

export interface ItemPedidoSupabase {
  codigo: string;
  codigo_pedido: string;
  codigo_produto?: string;
  nome_item: string;
  qtde_item: number;
  valor_item: number;
  total_produto: number;
  data_criacao: string;
  data_ultima_alteracao?: string;
  numero_do_pedido: string;
}

export type StatusPedidoSupabase = 
  | 'Pedindo'
  | 'Aguardando Pagamento'
  | 'Pagamento Confirmado'
  | 'Em preparação'
  | 'Pedido Pronto'
  | 'Saiu para entrega'
  | 'Pedido Entregue'
  | 'Cancelado Pelo Estabelecimento'
  | 'Cancelado pelo Cliente';

// Mapeamento de status do banco para o frontend (agora são idênticos)
export const STATUS_MAPPING: Record<StatusPedidoSupabase, string> = {
  'Pedindo': 'Pedindo',
  'Aguardando Pagamento': 'Aguardando Pagamento',
  'Pagamento Confirmado': 'Pagamento Confirmado',
  'Em preparação': 'Em preparação',
  'Pedido Pronto': 'Pedido Pronto',
  'Saiu para entrega': 'Saiu para entrega',
  'Pedido Entregue': 'Pedido Entregue',
  'Cancelado Pelo Estabelecimento': 'Cancelado Pelo Estabelecimento',
  'Cancelado pelo Cliente': 'Cancelado pelo Cliente'
};

// Mapeamento reverso do frontend para o banco (agora são idênticos)
export const STATUS_MAPPING_REVERSE: Record<string, StatusPedidoSupabase> = {
  'Pedindo': 'Pedindo',
  'Aguardando Pagamento': 'Aguardando Pagamento',
  'Pagamento Confirmado': 'Pagamento Confirmado',
  'Em preparação': 'Em preparação',
  'Pedido Pronto': 'Pedido Pronto',
  'Saiu para entrega': 'Saiu para entrega',
  'Pedido Entregue': 'Pedido Entregue',
  'Cancelado Pelo Estabelecimento': 'Cancelado Pelo Estabelecimento',
  'Cancelado pelo Cliente': 'Cancelado pelo Cliente'
};

// Função para converter dados do Supabase para o formato do frontend
export function convertPedidoFromSupabase(pedidoSupabase: PedidoSupabase, itens: ItemPedidoSupabase[]): import('./index').Pedido {
  return {
    id: parseInt(pedidoSupabase.numero_pedido) || 0,
    cliente: {
      nome: `${pedidoSupabase.cliente_nome || 'Cliente'} ${pedidoSupabase.cliente_sobrenome || ''}`.trim(),
      telefone: formatarTelefone(pedidoSupabase.cliente_whatsapp || ''),
      endereco: {
        rua: 'Endereço não informado',
        numero: 'S/N',
        bairro: 'Bairro',
        cidade: 'Cidade'
      }
    },
    itens: itens.map(item => ({
      produto: item.nome_item,
      quantidade: item.qtde_item,
      preco: parseFloat(item.valor_item.toString()),
      observacoes: undefined
    })),
    valores: {
      subtotal: itens.reduce((sum, item) => sum + parseFloat(item.total_produto.toString()), 0),
      taxaEntrega: parseFloat((pedidoSupabase.valor_entrega || 0).toString()),
      desconto: 0,
      total: parseFloat(pedidoSupabase.total_pedido.toString())
    },
    status: STATUS_MAPPING[pedidoSupabase.status] as import('./index').Pedido['status'],
    dataPedido: pedidoSupabase.data_criacao,
    pagamento: {
      metodo: pedidoSupabase.forma_pagamento || 'Não informado',
      status: pedidoSupabase.status === 'Pagamento Confirmado' ? 'Pago' : 'Pendente'
    },
    observacoes: pedidoSupabase.observacao_pedido,
    historico: [
      {
        status: STATUS_MAPPING[pedidoSupabase.status],
        data: pedidoSupabase.data_ultima_alteracao || pedidoSupabase.data_criacao,
        usuario: 'Sistema'
      }
    ],
    prioridade: 'Normal'
  };
}

// Função auxiliar para formatar telefone
function formatarTelefone(whatsapp: string): string {
  if (!whatsapp) return 'Não informado';
  
  // Remove caracteres não numéricos
  const numeros = whatsapp.replace(/\D/g, '');
  
  // Formatar telefone brasileiro
  if (numeros.length === 13 && numeros.startsWith('55')) {
    // +55 11 99999-9999
    return `(${numeros.substr(2, 2)}) ${numeros.substr(4, 5)}-${numeros.substr(9)}`;
  } else if (numeros.length === 11) {
    // 11 99999-9999
    return `(${numeros.substr(0, 2)}) ${numeros.substr(2, 5)}-${numeros.substr(7)}`;
  }
  
  return whatsapp;
}