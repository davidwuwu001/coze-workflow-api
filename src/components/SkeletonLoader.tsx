import React from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
  height?: string;
  width?: string;
}

/**
 * 骨架屏加载组件
 * @param lines - 行数
 * @param className - 额外的CSS类名
 * @param height - 高度
 * @param width - 宽度
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  className = '',
  height = 'h-4',
  width = 'w-full'
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} ${
            index === lines - 1 ? 'w-3/4' : width
          } ${index > 0 ? 'mt-3' : ''}`}
        />
      ))}
    </div>
  );
};

/**
 * 结果区域骨架屏组件
 */
export const ResultSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="border-t pt-4">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;