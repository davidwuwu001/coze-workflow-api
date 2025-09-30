import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 现代化的加载动画组件
 * @param size - 尺寸大小
 * @param className - 额外的CSS类名
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]`}>
        <span className="sr-only">加载中...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;