import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const MinhaConta: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('pessoais');
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: 'Administrador',
    email: 'admin@zapdelivery.com',
    telefone: '(65) 99605-5823',
    cargo: 'Administrador do Sistema',
    // Dados da Empresa
    nomeEmpresa: 'Zap Delivery',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Entregas, 123',
    cidade: 'Cuiabá',
    estado: 'MT',
    cep: '78000-000',
    // Configurações
    receberEmails: true,
    receberSMS: false,
    receberPush: true,
    relatorioDiario: true,
    relatorioSemanal: true,
    relatorioMensal: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'pessoais', label: 'Dados Pessoais', icon: UserIcon },
    { id: 'empresa', label: 'Dados da Empresa', icon: BuildingOfficeIcon },
    { id: 'notificacoes', label: 'Notificações', icon: BellIcon },
    { id: 'atividades', label: 'Histórico', icon: ClockIcon },
    { id: 'estatisticas', label: 'Estatísticas', icon: ChartBarIcon }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const atividades = [
    { acao: 'Login realizado', data: '04/09/2025 07:52', ip: '192.168.1.100' },
    { acao: 'Produto cadastrado', data: '03/09/2025 16:30', ip: '192.168.1.100' },
    { acao: 'Pedido processado', data: '03/09/2025 14:15', ip: '192.168.1.100' },
    { acao: 'Configuração alterada', data: '02/09/2025 09:20', ip: '192.168.1.100' },
    { acao: 'Relatório gerado', data: '01/09/2025 18:45', ip: '192.168.1.100' }
  ];

  const estatisticas = [
    { label: 'Total de Logins', valor: '47', periodo: 'Últimos 30 dias' },
    { label: 'Pedidos Processados', valor: '124', periodo: 'Este mês' },
    { label: 'Produtos Cadastrados', valor: '89', periodo: 'Total' },
    { label: 'Clientes Atendidos', valor: '156', periodo: 'Este mês' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pessoais':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
            </div>
          </div>
        );
      
      case 'empresa':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  name="nomeEmpresa"
                  value={formData.nomeEmpresa}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
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
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  CEP
                </label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Endereço *
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Cidade *
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="MT">Mato Grosso</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'notificacoes':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className={clsx(
                'text-lg font-semibold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Preferências de Notificação
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="receberEmails"
                    checked={formData.receberEmails}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Receber notificações por email
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="receberSMS"
                    checked={formData.receberSMS}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Receber notificações por SMS
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="receberPush"
                    checked={formData.receberPush}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Receber notificações push no navegador
                  </span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className={clsx(
                'text-lg font-semibold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Relatórios Automáticos
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="relatorioDiario"
                    checked={formData.relatorioDiario}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Relatório diário de vendas
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="relatorioSemanal"
                    checked={formData.relatorioSemanal}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Relatório semanal de performance
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="relatorioMensal"
                    checked={formData.relatorioMensal}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className={clsx(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Relatório mensal completo
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'atividades':
        return (
          <div className="space-y-4">
            <h3 className={clsx(
              'text-lg font-semibold mb-4',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Histórico de Atividades
            </h3>
            
            <div className="space-y-3">
              {atividades.map((atividade, index) => (
                <div key={index} className={clsx(
                  'p-4 rounded-lg border',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={clsx(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {atividade.acao}
                      </p>
                      <p className={clsx(
                        'text-sm mt-1',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {atividade.data} • IP: {atividade.ip}
                      </p>
                    </div>
                    <ClockIcon className={clsx(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'estatisticas':
        return (
          <div className="space-y-4">
            <h3 className={clsx(
              'text-lg font-semibold mb-4',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Estatísticas da Conta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {estatisticas.map((stat, index) => (
                <div key={index} className={clsx(
                  'p-4 rounded-lg border',
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="text-center">
                    <p className={clsx(
                      'text-2xl font-bold',
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    )}>
                      {stat.valor}
                    </p>
                    <p className={clsx(
                      'font-medium mt-1',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {stat.label}
                    </p>
                    <p className={clsx(
                      'text-sm mt-1',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {stat.periodo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Minha Conta
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200 text-sm font-medium">
              Alterações salvas com sucesso!
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com Tabs */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                      isActive
                        ? theme === 'dark'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-green-50 text-green-700'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            <Card>
              {renderTabContent()}
              
              {/* Action Buttons */}
              {(activeTab === 'pessoais' || activeTab === 'empresa' || activeTab === 'notificacoes') && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      // Reset form logic here
                      console.log('Form reset');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className={isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              )}
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MinhaConta;