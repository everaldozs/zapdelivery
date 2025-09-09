import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import { clsx } from 'clsx';
import {
  BuildingStorefrontIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface FormData {
  // Dados da empresa
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  
  // Endereço
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  
  // Proprietário
  nomeProprietario: string;
  whatsappProprietario: string;
  
  // Login
  senhaTemporaria: string;
  confirmarSenha: string;
}

const CadastroEstabelecimento: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    numero: '',
    bairro: '',
    cep: '',
    cidade: '',
    uf: '',
    nomeProprietario: '',
    whatsappProprietario: '',
    senhaTemporaria: '',
    confirmarSenha: ''
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Lista de estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplicar formatações
    if (name === 'cnpj') formattedValue = formatCNPJ(value);
    if (name === 'telefone' || name === 'whatsappProprietario') formattedValue = formatPhone(value);
    if (name === 'cep') formattedValue = formatCEP(value);
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Limpar erros
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (stepNumber === 1) {
      // Dados da empresa
      if (!formData.nome.trim()) newErrors.nome = 'Nome da empresa é obrigatório';
      if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      
    } else if (stepNumber === 2) {
      // Endereço
      if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
      if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
      if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
      if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
      if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
      if (!formData.uf) newErrors.uf = 'Estado é obrigatório';
      
    } else if (stepNumber === 3) {
      // Proprietário e senha
      if (!formData.nomeProprietario.trim()) newErrors.nomeProprietario = 'Nome do proprietário é obrigatório';
      if (!formData.whatsappProprietario.trim()) newErrors.whatsappProprietario = 'WhatsApp é obrigatório';
      if (!formData.senhaTemporaria) newErrors.senhaTemporaria = 'Senha é obrigatória';
      else if (formData.senhaTemporaria.length < 6) newErrors.senhaTemporaria = 'Senha deve ter pelo menos 6 caracteres';
      if (!formData.confirmarSenha) newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
      else if (formData.senhaTemporaria !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('https://tbtjsvvmrisukvqlhfgq.supabase.co/functions/v1/cadastrar-estabelecimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSuccess(true);
      } else {
        setErrorMessage(result.error || 'Erro ao cadastrar estabelecimento');
      }
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={clsx(
        'min-h-screen flex items-center justify-center p-4',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'
      )}>
        <div className={clsx(
          'max-w-md w-full text-center p-8 rounded-2xl shadow-xl',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )}>
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className={clsx(
            'text-2xl font-bold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Cadastro Realizado!
          </h2>
          <p className={clsx(
            'mb-6 text-sm',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Seu estabelecimento foi cadastrado com sucesso! Você já pode fazer login com suas credenciais.
          </p>
          <Button
            onClick={() => navigate('/login')}
            variant="primary"
            className="w-full"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'min-h-screen p-4',
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'
    )}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <TruckIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className={clsx(
            'text-3xl font-bold mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Cadastrar Estabelecimento
          </h1>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Junte-se à plataforma Zap Delivery e expanda seu negócio
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                stepNum <= step
                  ? 'bg-green-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
              )}>
                {stepNum}
              </div>
            ))}
          </div>
          <div className={clsx(
            'w-full bg-gray-200 rounded-full h-2',
            theme === 'dark' && 'bg-gray-700'
          )}>
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className={clsx(
          'bg-white rounded-2xl shadow-xl p-8',
          theme === 'dark' && 'bg-gray-800'
        )}>
          {errorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className={clsx(
                  'text-xl font-semibold mb-4 flex items-center gap-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  <BuildingStorefrontIcon className="h-6 w-6" />
                  Dados da Empresa
                </h3>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>Nome da Empresa *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className={clsx(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                      errors.nome
                        ? 'border-red-300 focus:ring-red-500'
                        : theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300'
                    )}
                    placeholder="Ex: Restaurante do João"
                  />
                  {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
                </div>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>CNPJ *</label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    maxLength={18}
                    className={clsx(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                      errors.cnpj
                        ? 'border-red-300 focus:ring-red-500'
                        : theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300'
                    )}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="contato@empresa.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Telefone *</label>
                    <input
                      type="text"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      maxLength={15}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.telefone
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="(65) 99999-9999"
                    />
                    {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className={clsx(
                  'text-xl font-semibold mb-4 flex items-center gap-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  <MapPinIcon className="h-6 w-6" />
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Endereço *</label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.endereco
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="Rua, Avenida..."
                    />
                    {errors.endereco && <p className="mt-1 text-sm text-red-600">{errors.endereco}</p>}
                  </div>

                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Número *</label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.numero
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="123"
                    />
                    {errors.numero && <p className="mt-1 text-sm text-red-600">{errors.numero}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Bairro *</label>
                    <input
                      type="text"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.bairro
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="Centro"
                    />
                    {errors.bairro && <p className="mt-1 text-sm text-red-600">{errors.bairro}</p>}
                  </div>

                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>CEP *</label>
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      maxLength={9}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.cep
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="00000-000"
                    />
                    {errors.cep && <p className="mt-1 text-sm text-red-600">{errors.cep}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Cidade *</label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.cidade
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300'
                      )}
                      placeholder="Cuiabá"
                    />
                    {errors.cidade && <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>}
                  </div>

                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Estado *</label>
                    <select
                      name="uf"
                      value={formData.uf}
                      onChange={handleChange}
                      className={clsx(
                        'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                        errors.uf
                          ? 'border-red-300 focus:ring-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                      )}
                    >
                      <option value="">Selecione</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                    {errors.uf && <p className="mt-1 text-sm text-red-600">{errors.uf}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className={clsx(
                  'text-xl font-semibold mb-4 flex items-center gap-2',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  <UserIcon className="h-6 w-6" />
                  Proprietário & Acesso
                </h3>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>Nome do Proprietário *</label>
                  <input
                    type="text"
                    name="nomeProprietario"
                    value={formData.nomeProprietario}
                    onChange={handleChange}
                    className={clsx(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                      errors.nomeProprietario
                        ? 'border-red-300 focus:ring-red-500'
                        : theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300'
                    )}
                    placeholder="João Silva"
                  />
                  {errors.nomeProprietario && <p className="mt-1 text-sm text-red-600">{errors.nomeProprietario}</p>}
                </div>

                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>WhatsApp do Proprietário *</label>
                  <input
                    type="text"
                    name="whatsappProprietario"
                    value={formData.whatsappProprietario}
                    onChange={handleChange}
                    maxLength={15}
                    className={clsx(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                      errors.whatsappProprietario
                        ? 'border-red-300 focus:ring-red-500'
                        : theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300'
                    )}
                    placeholder="(65) 99999-9999"
                  />
                  {errors.whatsappProprietario && <p className="mt-1 text-sm text-red-600">{errors.whatsappProprietario}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Senha Temporária *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="senhaTemporaria"
                        value={formData.senhaTemporaria}
                        onChange={handleChange}
                        className={clsx(
                          'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                          errors.senhaTemporaria
                            ? 'border-red-300 focus:ring-red-500'
                            : theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300'
                        )}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.senhaTemporaria && <p className="mt-1 text-sm text-red-600">{errors.senhaTemporaria}</p>}
                  </div>

                  <div>
                    <label className={clsx(
                      'block text-sm font-medium mb-2',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>Confirmar Senha *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        className={clsx(
                          'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
                          errors.confirmarSenha
                            ? 'border-red-300 focus:ring-red-500'
                            : theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300'
                        )}
                        placeholder="Confirme a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmarSenha && <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
              ) : (
                <Link
                  to="/login"
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-800'
                  )}
                >
                  ← Já tem conta? Fazer login
                </Link>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Processando...</span>
                  </div>
                ) : step === 3 ? (
                  'Finalizar Cadastro'
                ) : (
                  'Próximo'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroEstabelecimento;