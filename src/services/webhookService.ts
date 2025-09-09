import { toast } from 'sonner';
import type { StatusPedidoSupabase } from '../types/supabase';
import { UserProfile } from '../context/AuthContext';

interface WebhookData {
  cnpj_empresa: string;
  status_pedido: StatusPedidoSupabase;
  numero_pedido: string;
}

export class WebhookService {
  private static readonly WEBHOOK_URL = 'https://portaln8n.essolution.com.br/webhook-test/Altera_status_do_pedido';
  private static readonly TIMEOUT_MS = 10000; // 10 segundos

  /**
   * Dispara webhook para mudança de status do pedido
   * Implementado de forma assíncrona para não bloquear a interface
   */
  static async notificarMudancaStatus(
    numeroPedido: string,
    novoStatus: StatusPedidoSupabase,
    profile: UserProfile | null
  ): Promise<void> {
    // Executar de forma assíncrona sem bloquear
    setTimeout(async () => {
      await this.enviarWebhookInterno(numeroPedido, novoStatus, profile);
    }, 0);
  }

  /**
   * Implementação interna do webhook com tratamento completo de erros
   */
  private static async enviarWebhookInterno(
    numeroPedido: string,
    novoStatus: StatusPedidoSupabase,
    profile: UserProfile | null
  ): Promise<void> {
    try {
      console.log('🔗 Iniciando envio de webhook para mudança de status:', {
        pedido: numeroPedido,
        status: novoStatus,
        estabelecimento: profile?.estabelecimento_nome || 'N/A'
      });

      // Obter CNPJ da empresa - por enquanto usar um valor padrão
      // TODO: buscar CNPJ real do estabelecimento no banco de dados
      const cnpjEmpresa = this.obterCnpjEmpresa(profile);

      const webhookData: WebhookData = {
        cnpj_empresa: cnpjEmpresa,
        status_pedido: novoStatus,
        numero_pedido: numeroPedido
      };

      console.log('📤 Enviando webhook com dados:', webhookData);

      // Criar controller para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      try {
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ZapDelivery-Admin/1.0'
          },
          body: JSON.stringify(webhookData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('✅ Webhook enviado com sucesso:', {
            status: response.status,
            statusText: response.statusText
          });
          
          // Feedback opcional ao usuário (apenas em modo debug)
          if (process.env.NODE_ENV === 'development') {
            toast.success('Webhook enviado com sucesso', {
              description: `Status ${novoStatus} notificado externamente`
            });
          }
        } else {
          throw new Error(`Webhook falhou: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error) {
      console.warn('⚠️ Falha no webhook (não afeta funcionamento do sistema):', error);
      
      // Log detalhado do erro para debug
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        pedido: numeroPedido,
        status: novoStatus,
        timestamp: new Date().toISOString()
      };
      
      console.error('📊 Detalhes do erro do webhook:', errorDetails);
      
      // Em modo de desenvolvimento, mostrar notificação discreta
      if (process.env.NODE_ENV === 'development') {
        toast.error('Webhook falhou', {
          description: 'Sistema externo não foi notificado, mas status foi atualizado'
        });
      }
      
      // Não propagar o erro para não afetar a mudança de status
    }
  }

  /**
   * Obter CNPJ da empresa baseado no perfil do usuário
   * TODO: implementar busca real no banco de dados
   */
  private static obterCnpjEmpresa(profile: UserProfile | null): string {
    if (!profile) {
      console.warn('⚠️ Profile não disponível para obter CNPJ');
      return '00.000.000/0001-00'; // CNPJ padrão para testes
    }

    // TODO: buscar CNPJ real do estabelecimento no banco
    // Por enquanto, simular baseado no estabelecimento_id
    if (profile.estabelecimento_id) {
      // Gerar CNPJ fictício baseado no ID do estabelecimento
      const id = profile.estabelecimento_id.replace(/\D/g, '').padStart(4, '0');
      return `11.222.333/${id.slice(0, 4)}-${id.slice(-2)}`;
    }

    return '00.000.000/0001-00'; // CNPJ padrão
  }

  /**
   * Função para testar conectividade do webhook
   */
  static async testarWebhook(): Promise<boolean> {
    try {
      const testData: WebhookData = {
        cnpj_empresa: '00.000.000/0001-00',
        status_pedido: 'Pedindo',
        numero_pedido: 'TEST-' + Date.now()
      };

      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ZapDelivery-Admin/1.0'
        },
        body: JSON.stringify(testData)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      return false;
    }
  }
}

export default WebhookService;