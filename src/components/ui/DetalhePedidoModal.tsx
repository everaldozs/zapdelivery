import React, { useState } from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Pedido } from '../../types';
import Modal from './Modal';
import Button from './Button';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  PencilIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface DetalhePedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido | null;
  onStatusChange: (pedidoId: number, novoStatus: Pedido['status']) => void;
  onPrint?: (pedido: Pedido) => void;
  editMode?: boolean;
  onPedidoUpdate?: (pedidoAtualizado: Partial<Pedido>) => void;
  onDelete?: (pedidoId: number) => Promise<void>;
}

const DetalhePedidoModal: React.FC<DetalhePedidoModalProps> = ({
  isOpen,
  onClose,
  pedido,
  onStatusChange,
  onPrint,
  editMode = false,
  onPedidoUpdate,
  onDelete
}) => {
  const { theme } = useTheme();
  const { profile, isAdmin, isEstabelecimento } = useAuth();
  const [statusSelecionado, setStatusSelecionado] = useState<Pedido['status'] | ''>('');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarConfirmacaoExclusao, setMostrarConfirmacaoExclusao] = useState(false);
  
  // Estados para modo de edição
  const [modoEdicao, setModoEdicao] = useState(editMode);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  
  // Estados dos campos editáveis
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [enderecoRua, setEnderecoRua] = useState('');
  const [enderecoNumero, setEnderecoNumero] = useState('');
  const [enderecoBairro, setEnderecoBairro] = useState('');
  const [enderecoCidade, setEnderecoCidade] = useState('');
  const [enderecoComplemento, setEnderecoComplemento] = useState('');
  const [observacoesPedido, setObservacoesPedido] = useState('');
  const [statusPedido, setStatusPedido] = useState<Pedido['status']>('Pedindo');

  // Carregar dados do pedido nos estados de edição
  React.useEffect(() => {
    if (pedido && isOpen) {
      setNomeCliente(pedido.cliente.nome);
      setTelefoneCliente(pedido.cliente.telefone);
      setEnderecoRua(pedido.cliente.endereco.rua);
      setEnderecoNumero(pedido.cliente.endereco.numero);
      setEnderecoBairro(pedido.cliente.endereco.bairro);
      setEnderecoCidade(pedido.cliente.endereco.cidade);
      setEnderecoComplemento(pedido.cliente.endereco.complemento || '');
      setObservacoesPedido(pedido.observacoes || '');
      setStatusPedido(pedido.status);
      setModoEdicao(editMode);
    }
  }, [pedido, isOpen, editMode]);

  const statusOptions: Pedido['status'][] = [
    'Pedindo',
    'Aguardando Pagamento',
    'Pagamento Confirmado',
    'Em preparação',
    'Pedido Pronto',
    'Saiu para entrega',
    'Pedido Entregue',
    'Cancelado Pelo Estabelecimento',
    'Cancelado pelo Cliente'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pedindo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Aguardando Pagamento':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Pagamento Confirmado':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Em preparação':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Pedido Pronto':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400';
      case 'Saiu para entrega':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'Pedido Entregue':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Cancelado Pelo Estabelecimento':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400';
      case 'Cancelado pelo Cliente':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pedindo':
        return <ClockIcon className="h-4 w-4" />;
      case 'Aguardando Pagamento':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'Pagamento Confirmado':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Em preparação':
        return <ClockIcon className="h-4 w-4" />;
      case 'Pedido Pronto':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Saiu para entrega':
        return <TruckIcon className="h-4 w-4" />;
      case 'Pedido Entregue':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Cancelado Pelo Estabelecimento':
        return <XCircleIcon className="h-4 w-4" />;
      case 'Cancelado pelo Cliente':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funções para modo de edição
  const ativarModoEdicao = () => {
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    // Restaurar valores originais
    if (pedido) {
      setNomeCliente(pedido.cliente.nome);
      setTelefoneCliente(pedido.cliente.telefone);
      setEnderecoRua(pedido.cliente.endereco.rua);
      setEnderecoNumero(pedido.cliente.endereco.numero);
      setEnderecoBairro(pedido.cliente.endereco.bairro);
      setEnderecoCidade(pedido.cliente.endereco.cidade);
      setEnderecoComplemento(pedido.cliente.endereco.complemento || '');
      setObservacoesPedido(pedido.observacoes || '');
      setStatusPedido(pedido.status);
    }
    setModoEdicao(false);
  };

  const salvarEdicao = async () => {
    if (!pedido || !onPedidoUpdate) return;
    
    try {
      setSalvandoEdicao(true);
      
      // Preparar dados atualizados
      const dadosAtualizados: Partial<Pedido> = {
        cliente: {
          ...pedido.cliente,
          nome: nomeCliente.trim(),
          telefone: telefoneCliente.trim(),
          endereco: {
            ...pedido.cliente.endereco,
            rua: enderecoRua.trim(),
            numero: enderecoNumero.trim(),
            bairro: enderecoBairro.trim(),
            cidade: enderecoCidade.trim(),
            complemento: enderecoComplemento.trim()
          }
        },
        observacoes: observacoesPedido.trim(),
        status: statusPedido
      };
      
      // Chamar função de atualização
      await onPedidoUpdate(dadosAtualizados);
      
      // Sair do modo de edição
      setModoEdicao(false);
      
      // Fechar modal após salvamento bem-sucedido
      onClose();
      
    } catch (error) {
      console.error('💥 Erro ao salvar edições do pedido:', error);
      alert('Erro ao salvar as alterações. Tente novamente.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleStatusChange = () => {
    if (statusSelecionado && statusSelecionado !== pedido.status) {
      setMostrarConfirmacao(true);
    }
  };

  const confirmarMudancaStatus = () => {
    if (statusSelecionado) {
      onStatusChange(pedido.id, statusSelecionado as Pedido['status']);
      setMostrarConfirmacao(false);
      setStatusSelecionado('');
      onClose();
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(pedido);
    } else {
      window.print();
    }
  };

  const handleDelete = () => {
    console.log('🎯 [MODAL] Botão Excluir clicado');
    console.log('📋 [MODAL] Dados do pedido:', {
      id: pedido?.id,
      codigo: pedido?.codigo,
      status: pedido?.status
    });
    setMostrarConfirmacaoExclusao(true);
  };

  const confirmarExclusao = async () => {
    console.log('📝 [MODAL] Confirmação de exclusão iniciada');
    console.log('🔍 [MODAL] onDelete disponível:', typeof onDelete);
    console.log('📊 [MODAL] ID do pedido a excluir:', pedido?.id);
    console.log('📊 [MODAL] Tipo do ID:', typeof pedido?.id);
    
    if (onDelete && pedido) {
      try {
        console.log('➡️ [MODAL] Chamando onDelete com pedido.id:', pedido.id);
        console.log('🚀 [MODAL] Iniciando await onDelete...');
        
        // Aguardar a conclusão da exclusão
        const resultado = await onDelete(pedido.id);
        
        console.log('✅ [MODAL] onDelete retornou:', resultado);
        console.log('✅ [MODAL] Exclusão concluída com sucesso');
        
        // Só fechar o modal após a exclusão bem-sucedida
        setMostrarConfirmacaoExclusao(false);
        onClose();
        
      } catch (error) {
        console.error('💥 [MODAL] Erro durante exclusão:', error);
        console.error('💥 [MODAL] Tipo do erro:', typeof error);
        console.error('💥 [MODAL] Detalhes:', error);
        
        // Não fechar o modal em caso de erro para que o usuário veja a mensagem
        setMostrarConfirmacaoExclusao(false);
        // Manter o modal aberto para mostrar erro
      }
    } else {
      console.error('❌ [MODAL] Erro: onDelete não disponível ou pedido inválido');
      console.error('📝 [MODAL] onDelete:', onDelete);
      console.error('📝 [MODAL] pedido:', pedido);
    }
  };

  // Verificar se usuário pode excluir
  const podeExcluir = isAdmin() || isEstabelecimento();

  if (!pedido) return null;

  return (
    <>
      <Modal 
        isOpen={isOpen && !mostrarConfirmacao && !mostrarConfirmacaoExclusao} 
        onClose={onClose} 
        title={`Pedido #${pedido.id}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Header com Status e Ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border',
                getStatusColor(pedido.status)
              )}>
                {getStatusIcon(pedido.status)}
                {pedido.status}
              </span>
              {pedido.prioridade === 'Urgente' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  Urgente
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!modoEdicao && (
                <Button variant="secondary" size="sm" onClick={handlePrint}>
                  <PrinterIcon className="h-4 w-4 mr-1" />
                  Imprimir
                </Button>
              )}
              {podeExcluir && !modoEdicao && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleDelete}
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              )}
              {!modoEdicao ? (
                <Button variant="ghost" size="sm" onClick={ativarModoEdicao}>
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              ) : (
                <>
                  {podeExcluir && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleDelete}
                      disabled={salvandoEdicao}
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={cancelarEdicao}
                    disabled={salvandoEdicao}
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={salvarEdicao}
                    disabled={salvandoEdicao}
                  >
                    {salvandoEdicao ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Salvar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações do Cliente */}
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <h3 className={clsx(
                'font-semibold text-sm mb-3 flex items-center gap-2',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <UserIcon className="h-4 w-4" />
                Informações do Cliente
              </h3>
              <div className="space-y-3">
                {/* Nome do Cliente */}
                <div>
                  <label className={clsx(
                    'block text-xs font-medium mb-1',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Nome
                  </label>
                  {modoEdicao ? (
                    <input
                      type="text"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className={clsx(
                        'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      )}
                      placeholder="Nome do cliente"
                    />
                  ) : (
                    <p className={clsx(
                      'font-medium',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {nomeCliente}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className={clsx(
                    'block text-xs font-medium mb-1',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Telefone
                  </label>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {modoEdicao ? (
                      <input
                        type="tel"
                        value={telefoneCliente}
                        onChange={(e) => setTelefoneCliente(e.target.value)}
                        className={clsx(
                          'flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        )}
                        placeholder="Telefone do cliente"
                      />
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{telefoneCliente}</span>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <label className={clsx(
                    'block text-xs font-medium mb-1',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Endereço
                  </label>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1 space-y-2">
                      {modoEdicao ? (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={enderecoRua}
                              onChange={(e) => setEnderecoRua(e.target.value)}
                              className={clsx(
                                'col-span-2 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              )}
                              placeholder="Rua"
                            />
                            <input
                              type="text"
                              value={enderecoNumero}
                              onChange={(e) => setEnderecoNumero(e.target.value)}
                              className={clsx(
                                'px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              )}
                              placeholder="Nº"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={enderecoBairro}
                              onChange={(e) => setEnderecoBairro(e.target.value)}
                              className={clsx(
                                'px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              )}
                              placeholder="Bairro"
                            />
                            <input
                              type="text"
                              value={enderecoCidade}
                              onChange={(e) => setEnderecoCidade(e.target.value)}
                              className={clsx(
                                'px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                theme === 'dark'
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              )}
                              placeholder="Cidade"
                            />
                          </div>
                          <input
                            type="text"
                            value={enderecoComplemento}
                            onChange={(e) => setEnderecoComplemento(e.target.value)}
                            className={clsx(
                              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                              theme === 'dark'
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            )}
                            placeholder="Complemento (opcional)"
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {enderecoRua}, {enderecoNumero}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {enderecoBairro} - {enderecoCidade}
                          </p>
                          {enderecoComplemento && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Complemento: {enderecoComplemento}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Pedido */}
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <h3 className={clsx(
                'font-semibold text-sm mb-3 flex items-center gap-2',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                <ClipboardDocumentListIcon className="h-4 w-4" />
                Detalhes do Pedido
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Data/Hora:</span>
                  <span className={clsx(
                    'font-medium',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {formatarDataHora(pedido.dataPedido)}
                  </span>
                </div>
                
                {/* Status Editável */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <div className="flex-1 max-w-xs">
                    {modoEdicao ? (
                      <select
                        value={statusPedido}
                        onChange={(e) => setStatusPedido(e.target.value as Pedido['status'])}
                        className={clsx(
                          'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        )}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-right">
                        <span className={clsx(
                          'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 justify-end',
                          getStatusColor(statusPedido)
                        )}>
                          {getStatusIcon(statusPedido)}
                          {statusPedido}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Pagamento:</span>
                  <div className="text-right">
                    <span className={clsx(
                      'font-medium',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {pedido.pagamento.metodo}
                    </span>
                    <p className={clsx(
                      'text-xs',
                      pedido.pagamento.status === 'Pago' ? 'text-green-600' : 'text-yellow-600'
                    )}>
                      {pedido.pagamento.status}
                    </p>
                  </div>
                </div>
                {pedido.tempoEstimado && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tempo Estimado:</span>
                    <span className={clsx(
                      'font-medium',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {pedido.tempoEstimado} min
                    </span>
                  </div>
                )}
                {pedido.entregador && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Entregador:</span>
                    <div className="text-right">
                      <span className={clsx(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {pedido.entregador.nome}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pedido.entregador.telefone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className={clsx(
            'p-4 rounded-lg border',
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          )}>
            <h3 className={clsx(
              'font-semibold text-sm mb-4 flex items-center gap-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              <ClipboardDocumentListIcon className="h-4 w-4" />
              Itens do Pedido
            </h3>
            <div className="space-y-3">
              {pedido.itens.map((item, index) => (
                <div key={index} className={clsx(
                  'flex justify-between items-start p-3 rounded border',
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500'
                    : 'bg-white border-gray-200'
                )}>
                  <div className="flex-1">
                    <p className={clsx(
                      'font-medium text-sm',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.quantidade}x {item.produto}
                    </p>
                    {item.observacoes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Obs: {item.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={clsx(
                      'font-medium text-sm',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      R$ {(item.quantidade * item.preco).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      R$ {item.preco.toFixed(2)} cada
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Financeiro */}
            <div className={clsx(
              'mt-4 pt-4 border-t space-y-2',
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            )}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                <span className={clsx(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  R$ {pedido.valores.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Taxa de Entrega:</span>
                <span className={clsx(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  R$ {pedido.valores.taxaEntrega.toFixed(2)}
                </span>
              </div>
              {pedido.valores.desconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Desconto:</span>
                  <span className="font-medium text-red-600">
                    -R$ {pedido.valores.desconto.toFixed(2)}
                  </span>
                </div>
              )}
              <div className={clsx(
                'flex justify-between text-lg font-bold pt-2 border-t',
                theme === 'dark' ? 'border-gray-600 text-green-400' : 'border-gray-300 text-green-600'
              )}>
                <span>Total:</span>
                <span className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  R$ {pedido.valores.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {(pedido.observacoes || modoEdicao) && (
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <h3 className={clsx(
                'font-semibold text-sm mb-3',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Observações
              </h3>
              {modoEdicao ? (
                <textarea
                  value={observacoesPedido}
                  onChange={(e) => setObservacoesPedido(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical',
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                  placeholder="Observações do pedido"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {observacoesPedido || 'Nenhuma observação'}
                </p>
              )}
            </div>
          )}

          {/* Histórico */}
          {pedido.historico.length > 0 && (
            <div className={clsx(
              'p-4 rounded-lg border',
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <h3 className={clsx(
                'font-semibold text-sm mb-3',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Histórico do Pedido
              </h3>
              <div className="space-y-3">
                {pedido.historico.map((evento, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border',
                      getStatusColor(evento.status)
                    )}>
                      {getStatusIcon(evento.status)}
                    </div>
                    <div className="flex-1">
                      <p className={clsx(
                        'font-medium text-sm',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {evento.status}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatarDataHora(evento.data)} • {evento.usuario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alteração de Status */}
          <div className={clsx(
            'p-4 rounded-lg border',
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          )}>
            <h3 className={clsx(
              'font-semibold text-sm mb-3',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Alterar Status
            </h3>
            <div className="flex gap-3">
              <select
                value={statusSelecionado}
                onChange={(e) => setStatusSelecionado(e.target.value as Pedido['status'])}
                className={clsx(
                  'flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
                  theme === 'dark'
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                )}
              >
                <option value="">Selecionar novo status...</option>
                {statusOptions.map(status => (
                  <option key={status} value={status} disabled={status === pedido.status}>
                    {status}
                  </option>
                ))}
              </select>
              <Button 
                variant="primary" 
                onClick={handleStatusChange}
                disabled={!statusSelecionado || statusSelecionado === pedido.status}
              >
                Atualizar Status
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Status */}
      <Modal
        isOpen={mostrarConfirmacao}
        onClose={() => setMostrarConfirmacao(false)}
        title="Confirmar Alteração de Status"
        size="md"
      >
        <div className="space-y-4">
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Tem certeza que deseja alterar o status do pedido #{pedido.id} de <strong>{pedido.status}</strong> para <strong>{statusSelecionado}</strong>?
          </p>
          
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setMostrarConfirmacao(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmarMudancaStatus}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={mostrarConfirmacaoExclusao}
        onClose={() => setMostrarConfirmacaoExclusao(false)}
        title="Confirmar Exclusão do Pedido"
        size="md"
      >
        <div className="space-y-4">
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Tem certeza que deseja excluir o pedido #{pedido.id}? Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setMostrarConfirmacaoExclusao(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={confirmarExclusao} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir Pedido
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DetalhePedidoModal;