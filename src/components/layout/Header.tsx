import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSigningOut, setIsSigningOut] = useState(false);

  // FUNÇÃO PARA FAZER LOGOUT RADICAL
  const handleSignOut = async () => {
    console.log('🚪 [Header] LOGOUT RADICAL iniciado...');
    
    try {
      setIsSigningOut(true);
      setUserMenuOpen(false);
      
      // Redirecionamento IMEDIATO para a página de logout
      console.log('🎯 [Header] Redirecionando IMEDIATAMENTE para /logout');
      window.location.replace('/logout'); // ← Usando replace para não deixar histórico
      
    } catch (error) {
      console.error('❌ [Header] Erro no redirecionamento, forçando logout direto:', error);
      
      // FALLBACK: Logout direto se o redirecionamento falhar
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
  };

  // Determinar o ícone do role
  const getRoleIcon = () => {
    if (!profile) return UserCircleIcon;
    
    switch (profile.role_name) {
      case 'Administrator':
        return ShieldCheckIcon;
      case 'Estabelecimento':
        return BuildingStorefrontIcon;
      case 'Atendente':
      default:
        return UserCircleIcon;
    }
  };

  const RoleIcon = getRoleIcon();

  // Atualizar horário a cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentDate = new Date(2025, 8, 4, 7, 52); // 04/09/2025 07:52 conforme especificado

  return (
    <header className={clsx(
      'h-16 border-b flex items-center justify-between px-6 transition-colors duration-200',
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-800'
    )}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className={clsx(
            'p-2 rounded-lg transition-colors duration-200',
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          )}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Date and Time */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className={clsx(
              'h-5 w-5',
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            )} />
            <span className="text-sm font-medium">
              {format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ClockIcon className={clsx(
              'h-5 w-5',
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            )} />
            <span className="text-sm font-medium">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={clsx(
            'p-2 rounded-lg transition-colors duration-200',
            theme === 'dark'
              ? 'hover:bg-gray-700 text-yellow-400 hover:text-yellow-300'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          )}
          title="Alternar tema"
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={clsx(
              'flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200',
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            )}
          >
            <div className={clsx(
              'relative p-1 rounded-lg',
              profile?.role_name === 'Administrator' && 'bg-purple-100 dark:bg-purple-900',
              profile?.role_name === 'Estabelecimento' && 'bg-blue-100 dark:bg-blue-900',
              profile?.role_name === 'Atendente' && 'bg-green-100 dark:bg-green-900'
            )}>
              <RoleIcon className={clsx(
                'h-6 w-6',
                profile?.role_name === 'Administrator' && 'text-purple-600 dark:text-purple-400',
                profile?.role_name === 'Estabelecimento' && 'text-blue-600 dark:text-blue-400',
                profile?.role_name === 'Atendente' && 'text-green-600 dark:text-green-400',
                !profile && 'text-gray-400'
              )} />
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-left">
                <p className="text-sm font-medium">
                  {profile?.name || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    profile?.role_name === 'Administrator' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                    profile?.role_name === 'Estabelecimento' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                    profile?.role_name === 'Atendente' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    !profile && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  )}>
                    {profile?.role_name || 'Carregando...'}
                  </span>
                  {profile?.estabelecimento_nome && profile.role_name !== 'Administrator' && (
                    <span className={clsx(
                      'text-xs',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      • {profile.estabelecimento_nome}
                    </span>
                  )}
                </div>
              </div>
              <ChevronDownIcon className={clsx(
                'h-4 w-4 transition-transform duration-200',
                userMenuOpen && 'transform rotate-180'
              )} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className={clsx(
              'absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg border z-50',
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            )}>
              {/* Informações do usuário */}
              <div className={clsx(
                'px-4 py-3 border-b',
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              )}>
                <p className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {profile?.name || 'Usuário'}
                </p>
                <p className={clsx(
                  'text-xs mt-1',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {user?.email || 'Não informado'}
                </p>
                {profile?.estabelecimento_nome && (
                  <p className={clsx(
                    'text-xs mt-1 flex items-center gap-1',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    <BuildingStorefrontIcon className="h-3 w-3" />
                    {profile.estabelecimento_nome}
                  </p>
                )}
              </div>

              <div className="py-2">
                <Link
                  to="/minha-conta"
                  onClick={() => setUserMenuOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200',
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <UserCircleIcon className="h-4 w-4" />
                  <span>Minha Conta</span>
                </Link>
                <Link
                  to="/perfil"
                  onClick={() => setUserMenuOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200',
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Perfil</span>
                </Link>
                <a
                  href="https://wa.me/5565996055823?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20o%20sistema%20Zap%20Delivery."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setUserMenuOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200',
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>Ajuda</span>
                </a>

                {/* Divisor */}
                <div className={clsx(
                  'my-2 border-t',
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                )} />

                {/* Botão de Sair */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={clsx(
                    'flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors duration-200',
                    'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
                    isSigningOut && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
