import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import {
  UserCircleIcon,
  CameraIcon,
  ShieldCheckIcon,
  KeyIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Perfil: React.FC = () => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('informacoes');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Informações Profissionais
    nome: 'Administrador',
    email: 'admin@zapdelivery.com',
    cargo: 'Administrador do Sistema',
    departamento: 'Tecnologia',
    biografia: 'Administrador responsável pelo sistema Zap Delivery com mais de 5 anos de experiência em gestão de plataformas de entrega.',
    linkedin: 'https://linkedin.com/in/admin-zapdelivery',
    // Segurança
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
    // Preferências
    tema: theme,
    idioma: 'pt-BR',
    timezone: 'America/Cuiaba',
    // Configurações 2FA
    twoFactorEnabled: false,
    backupCodes: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'informacoes', label: 'Informações Profissionais', icon: UserCircleIcon },
    { id: 'seguranca', label: 'Segurança', icon: ShieldCheckIcon },
    { id: 'preferencias', label: 'Preferências', icon: DevicePhoneMobileIcon },
    { id: 'historico', label: 'Histórico de Login', icon: ClockIcon }
  ];

  const historicoLogin = [
    { data: '04/09/2025 07:52', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', localizacao: 'Cuiabá, MT' },
    { data: '03/09/2025 18:30', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', localizacao: 'Cuiabá, MT' },
    { data: '03/09/2025 08:15', ip: '192.168.1.105', dispositivo: 'Firefox - Windows', localizacao: 'Cuiabá, MT' },
    { data: '02/09/2025 19:45', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', localizacao: 'Cuiabá, MT' },
    { data: '02/09/2025 09:20', ip: '192.168.1.100', dispositivo: 'Chrome - Windows', localizacao: 'Cuiabá, MT' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    setFormData(prev => ({ ...prev, backupCodes: codes }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informacoes':
        return (
          <div className="space-y-6">
            {/* Foto do Perfil */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={clsx(
                  'w-24 h-24 rounded-full flex items-center justify-center border-2',
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
                  profileImage ? 'p-0' : 'p-4'
                )}>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Perfil"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className={clsx(
                      'w-full h-full',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    )} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    'absolute -bottom-2 -right-2 p-2 rounded-full shadow-lg border',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className={clsx(
                'text-sm',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Clique no ícone da câmera para alterar sua foto
              </p>
            </div>

            {/* Informações Profissionais */}
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
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Departamento
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operações">Operações</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/seu-perfil"
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
                  Biografia Profissional
                </label>
                <textarea
                  name="biografia"
                  value={formData.biografia}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Conte um pouco sobre sua experiência profissional..."
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                />
              </div>
            </div>
          </div>
        );
      
      case 'seguranca':
        return (
          <div className="space-y-6">
            {/* Alterar Senha */}
            <div className="space-y-4">
              <h3 className={clsx(
                'text-lg font-semibold flex items-center',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <KeyIcon className="h-5 w-5 mr-2" />
                Alterar Senha
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="senhaAtual"
                      value={formData.senhaAtual}
                      onChange={handleInputChange}
                      className={clsx(
                        'w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="novaSenha"
                      value={formData.novaSenha}
                      onChange={handleInputChange}
                      className={clsx(
                        'w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      className={clsx(
                        'w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Autenticação de Dois Fatores */}
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-50 border-gray-200'
            )}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={clsx(
                    'font-semibold',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    Autenticação de Dois Fatores (2FA)
                  </h4>
                  <p className={clsx(
                    'text-sm mt-1',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Button
                  type="button"
                  variant={formData.twoFactorEnabled ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => {
                    if (!formData.twoFactorEnabled) {
                      generateBackupCodes();
                    }
                    setFormData(prev => ({
                      ...prev,
                      twoFactorEnabled: !prev.twoFactorEnabled
                    }));
                  }}
                >
                  {formData.twoFactorEnabled ? 'Desativar 2FA' : 'Ativar 2FA'}
                </Button>
              </div>
              
              {formData.twoFactorEnabled && formData.backupCodes.length > 0 && (
                <div className="mt-4">
                  <p className={clsx(
                    'text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Códigos de Backup (guarde em local seguro):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.backupCodes.map((code, index) => (
                      <code key={index} className={clsx(
                        'text-xs p-2 rounded font-mono',
                        theme === 'dark'
                          ? 'bg-gray-800 text-green-400'
                          : 'bg-white text-green-600'
                      )}>
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'preferencias':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Tema do Sistema
                </label>
                <select
                  name="tema"
                  value={formData.tema}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
              
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Idioma
                </label>
                <select
                  name="idioma"
                  value={formData.idioma}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              <div>
                <label className={clsx(
                  'block text-sm font-medium mb-2',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Fuso Horário
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors',
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value="America/Cuiaba">America/Cuiabá (GMT-4)</option>
                  <option value="America/Sao_Paulo">America/São_Paulo (GMT-3)</option>
                  <option value="America/Manaus">America/Manaus (GMT-4)</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'historico':
        return (
          <div className="space-y-4">
            <h3 className={clsx(
              'text-lg font-semibold mb-4',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Histórico de Logins
            </h3>
            
            <div className="space-y-3">
              {historicoLogin.map((login, index) => (
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
                        {login.data}
                      </p>
                      <p className={clsx(
                        'text-sm mt-1',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {login.dispositivo} • IP: {login.ip}
                      </p>
                      <p className={clsx(
                        'text-xs mt-1',
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      )}>
                        📍 {login.localizacao}
                      </p>
                    </div>
                    <span className={clsx(
                      'px-2 py-1 text-xs rounded-full',
                      index === 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : theme === 'dark'
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                    )}>
                      {index === 0 ? 'Atual' : 'Anterior'}
                    </span>
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
          Perfil
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Gerencie suas informações profissionais e configurações de segurança
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200 text-sm font-medium">
              Perfil atualizado com sucesso!
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
              {(activeTab === 'informacoes' || activeTab === 'seguranca' || activeTab === 'preferencias') && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
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

export default Perfil;