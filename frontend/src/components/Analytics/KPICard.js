import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../ui/Card';

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  progress = null,
  trend = null,
  loading = false 
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Color configurations
  const colorConfig = {
    blue: {
      border: 'border-l-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    green: {
      border: 'border-l-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    orange: {
      border: 'border-l-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  // Animate value on mount
  useEffect(() => {
    if (isVisible && !loading) {
      const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.]/g, '')) : value;
      if (!isNaN(numericValue)) {
        const duration = 1000; // 1 second
        const steps = 60;
        const stepValue = numericValue / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          setAnimatedValue(Math.min(stepValue * currentStep, numericValue));
          
          if (currentStep >= steps) {
            clearInterval(timer);
            setAnimatedValue(numericValue);
          }
        }, stepDuration);

        return () => clearInterval(timer);
      }
    }
  }, [isVisible, value, loading]);

  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const cardElement = document.getElementById(`kpi-card-${title}`);
    if (cardElement) {
      observer.observe(cardElement);
    }

    return () => {
      if (cardElement) {
        observer.unobserve(cardElement);
      }
    };
  }, [title]);

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatValue = (val) => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${Math.round(val)}%`;
    }
    if (typeof value === 'string' && value.includes(',')) {
      return Math.round(val).toLocaleString();
    }
    return Math.round(val);
  };

  return (
    <Card 
      id={`kpi-card-${title}`}
      className={`
        relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105
        ${config.border} border-l-4
      `}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon className={`w-6 h-6 ${config.text}`} />
          </div>
          {trend !== null && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="text-sm font-medium text-gray-600">
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {isVisible ? formatValue(animatedValue) : '0'}
                {typeof value === 'string' && value.includes('%') ? '%' : ''}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-1000 ease-out`}
                style={{ 
                  width: loading ? '0%' : `${Math.min(progress, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <div className={`w-full h-full bg-gradient-to-br ${config.gradient} rounded-full transform translate-x-8 -translate-y-8`} />
      </div>
    </Card>
  );
};

export default KPICard;
