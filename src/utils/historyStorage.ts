import { HistoryRecord, HistoryStorage } from '../types/history';

const STORAGE_KEY = 'coze-workflow-history';

/**
 * 历史记录存储工具类
 */
export class HistoryStorageUtil {
  /**
   * 获取所有历史记录
   */
  static getHistory(): HistoryRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const data: HistoryStorage = JSON.parse(stored);
      return data.records || [];
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  /**
   * 保存新的历史记录
   */
  static saveRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): void {
    try {
      const history = this.getHistory();
      const newRecord: HistoryRecord = {
        ...record,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      
      // 将新记录添加到开头
      history.unshift(newRecord);
      
      // 限制历史记录数量（最多保存100条）
      const limitedHistory = history.slice(0, 100);
      
      const data: HistoryStorage = {
        records: limitedHistory
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  /**
   * 清空所有历史记录
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  }

  /**
   * 删除指定的历史记录
   */
  static deleteRecord(id: string): void {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(record => record.id !== id);
      
      const data: HistoryStorage = {
        records: filteredHistory
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('删除历史记录失败:', error);
    }
  }

  /**
   * 格式化时间戳为可读格式
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}