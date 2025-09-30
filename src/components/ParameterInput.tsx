import React from 'react';
import { Parameter, ParameterType } from '../types/parameter';
import Button from './Button';
import Input from './Input';

/**
 * 动态参数输入组件的属性接口
 */
interface ParameterInputProps {
  parameters: Parameter[];                                    // 参数列表
  onParametersChange: (parameters: Parameter[]) => void;     // 参数变化回调
  disabled?: boolean;                                         // 是否禁用
}

/**
 * 动态参数输入组件
 * 支持添加、编辑、删除多个参数
 */
const ParameterInput: React.FC<ParameterInputProps> = ({
  parameters,
  onParametersChange,
  disabled = false
}) => {
  
  /**
   * 添加新参数
   */
  const handleAddParameter = () => {
    const newParameter: Parameter = {
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      name: '',
      value: '',
      type: ParameterType.STRING
    };
    onParametersChange([...parameters, newParameter]);
  };

  /**
   * 删除参数
   * @param id 参数ID
   */
  const handleDeleteParameter = (id: string) => {
    const updatedParameters = parameters.filter(param => param.id !== id);
    onParametersChange(updatedParameters);
  };

  /**
   * 更新参数名称
   * @param id 参数ID
   * @param name 新的参数名称
   */
  const handleParameterNameChange = (id: string, name: string) => {
    const updatedParameters = parameters.map(param =>
      param.id === id ? { ...param, name } : param
    );
    onParametersChange(updatedParameters);
  };

  /**
   * 更新参数值
   * @param id 参数ID
   * @param value 新的参数值
   */
  const handleParameterValueChange = (id: string, value: string) => {
    const updatedParameters = parameters.map(param =>
      param.id === id ? { ...param, value } : param
    );
    onParametersChange(updatedParameters);
  };

  /**
   * 更新参数类型
   * @param id 参数ID
   * @param type 新的参数类型
   */
  const handleParameterTypeChange = (id: string, type: ParameterType) => {
    const updatedParameters = parameters.map(param =>
      param.id === id ? { ...param, type } : param
    );
    onParametersChange(updatedParameters);
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 添加参数按钮 */}
      <div className="flex justify-between items-center">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          参数配置
        </h3>
        <Button
          onClick={handleAddParameter}
          disabled={disabled}
          variant="primary"
          size="sm"
          className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
        >
          添加参数
        </Button>
      </div>

      {/* 参数列表 */}
      {parameters.length > 0 && (
        <div className="space-y-2 md:space-y-3">
          {parameters.map((parameter) => (
            <div
              key={parameter.id}
              className="border border-gray-200 rounded-lg bg-white p-3 shadow-sm"
            >
              {/* 第一行：参数名称、类型选择、删除按钮 */}
              <div className="flex items-center gap-2 mb-3">
                {/* 参数名称输入 */}
                <div className="flex-1">
                  <Input
                    value={parameter.name}
                    onChange={(e) => handleParameterNameChange(parameter.id, e.target.value)}
                    placeholder="请输入参数名"
                    disabled={disabled}
                    className="w-full text-sm h-9"
                  />
                </div>

                {/* 参数类型选择 */}
                <div className="w-20">
                  <select
                    value={parameter.type}
                    onChange={(e) => handleParameterTypeChange(parameter.id, e.target.value as ParameterType)}
                    disabled={disabled}
                    className="w-full px-2 py-1.5 text-xs h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value={ParameterType.STRING}>字符串</option>
                    <option value={ParameterType.NUMBER}>数字</option>
                    <option value={ParameterType.BOOLEAN}>布尔值</option>
                    <option value={ParameterType.ARRAY}>数组</option>
                    <option value={ParameterType.OBJECT}>对象</option>
                  </select>
                </div>

                {/* 删除按钮 */}
                <Button
                  onClick={() => handleDeleteParameter(parameter.id)}
                  disabled={disabled}
                  variant="danger"
                  size="sm"
                  className="text-xs px-2 py-1 h-9 w-12 flex-shrink-0"
                >
                  删除
                </Button>
              </div>

              {/* 第二行：参数值输入 */}
              <div>
                <Input
                  value={parameter.value}
                  onChange={(e) => handleParameterValueChange(parameter.id, e.target.value)}
                  placeholder="请输入参数值"
                  disabled={disabled}
                  className="w-full text-sm h-9"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态提示 */}
      {parameters.length === 0 && (
        <div className="text-center py-6 md:py-8 text-gray-500">
          <div className="text-sm md:text-base">
            暂无参数，点击"添加参数"开始配置
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterInput;