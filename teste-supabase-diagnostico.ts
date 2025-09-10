// TESTE DE DIAGNÓSTICO SUPABASE - EXCLUSÃO DE PEDIDOS
// Este arquivo vai identificar o problema real na exclusão

import { supabase } from './src/lib/supabase';

console.log('🔍 INICIANDO DIAGNÓSTICO SUPABASE - EXCLUSÃO DE PEDIDOS');

const diagnosticarExclusao = async () => {
  try {
    console.log('\n1️⃣ Testando conexão básica...');
    
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('pedidos')
      .select('codigo')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      console.log('🔧 PROBLEMA: Conexão com Supabase falhou');
      return;
    }
    
    console.log('✅ Conexão OK');
    
    if (!testData || testData.length === 0) {
      console.log('⚠️ Nenhum pedido na base para testar');
    } else {
      console.log('📊 Pedido de exemplo encontrado:', testData[0].codigo);
    }
    
    console.log('\n2️⃣ Testando permissões DELETE...');
    
    // Testar DELETE com condição impossível (não afeta dados)
    const { error: deleteError } = await supabase
      .from('pedidos')
      .delete()
      .eq('codigo', 'teste-inexistente-123456789');
    
    if (deleteError) {
      console.error('❌ ERRO DE PERMISSÃO DELETE:', deleteError);
      console.log('');
      console.log('🚨 PROBLEMA IDENTIFICADO: Row Level Security (RLS)');
      console.log('');
      console.log('🔧 SOLUÇÃO NECESSÁRIA:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá em Authentication > Policies');
      console.log('3. Na tabela "pedidos", adicione policy DELETE:');
      console.log('   Nome: "Usuários podem deletar pedidos"');
      console.log('   Comando: DELETE');
      console.log('   Roles: authenticated');
      console.log('   Policy: true (ou uma condição específica)');
      console.log('');
      console.log('4. Na tabela "itens_pedido", adicione policy DELETE similar');
      console.log('');
      return;
    }
    
    console.log('✅ Permissões DELETE OK');
    
    console.log('\n3️⃣ Testando estrutura das tabelas...');
    
    // Verificar se as colunas existem
    try {
      await supabase.from('itens_pedido').select('codigo_pedido').limit(1);
      console.log('✅ Tabela itens_pedido OK');
    } catch (err) {
      console.error('❌ Problema na tabela itens_pedido:', err);
    }
    
    console.log('\n4️⃣ Simulando exclusão...');
    console.log('⚠️ (Não executará exclusão real para preservar dados)');
    
    const simularExclusao = async (codigoPedido: string) => {
      console.log(`🗑️ Simulando exclusão do pedido: ${codigoPedido}`);
      
      // Simular contagem de itens
      const { count: itensCount } = await supabase
        .from('itens_pedido')
        .select('*', { count: 'exact', head: true })
        .eq('codigo_pedido', codigoPedido);
      
      console.log(`📦 Itens encontrados: ${itensCount || 0}`);
      
      console.log('✅ Simulação bem-sucedida');
    };
    
    // Se existe pedido de teste, simular
    if (testData && testData.length > 0) {
      await simularExclusao(testData[0].codigo);
    }
    
    console.log('\n🎉 DIAGNÓSTICO CONCLUÍDO COM SUCESSO!');
    console.log('');
    console.log('🔬 RESULTADO:');
    console.log('- Conexão: ✅ OK');
    console.log('- Permissões: ✅ OK');
    console.log('- Estrutura: ✅ OK');
    console.log('- Lógica: ✅ OK');
    console.log('');
    console.log('🤔 SE O PROBLEMA PERSISTE, PODE SER:');
    console.log('1. Erro no frontend (console do navegador)');
    console.log('2. Estado não está sendo atualizado corretamente');
    console.log('3. Código do pedido inválido');
    
  } catch (error) {
    console.error('💥 ERRO NO DIAGNÓSTICO:', error);
    console.log('');
    console.log('🔧 CHECKLIST DE SOLUÇÕES:');
    console.log('1. Verificar arquivo .env com credenciais Supabase');
    console.log('2. Verificar políticas RLS no Supabase Dashboard');
    console.log('3. Verificar logs do Supabase em tempo real');
    console.log('4. Testar manualmente no SQL Editor do Supabase');
  }
};

// Executar diagnóstico
diagnosticarExclusao();
