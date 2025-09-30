import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: string | number;
  titleClassName?: string;
  contentClassName?: string;
}

/**
 * 可折叠区域组件
 * @param title - 标题
 * @param children - 内容
 * @param defaultOpen - 默认是否展开
 * @param className - 额外的CSS类名
 * @param badge - 徽章内容
 * @param titleClassName - 标题区域额外的CSS类名
 * @param contentClassName - 内容区域额外的CSS类名
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  badge,
  titleClassName = '',
  contentClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${titleClassName}`}
        aria-expanded={isOpen}
        aria-controls="collapsible-content"
      >
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{title}</span>
          {badge && (
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
        <div className={`transform transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div 
        id="collapsible-content"
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        <div className={`p-3 sm:p-4 bg-white border-t border-gray-100 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;