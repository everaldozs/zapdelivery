import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  totalPedidos: number;
  ultimoPedido: string;
  status: 'Ativo' | 'Inativo';
  created_at: string;
  updated_at: string;
}

export interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  status: 'Ativo' | 'Inativo';
}

export interface ClienteStats {
  total: number;
  ativos: number;
  inativos: number;
  cidadesAtendidas: number;
  pedidosPorCliente: number;
}

class ClientesService {
  async listarClientes(profile: UserProfile | null): Promise<Cliente[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('clientes')
      .select(`
        *,
        pedidos!left(id)
      `)
      .order('nome', { ascending: true });

    // Aplicar filtro por estabelecimento apenas para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    // Processar dados para calcular estatísticas
    return (data || []).map(cliente => ({
      id: cliente.codigo || cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      totalPedidos: cliente.pedidos?.length || 0,
      ultimoPedido: cliente.updated_at || cliente.created_at,
      status: cliente.ativo ? 'Ativo' : 'Inativo',
      created_at: cliente.created_at,
      updated_at: cliente.updated_at
    }));
  }

  async obterClientePorId(id: string, profile: UserProfile | null): Promise<Cliente | null> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('clientes')
      .select('*')
      .eq('codigo', id);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.codigo || data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco || '',
      cidade: data.cidade || '',
      totalPedidos: 0, // Seria necessário uma query separada
      ultimoPedido: data.updated_at || data.created_at,
      status: data.ativo ? 'Ativo' : 'Inativo',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async criarCliente(dadosCliente: ClienteFormData, profile: UserProfile | null): Promise<Cliente> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      // Atendentes podem criar clientes
    }

    const estabelecimentoId = profile.estabelecimento_id;

    if (!estabelecimentoId) {
      throw new Error('ID do estabelecimento não encontrado');
    }

    // Verificar se já existe cliente com o mesmo email
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('codigo')
      .eq('email', dadosCliente.email)
      .maybeSingle();

    if (clienteExistente) {
      throw new Error('Já existe um cliente cadastrado com esse email');
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        endereco: dadosCliente.endereco,
        cidade: dadosCliente.cidade,
        ativo: dadosCliente.status === 'Ativo',
        codigo_estabelecimento: estabelecimentoId
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Falha ao criar cliente');
    }

    return {
      id: data.codigo || data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco || '',
      cidade: data.cidade || '',
      totalPedidos: 0,
      ultimoPedido: data.created_at,
      status: data.ativo ? 'Ativo' : 'Inativo',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async atualizarCliente(id: string, dadosCliente: ClienteFormData, profile: UserProfile | null): Promise<Cliente> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se já existe cliente com o mesmo email (exceto o atual)
    if (dadosCliente.email) {
      const { data: emailExistente } = await supabase
        .from('clientes')
        .select('codigo')
        .eq('email', dadosCliente.email)
        .neq('codigo', id)
        .maybeSingle();

      if (emailExistente) {
        throw new Error('Já existe um cliente com esse email');
      }
    }

    let query = supabase
      .from('clientes')
      .update({
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        endereco: dadosCliente.endereco,
        cidade: dadosCliente.cidade,
        ativo: dadosCliente.status === 'Ativo'
      })
      .eq('codigo', id);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Cliente não encontrado ou sem permissão');
    }

    return {
      id: data.codigo || data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco || '',
      cidade: data.cidade || '',
      totalPedidos: 0, // Seria necessário uma query separada
      ultimoPedido: data.updated_at,
      status: data.ativo ? 'Ativo' : 'Inativo',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async excluirCliente(id: string, profile: UserProfile | null): Promise<void> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se existem pedidos vinculados a esse cliente
    const { data: pedidosVinculados } = await supabase
      .from('pedidos')
      .select('codigo')
      .eq('codigo_cliente', id)
      .limit(1);

    if (pedidosVinculados && pedidosVinculados.length > 0) {
      throw new Error('Não é possível excluir cliente que possui pedidos vinculados');
    }

    let query = supabase
      .from('clientes')
      .delete()
      .eq('codigo', id);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Erro ao excluir cliente:', error);
      throw error;
    }
  }

  async obterEstatisticas(profile: UserProfile | null): Promise<ClienteStats> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('clientes')
      .select('codigo, ativo, cidade');

    // Aplicar filtro por estabelecimento apenas para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data: clientes, error } = await query;

    if (error) {
      console.error('Erro ao buscar estatísticas de clientes:', error);
      throw error;
    }

    const total = clientes?.length || 0;
    const ativos = clientes?.filter(c => c.ativo).length || 0;
    const inativos = total - ativos;
    const cidadesAtendidas = new Set(
      clientes
        ?.map(c => c.cidade)
        ?.filter(cidade => cidade && cidade.trim() !== '')
    ).size;

    return {
      total,
      ativos,
      inativos,
      cidadesAtendidas,
      pedidosPorCliente: total > 0 ? Math.round(total / total) : 0 // Placeholder
    };
  }
}

export const clientesService = new ClientesService();
export default clientesService;
