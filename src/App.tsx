import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { RouteGuard, AdminOnlyGuard, EstablishmentGuard, OrdersGuard, ProductGuard, CategoryGuard, StaffGuard, UserManagementGuard } from './components/RouteGuard';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import CadastroEstabelecimento from './pages/CadastroEstabelecimento';
import AtivarAtendente from './pages/AtivarAtendente';
import Dashboard from './pages/Dashboard';
import CadastrarCliente from './pages/CadastrarCliente';
import ListarClientes from './pages/ListarClientes';
import CadastrarProduto from './pages/CadastrarProduto';
import ListarProdutos from './pages/ListarProdutos';
import CadastrarPedidoNovo from './pages/CadastrarPedidoNovo';
import ListarPedidos from './pages/ListarPedidos';
import VerCardapio from './pages/VerCardapio';
import Perfil from './pages/Perfil';
import MinhaConta from './pages/MinhaConta';
import GerenciarAtendentes from './pages/GerenciarAtendentes';
import DashboardEspecifico from './pages/DashboardEspecifico';
import DashboardEstabelecimento from './pages/DashboardEstabelecimento';
import GenericPage from './components/GenericPage';
import ListarCategorias from './pages/ListarCategorias';
import CadastrarCategoria from './pages/CadastrarCategoria';
import CadastrarEmpresa from './pages/CadastrarEmpresa';
import ListarEmpresas from './pages/ListarEmpresas';
import ListarEntregadores from './pages/ListarEntregadores';
import CadastrarEntregador from './pages/CadastrarEntregador';
import ListarUsuarios from './pages/Usuarios/ListarUsuarios';
import CadastrarUsuario from './pages/Usuarios/CadastrarUsuario';
import LogoutPage from './pages/LogoutPage';
import { Toaster } from 'sonner';
import './App.css';

// Componente para redirecionamento automático baseado no role
const RoleBasedRedirect: React.FC = () => {
  return (
    <ProtectedRoute redirectToRoleDefault={true}>
      <div>Redirecionando...</div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
            <Route path="/ativar-atendente/:token" element={<AtivarAtendente />} />
            
            {/* Redirecionamento automático baseado no role */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Todas as outras rotas são protegidas */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      {/* DASHBOARD - Hierarquia de acesso */}
                      <Route path="/dashboard" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <DashboardEstabelecimento />
                        </EstablishmentGuard>
                      } />
                      
                      {/* PEDIDOS - Todos os roles autenticados */}
                      <Route path="/pedidos" element={
                        <OrdersGuard>
                          <ListarPedidos />
                        </OrdersGuard>
                      } />
                      <Route path="/pedidos/cadastrar" element={
                        <OrdersGuard>
                          <CadastrarPedidoNovo />
                        </OrdersGuard>
                      } />
                      <Route path="/pedidos/listar" element={
                        <OrdersGuard>
                          <ListarPedidos />
                        </OrdersGuard>
                      } />
                      
                      {/* CARDÁPIO - Visualização para todos */}
                      <Route path="/cardapio" element={
                        <OrdersGuard>
                          <VerCardapio />
                        </OrdersGuard>
                      } />
                      <Route path="/cardapio/ver" element={
                        <OrdersGuard>
                          <VerCardapio />
                        </OrdersGuard>
                      } />
                      
                      {/* PRODUTOS - Apenas admin e estabelecimento */}
                      <Route path="/produtos" element={
                        <ProductGuard showUnauthorized={true}>
                          <ListarProdutos />
                        </ProductGuard>
                      } />
                      <Route path="/produtos/cadastrar" element={
                        <ProductGuard showUnauthorized={true}>
                          <CadastrarProduto />
                        </ProductGuard>
                      } />
                      <Route path="/produtos/listar" element={
                        <ProductGuard showUnauthorized={true}>
                          <ListarProdutos />
                        </ProductGuard>
                      } />
                      
                      {/* CLIENTES - Todos os roles (atendentes podem criar/editar) */}
                      <Route path="/clientes" element={
                        <OrdersGuard>
                          <ListarClientes />
                        </OrdersGuard>
                      } />
                      <Route path="/clientes/cadastrar" element={
                        <OrdersGuard>
                          <CadastrarCliente />
                        </OrdersGuard>
                      } />
                      <Route path="/clientes/listar" element={
                        <OrdersGuard>
                          <ListarClientes />
                        </OrdersGuard>
                      } />
                      
                      {/* CATEGORIAS - Admin geral e estabelecimento */}
                      <Route path="/categorias/cadastrar" element={
                        <CategoryGuard showUnauthorized={true}>
                          <CadastrarCategoria />
                        </CategoryGuard>
                      } />
                      <Route path="/categorias/listar" element={
                        <CategoryGuard showUnauthorized={true}>
                          <ListarCategorias />
                        </CategoryGuard>
                      } />
                      
                      {/* ESTABELECIMENTOS - Apenas admin geral */}
                      <Route path="/estabelecimentos" element={
                        <AdminOnlyGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Gerenciar Estabelecimentos" 
                            description="Administração de todos os estabelecimentos"
                            content="Visualize e gerencie todos os estabelecimentos da plataforma."
                          />
                        </AdminOnlyGuard>
                      } />
                      <Route path="/estabelecimentos/cadastrar" element={
                        <AdminOnlyGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Cadastrar Estabelecimento" 
                            description="Adicione novo estabelecimento"
                            content="Registro de novos estabelecimentos na plataforma."
                          />
                        </AdminOnlyGuard>
                      } />
                      <Route path="/estabelecimentos/listar" element={
                        <AdminOnlyGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Listar Estabelecimentos" 
                            description="Visualize todos os estabelecimentos cadastrados"
                            content="Gestão completa dos estabelecimentos da plataforma."
                          />
                        </AdminOnlyGuard>
                      } />
                      
                      {/* ATENDENTES - Admin geral e estabelecimento */}
                      <Route path="/atendentes" element={
                        <StaffGuard showUnauthorized={true}>
                          <GerenciarAtendentes />
                        </StaffGuard>
                      } />
                      <Route path="/atendentes/cadastrar" element={
                        <StaffGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Cadastrar Atendente" 
                            description="Adicione novo atendente"
                            content="Registro de novos atendentes no estabelecimento."
                          />
                        </StaffGuard>
                      } />
                      <Route path="/atendentes/listar" element={
                        <StaffGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Listar Atendentes" 
                            description="Visualize todos os atendentes"
                            content="Lista completa de atendentes do estabelecimento."
                          />
                        </StaffGuard>
                      } />
                      <Route path="/atendentes/convites" element={
                        <StaffGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Convites de Atendentes" 
                            description="Gerencie convites pendentes"
                            content="Sistema de convites para novos atendentes."
                          />
                        </StaffGuard>
                      } />
                      
                      {/* EMPRESAS - Apenas admin geral */}
                      <Route path="/empresas/cadastrar" element={
                        <AdminOnlyGuard showUnauthorized={true}>
                          <CadastrarEmpresa />
                        </AdminOnlyGuard>
                      } />
                      <Route path="/empresas/listar" element={
                        <AdminOnlyGuard showUnauthorized={true}>
                          <ListarEmpresas />
                        </AdminOnlyGuard>
                      } />
                      
                      {/* ENTREGADORES - Admin geral e estabelecimento */}
                      <Route path="/entregadores" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <ListarEntregadores />
                        </EstablishmentGuard>
                      } />
                      <Route path="/entregadores/cadastrar" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <CadastrarEntregador />
                        </EstablishmentGuard>
                      } />
                      <Route path="/entregadores/listar" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <ListarEntregadores />
                        </EstablishmentGuard>
                      } />
                      
                      {/* FORNECEDORES - Admin geral e estabelecimento */}
                      <Route path="/fornecedores/cadastrar" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Cadastrar Fornecedores" 
                            description="Adicione novos fornecedores"
                            content="Registro de fornecedores e parceiros comerciais."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/fornecedores/listar" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Listar Fornecedores" 
                            description="Gerencie todos os fornecedores"
                            content="Lista completa de fornecedores com dados de contato."
                          />
                        </EstablishmentGuard>
                      } />
                      
                      {/* USUÁRIOS - Apenas admin geral */}
                      <Route path="/usuarios" element={
                        <UserManagementGuard showUnauthorized={true}>
                          <ListarUsuarios />
                        </UserManagementGuard>
                      } />
                      <Route path="/usuarios/cadastrar" element={
                        <UserManagementGuard showUnauthorized={true}>
                          <CadastrarUsuario />
                        </UserManagementGuard>
                      } />
                      <Route path="/usuarios/listar" element={
                        <UserManagementGuard showUnauthorized={true}>
                          <ListarUsuarios />
                        </UserManagementGuard>
                      } />
                      
                      {/* CONFIGURAÇÕES - Admin geral e estabelecimento */}
                      <Route path="/configuracoes/dados-empresa" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Dados da Empresa" 
                            description="Configure as informações da sua empresa"
                            content="Edição dos dados básicos da empresa, logo e informações de contato."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/configuracoes/apis" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Configurações de API" 
                            description="Gerencie integrações com APIs externas"
                            content="Configure chaves de API e integrações com serviços externos."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/configuracoes/formas-pagamento" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Formas de Pagamento" 
                            description="Configure os métodos de pagamento aceitos"
                            content="Gestão das formas de pagamento disponíveis para os clientes."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/configuracoes/taxas-entrega" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Taxas de Entrega" 
                            description="Defina as taxas de entrega por região"
                            content="Configure valores de entrega baseados em localização e distância."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/configuracoes/horario-funcionamento" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Horário de Funcionamento" 
                            description="Configure os horários de atendimento"
                            content="Defina horários de funcionamento por dia da semana."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/configuracoes/integracoes" element={
                        <EstablishmentGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Integrações" 
                            description="Gerencie integrações com plataformas externas"
                            content="Configure integrações com WhatsApp, redes sociais e outros serviços."
                          />
                        </EstablishmentGuard>
                      } />
                      <Route path="/configuracoes/backup-sistema" element={
                        <AdminOnlyGuard showUnauthorized={true}>
                          <GenericPage 
                            title="Backup do Sistema" 
                            description="Configure backups automáticos dos dados"
                            content="Gestão de backups e recuperação de dados do sistema."
                          />
                        </AdminOnlyGuard>
                      } />
                      
                      {/* MENU DO USUÁRIO - Acesso público (após login) */}
                      <Route path="/minha-conta" element={<MinhaConta />} />
                      <Route path="/perfil" element={<Perfil />} />
                      
                      {/* ROTAS DE FALLBACK */}
                      <Route path="*" element={<RoleBasedRedirect />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;