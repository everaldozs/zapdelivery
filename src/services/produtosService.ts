import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';

export interface Produto {
  codigo: string;
  nome: string;
  descricao?: string;
  preco: number;
  disponivel: boolean;
  codigo_categoria?: string;
  codigo_estabelecimento: string;
  imagem_url?: string;
  tempo_preparo_min?: number;
  data_criacao: string;
  // Dados relacionados
  categoria_nome?: string;
  estabelecimento_nome?: string;
}

export interface Categoria {
  codigo: string;
  nome: string;
  codigo_estabelecimento?: string;
}

export interface ProdutoFormData {
  nome: string;
  descricao?: string;
  preco: number;
  codigo_categoria?: string;
  disponivel: boolean;
  imagem_url?: string;
  tempo_preparo_min?: number;
}

class ProdutosService {
  async listarProdutos(profile: UserProfile | null): Promise<Produto[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    // Aplicar filtro por estabelecimento apenas para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }

    // Buscar dados relacionados manualmente
    const produtosComRelacionados = await this.adicionarDadosRelacionados(data || []);
    
    return produtosComRelacionados;
  }

  async buscarProdutos(termo: string, profile: UserProfile | null): Promise<Produto[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('produtos')
      .select('*')
      .ilike('nome', `%${termo}%`)
      .order('nome', { ascending: true });

    // Aplicar filtro por estabelecimento apenas para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro na busca de produtos:', error);
      throw error;
    }

    return await this.adicionarDadosRelacionados(data || []);
  }

  async criarProduto(dadosProduto: ProdutoFormData, profile: UserProfile | null): Promise<Produto> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para criar produtos');
    }

    const estabelecimentoId = profile.estabelecimento_id;

    if (!estabelecimentoId) {
      throw new Error('ID do estabelecimento não encontrado');
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        ...dadosProduto,
        codigo_estabelecimento: estabelecimentoId
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Falha ao criar produto');
    }

    return await this.obterProdutoPorId(data.codigo, profile);
  }

  async atualizarProduto(codigo: string, dadosProduto: Partial<ProdutoFormData>, profile: UserProfile | null): Promise<Produto> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para editar produtos');
    }

    let query = supabase
      .from('produtos')
      .update(dadosProduto)
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Produto não encontrado ou sem permissão');
    }

    return await this.obterProdutoPorId(data.codigo, profile);
  }

  async deletarProduto(codigo: string, profile: UserProfile | null): Promise<void> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões - apenas estabelecimento e admin podem deletar
    if (profile.role_name === 'Atendente') {
      throw new Error('Atendentes não têm permissão para deletar produtos');
    }

    let query = supabase
      .from('produtos')
      .delete()
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  async alternarDisponibilidade(codigo: string, profile: UserProfile | null): Promise<Produto> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Primeiro buscar o produto atual
    const produtoAtual = await this.obterProdutoPorId(codigo, profile);
    
    // Alternar disponibilidade
    return await this.atualizarProduto(codigo, {
      disponivel: !produtoAtual.disponivel
    }, profile);
  }

  async listarCategorias(profile: UserProfile | null): Promise<Categoria[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('categorias')
      .select('*')
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

  private async obterProdutoPorId(codigo: string, profile: UserProfile | null): Promise<Produto> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    let query = supabase
      .from('produtos')
      .select('*')
      .eq('codigo', codigo);

    // Aplicar filtro por estabelecimento para não-admin
    if (profile.role_name !== 'Administrator' && profile.estabelecimento_id) {
      query = query.eq('codigo_estabelecimento', profile.estabelecimento_id);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Produto não encontrado');
    }

    const [produtoComRelacionados] = await this.adicionarDadosRelacionados([data]);
    return produtoComRelacionados;
  }

  private async adicionarDadosRelacionados(produtos: any[]): Promise<Produto[]> {
    if (!produtos || produtos.length === 0) {
      return [];
    }

    // Buscar categorias relacionadas
    const categoriaIds = produtos
      .map(p => p.codigo_categoria)
      .filter(Boolean)
      .filter((id, index, arr) => arr.indexOf(id) === index); // remover duplicatas

    const { data: categorias } = await supabase
      .from('categorias')
      .select('codigo, nome')
      .in('codigo', categoriaIds);

    // Buscar estabelecimentos relacionados
    const estabelecimentoIds = produtos
      .map(p => p.codigo_estabelecimento)
      .filter(Boolean)
      .filter((id, index, arr) => arr.indexOf(id) === index); // remover duplicatas

    const { data: estabelecimentos } = await supabase
      .from('estabelecimentos')
      .select('codigo, nome')
      .in('codigo', estabelecimentoIds);

    // Mapear dados relacionados
    return produtos.map(produto => ({
      ...produto,
      categoria_nome: categorias?.find(c => c.codigo === produto.codigo_categoria)?.nome,
      estabelecimento_nome: estabelecimentos?.find(e => e.codigo === produto.codigo_estabelecimento)?.nome
    }));
  }
}

export const produtosService = new ProdutosService();
