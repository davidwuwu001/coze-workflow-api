// 导入React核心库和useState钩子，用于管理组件状态
import React, { useState } from 'react';
// 导入Coze官方SDK，用于调用工作流API
import { CozeAPI, WorkflowEventType } from '@coze/api';
// 导入自定义UI组件
import Card from './components/Card';
import Button from './components/Button';
import Input from './components/Input';
import Alert from './components/Alert';
import CollapsibleSection from './components/CollapsibleSection';
import { ResultSkeleton } from './components/SkeletonLoader';
import HistoryPanel from './components/HistoryPanel';
// 导入类型定义和工具函数
import { HistoryRecord } from './types/history';
import { HistoryStorageUtil } from './utils/historyStorage';

/**
 * 通用工作流测试页面 - 测试Coze工作流API调用
 * 功能：支持自定义工作流ID和输入参数，调用工作流并显示结果
 */
const WorkflowTest: React.FC = () => {
  // 输入URL状态，默认为抖音链接示例
  const [inputUrl, setInputUrl] = useState('https://v.douyin.com/ipT9jS1Z7nc/');
  // 参数名称状态，用于指定传递给工作流的参数名
  const [parameterName, setParameterName] = useState('key_word');
  // 参数格式状态，支持不同的参数传递格式
  const [parameterFormat, setParameterFormat] = useState('simple');
  // API端点状态，支持不同的Coze API地址
  const [apiEndpoint, setApiEndpoint] = useState('https://api.coze.cn/v1/workflow/run');
  // 认证Token状态，用于API身份验证
  const [authToken, setAuthToken] = useState('sat_2Tbrpr7NNNHzijmBA0u2WFIwURfdnJX3XSYOUyH6tIErlnA7DNSP32Dp6k5tCidP');
  // 工作流ID状态，从本地存储读取上次使用的ID
  const [workflowId, setWorkflowId] = useState(() => {
    // 从localStorage读取上次保存的workflowId，如果没有则使用默认值
    return localStorage.getItem('lastWorkflowId') || '7549776785002283060';
  });
  // 加载状态，控制按钮和输入框的禁用状态
  const [isLoading, setIsLoading] = useState(false);
  // 执行结果状态，存储API返回的结果
  const [result, setResult] = useState<string>('');
  // 错误信息状态，存储执行过程中的错误
  const [error, setError] = useState<string>('');
  // 调试信息状态，存储详细的执行日志
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  // 历史记录面板显示状态
  const [showHistory, setShowHistory] = useState(false);
  // 复制操作反馈信息状态
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  /**
   * 复制链接到剪贴板
   * @param link 要复制的链接地址
   */
  const handleCopyLink = async (link: string) => {
    try {
      // 使用浏览器剪贴板API复制文本
      await navigator.clipboard.writeText(link);
      // 设置成功提示信息
      setCopyFeedback('链接已复制到剪贴板！');
      // 3秒后自动清除提示信息
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch (err) {
      // 复制失败时的错误处理
      console.error('复制失败:', err);
      setCopyFeedback('复制失败，请手动复制');
      // 3秒后清除错误提示
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  };

  /**
   * 执行工作流调用 - 使用官方Coze SDK
   * 这是整个应用的核心功能，负责调用Coze工作流API
   */
  const handleExecuteWorkflow = async () => {
    // 验证参数名称是否为空
    if (!parameterName.trim()) {
      setError('请输入有效的参数名称');
      return;
    }

    // 验证输入内容是否为空
    if (!inputUrl.trim()) {
      setError('请输入有效的输入内容');
      return;
    }

    // 验证工作流ID是否为空
    if (!workflowId.trim()) {
      setError('请输入有效的工作流ID');
      return;
    }

    // 保存当前工作流ID到本地存储，下次打开页面时自动填充
    localStorage.setItem('lastWorkflowId', workflowId);

    // 设置加载状态，禁用相关按钮和输入框
    setIsLoading(true);
    // 清空之前的错误信息和结果
    setError('');
    setResult('');
    setDebugInfo([]);

    try {
      // 在控制台输出开始调用的日志
      console.log('开始调用工作流API (使用官方SDK)...');
      // 添加调试信息到界面显示
      setDebugInfo(prev => [...prev, '开始调用工作流API (使用官方SDK)...']);
      
      // 创建Coze API客户端实例
      const apiClient = new CozeAPI({
        token: authToken, // 使用用户输入的认证token
        baseURL: 'https://api.coze.cn' // 设置API基础URL
      });

      // 构建传递给工作流的参数对象
      const parameters: Record<string, any> = {
        [parameterName]: inputUrl // 使用动态参数名和用户输入的值
      };

      // 输出详细的请求信息到控制台，便于调试
      console.log('=== SDK请求详情 ===');
      console.log('Base URL:', 'https://api.coze.cn');
      console.log('Token:', `${authToken.substring(0, 20)}...`); // 只显示token前20位，保护隐私
      console.log('工作流ID:', workflowId);
      console.log('参数:', parameters);
      console.log('==================');

      // 将请求详情添加到界面的调试信息中
      setDebugInfo(prev => [...prev, 
        `Base URL: https://api.coze.cn`,
        `Token: ${authToken.substring(0, 20)}...`, // 隐藏完整token
        `工作流ID: ${workflowId}`,
        `参数名称: ${parameterName}`,
        `参数值: ${inputUrl}`,
        `参数: ${JSON.stringify(parameters, null, 2)}` // 格式化显示参数对象
      ]);

      // 使用SDK调用工作流，采用流式响应方式
      const response = await apiClient.workflows.runs.stream({
        workflow_id: workflowId, // 工作流ID
        parameters: parameters // 传递的参数
      });

      // 输出SDK响应信息
      console.log('SDK响应:', response);
      setDebugInfo(prev => [...prev, `SDK响应类型: ${typeof response}`]);

      // 处理流式响应数据
      let resultContent = ''; // 存储最终结果内容
      let hasContent = false; // 标记是否收到了有效内容

      // 遍历流式响应的每个数据块
      for await (const chunk of response) {
        console.log('收到数据块:', chunk);
        // 将收到的数据块信息添加到调试信息中
        setDebugInfo(prev => [...prev, `收到数据块: ${JSON.stringify(chunk, null, 2)}`]);
        
        // 检查数据块的事件类型
        if (chunk.event === WorkflowEventType.DONE) {
          // 工作流执行完成
          if (chunk.data) {
            // 处理返回的数据，如果是对象则转换为JSON字符串
            resultContent = typeof chunk.data === 'string' ? chunk.data : JSON.stringify(chunk.data, null, 2);
            hasContent = true; // 标记已收到内容
          }
          setDebugInfo(prev => [...prev, '工作流执行完成']);
          break; // 跳出循环
        } else if (chunk.event === WorkflowEventType.ERROR) {
          // 工作流执行失败
          const errorData = chunk.data as any;
          // 提取错误信息，如果没有则使用默认错误信息
          const errorMsg = errorData?.error_message || '工作流执行失败';
          throw new Error(errorMsg); // 抛出错误，进入catch块处理
        } else if (chunk.data) {
          // 处理其他类型的数据块
          const chunkData = typeof chunk.data === 'string' ? chunk.data : JSON.stringify(chunk.data, null, 2);
          resultContent += chunkData + '\n'; // 累加数据内容
          hasContent = true;
        }
      }

      // 如果没有收到任何内容，设置默认提示信息
      if (!hasContent) {
        resultContent = '工作流执行完成，但未返回具体结果';
      }

      // 输出最终结果到控制台
      console.log('最终结果:', resultContent);
      // 设置结果到状态中，在界面显示
      setResult(resultContent);
      setDebugInfo(prev => [...prev, '工作流执行成功，已获取结果']);
      
      // 保存成功的执行记录到历史记录中
      HistoryStorageUtil.saveRecord({
        input: inputUrl, // 输入内容
        result: resultContent, // 执行结果
        success: true // 标记为成功
      });

    } catch (err: any) {
      // 捕获并处理执行过程中的错误
      console.error('工作流执行失败:', err);
      // 提取错误信息，如果没有则使用默认信息
      const errorMessage = err.message || '未知错误';
      // 设置错误信息到状态中
      setError(`执行失败: ${errorMessage}`);
      setDebugInfo(prev => [...prev, `执行失败: ${errorMessage}`]);
      
      // 保存失败的执行记录到历史记录中
      HistoryStorageUtil.saveRecord({
        input: inputUrl, // 输入内容
        result: '', // 结果为空
        success: false, // 标记为失败
        error: errorMessage // 错误信息
      });
    } finally {
      // 无论成功还是失败，都要取消加载状态
      setIsLoading(false);
    }
  };

  /**
   * 清空结果和错误信息
   * 重置界面显示状态
   */
  const handleClear = () => {
    setResult(''); // 清空结果
    setError(''); // 清空错误信息
    setDebugInfo([]); // 清空调试信息
  };

  /**
   * 复制执行结果到剪贴板
   * 方便用户保存或分享结果
   */
  const handleCopyResult = async () => {
    try {
      // 使用剪贴板API复制结果文本
      await navigator.clipboard.writeText(result);
      // 这里可以添加一个成功提示（当前未实现）
    } catch (err) {
      // 复制失败时输出错误日志
      console.error('复制失败:', err);
    }
  };

  /**
   * 处理历史记录选择
   * 当用户从历史记录中选择一条记录时调用
   * @param record 选中的历史记录
   */
  const handleHistorySelect = (record: HistoryRecord) => {
    setInputUrl(record.input); // 恢复输入内容
    setResult(record.result); // 恢复执行结果
    setError(record.error || ''); // 恢复错误信息（如果有）
    setDebugInfo([]); // 清空调试信息
    setShowHistory(false); // 关闭历史记录面板
  };

  /**
   * 切换历史记录面板显示状态
   * 控制历史记录面板的显示和隐藏
   */
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  /**
   * 处理文本中的链接，将链接转换为可点击的按钮
   * 用于在结果中显示可点击的链接
   * @param text 包含链接的文本
   * @returns 处理后的JSX元素数组
   */
  const processLinksInText = (text: string) => {
    // 正则表达式匹配HTTP/HTTPS链接
    const urlRegex = /(https?:\/\/[^\s`"']+)/g;
    // 按链接分割文本
    const parts = text.split(urlRegex);
    
    // 遍历分割后的文本片段
    return parts.map((part, index) => {
      // 创建新的正则表达式实例来测试每个部分是否为链接
      const testRegex = /^https?:\/\/[^\s`"']+$/;
      if (testRegex.test(part)) {
        // 如果是链接，创建可点击的按钮
        return (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault(); // 阻止默认行为
              handleCopyLink(part); // 点击时复制链接
            }}
            className="text-blue-600 hover:text-blue-800 underline break-all cursor-pointer bg-transparent border-none p-0 font-inherit text-left"
            title="点击复制链接"
          >
            {part}
          </button>
        );
      }
      // 如果不是链接，直接返回文本
      return <span key={index}>{part}</span>;
    });
  };

  /**
   * 格式化并渲染结果内容
   * 智能处理JSON格式和普通文本，支持链接点击
   * @returns 格式化后的结果JSX元素
   */
  const renderResult = () => {
    // 如果没有结果，返回null
    if (!result) return null;

    try {
      // 尝试将结果解析为JSON对象
      const parsed = JSON.parse(result);
      // 格式化JSON字符串，缩进2个空格
      const formattedJson = JSON.stringify(parsed, null, 2);
      
      // 检查JSON字符串中是否包含链接
      const urlRegex = /(https?:\/\/[^\s`"']+)/g;
      if (urlRegex.test(formattedJson)) {
        // 如果包含链接，处理链接并显示
        return (
          <div className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
            {processLinksInText(formattedJson)}
          </div>
        );
      } else {
        // 如果不包含链接，正常显示JSON
        return (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
            {formattedJson}
          </pre>
        );
      }
    } catch {
      // 如果不是有效的JSON，按普通文本处理
      return (
        <div className="text-sm text-gray-800 leading-relaxed">
          {processLinksInText(result)}
        </div>
      );
    }
  };

  // 渲染主界面
  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题区域 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Coze工作流测试平台
          </h1>
          <p className="text-white/90 text-lg">
            通用工作流API调用测试工具
          </p>
        </div>

        {/* 输入区域卡片 */}
        <Card className="mb-6 animate-fade-in glass-effect" hover>
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
            {/* 文档图标 */}
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            输入测试数据
          </h2>
          
          <div className="space-y-6">
            {/* 工作流ID输入框 */}
            <Input
              label="工作流ID"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              placeholder="请输入工作流ID"
              disabled={isLoading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }
            />
            
            {/* 认证Token输入框 */}
            <Input
              label="认证Token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="请输入Coze API Token (以sat_开头)"
              disabled={isLoading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                </svg>
              }
            />
            
            {/* 参数名称输入框 */}
            <Input
              label="参数名称"
              value={parameterName}
              onChange={(e) => setParameterName(e.target.value)}
              placeholder="请输入参数名称 (如: key_word, input, keyword等)"
              disabled={isLoading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
            
            {/* 参数格式选择器 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                参数格式
              </label>
              <select
                value={parameterFormat}
                onChange={(e) => setParameterFormat(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="simple">简单格式 (推荐)</option>
                <option value="nested">嵌套对象格式</option>
                <option value="array">数组格式</option>
                <option value="coze_format">Coze官方格式</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                选择不同的参数格式来测试API兼容性
              </p>
            </div>
            
            {/* API端点选择器 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                API端点
              </label>
              <select
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="https://api.coze.cn/v1/workflow/run">Coze CN - 工作流运行</option>
                <option value="https://api.coze.com/v1/workflow/run">Coze COM - 工作流运行</option>
                <option value="https://api.coze.cn/v1/workflows/run">Coze CN - 工作流运行 (复数)</option>
                <option value="https://api.coze.com/v1/workflows/run">Coze COM - 工作流运行 (复数)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                选择不同的API端点来测试连接性
              </p>
            </div>
            
            {/* 输入参数输入框 */}
            <Input
              label="输入参数"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="请输入测试数据"
              disabled={isLoading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            {/* 操作按钮组 */}
            <div className="flex space-x-4">
              {/* 执行工作流按钮 */}
              <Button
                onClick={handleExecuteWorkflow}
                disabled={isLoading || !inputUrl.trim() || !parameterName.trim() || !workflowId.trim()}
                loading={isLoading}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                {isLoading ? '执行中...' : '执行工作流'}
              </Button>
              
              {/* 历史记录按钮 */}
              <Button
                onClick={toggleHistory}
                variant="outline"
                size="lg"
                className="px-6"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                历史记录
              </Button>
              
              {/* 清空按钮 */}
              <Button
                onClick={handleClear}
                variant="secondary"
                size="lg"
                className="px-6"
              >
                清空
              </Button>
            </div>
          </div>
        </Card>

        {/* 加载状态显示 */}
        {isLoading && (
          <Card className="mb-6 animate-fade-in">
            <ResultSkeleton />
          </Card>
        )}

        {/* 执行状态日志 - 可折叠区域 */}
        {debugInfo.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <CollapsibleSection
              title="执行状态"
              badge={debugInfo.length} // 显示日志条数
              defaultOpen={false} // 默认折叠
            >
              <div className="max-h-64 overflow-y-auto space-y-2">
                {/* 遍历显示每条调试信息 */}
                {debugInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    {/* 步骤编号 */}
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {/* 调试信息内容 */}
                    <span className="text-gray-700 font-mono">{info}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* 复制反馈提示 */}
        {copyFeedback && (
          <div className="mb-6 animate-fade-in">
            <Alert type="success" onClose={() => setCopyFeedback('')}>
              <div>
                <h4 className="font-medium">复制成功</h4>
                <p className="mt-1">{copyFeedback}</p>
              </div>
            </Alert>
          </div>
        )}

        {/* 错误信息显示 */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <Alert type="error" onClose={() => setError('')}>
              <div>
                <h4 className="font-medium">执行失败</h4>
                <p className="mt-1">{error}</p>
              </div>
            </Alert>
          </div>
        )}

        {/* 结果显示区域 */}
        {result && (
          <Card className="mb-6 animate-fade-in" hover>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                {/* 成功图标 */}
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                执行结果
              </h2>
              {/* 复制结果按钮 */}
              <Button
                onClick={handleCopyResult}
                variant="success"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制结果
              </Button>
            </div>
            
            {/* 结果内容显示区域 */}
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
              {renderResult()}
            </div>
          </Card>
        )}

        {/* 历史记录面板 */}
        {showHistory && (
          <HistoryPanel
            isOpen={showHistory}
            onSelectRecord={handleHistorySelect}
            onClose={() => setShowHistory(false)}
          />
        )}

      </div>
    </div>
  );
};

// 导出组件供其他文件使用
export default WorkflowTest;