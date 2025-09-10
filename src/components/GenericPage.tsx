import React from 'react';
import Card from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';

interface GenericPageProps {
  title: string;
  description: string;
  content?: string;
}

const GenericPage: React.FC<GenericPageProps> = ({ title, description, content }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={clsx(
          'text-3xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {title}
        </h1>
        <p className={clsx(
          'text-sm mt-1',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          {description}
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className={clsx(
            'text-6xl mb-4',
            theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
          )}>
            🚧
          </div>
          <h3 className={clsx(
            'text-xl font-semibold mb-2',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Página em Desenvolvimento
          </h3>
          <p className={clsx(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {content || 'Esta funcionalidade estará disponível em breve.'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default GenericPage;
