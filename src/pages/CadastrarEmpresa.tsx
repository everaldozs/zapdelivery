import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { BuildingOffice2Icon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { EmpresaFormData, empresasService } from '../services/empresasService';

const CadastrarEmpresa: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<EmpresaFormData>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: '',
    endereco_cep: '',
    status: 'Ativo',
    observacoes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Formatação automática para campos específicos
    if (name === 'cnpj') {
      processedValue = empresasService.formatarCNPJ(value);
    } else if (name === 'endereco_cep') {
      processedValue = empresasService.formatarCEP(value);
    } else if (name === 'telefone') {
      // Formatar telefone (11) 99999-9999
      const numeros = value.replace(/\D/g, '');
      if (numeros.length <= 11) {
        if (numeros.length > 6) {
          processedValue = numeros.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
        } else if (numeros.length > 2) {
          processedValue = numeros.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
          processedValue = numeros;
        }
      } else {
        processedValue = formData.telefone; // Manter valor anterior se exceder o limite
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Limpar mensagens ao modificar campos
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validarFormulario = (): string | null => {
    if (!formData.nome.trim()) {
      return 'Nome da empresa é obrigatório';
    }
    
    if (!formData.cnpj.trim()) {
      return 'CNPJ é obrigatório';
    }
    
    if (!empresasService.validarCNPJ(formData.cnpj)) {
      return 'CNPJ inválido';
    }
    
    if (!formData.email.trim()) {
      return 'Email é obrigatório';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      return 'Telefone é obrigatório';
    }
    
    if (!formData.endereco_rua.trim()) {
      return 'Endereço (rua) é obrigatório';
    }
    
    if (!formData.endereco_numero.trim()) {
      return 'Número do endereço é obrigatório';
    }
    
    if (!formData.endereco_bairro.trim()) {
      return 'Bairro é obrigatório';
    }
    
    if (!formData.endereco_cidade.trim()) {
      return 'Cidade é obrigatória';
    }
    
    if (!formData.endereco_estado.trim()) {
      return 'Estado é obrigatório';
    }
    
    if (!formData.endereco_cep.trim()) {
      return 'CEP é obrigatório';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validarFormulario();
    if (validationError) {
      setError(validationError);
      // Rolar para o topo para mostrar o erro
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const novaEmpresa = await empresasService.criarEmpresa(formData, profile);
      setSuccess('Empresa criada com sucesso!');
      
      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/empresas/listar');
      }, 1500);
      
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
      // Rolar para o topo para mostrar o erro
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate('/empresas/listar');
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Cadastrar Empresa
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Cadastre uma nova empresa no sistema
        </p>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Card padding="md">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Mensagem de Sucesso */}
      {success && (
        <Card padding="md">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <CheckIcon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Sucesso</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <h2 className={clsx(
            'text-xl font-semibold mb-6 flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <BuildingOffice2Icon className="h-5 w-5" />
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Nome da Empresa *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                maxLength={255}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Nome completo da empresa"
                disabled={loading}
              />
            </div>

            {/* CNPJ */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                CNPJ *
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleInputChange}
                required
                maxLength={18}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="00.000.000/0000-00"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
                disabled={loading}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            {/* Email */}
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
                value={formData.email}
                onChange={handleInputChange}
                required
                maxLength={255}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="contato@empresa.com"
                disabled={loading}
              />
            </div>

            {/* Telefone */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Telefone *
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                required
                maxLength={15}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="(11) 99999-9999"
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card>
          <h2 className={clsx(
            'text-xl font-semibold mb-6',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Endereço
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rua */}
            <div className="md:col-span-2">
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Rua/Avenida *
              </label>
              <input
                type="text"
                name="endereco_rua"
                value={formData.endereco_rua}
                onChange={handleInputChange}
                required
                maxLength={255}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Nome da rua ou avenida"
                disabled={loading}
              />
            </div>

            {/* Número */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Número *
              </label>
              <input
                type="text"
                name="endereco_numero"
                value={formData.endereco_numero}
                onChange={handleInputChange}
                required
                maxLength={10}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="123"
                disabled={loading}
              />
            </div>

            {/* Complemento */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Complemento
              </label>
              <input
                type="text"
                name="endereco_complemento"
                value={formData.endereco_complemento || ''}
                onChange={handleInputChange}
                maxLength={100}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Apto, sala, etc."
                disabled={loading}
              />
            </div>

            {/* Bairro */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Bairro *
              </label>
              <input
                type="text"
                name="endereco_bairro"
                value={formData.endereco_bairro}
                onChange={handleInputChange}
                required
                maxLength={100}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Nome do bairro"
                disabled={loading}
              />
            </div>

            {/* Cidade */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Cidade *
              </label>
              <input
                type="text"
                name="endereco_cidade"
                value={formData.endereco_cidade}
                onChange={handleInputChange}
                required
                maxLength={100}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="Nome da cidade"
                disabled={loading}
              />
            </div>

            {/* Estado */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Estado *
              </label>
              <select
                name="endereco_estado"
                value={formData.endereco_estado}
                onChange={handleInputChange}
                required
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
                disabled={loading}
              >
                <option value="">Selecione o estado</option>
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            {/* CEP */}
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                CEP *
              </label>
              <input
                type="text"
                name="endereco_cep"
                value={formData.endereco_cep}
                onChange={handleInputChange}
                required
                maxLength={9}
                className={clsx(
                  'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
                placeholder="00000-000"
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        {/* Observações */}
        <Card>
          <h2 className={clsx(
            'text-xl font-semibold mb-6',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Informações Adicionais
          </h2>
          
          <div>
            <label className={clsx(
              'block text-sm font-medium mb-2',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className={clsx(
                'w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-vertical',
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              )}
              placeholder="Informações adicionais sobre a empresa..."
              disabled={loading}
            />
            <p className={clsx(
              'text-xs mt-1',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              Máximo 500 caracteres
            </p>
          </div>
        </Card>

        {/* Botões */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCancelar}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 sm:flex-initial"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4" />
                  <span>Salvar Empresa</span>
                </div>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CadastrarEmpresa;
