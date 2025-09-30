import React, { useState, useEffect } from 'react';
import { HistoryRecord } from '../types/history';
import { HistoryStorageUtil } from '../utils/historyStorage';
import Card from './Card';
import Button from './Button';
import Alert from './Alert';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (record: HistoryRecord) => void;
}

/**
 * 历史记录面板组件
 * @param isOpen - 是否打开面板
 * @param onClose - 关闭面板回调
 * @param onSelectRecord - 选择记录回调
 */
const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  onSelectRecord
}) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 加载历史记录
  useEffect(() => {
    if (isOpen) {
      const records = HistoryStorageUtil.getHistory();
      setHistory(records);
    }
  }, [isOpen]);

  /**
   * 清空历史记录
   */
  const handleClearHistory = () => {
    HistoryStorageUtil.clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  /**
   * 删除单条记录
   */
  const handleDeleteRecord = (id: string) => {
    HistoryStorageUtil.deleteRecord(id);
    const updatedHistory = history.filter(record => record.id !== id);
    setHistory(updatedHistory);
  };

  /**
   * 选择记录并关闭面板
   */
  const handleSelectRecord = (record: HistoryRecord) => {
    onSelectRecord(record);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            历史记录 ({history.length})
          </h2>
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                清空记录
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              关闭
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {showClearConfirm && (
            <Alert
              type="warning"
              className="mb-4"
              onClose={() => setShowClearConfirm(false)}
            >
              <div className="flex items-center justify-between">
                <span>确定要清空所有历史记录吗？此操作不可撤销。</span>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleClearHistory}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    确定清空
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">暂无历史记录</p>
              <p className="text-gray-400 text-sm mt-2">执行工作流后，结果会自动保存到这里</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => handleSelectRecord(record)}>
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${record.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-500">
                          {HistoryStorageUtil.formatTimestamp(record.timestamp)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">输入:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded break-all">
                          {record.input}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {record.success ? '结果:' : '错误:'}
                        </p>
                        <p className={`text-sm p-2 rounded break-all ${
                          record.success 
                            ? 'text-gray-600 bg-green-50' 
                            : 'text-red-600 bg-red-50'
                        }`}>
                          {record.success ? record.result : record.error}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                      className="ml-4 text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;