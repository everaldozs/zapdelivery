import { supabase } from '../lib/supabase';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role_name: string;
  estabelecimento_id: string | null;
  estabelecimento?: {
    id: string;
    nome: string;
  };
  created_at: string;
  updated_at: string;
  // Campos específicos para estabelecimentos
  cnpj?: string;
  telefone?: string;
  user_type: 'system_user' | 'Estabelecimento'; // Para identificar a origem
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  estabelecimento_id: string;
}

export const userService = {
  // Listar todos os usuários do sistema (system_users + estabelecimentos)
  async getUsers(): Promise<SystemUser[]> {
    try {
      // Buscar usuários da tabela system_users
      const { data: systemUsers, error: systemError } = await supabase
        .from('system_users')
        .select(`
          *,
          estabelecimento:estabelecimentos!estabelecimento_id(codigo, nome)
        `)
        .order('created_at', { ascending: false });

      if (systemError) {
        console.error('Erro ao buscar system_users:', systemError);
        throw systemError;
      }

      // Buscar estabelecimentos
      const { data: estabelecimentos, error: estabelecimentosError } = await supabase
        .from('estabelecimentos')
        .select('*')
        .order('nome', { ascending: true });

      if (estabelecimentosError) {
        console.error('Erro ao buscar estabelecimentos:', estabelecimentosError);
        throw estabelecimentosError;
      }

      // Consolidar ambos os tipos em uma única lista
      const allUsers: SystemUser[] = [];

      // Adicionar usuários do sistema
      if (systemUsers) {
        systemUsers.forEach(user => {
          allUsers.push({
            ...user,
            user_type: 'system_user'
          });
        });
      }

      // Adicionar estabelecimentos como usuários do tipo "Estabelecimento"
      if (estabelecimentos) {
        estabelecimentos.forEach(estabelecimento => {
          allUsers.push({
            id: estabelecimento.codigo,
            name: estabelecimento.nome || 'Nome não informado',
            email: estabelecimento.email || 'Email não informado',
            role_name: 'Estabelecimento',
            estabelecimento_id: null,
            estabelecimento: {
              id: estabelecimento.codigo,
              nome: estabelecimento.nome || 'Nome não informado'
            },
            created_at: estabelecimento.data_criacao || new Date().toISOString(),
            updated_at: estabelecimento.data_criacao || new Date().toISOString(),
            cnpj: estabelecimento.cnpj || 'CNPJ não informado',
            telefone: estabelecimento.telefone || 'Telefone não informado',
            user_type: 'Estabelecimento'
          });
        });
      }

      // Ordenar por nome
      allUsers.sort((a, b) => a.name.localeCompare(b.name));

      return allUsers;
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw error;
    }
  },

  // Criar novo usuário do sistema
  async createUser(userData: CreateUserRequest): Promise<SystemUser> {
    // Primeiro, criar o usuário na autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      throw authError;
    }

    // Em seguida, criar o registro na tabela system_users
    const { data, error } = await supabase
      .from('system_users')
      .insert([
        {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role_name: 'admin', // Por padrão, novos usuários são admins
          estabelecimento_id: userData.estabelecimento_id,
        }
      ])
      .select(`
        *,
        estabelecimento:estabelecimentos!estabelecimento_id(codigo, nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar usuário do sistema:', error);
      // Se falhar ao criar o registro do usuário, tentar deletar o usuário criado na autenticação
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    return data;
  },

  // Buscar estabelecimentos para o dropdown
  async getEstabelecimentos() {
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('codigo, nome')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      throw error;
    }

    return data || [];
  },
};
