import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';

export interface EntregadorSimples {
  codigo: string;
  nome: string;
  telefone: string;
  codigo_estabelecimento: string;
  data_criacao: string;
  ativo: boolean;
}

export interface EntregadorFormData {
  nome: string;
  telefone: string;
}

class EntregadoresService {
  async listarEntregadores(profile: UserProfile | null): Promise<EntregadorSimples[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('entregadores')
      .select('codigo, nome, telefone, codigo_estabelecimento, data_criacao, ativo')
      .order('nome', { ascending: true });

    // Aplicar filtro por estabelecimento apenas para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar entregadores:', error);
      throw error;
    }

    return data || [];
  }

  async criarEntregador(dadosEntregador: EntregadorFormData, profile: UserProfile | null): Promise<EntregadorSimples> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para cadastrar entregadores');
    }

    const estabelecimentoId = profile.estabelecimento_id;

    if (!estabelecimentoId) {
      throw new Error('ID do estabelecimento não encontrado');
    }

    // Verificar se já existe entregador com o mesmo nome no estabelecimento
    const { data: entregadorExistente } = await supabase
      .from('entregadores')
      .select('codigo')
      .eq('nome', dadosEntregador.nome)
      .eq('codigo_estabelecimento', estabelecimentoId)
      .maybeSingle();

    if (entregadorExistente) {
      throw new Error('Já existe um entregador com esse nome neste estabelecimento');
    }

    const { data, error } = await supabase
      .from('entregadores')
      .insert({
        nome: dadosEntregador.nome,
        telefone: dadosEntregador.telefone,
        codigo_estabelecimento: estabelecimentoId,
        ativo: true
      })
      .select('codigo, nome, telefone, codigo_estabelecimento, data_criacao, ativo')
      .maybeSingle();

    if (error) {
      console.error('Erro ao criar entregador:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Falha ao criar entregador');
    }

    return data;
  }

  async atualizarEntregador(codigo: string, dadosEntregador: EntregadorFormData, profile: UserProfile | null): Promise<EntregadorSimples> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para editar entregadores');
    }

    // Verificar se já existe entregador com o mesmo nome (exceto o atual)
    if (profile.estabelecimento_id) {
      const { data: entregadorExistente } = await supabase
        .from('entregadores')
        .select('codigo')
        .eq('nome', dadosEntregador.nome)
        .eq('codigo_estabelecimento', profile.estabelecimento_id)
        .neq('codigo', codigo)
        .maybeSingle();

      if (entregadorExistente) {
        throw new Error('Já existe um entregador com esse nome neste estabelecimento');
      }
    }

    let query = supabase
      .from('entregadores')
      .update({ 
        nome: dadosEntregador.nome,
        telefone: dadosEntregador.telefone
      })
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query
      .select('codigo, nome, telefone, codigo_estabelecimento, data_criacao, ativo')
      .maybeSingle();

    if (error) {
      console.error('Erro ao atualizar entregador:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Entregador não encontrado ou sem permissão');
    }

    return data;
  }

  async excluirEntregador(codigo: string, profile: UserProfile | null): Promise<void> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões - apenas estabelecimento e admin podem deletar
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para deletar entregadores');
    }

    // Verificar se existem pedidos vinculados a esse entregador
    const { data: pedidosVinculados } = await supabase
      .from('pedidos')
      .select('codigo')
      .eq('codigo_entregador', codigo)
      .limit(1);

    if (pedidosVinculados && pedidosVinculados.length > 0) {
      throw new Error('Não é possível excluir entregador que possui pedidos vinculados');
    }

    let query = supabase
      .from('entregadores')
      .delete()
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Erro ao excluir entregador:', error);
      throw error;
    }
  }

  async alterarStatus(codigo: string, ativo: boolean, profile: UserProfile | null): Promise<EntregadorSimples> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para alterar status de entregadores');
    }

    let query = supabase
      .from('entregadores')
      .update({ ativo })
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query
      .select('codigo, nome, telefone, codigo_estabelecimento, data_criacao, ativo')
      .maybeSingle();

    if (error) {
      console.error('Erro ao alterar status do entregador:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Entregador não encontrado ou sem permissão');
    }

    return data;
  }
}

export const entregadoresService = new EntregadoresService();
export default entregadoresService;
