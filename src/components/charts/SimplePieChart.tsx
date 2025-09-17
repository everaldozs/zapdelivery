import React, { useState } from 'react';
import { clsx } from 'clsx';

interface SimplePieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  theme: 'light' | 'dark';
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, theme }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <span className={clsx(
          'text-sm',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          Nenhum dado disponível
        </span>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calcular ângulos para cada segmento
  let currentAngle = 0;
  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage: Math.round((item.value / total) * 100)
    };
    currentAngle += angle;
    return segment;
  });

  // Criar path SVG para cada segmento
  const createPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const centerX = 125;
    const centerY = 125;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', x1, y1, 
      'A', outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
      'L', x3, y3,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
      'Z'
    ].join(' ');
  };

  return (
    <div className="h-[250px] flex items-center justify-center">
      <div className="flex items-center space-x-8">
        {/* Gráfico de Pizza */}
        <div className="relative">
          <svg width="250" height="250" viewBox="0 0 250 250">
            {segments.map((segment, index) => {
              const isHovered = hoveredIndex === index;
              const outerRadius = isHovered ? 105 : 100;
              const innerRadius = 60;
              
              return (
                <g key={index}>
                  <path
                    d={createPath(segment.startAngle, segment.endAngle, innerRadius, outerRadius)}
                    fill={segment.color}
                    stroke={theme === 'dark' ? '#374151' : '#ffffff'}
                    strokeWidth="2"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  
                  {/* Texto de percentual no segmento */}
                  {segment.percentage > 8 && (
                    <text
                      x={125 + (outerRadius - 20) * Math.cos(((segment.startAngle + segment.endAngle) / 2 * Math.PI) / 180)}
                      y={125 + (outerRadius - 20) * Math.sin(((segment.startAngle + segment.endAngle) / 2 * Math.PI) / 180)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={clsx(
                        'text-xs font-medium fill-current pointer-events-none',
                        theme === 'dark' ? 'text-white' : 'text-white'
                      )}
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {segment.percentage}%
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Texto central */}
            <text
              x="125"
              y="120"
              textAnchor="middle"
              className={clsx(
                'text-lg font-bold',
                theme === 'dark' ? 'fill-white' : 'fill-gray-900'
              )}
            >
              Total
            </text>
            <text
              x="125"
              y="135"
              textAnchor="middle"
              className={clsx(
                'text-sm',
                theme === 'dark' ? 'fill-gray-300' : 'fill-gray-600'
              )}
            >
              {total}
            </text>
          </svg>
          
          {/* Tooltip */}
          {hoveredIndex !== null && (
            <div className={clsx(
              'absolute top-2 right-2 p-2 rounded-lg shadow-lg border z-10',
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            )}>
              <div className="text-sm font-medium">{segments[hoveredIndex].name}</div>
              <div className="text-xs">
                {segments[hoveredIndex].value} ({segments[hoveredIndex].percentage}%)
              </div>
            </div>
          )}
        </div>
        
        {/* Legenda */}
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <div 
              key={index} 
              className={clsx(
                'flex items-center space-x-3 cursor-pointer transition-all duration-200',
                hoveredIndex === index ? 'scale-105' : ''
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <div className={clsx(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {segment.name}
                </div>
                <div className={clsx(
                  'text-xs',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {segment.value} ({segment.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimplePieChart;