import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';

// Interface que representa a estrutura da tabela estabelecimentos no Supabase
interface EstabelecimentoDB {
  codigo: string;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  data_criacao: string | null;
  whatsapp_cozinha: string | null;
  whatsapp_agente: string | null;
  nome_agente: string | null;
  nome_proprietario: string | null;
  whatsapp_proprietario: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cep: string | null;
  cidade: string | null;
  UF: string | null;
}

// Interface para o frontend (mantém compatibilidade com a UI existente)
export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  status: 'Ativo' | 'Inativo';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Interface para formulário (sem campos calculados)
export interface EmpresaFormData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento?: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  status: 'Ativo' | 'Inativo';
  observacoes?: string;
}

export interface EmpresaStats {
  total: number;
  ativas: number;
  inativas: number;
  cidadesAtendidas: number;
}

// Função para converter dados da tabela estabelecimentos para interface Empresa
function mapEstabelecimentoToEmpresa(estabelecimento: EstabelecimentoDB): Empresa {
  return {
    id: estabelecimento.codigo,
    nome: estabelecimento.nome || '',
    cnpj: estabelecimento.cnpj || '',
    email: estabelecimento.email || '',
    telefone: estabelecimento.telefone || '',
    endereco_rua: estabelecimento.endereco || '',
    endereco_numero: estabelecimento.numero || '',
    endereco_complemento: '', // Campo não existe na tabela estabelecimentos
    endereco_bairro: estabelecimento.bairro || '',
    endereco_cidade: estabelecimento.cidade || '',
    endereco_estado: estabelecimento.UF || '',
    endereco_cep: estabelecimento.cep || '',
    status: 'Ativo' as const, // Sempre ativo para estabelecimentos
    observacoes: '', // Campo não existe na tabela estabelecimentos
    created_at: estabelecimento.data_criacao || new Date().toISOString(),
    updated_at: estabelecimento.data_criacao || new Date().toISOString(),
  };
}

// Função para converter dados do formulário para inserção na tabela estabelecimentos
function mapFormDataToEstabelecimento(formData: EmpresaFormData): Partial<EstabelecimentoDB> {
  return {
    nome: formData.nome,
    cnpj: formData.cnpj || null,
    email: formData.email || null,
    telefone: formData.telefone || null,
    endereco: formData.endereco_rua || null,
    numero: formData.endereco_numero || null,
    bairro: formData.endereco_bairro || null,
    cidade: formData.endereco_cidade || null,
    UF: formData.endereco_estado || null,
    cep: formData.endereco_cep || null,
  };
}

class EmpresasService {
  async listarEmpresas(profile: UserProfile | null): Promise<Empresa[]> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar permissões - apenas admin_geral pode ver todas as empresas
    if (profile.role_name !== 'Administrator') {
      throw new Error('Acesso negado. Apenas administradores podem gerenciar empresas.');
    }

    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      throw error;
    }

    // Converter dados da tabela para interface Empresa
    return (data || []).map(mapEstabelecimentoToEmpresa);
  }

  async obterEmpresaPorId(id: string, profile: UserProfile | null): Promise<Empresa | null> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    if (profile.role_name !== 'Administrator') {
      throw new Error('Acesso negado. Apenas administradores podem gerenciar empresas.');
    }

    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('codigo', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar estabelecimento:', error);
      throw error;
    }

    return data ? mapEstabelecimentoToEmpresa(data) : null;
  }

  async criarEmpresa(dadosEmpresa: EmpresaFormData, profile: UserProfile | null): Promise<Empresa> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    if (profile.role_name !== 'Administrator') {
      throw new Error('Acesso negado. Apenas administradores podem criar empresas.');
    }

    // Verificar se já existe estabelecimento com o mesmo CNPJ
    if (dadosEmpresa.cnpj) {
      const { data: empresaExistente } = await supabase
        .from('estabelecimentos')
        .select('codigo')
        .eq('cnpj', dadosEmpresa.cnpj)
        .maybeSingle();

      if (empresaExistente) {
        throw new Error('Já existe um estabelecimento cadastrado com esse CNPJ');
      }
    }

    // Verificar se já existe estabelecimento com o mesmo email
    if (dadosEmpresa.email) {
      const { data: emailExistente } = await supabase
        .from('estabelecimentos')
        .select('codigo')
        .eq('email', dadosEmpresa.email)
        .maybeSingle();

      if (emailExistente) {
        throw new Error('Já existe um estabelecimento cadastrado com esse email');
      }
    }

    // Converter dados do formulário para estrutura da tabela
    const dadosEstabelecimento = mapFormDataToEstabelecimento(dadosEmpresa);

    const { data, error } = await supabase
      .from('estabelecimentos')
      .insert(dadosEstabelecimento)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Erro ao criar estabelecimento:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Falha ao criar estabelecimento');
    }

    return mapEstabelecimentoToEmpresa(data);
  }

  async atualizarEmpresa(id: string, dadosEmpresa: EmpresaFormData, profile: UserProfile | null): Promise<Empresa> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    if (profile.role_name !== 'Administrator') {
      throw new Error('Acesso negado. Apenas administradores podem editar empresas.');
    }

    // Verificar se já existe estabelecimento com o mesmo CNPJ (exceto o atual)
    if (dadosEmpresa.cnpj) {
      const { data: cnpjExistente } = await supabase
        .from('estabelecimentos')
        .select('codigo')
        .eq('cnpj', dadosEmpresa.cnpj)
        .neq('codigo', id)
        .maybeSingle();

      if (cnpjExistente) {
        throw new Error('Já existe um estabelecimento com esse CNPJ');
      }
    }

    // Verificar se já existe estabelecimento com o mesmo email (exceto o atual)
    if (dadosEmpresa.email) {
      const { data: emailExistente } = await supabase
        .from('estabelecimentos')
        .select('codigo')
        .eq('email', dadosEmpresa.email)
        .neq('codigo', id)
        .maybeSingle();

      if (emailExistente) {
        throw new Error('Já existe um estabelecimento com esse email');
      }
    }

    // Converter dados do formulário para estrutura da tabela
    const dadosEstabelecimento = mapFormDataToEstabelecimento(dadosEmpresa);

    const { data, error } = await supabase
      .from('estabelecimentos')
      .update(dadosEstabelecimento)
      .eq('codigo', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Estabelecimento não encontrado');
    }

    return mapEstabelecimentoToEmpresa(data);
  }

  async excluirEmpresa(id: string, profile: UserProfile | null): Promise<void> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    if (profile.role_name !== 'Administrator') {
      throw new Error('Acesso negado. Apenas administradores podem excluir empresas.');
    }

    // Verificar se existem user_profiles vinculados a esse estabelecimento
    const { data: perfisVinculados } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('estabelecimento_id', id)
      .limit(1);

    if (perfisVinculados && perfisVinculados.length > 0) {
      throw new Error('Não é possível excluir estabelecimento que possui usuários vinculados');
    }

    const { error } = await supabase
      .from('estabelecimentos')
      .delete()
      .eq('codigo', id);

    if (error) {
      console.error('Erro ao excluir estabelecimento:', error);
      throw error;
    }
  }

  async obterEstatisticas(profile: UserProfile | null): Promise<EmpresaStats> {
    if (!profile) {
      throw new Error('Usuário não autenticado');
    }

    if (profile.role_name !== 'Administrator') {
      throw new Error('Acesso negado. Apenas administradores podem ver estatísticas.');
    }

    const { data: estabelecimentos, error } = await supabase
      .from('estabelecimentos')
      .select('codigo, cidade');

    if (error) {
      console.error('Erro ao buscar estatísticas de estabelecimentos:', error);
      throw error;
    }

    const total = estabelecimentos?.length || 0;
    const ativas = total; // Todos estabelecimentos são considerados ativos
    const inativas = 0;
    const cidadesAtendidas = new Set(
      estabelecimentos
        ?.map(e => e.cidade)
        ?.filter(cidade => cidade && cidade.trim() !== '')
    ).size;

    return {
      total,
      ativas,
      inativas,
      cidadesAtendidas
    };
  }

  // Função utilitária para formatar CNPJ
  formatarCNPJ(cnpj: string): string {
    // Remove caracteres não numéricos
    const numeros = cnpj.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cnpj;
  }

  // Função utilitária para formatar CEP
  formatarCEP(cep: string): string {
    // Remove caracteres não numéricos
    const numeros = cep.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numeros.length === 8) {
      return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    
    return cep;
  }

  // Função utilitária para validar CNPJ
  validarCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '');

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    // Algoritmo de validação do CNPJ
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  }
}

export const empresasService = new EmpresasService();
export default empresasService;
