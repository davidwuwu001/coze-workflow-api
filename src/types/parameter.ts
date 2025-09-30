/**
 * 动态参数类型定义
 */

// 单个参数的接口定义
export interface Parameter {
  id: string;          // 参数的唯一标识符
  name: string;        // 参数名称
  value: string;       // 参数值
  type: ParameterType; // 参数类型
}

// 参数类型枚举
export enum ParameterType {
  STRING = 'string',   // 字符串类型
  NUMBER = 'number',   // 数字类型
  BOOLEAN = 'boolean', // 布尔类型
  OBJECT = 'object',   // 对象类型
  ARRAY = 'array'      // 数组类型
}

// 参数验证结果接口
export interface ParameterValidation {
  isValid: boolean;    // 是否有效
  error?: string;      // 错误信息
}

// 参数操作类型
export type ParameterAction = 'add' | 'update' | 'delete';