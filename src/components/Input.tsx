import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * 现代化的输入框组件
 * @param value - 输入值
 * @param onChange - 值变化处理函数
 * @param placeholder - 占位符文本
 * @param disabled - 是否禁用
 * @param className - 额外的CSS类名
 * @param label - 标签文本
 * @param error - 错误信息
 * @param icon - 图标
 */
const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  label,
  error,
  icon,
  onKeyDown
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''} 
            border border-gray-200 rounded-lg 
            bg-white text-gray-900 placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            hover:border-gray-300
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md focus:shadow-lg
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;