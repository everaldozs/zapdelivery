import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';

export interface CategoriaSimples {
  codigo: string;
  nome: string;
  codigo_estabelecimento: string;
  created_at: string;
}

export interface CategoriaFormData {
  nome: string;
}

class CategoriasService {
  async listarCategorias(profile: UserProfile | null): Promise<CategoriaSimples[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('categorias')
      .select('codigo, nome, codigo_estabelecimento, created_at')
      .order('nome', { ascending: true });

    // Aplicar filtro por estabelecimento apenas para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }

    return data || [];
  }

  async criarCategoria(dadosCategoria: CategoriaFormData, profile: UserProfile | null): Promise<CategoriaSimples> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para criar categorias');
    }

    const estabelecimentoId = profile.estabelecimento_id;

    if (!estabelecimentoId) {
      throw new Error('ID do estabelecimento não encontrado');
    }

    // Verificar se já existe categoria com o mesmo nome
    const { data: categoriaExistente } = await supabase
      .from('categorias')
      .select('codigo')
      .eq('nome', dadosCategoria.nome)
      .eq('codigo_estabelecimento', estabelecimentoId)
      .maybeSingle();

    if (categoriaExistente) {
      throw new Error('Já existe uma categoria com esse nome');
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({
        nome: dadosCategoria.nome,
        codigo_estabelecimento: estabelecimentoId,
        ativo: true
      })
      .select('codigo, nome, codigo_estabelecimento, created_at')
      .maybeSingle();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Falha ao criar categoria');
    }

    return data;
  }

  async atualizarCategoria(codigo: string, dadosCategoria: CategoriaFormData, profile: UserProfile | null): Promise<CategoriaSimples> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para editar categorias');
    }

    // Verificar se já existe categoria com o mesmo nome (exceto a atual)
    if (profile.estabelecimento_id) {
      const { data: categoriaExistente } = await supabase
        .from('categorias')
        .select('codigo')
        .eq('nome', dadosCategoria.nome)
        .eq('codigo_estabelecimento', profile.estabelecimento_id)
        .neq('codigo', codigo)
        .maybeSingle();

      if (categoriaExistente) {
        throw new Error('Já existe uma categoria com esse nome');
      }
    }

    let query = supabase
      .from('categorias')
      .update({ nome: dadosCategoria.nome })
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query
      .select('codigo, nome, codigo_estabelecimento, created_at')
      .maybeSingle();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Categoria não encontrada ou sem permissão');
    }

    return data;
  }

  async excluirCategoria(codigo: string, profile: UserProfile | null): Promise<void> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões - apenas estabelecimento e admin podem deletar
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para deletar categorias');
    }

    // Verificar se existem produtos vinculados a essa categoria
    const { data: produtosVinculados } = await supabase
      .from('produtos')
      .select('codigo')
      .eq('codigo_categoria', codigo)
      .limit(1);

    if (produtosVinculados && produtosVinculados.length > 0) {
      throw new Error('Não é possível excluir categoria que possui produtos vinculados');
    }

    let query = supabase
      .from('categorias')
      .delete()
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }
  }
}

export const categoriasService = new CategoriasService();
export default categoriasService;
