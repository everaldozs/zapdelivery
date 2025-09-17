import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { TruckIcon } from '@heroicons/react/24/solid';
import { menuItems, bottomMenuItem } from '../../data/menuData';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>('dashboard');
  const location = useLocation();
  const { theme } = useTheme();
  const { profile } = useAuth();

  // Função para verificar se um item do menu deve ser exibido
  const shouldShowMenuItem = (menuId: string) => {
    // Dashboard Administrativa - apenas admin_geral pode ver
    if (menuId === 'admin-dashboard') {
      return profile?.role_name === 'Administrator';
    }
    
    // Menu "Empresas" - apenas admin_geral pode ver
    if (menuId === 'empresas') {
      return profile?.role_name === 'Administrator';
    }
    
    // Menu "Usuários" - apenas admin_geral pode ver
    if (menuId === 'usuarios') {
      return profile?.role_name === 'Administrator';
    }
    
    // Todos os outros menus são visíveis para todos os usuários autenticados
    return true;
  };

  // Função para verificar se um submenu deve ser exibido
  const shouldShowSubmenuItem = (menuId: string, submenuId: string) => {
    // Para o menu usuários, "tipos-usuarios" só para admin_geral
    if (menuId === 'usuarios' && submenuId === 'tipos-usuarios') {
      return profile?.role_name === 'Administrator';
    }
    
    // Outros submenus seguem a regra do menu pai
    return true;
  };

  // Função para filtrar submenu baseado nas regras de permissão
  const filterSubmenu = (menuId: string, submenu: any[]) => {
    return submenu.filter(subItem => shouldShowSubmenuItem(menuId, subItem.id));
  };

  const toggleMenu = (menuId: string) => {
    if (expandedMenu === menuId) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuId);
    }
  };

  const isActive = (path?: string, submenu?: any[]) => {
    if (path) {
      return location.pathname === path;
    }
    if (submenu) {
      return submenu.some(item => location.pathname === item.path);
    }
    return false;
  };

  const isSubmenuItemActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={clsx(
      'h-screen bg-gray-800 text-white transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64',
      theme === 'dark' && 'bg-gray-900'
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <TruckIcon className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-green-400">Zap Delivery</h1>
              <p className="text-xs text-gray-400">Painel Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems
            .filter(item => shouldShowMenuItem(item.id))
            .map((item) => (
            <li key={item.id}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={clsx(
                      'w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left',
                      isActive(item.path, item.submenu)
                        ? 'bg-green-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={clsx('flex-shrink-0', isCollapsed ? 'h-6 w-6' : 'h-5 w-5')} />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      expandedMenu === item.id ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {!isCollapsed && expandedMenu === item.id && (
                    <ul className="mt-2 space-y-1 ml-4">
                      {filterSubmenu(item.id, item.submenu).map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.path}
                            className={clsx(
                              'block p-2 pl-8 rounded-lg transition-all duration-200 text-sm',
                              isSubmenuItemActive(subItem.path)
                                ? 'bg-green-500 text-white'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            )}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path || '#'}
                  className={clsx(
                    'flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
                    isActive(item.path)
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <item.icon className={clsx('flex-shrink-0', isCollapsed ? 'h-6 w-6' : 'h-5 w-5')} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu (Sair) */}
      <div className="border-t border-gray-700 p-3">
        <Link
          to={bottomMenuItem.path || '#'}
          className={clsx(
            'flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300',
            isCollapsed && 'justify-center'
          )}
        >
          <bottomMenuItem.icon className={clsx('flex-shrink-0', isCollapsed ? 'h-6 w-6' : 'h-5 w-5')} />
          {!isCollapsed && (
            <span className="font-medium">{bottomMenuItem.title}</span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
