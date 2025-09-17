import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';
import type { PedidoSupabase, ItemPedidoSupabase, StatusPedidoSupabase } from '../types/supabase';
import { STATUS_MAPPING_REVERSE } from '../types/supabase';
import type { Pedido } from '../types';

class PedidosService {
  /**
   * Busca todos os pedidos do estabelecimento do usuário logado
   */
  static async buscarPedidos(profile: UserProfile | null): Promise<PedidoSupabase[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Buscando pedidos para profile:', {
      role: profile.role_name,
      estabelecimento_id: profile.estabelecimento_id,
      nome: profile.name
    });

    try {
      let query = supabase
        .from('pedidos')
        .select(`
          codigo,
          "numero do pedido",
          codigo_estabelecimento,
          codigo_cliente,
          status,
          total_pedido,
          data_criacao,
          data_ultima_alteracao,
          "Forma de Pagamento",
          "Forma de Entregra",
          "Valor_da_Entrega",
          "Obervação do Pedido",
          clientes (
            nome,
            sobrenome,
            whatsapp
          )
        `)
        .order('data_criacao', { ascending: false });

      // Aplicar filtro por estabelecimento apenas para não-admin
      if (profile.role_name !== 'Administrator') {
        if (profile.estabelecimento_id) {
          console.log('📌 Filtrando pedidos por estabelecimento:', profile.estabelecimento_id);
          query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
        } else {
          console.warn('⚠️ Usuário não-admin sem estabelecimento_id');
          // Para usuários sem estabelecimento, retornar array vazio
          return [];
        }
      } else {
        console.log('👑 Admin: buscando todos os pedidos');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        throw new Error(`Erro na consulta: ${error.message}`);
      }

      console.log('✅ Pedidos encontrados:', data?.length || 0);
      
      if (!data) {
        console.log('📝 Nenhum dado retornado pela consulta');
        return [];
      }

      // Converter para formato PedidoSupabase
      const pedidosConvertidos = data.map(pedido => ({
        codigo: pedido.codigo,
        numero_pedido: pedido["numero do pedido"] || '',
        codigo_estabelecimento: pedido.codigo_estabelecimento,
        codigo_cliente: pedido.codigo_cliente,
        status: pedido.status as StatusPedidoSupabase,
        total_pedido: parseFloat(pedido.total_pedido?.toString() || '0'),
        data_criacao: pedido.data_criacao,
        data_ultima_alteracao: pedido.data_ultima_alteracao,
        forma_pagamento: pedido["Forma de Pagamento"],
        forma_entrega: pedido["Forma de Entregra"],
        valor_entrega: parseFloat(pedido["Valor_da_Entrega"]?.toString() || '0'),
        observacao_pedido: pedido["Obervação do Pedido"],
        cliente_nome: (pedido.clientes as any)?.nome,
        cliente_sobrenome: (pedido.clientes as any)?.sobrenome,
        cliente_whatsapp: (pedido.clientes as any)?.whatsapp
      }));
      
      console.log('🔄 Pedidos convertidos:', pedidosConvertidos.length);
      return pedidosConvertidos;
    } catch (error) {
      console.error('💥 Erro crítico no serviço de pedidos:', error);
      
      // Melhor tratamento de erros
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Erro desconhecido ao carregar pedidos');
      }
    }
  }

  /**
   * Busca itens de um pedido específico
   */
  static async buscarItensPedido(codigoPedido: string): Promise<ItemPedidoSupabase[]> {
    try {
      const { data, error } = await supabase
        .from('itens_pedido')
        .select(`
          codigo,
          codigo_pedido,
          codigo_produto,
          nome_item,
          qtde_item,
          valor_item,
          total_produto,
          data_criacao,
          data_ultima_alteracao,
          numero_do_pedido
        `)
        .eq('codigo_pedido', codigoPedido)
        .order('data_criacao', { ascending: true });

      if (error) {
        console.error('Erro ao buscar itens do pedido:', error);
        throw error;
      }

      return (data || []).map(item => ({
        codigo: item.codigo,
        codigo_pedido: item.codigo_pedido,
        codigo_produto: item.codigo_produto,
        nome_item: item.nome_item || '',
        qtde_item: item.qtde_item || 0,
        valor_item: parseFloat(item.valor_item?.toString() || '0'),
        total_produto: parseFloat(item.total_produto?.toString() || '0'),
        data_criacao: item.data_criacao,
        data_ultima_alteracao: item.data_ultima_alteracao,
        numero_do_pedido: item.numero_do_pedido || ''
      }));
    } catch (error) {
      console.error('Erro ao buscar itens do pedido:', error);
      throw error;
    }
  }

  /**
   * Busca todos os itens para uma lista de pedidos
   */
  static async buscarItensMultiplosPedidos(codigosPedidos: string[]): Promise<{ [codigoPedido: string]: ItemPedidoSupabase[] }> {
    if (codigosPedidos.length === 0) {
      return {};
    }

    try {
      const { data, error } = await supabase
        .from('itens_pedido')
        .select(`
          codigo,
          codigo_pedido,
          codigo_produto,
          nome_item,
          qtde_item,
          valor_item,
          total_produto,
          data_criacao,
          data_ultima_alteracao,
          numero_do_pedido
        `)
        .in('codigo_pedido', codigosPedidos)
        .order('data_criacao', { ascending: true });

      if (error) {
        console.error('Erro ao buscar itens dos pedidos:', error);
        throw error;
      }

      // Agrupar itens por pedido
      const itensPorPedido: { [codigoPedido: string]: ItemPedidoSupabase[] } = {};
      
      (data || []).forEach(item => {
        const codigoPedido = item.codigo_pedido;
        if (!itensPorPedido[codigoPedido]) {
          itensPorPedido[codigoPedido] = [];
        }
        
        itensPorPedido[codigoPedido].push({
          codigo: item.codigo,
          codigo_pedido: item.codigo_pedido,
          codigo_produto: item.codigo_produto,
          nome_item: item.nome_item || '',
          qtde_item: item.qtde_item || 0,
          valor_item: parseFloat(item.valor_item?.toString() || '0'),
          total_produto: parseFloat(item.total_produto?.toString() || '0'),
          data_criacao: item.data_criacao,
          data_ultima_alteracao: item.data_ultima_alteracao,
          numero_do_pedido: item.numero_do_pedido || ''
        });
      });

      return itensPorPedido;
    } catch (error) {
      console.error('Erro ao buscar itens dos pedidos:', error);
      throw error;
    }
  }

  /**
   * Atualiza o status de um pedido
   */
  static async atualizarStatusPedido(codigoPedido: string, novoStatus: StatusPedidoSupabase): Promise<void> {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          status: novoStatus,
          data_ultima_alteracao: new Date().toISOString()
        })
        .eq('codigo', codigoPedido);

      if (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço ao atualizar status:', error);
      throw error;
    }
  }

  /**
   * Busca um pedido específico com seus itens
   */
  static async buscarPedidoPorCodigo(codigoPedido: string): Promise<{ pedido: PedidoSupabase, itens: ItemPedidoSupabase[] } | null> {
    try {
      // Buscar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select(`
          codigo,
          "numero do pedido",
          codigo_estabelecimento,
          codigo_cliente,
          status,
          total_pedido,
          data_criacao,
          data_ultima_alteracao,
          "Forma de Pagamento",
          "Forma de Entregra",
          "Valor_da_Entrega",
          "Obervação do Pedido",
          clientes (
            nome,
            sobrenome,
            whatsapp
          )
        `)
        .eq('codigo', codigoPedido)
        .maybeSingle();

      if (pedidoError) {
        console.error('Erro ao buscar pedido:', pedidoError);
        throw pedidoError;
      }

      if (!pedidoData) {
        return null;
      }

      // Buscar itens do pedido
      const itens = await this.buscarItensPedido(codigoPedido);

      const pedido: PedidoSupabase = {
        codigo: pedidoData.codigo,
        numero_pedido: pedidoData["numero do pedido"] || '',
        codigo_estabelecimento: pedidoData.codigo_estabelecimento,
        codigo_cliente: pedidoData.codigo_cliente,
        status: pedidoData.status as StatusPedidoSupabase,
        total_pedido: parseFloat(pedidoData.total_pedido?.toString() || '0'),
        data_criacao: pedidoData.data_criacao,
        data_ultima_alteracao: pedidoData.data_ultima_alteracao,
        forma_pagamento: pedidoData["Forma de Pagamento"],
        forma_entrega: pedidoData["Forma de Entregra"],
        valor_entrega: parseFloat(pedidoData["Valor_da_Entrega"]?.toString() || '0'),
        observacao_pedido: pedidoData["Obervação do Pedido"],
        cliente_nome: (pedidoData.clientes as any)?.nome,
        cliente_sobrenome: (pedidoData.clientes as any)?.sobrenome,
        cliente_whatsapp: (pedidoData.clientes as any)?.whatsapp
      };

      return { pedido, itens };
    } catch (error) {
      console.error('Erro ao buscar pedido por código:', error);
      throw error;
    }
  }

  /**
   * Converte status do frontend para o formato do banco
   */
  static converterStatusParaBanco(statusFrontend: Pedido['status']): StatusPedidoSupabase {
    return STATUS_MAPPING_REVERSE[statusFrontend] || 'Pedindo';
  }

  /**
   * Mapeia status do banco para o formato do frontend (agora são idênticos)
   */
  static mapStatusFromDatabase(dbStatus: string): string {
    // Não há necessidade de mapeamento - usar os status exatos do banco
    const statusValidos = [
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
    
    return statusValidos.includes(dbStatus) ? dbStatus : 'Pedindo';
  }

  /**
   * Criar um novo pedido com itens
   */
  static async criarPedido(
    dadosPedido: {
      codigo_cliente: string;
      total_pedido: number;
      forma_pagamento: string;
      forma_entrega: string;
      valor_entrega: number;
      observacao_pedido?: string;
    },
    itens: {
      codigo_produto: string;
      nome_item: string;
      qtde_item: number;
      valor_item: number;
      total_produto: number;
    }[],
    profile: UserProfile | null
  ): Promise<{ pedido: PedidoSupabase, itens: ItemPedidoSupabase[] }> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    if (!profile.estabelecimento_id) {
      throw new Error('Estabelecimento não encontrado');
    }

    if (itens.length === 0) {
      throw new Error('Pedido deve ter pelo menos um item');
    }

    console.log('🛒 Iniciando criação do pedido:', {
      estabelecimento: profile.estabelecimento_id,
      cliente: dadosPedido.codigo_cliente,
      total: dadosPedido.total_pedido,
      itens: itens.length
    });

    try {
      // Gerar número do pedido
      const numeroPedido = `${new Date().getFullYear()}${Date.now().toString().slice(-4)}`;
      console.log('🔢 Número do pedido gerado:', numeroPedido);

      // Criar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          "numero do pedido": numeroPedido,
          codigo_estabelecimento: profile.estabelecimento_id,
          codigo_cliente: dadosPedido.codigo_cliente,
          total_pedido: dadosPedido.total_pedido,
          "Forma de Pagamento": dadosPedido.forma_pagamento,
          "Forma de Entregra": dadosPedido.forma_entrega,
          "Valor_da_Entrega": dadosPedido.valor_entrega,
          "Obervação do Pedido": dadosPedido.observacao_pedido,
          status: 'Pedindo' as StatusPedidoSupabase
        })
        .select()
        .single();

      if (pedidoError) {
        console.error('❌ Erro ao criar pedido:', pedidoError);
        throw new Error(`Erro ao criar pedido: ${pedidoError.message}`);
      }

      if (!pedidoData) {
        throw new Error('Falha ao criar pedido - nenhum dado retornado');
      }

      console.log('✅ Pedido criado com sucesso:', pedidoData.codigo);

      // Criar itens do pedido
      const itensParaInserir = itens.map(item => ({
        codigo_pedido: pedidoData.codigo,
        numero_do_pedido: numeroPedido,
        codigo_produto: item.codigo_produto,
        nome_item: item.nome_item,
        qtde_item: item.qtde_item,
        valor_item: item.valor_item,
        total_produto: item.total_produto
      }));

      console.log('📦 Inserindo', itensParaInserir.length, 'itens...');
      const { data: itensData, error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensParaInserir)
        .select();

      if (itensError) {
        console.error('❌ Erro ao criar itens do pedido:', itensError);
        // Tentar deletar o pedido criado
        await supabase.from('pedidos').delete().eq('codigo', pedidoData.codigo);
        throw new Error(`Erro ao criar itens: ${itensError.message}`);
      }

      console.log('✅ Itens criados com sucesso:', itensData?.length || 0);

      // Converter para formatos de retorno
      const pedidoFormatado: PedidoSupabase = {
        codigo: pedidoData.codigo,
        numero_pedido: numeroPedido,
        codigo_estabelecimento: pedidoData.codigo_estabelecimento,
        codigo_cliente: pedidoData.codigo_cliente,
        status: pedidoData.status as StatusPedidoSupabase,
        total_pedido: parseFloat(pedidoData.total_pedido?.toString() || '0'),
        data_criacao: pedidoData.data_criacao,
        data_ultima_alteracao: pedidoData.data_ultima_alteracao,
        forma_pagamento: pedidoData["Forma de Pagamento"],
        forma_entrega: pedidoData["Forma de Entregra"],
        valor_entrega: parseFloat(pedidoData["Valor_da_Entrega"]?.toString() || '0'),
        observacao_pedido: pedidoData["Obervação do Pedido"],
        cliente_nome: undefined,
        cliente_sobrenome: undefined,
        cliente_whatsapp: undefined
      };

      const itensFormatados: ItemPedidoSupabase[] = (itensData || []).map(item => ({
        codigo: item.codigo,
        codigo_pedido: item.codigo_pedido,
        codigo_produto: item.codigo_produto,
        nome_item: item.nome_item || '',
        qtde_item: item.qtde_item || 0,
        valor_item: parseFloat(item.valor_item?.toString() || '0'),
        total_produto: parseFloat(item.total_produto?.toString() || '0'),
        data_criacao: item.data_criacao,
        data_ultima_alteracao: item.data_ultima_alteracao,
        numero_do_pedido: item.numero_do_pedido || ''
      }));

      console.log('🎉 Pedido completo criado com sucesso!');
      return { pedido: pedidoFormatado, itens: itensFormatados };

    } catch (error) {
      console.error('💥 Erro crítico ao criar pedido:', error);
      throw error;
    }
  }
  /**
   * Excluir um pedido e seus itens de forma robusta
   */
  static async excluirPedido(codigoPedido: string): Promise<void> {
    console.log('🗑️ [excluirPedido] Iniciando exclusão robusta do pedido:', codigoPedido);
    
    try {
      // ETAPA 1: Excluir todos os itens do pedido primeiro (CASCADE DELETE)
      console.log('📋 [excluirPedido] Etapa 1: Excluindo itens do pedido...');
      const { error: itensError, count: itensCount } = await supabase
        .from('itens_pedido')
        .delete({ count: 'exact' })
        .eq('codigo_pedido', codigoPedido);

      if (itensError) {
        console.error('❌ [excluirPedido] ERRO ao excluir itens do pedido:', itensError);
        throw new Error(`Falha ao excluir itens do pedido: ${itensError.message}`);
      }

      console.log(`✅ [excluirPedido] Etapa 1 concluída: ${itensCount || 0} itens excluídos`);

      // ETAPA 2: Excluir o pedido principal
      console.log('🎯 [excluirPedido] Etapa 2: Excluindo pedido principal...');
      const { error: pedidoError, count: pedidoCount } = await supabase
        .from('pedidos')
        .delete({ count: 'exact' })
        .eq('codigo', codigoPedido);

      if (pedidoError) {
        console.error('❌ [excluirPedido] ERRO ao excluir pedido principal:', pedidoError);
        throw new Error(`Falha ao excluir pedido: ${pedidoError.message}`);
      }

      if (pedidoCount === 0) {
        console.warn('⚠️ [excluirPedido] ATENÇÃO: Nenhum pedido foi excluído. Pedido não encontrado.');
        throw new Error('Pedido não encontrado para exclusão');
      }

      console.log(`✅ [excluirPedido] Etapa 2 concluída: ${pedidoCount} pedido excluído`);
      console.log('🎉 [excluirPedido] EXCLUSÃO COMPLETA COM SUCESSO para pedido:', codigoPedido);
      
    } catch (error) {
      console.error('💥 [excluirPedido] FALHA CRÍTICA na exclusão do pedido:', codigoPedido, error);
      
      // Re-lançar o erro com mais contexto
      if (error instanceof Error) {
        throw new Error(`Exclusão falhou: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido durante exclusão do pedido');
      }
    }
  }
}

export default PedidosService;
export { PedidosService };