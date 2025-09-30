/**
 * 历史记录相关的类型定义
 */

export interface HistoryRecord {
  id: string;
  input: string;
  result: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface HistoryStorage {
  records: HistoryRecord[];
}