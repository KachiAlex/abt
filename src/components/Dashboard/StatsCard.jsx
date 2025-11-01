import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue'
}) {
  const isPositiveTrend = trend === 'up';
  
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
  };

  const accentBorders = {
    blue: 'border-l-4 border-blue-500',
    green: 'border-l-4 border-green-500',
    yellow: 'border-l-4 border-yellow-500',
    red: 'border-l-4 border-red-500',
    purple: 'border-l-4 border-purple-500',
  };

  return (
    <div className={clsx('card relative overflow-hidden group', accentBorders[color])}>
      {/* Gradient background effect */}
      <div className={clsx('absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 blur-3xl', 
        color === 'blue' ? 'bg-blue-500' :
        color === 'green' ? 'bg-green-500' :
        color === 'yellow' ? 'bg-yellow-500' :
        color === 'red' ? 'bg-red-500' :
        'bg-purple-500'
      )}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
          <div className="flex items-baseline mt-3">
            <p className="text-4xl font-extrabold text-gray-900">{value}</p>
            {trendValue && (
              <div className={clsx(
                'ml-3 flex items-center text-sm font-semibold px-2 py-1 rounded-lg',
                isPositiveTrend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {isPositiveTrend ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {trendValue}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3 font-medium">{subtitle}</p>
        </div>
        
        <div className={clsx('p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300', colorClasses[color])}>
          <Icon className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
