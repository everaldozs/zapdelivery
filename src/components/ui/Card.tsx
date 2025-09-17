import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className, padding = 'md' }) => {
  const { theme } = useTheme();
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={clsx(
      'rounded-xl shadow-sm border transition-colors duration-200',
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

export default Card;
