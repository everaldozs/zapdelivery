import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { EstablishmentGuard } from '../components/RouteGuard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { clsx } from 'clsx';
import {
  UserPlusIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  LinkIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Atendente {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  ativo: boolean;
  created_at: string;
  email?: string;
}

interface Convite {
  id: string;
  email: string;
  nome_convidado: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

interface ConviteFormData {
  email: string;
  nomeConvidado: string;
  telefone: string;
}

const GerenciarAtendentes: React.FC = () => {
  const { user, profile, session } = useAuth();
  const { theme } = useTheme();
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'atendentes' | 'convites'>('atendentes');
  
  const [conviteForm, setConviteForm] = useState<ConviteFormData>({
    email: '',
    nomeConvidado: '',
    telefone: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ConviteFormData>>({});
  
  // Estados para confirmação de exclusão
  const [atendenteParaExcluir, setAtendenteParaExcluir] = useState<Atendente | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [loadingExclusao, setLoadingExclusao] = useState(false);

  // Carregar dados
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar role de atendente
      const { data: atendenteRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_name', 'Atendente')
        .single();

      if (atendenteRole) {
        // Buscar atendentes usando Supabase diretamente
        const { data: atendentesData, error: atendentesError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            user_id,
            nome,
            telefone,
            ativo,
            created_at
          `)
          .eq('estabelecimento_id', profile?.estabelecimento_id)
          .eq('role_id', atendenteRole.id)
          .order('created_at', { ascending: false });
        
        if (!atendentesError && atendentesData) {
          // Mapear os dados sem buscar email (por limitações de RLS)
          const atendentesFormatados = atendentesData.map(atendente => ({
            ...atendente,
            email: 'N/A' // Por limitações de segurança, não podemos acessar o email diretamente
          }));
          setAtendentes(atendentesFormatados);
        }
      }

      // Buscar convites pendentes
      const convitesResponse = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/sistema-convites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (convitesResponse.ok) {
        const result = await convitesResponse.json();
        setConvites(result.data || []);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados dos atendentes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'telefone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        formattedValue = cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        formattedValue = cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    }
    
    setConviteForm(prev => ({ ...prev, [name]: formattedValue }));
    
    if (formErrors[name as keyof ConviteFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ConviteFormData> = {};
    
    if (!conviteForm.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(conviteForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!conviteForm.nomeConvidado.trim()) {
      errors.nomeConvidado = 'Nome é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConvidarAtendente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/sistema-convites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conviteForm)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSuccess(`Convite enviado para ${conviteForm.email}! Link: ${result.data.inviteLink}`);
        setConviteForm({ email: '', nomeConvidado: '', telefone: '' });
        setIsModalOpen(false);
        loadData(); // Recarregar dados
      } else {
        setError(result.error || 'Erro ao enviar convite');
      }
      
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAtivoAtendente = async (atendenteId: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ativo })
        .eq('id', atendenteId);

      if (error) {
        throw error;
      }

      // Atualizar lista local
      setAtendentes(prev => prev.map(atendente => 
        atendente.id === atendenteId 
          ? { ...atendente, ativo }
          : atendente
      ));

      setSuccess(`Atendente ${ativo ? 'ativado' : 'desativado'} com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro ao alterar status do atendente');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/ativar-atendente/${token}`;
    navigator.clipboard.writeText(link);
    setSuccess('Link de convite copiado!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const confirmarExclusaoAtendente = (atendente: Atendente) => {
    setAtendenteParaExcluir(atendente);
    setModalExclusao(true);
  };

  const handleExcluirAtendente = async () => {
    if (!atendenteParaExcluir) return;
    
    try {
      setLoadingExclusao(true);
      
      // Primeiro, desativar o usuário no auth (não pode ser deletado por limitações do Supabase)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ ativo: false })
        .eq('id', atendenteParaExcluir.id);

      if (profileError) {
        throw profileError;
      }

      // Remover da lista local
      setAtendentes(prev => prev.filter(a => a.id !== atendenteParaExcluir.id));
      setModalExclusao(false);
      setAtendenteParaExcluir(null);
      setSuccess('Atendente removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Erro ao excluir atendente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir atendente');
    } finally {
      setLoadingExclusao(false);
      setModalExclusao(false);
      setAtendenteParaExcluir(null);
    }
  };

  const isConviteExpirado = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <EstablishmentGuard showUnauthorized={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={clsx(
              'text-2xl font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Gerenciar Atendentes
            </h1>
            <p className={clsx(
              'text-sm mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Convide e gerencie atendentes do seu estabelecimento
            </p>
          </div>
          
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Convidar Atendente
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Erro</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Sucesso!</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('atendentes')}
              className={clsx(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'atendentes'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              Atendentes Ativos ({atendentes.length})
            </button>
            <button
              onClick={() => setActiveTab('convites')}
              className={clsx(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'convites'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              Convites Pendentes ({convites.filter(c => !c.used && !isConviteExpirado(c.expires_at)).length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className={clsx(
              'ml-3 text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Carregando...
            </span>
          </div>
        ) : activeTab === 'atendentes' ? (
          <div className={clsx(
            'bg-white rounded-lg shadow overflow-hidden',
            theme === 'dark' && 'bg-gray-800'
          )}>
            {atendentes.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className={clsx(
                  'h-12 w-12 mx-auto mb-4',
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                )} />
                <h3 className={clsx(
                  'text-lg font-medium mb-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Nenhum atendente cadastrado
                </h3>
                <p className={clsx(
                  'text-sm mb-4',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Comece convidando atendentes para ajudar no seu estabelecimento
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="primary"
                >
                  Convidar Primeiro Atendente
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={clsx(
                    'border-b',
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  )}>
                    <tr>
                      <th className={clsx(
                        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>Atendente</th>
                      <th className={clsx(
                        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>Email</th>
                      <th className={clsx(
                        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>Telefone</th>
                      <th className={clsx(
                        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>Status</th>
                      <th className={clsx(
                        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>Desde</th>
                      <th className={clsx(
                        'px-6 py-3 text-right text-xs font-medium uppercase tracking-wider',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      )}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className={clsx(
                    'divide-y',
                    theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                  )}>
                    {atendentes.map((atendente) => (
                      <tr key={atendente.id} className={clsx(
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      )}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className={clsx(
                                'h-10 w-10 rounded-full flex items-center justify-center',
                                'bg-green-100 dark:bg-green-900'
                              )}>
                                <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={clsx(
                                'text-sm font-medium',
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              )}>
                                {atendente.nome}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={clsx(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        )}>
                          {atendente.email || 'N/A'}
                        </td>
                        <td className={clsx(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        )}>
                          {atendente.telefone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            atendente.ativo
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          )}>
                            {atendente.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className={clsx(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        )}>
                          {formatDate(atendente.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleAtivoAtendente(atendente.id, !atendente.ativo)}
                              className={clsx(
                                'text-sm font-medium transition-colors px-2 py-1 rounded',
                                atendente.ativo
                                  ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                              )}
                            >
                              {atendente.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => confirmarExclusaoAtendente(atendente)}
                              title="Excluir atendente"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className={clsx(
            'bg-white rounded-lg shadow overflow-hidden',
            theme === 'dark' && 'bg-gray-800'
          )}>
            {convites.length === 0 ? (
              <div className="text-center py-12">
                <EnvelopeIcon className={clsx(
                  'h-12 w-12 mx-auto mb-4',
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                )} />
                <h3 className={clsx(
                  'text-lg font-medium mb-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Nenhum convite pendente
                </h3>
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Convites aparecerão aqui quando você convidar novos atendentes
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {convites.map((convite) => {
                  const expirado = isConviteExpirado(convite.expires_at);
                  
                  return (
                    <div key={convite.id} className={clsx(
                      'border rounded-lg p-4 transition-colors',
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
                      convite.used 
                        ? 'opacity-60'
                        : expirado
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                          : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={clsx(
                              'font-medium',
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            )}>
                              {convite.nome_convidado}
                            </h4>
                            <span className={clsx(
                              'text-xs px-2 py-1 rounded-full font-medium',
                              convite.used
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                : expirado
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            )}>
                              {convite.used ? 'Usado' : expirado ? 'Expirado' : 'Pendente'}
                            </span>
                          </div>
                          <p className={clsx(
                            'text-sm',
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            Email: {convite.email}
                          </p>
                          <p className={clsx(
                            'text-xs mt-1',
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          )}>
                            Enviado em {formatDate(convite.created_at)} • 
                            Expira em {formatDate(convite.expires_at)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!convite.used && !expirado && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => copyInviteLink(convite.token)}
                              className="flex items-center gap-2"
                            >
                              <LinkIcon className="h-4 w-4" />
                              Copiar Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal de Convite */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setConviteForm({ email: '', nomeConvidado: '', telefone: '' });
            setFormErrors({});
            setError('');
          }}
          title="Convidar Atendente"
        >
          <form onSubmit={handleConvidarAtendente} className="space-y-6">
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Nome do Atendente *
              </label>
              <input
                type="text"
                name="nomeConvidado"
                value={conviteForm.nomeConvidado}
                onChange={handleInputChange}
                className={clsx(
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                  formErrors.nomeConvidado
                    ? 'border-red-300 focus:ring-red-500'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300'
                )}
                placeholder="Nome do novo atendente"
                disabled={isSubmitting}
              />
              {formErrors.nomeConvidado && (
                <p className="mt-1 text-sm text-red-600">{formErrors.nomeConvidado}</p>
              )}
            </div>

            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={conviteForm.email}
                onChange={handleInputChange}
                className={clsx(
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                  formErrors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300'
                )}
                placeholder="email@exemplo.com"
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Telefone (opcional)
              </label>
              <input
                type="text"
                name="telefone"
                value={conviteForm.telefone}
                onChange={handleInputChange}
                maxLength={15}
                className={clsx(
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300'
                )}
                placeholder="(65) 99999-9999"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Enviar Convite'
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <Modal
          isOpen={modalExclusao}
          onClose={() => setModalExclusao(false)}
          title="Excluir Atendente"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className={clsx(
                  'font-medium',
                  theme === 'dark' ? 'text-red-400' : 'text-red-800'
                )}>
                  Atenção! Esta ação não pode ser desfeita.
                </p>
                <p className={clsx(
                  'text-sm mt-1',
                  theme === 'dark' ? 'text-red-300' : 'text-red-700'
                )}>
                  Tem certeza que deseja excluir o atendente "{atendenteParaExcluir?.nome}"?
                </p>
                <p className={clsx(
                  'text-xs mt-2',
                  theme === 'dark' ? 'text-red-300' : 'text-red-700'
                )}>
                  O usuário será desativado e removido da lista.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setModalExclusao(false)}
                disabled={loadingExclusao}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger" 
                onClick={handleExcluirAtendente}
                disabled={loadingExclusao}
              >
                {loadingExclusao ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Excluindo...</span>
                  </div>
                ) : (
                  'Excluir Atendente'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </EstablishmentGuard>
  );
};

export default GerenciarAtendentes;