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
      
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{title}</p>
          <div className={clsx('p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-baseline flex-wrap gap-2 mb-2">
            <p className="text-5xl font-extrabold text-gray-900 leading-none">{value}</p>
            {trendValue && (
              <div className={clsx(
                'flex items-center text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap',
                isPositiveTrend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {isPositiveTrend ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                {trendValue}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium mt-2">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
