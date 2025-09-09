import { supabase } from '../lib/supabase';

export interface UserType {
  id: number;
  role_name: string;
  role_display_name: string;
  description: string | null;
  permissions: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserTypeRequest {
  role_name: string;
  role_display_name: string;
  description?: string;
  permissions?: Record<string, any>;
}

export interface UpdateUserTypeRequest {
  role_display_name?: string;
  description?: string;
  permissions?: Record<string, any>;
}

export const userTypesService = {
  // Listar todos os tipos de usuários
  async getUserTypes(): Promise<UserType[]> {
    console.log('🔍 Iniciando getUserTypes...');
    
    try {
      console.log('📡 Fazendo requisição ao Supabase...');
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('id', { ascending: true });

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar tipos de usuários:', error);
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2));
        throw new Error(`Erro na consulta: ${error.message || 'Erro desconhecido'}`);
      }

      if (!data) {
        console.warn('⚠️ Dados nulos retornados do Supabase');
        return [];
      }

      console.log('✅ Tipos de usuários carregados com sucesso:', data.length, 'registros');
      console.log('📋 Dados:', data);
      
      return data;
    } catch (error) {
      console.error('💥 Erro geral em getUserTypes:', error);
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  },

  // Buscar tipo de usuário por ID
  async getUserTypeById(id: number): Promise<UserType | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Registro não encontrado
        }
        console.error('Erro ao buscar tipo de usuário:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar tipo de usuário:', error);
      throw error;
    }
  },

  // Criar novo tipo de usuário
  async createUserType(userData: CreateUserTypeRequest): Promise<UserType> {
    try {
      // Verificar se role_name já existe
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_name', userData.role_name)
        .single();

      if (existing) {
        throw new Error('Já existe um tipo de usuário com este nome interno');
      }

      const { data, error } = await supabase
        .from('user_roles')
        .insert([
          {
            role_name: userData.role_name,
            role_display_name: userData.role_display_name,
            description: userData.description || null,
            permissions: userData.permissions || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tipo de usuário:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tipo de usuário:', error);
      throw error;
    }
  },

  // Atualizar tipo de usuário existente
  async updateUserType(id: number, userData: UpdateUserTypeRequest): Promise<UserType> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({
          ...(userData.role_display_name && { role_display_name: userData.role_display_name }),
          ...(userData.description !== undefined && { description: userData.description }),
          ...(userData.permissions !== undefined && { permissions: userData.permissions }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tipo de usuário:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Tipo de usuário não encontrado');
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de usuário:', error);
      throw error;
    }
  },

  // Deletar tipo de usuário
  async deleteUserType(id: number): Promise<void> {
    try {
      // Primeiro, verificar se existem usuários usando este tipo
      const { data: usersUsingType, error: countError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('role_id', id);

      if (countError) {
        console.error('Erro ao verificar usuários:', countError);
        throw countError;
      }

      if (usersUsingType && usersUsingType.length > 0) {
        throw new Error(`Não é possível excluir este tipo pois existem ${usersUsingType.length} usuário(s) usando-o`);
      }

      // Não permitir deletar tipos padrão do sistema
      const { data: userType } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('id', id)
        .single();

      const systemRoles = ['admin_geral', 'estabelecimento', 'atendente'];
      if (userType && systemRoles.includes(userType.role_name)) {
        throw new Error('Não é possível excluir tipos de usuário padrão do sistema');
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar tipo de usuário:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar tipo de usuário:', error);
      throw error;
    }
  },

  // Verificar se um role_name é único (excluindo um ID específico para edições)
  async isRoleNameUnique(roleName: string, excludeId?: number): Promise<boolean> {
    try {
      let query = supabase
        .from('user_roles')
        .select('id')
        .eq('role_name', roleName);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao verificar unicidade do role_name:', error);
        throw error;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar unicidade do role_name:', error);
      throw error;
    }
  },

  // Contar quantos usuários estão usando cada tipo
  async getUserTypeUsageStats(): Promise<Array<{id: number, role_display_name: string, user_count: number}>> {
    console.log('📊 Iniciando getUserTypeUsageStats...');
    
    try {
      // Primeiro buscar todos os tipos
      console.log('📡 Buscando tipos de usuários para estatísticas...');
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, role_display_name')
        .order('id');

      if (rolesError) {
        console.error('❌ Erro ao buscar tipos de usuários para stats:', rolesError);
        throw rolesError;
      }

      console.log('📋 Tipos encontrados para stats:', userRoles?.length || 0);

      if (!userRoles || userRoles.length === 0) {
        console.warn('⚠️ Nenhum tipo de usuário encontrado para estatísticas');
        return [];
      }

      // Para cada tipo, contar quantos usuários existem
      const stats = [];
      
      for (const role of userRoles) {
        console.log(`🔢 Contando usuários para tipo ${role.id} (${role.role_display_name})...`);
        
        try {
          const { count, error: countError } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', role.id);

          if (countError) {
            console.error(`❌ Erro ao contar usuários do tipo ${role.id}:`, countError);
            stats.push({
              id: role.id,
              role_display_name: role.role_display_name,
              user_count: 0
            });
          } else {
            console.log(`✅ Tipo ${role.id}: ${count || 0} usuários`);
            stats.push({
              id: role.id,
              role_display_name: role.role_display_name,
              user_count: count || 0
            });
          }
        } catch (err) {
          console.error(`💥 Erro geral ao contar tipo ${role.id}:`, err);
          stats.push({
            id: role.id,
            role_display_name: role.role_display_name,
            user_count: 0
          });
        }
      }

      console.log('✅ Estatísticas finalizadas:', stats);
      return stats;
    } catch (error) {
      console.error('💥 Erro geral em getUserTypeUsageStats:', error);
      throw error;
    }
  }
};
