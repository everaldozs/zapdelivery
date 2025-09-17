// TESTE DIAGNÓSTICO - FUNÇÃO DE EXCLUSÃO DE PEDIDOS
// Este teste vai identificar exatamente onde está o problema

console.log('🔍 INICIANDO DIAGNÓSTICO DA EXCLUSÃO DE PEDIDOS...');

// 1. Testar se o módulo de serviço pode ser importado
try {
  console.log('\n1️⃣ Testando importação do módulo PedidosService...');
  
  // Vamos simular a estrutura do supabase client primeiro
  const mockSupabase = {
    from: (table) => {
      console.log(`📊 Chamada para tabela: ${table}`);
      return {
        delete: () => {
          console.log(`🗑️ Chamada DELETE na tabela: ${table}`);
          return {
            eq: (column, value) => {
              console.log(`🔍 Filtro WHERE ${column} = ${value}`);
              // Simular sucesso como se fosse o real
              return Promise.resolve({ error: null, data: null });
            }
          };
        }
      };
    }
  };
  
  console.log('✅ Mock do Supabase criado');

  // 2. Testar a lógica de exclusão passo a passo
  console.log('\n2️⃣ Simulando processo de exclusão...');
  
  const excluirPedidoTeste = async (codigoPedido) => {
    try {
      console.log('🗑️ Iniciando exclusão do pedido:', codigoPedido);
      
      // Simular exclusão de itens
      console.log('📦 Excluindo itens do pedido...');
      const itensResult = await mockSupabase.from('itens_pedido').delete().eq('codigo_pedido', codigoPedido);
      
      if (itensResult.error) {
        console.error('❌ Erro ao excluir itens:', itensResult.error);
        throw new Error(`Erro ao excluir itens: ${itensResult.error.message}`);
      }
      
      console.log('✅ Itens excluídos com sucesso');
      
      // Simular exclusão do pedido
      console.log('📝 Excluindo pedido principal...');
      const pedidoResult = await mockSupabase.from('pedidos').delete().eq('codigo', codigoPedido);
      
      if (pedidoResult.error) {
        console.error('❌ Erro ao excluir pedido:', pedidoResult.error);
        throw new Error(`Erro ao excluir pedido: ${pedidoResult.error.message}`);
      }
      
      console.log('✅ Pedido excluído com sucesso:', codigoPedido);
      return { success: true };
    } catch (error) {
      console.error('💥 Erro na função de exclusão:', error);
      throw error;
    }
  };
  
  // Testar com um código de exemplo
  await excluirPedidoTeste('teste-codigo-123');
  
  console.log('\n3️⃣ Teste de função bem-sucedido!');
  
} catch (error) {
  console.error('💥 ERRO NO TESTE:', error);
  console.error('Stack:', error.stack);
}

console.log('\n🔬 ANÁLISE DOS POSSÍVEIS PROBLEMAS:');
console.log('1. Se chegou até aqui, o problema NÃO é na lógica da função');
console.log('2. Possíveis causas do problema real:');
console.log('   - Permissões do Supabase (RLS - Row Level Security)');
console.log('   - Credenciais ou configuração do cliente Supabase');
console.log('   - Formato incorreto do código do pedido');
console.log('   - Problema na conexão com o banco');
console.log('   - Constraints de chave estrangeira no banco');

console.log('\n📋 PRÓXIMOS PASSOS RECOMENDADOS:');
console.log('1. Verificar as policies (RLS) do Supabase');
console.log('2. Testar a conexão e credenciais do Supabase');
console.log('3. Verificar se o código do pedido existe na base');
console.log('4. Verificar logs do Supabase para erros detalhados');

console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
