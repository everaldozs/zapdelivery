import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestUserTypes: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testDirectQuery();
  }, []);

  const testDirectQuery = async () => {
    console.log('🧪 [TestUserTypes] Iniciando teste direto...');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 [TestUserTypes] Fazendo consulta direta...');
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('id');
      
      console.log('📊 [TestUserTypes] Resultado:', { data, error });
      
      if (error) {
        console.error('❌ [TestUserTypes] Erro na consulta:', error);
        setError(JSON.stringify(error, null, 2));
      } else {
        console.log('✅ [TestUserTypes] Sucesso! Dados:', data);
        setResults(data || []);
      }
    } catch (err: any) {
      console.error('💥 [TestUserTypes] Erro geral:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste Direto - User Roles</h1>
      
      <button 
        onClick={testDirectQuery}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Testando...' : 'Testar Consulta'}
      </button>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-bold text-red-800">Erro:</h3>
          <pre className="text-sm text-red-700 mt-2 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Resultados ({results.length} registros):</h3>
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div><strong>ID:</strong> {item.id}</div>
                <div><strong>Role Name:</strong> {item.role_name}</div>
                <div><strong>Display Name:</strong> {item.role_display_name}</div>
                <div><strong>Description:</strong> {item.description}</div>
                <div><strong>Permissions:</strong> {JSON.stringify(item.permissions)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">Nenhum resultado</div>
        )}
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded">
        <h3 className="font-bold text-blue-800 mb-2">Informações de Debug:</h3>
        <div className="text-sm text-blue-700">
          <div>Horário do teste: {new Date().toLocaleString('pt-BR')}</div>
          <div>Status: {loading ? 'Carregando...' : 'Finalizado'}</div>
          <div>Erro: {error ? 'Sim' : 'Não'}</div>
          <div>Registros: {results.length}</div>
        </div>
      </div>
    </div>
  );
};

export default TestUserTypes;