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
import { Parameter, ParameterType } from './types/parameter';
import ParameterInput from './components/ParameterInput';

/**
 * 通用工作流测试页面 - 测试Coze工作流API调用
 * 功能：支持自定义工作流ID和输入参数，调用工作流并显示结果
 */
const WorkflowTest: React.FC = () => {
  // 基础配置状态
  // 认证Token状态，用于API身份验证
  const [authToken, setAuthToken] = useState('sat_2Tbrpr7NNNHzijmBA0u2WFIwURfdnJX3XSYOUyH6tIErlnA7DNSP32Dp6k5tCidP');
  // 工作流ID状态，从本地存储读取上次使用的ID
  const [workflowId, setWorkflowId] = useState(() => {
    // 从localStorage读取上次保存的workflowId，如果没有则使用默认值
    return localStorage.getItem('lastWorkflowId') || '7549776785002283060';
  });
  // 动态参数列表状态，支持多个参数的添加和管理
  const [parameters, setParameters] = useState<Parameter[]>(() => {
    // 初始化一个默认参数，保持向后兼容
    return [{
      id: '1',
      name: 'key_word',
      value: 'https://v.douyin.com/ipT9jS1Z7nc/',
      type: ParameterType.STRING
    }];
  });

  // API端点状态，支持不同的Coze API地址
  const [apiEndpoint, setApiEndpoint] = useState('https://api.coze.cn/v1/workflow/run');
  
  // UI状态管理
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
    // 验证参数列表是否为空
    if (parameters.length === 0) {
      setError('请至少添加一个参数');
      return;
    }

    // 验证所有参数是否都有名称和值
    const invalidParams = parameters.filter(param => !param.name.trim() || !param.value.trim());
    if (invalidParams.length > 0) {
      setError('请确保所有参数都有名称和值');
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

      // 构建传递给工作流的参数对象，支持多个参数
      const workflowParameters: Record<string, any> = {};
      parameters.forEach(param => {
        // 根据参数类型转换值
        let convertedValue: any = param.value;
        switch (param.type) {
          case ParameterType.NUMBER:
            convertedValue = Number(param.value);
            break;
          case ParameterType.BOOLEAN:
            convertedValue = param.value.toLowerCase() === 'true';
            break;
          case ParameterType.OBJECT:
            try {
              convertedValue = JSON.parse(param.value);
            } catch {
              convertedValue = param.value; // 如果解析失败，保持字符串
            }
            break;
          case ParameterType.ARRAY:
            try {
              convertedValue = JSON.parse(param.value);
            } catch {
              convertedValue = param.value.split(',').map(v => v.trim()); // 逗号分隔的数组
            }
            break;
          default:
            convertedValue = param.value; // 字符串类型保持不变
        }
        workflowParameters[param.name] = convertedValue;
      });

      // 输出详细的请求信息到控制台，便于调试
      console.log('=== SDK请求详情 ===');
      console.log('Base URL:', 'https://api.coze.cn');
      console.log('Token:', `${authToken.substring(0, 20)}...`); // 只显示token前20位，保护隐私
      console.log('工作流ID:', workflowId);
      console.log('参数:', workflowParameters);
      console.log('==================');

      // 将请求详情添加到界面的调试信息中
      setDebugInfo(prev => [...prev, 
        `Base URL: https://api.coze.cn`,
        `Token: ${authToken.substring(0, 20)}...`, // 隐藏完整token
        `工作流ID: ${workflowId}`,
        `参数数量: ${parameters.length}`,
        ...parameters.map(param => `${param.name}: ${param.value} (${param.type})`),
        `参数: ${JSON.stringify(workflowParameters, null, 2)}` // 格式化显示参数对象
      ]);

      // 使用SDK调用工作流，采用流式响应方式
      const response = await apiClient.workflows.runs.stream({
        workflow_id: workflowId, // 工作流ID
        parameters: workflowParameters // 传递的参数
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
        input: parameters.map(p => `${p.name}: ${p.value}`).join(', '), // 输入内容（多个参数）
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
        input: parameters.map(p => `${p.name}: ${p.value}`).join(', '), // 输入内容（多个参数）
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
    // 尝试解析历史记录中的参数信息
    try {
      // 解析输入字符串，恢复参数列表
      const paramPairs = record.input.split(', ');
      const restoredParameters: Parameter[] = paramPairs.map((pair, index) => {
        const [name, value] = pair.split(': ');
        return {
          id: Date.now().toString() + index,
          name: name || '',
          value: value || '',
          type: ParameterType.STRING
        };
      });
      setParameters(restoredParameters);
    } catch (err) {
      // 如果解析失败，创建一个默认参数
      setParameters([{
        id: Date.now().toString(),
        name: 'input',
        value: record.input,
        type: ParameterType.STRING
      }]);
    }
    
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
    <div className="min-h-screen gradient-bg py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题区域 */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
            Coze工作流测试平台
          </h1>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg px-4">
            通用工作流API调用测试工具
          </p>
        </div>

        {/* 输入区域卡片 */}
        <CollapsibleSection
          title="输入测试数据"
          defaultOpen={true}
          className="mb-4 sm:mb-6 animate-fade-in glass-effect"
          titleClassName="bg-blue-50 hover:bg-blue-100"
          contentClassName="space-y-4 sm:space-y-6"
        >
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
            
            {/* 动态参数输入组件 */}
            <ParameterInput
              parameters={parameters}
              onParametersChange={setParameters}
              disabled={isLoading}
            />
            
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

            {/* 操作按钮组 */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* 执行工作流按钮 */}
              <Button
                onClick={handleExecuteWorkflow}
                disabled={isLoading || parameters.length === 0 || !workflowId.trim()}
                loading={isLoading}
                variant="primary"
                size="lg"
                className="flex-1 w-full sm:w-auto"
              >
                {isLoading ? '执行中...' : '执行工作流'}
              </Button>
              
              {/* 历史记录按钮 */}
              <Button
                onClick={toggleHistory}
                variant="outline"
                size="lg"
                className="px-6 w-full sm:w-auto"
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
                className="px-6 w-full sm:w-auto"
              >
                清空
              </Button>
            </div>
        </CollapsibleSection>

        {/* 加载状态显示 */}
        {isLoading && (
          <Card className="mb-4 sm:mb-6 animate-fade-in">
            <ResultSkeleton />
          </Card>
        )}

        {/* 执行状态日志 - 可折叠区域 */}
        {debugInfo.length > 0 && (
          <div className="mb-4 sm:mb-6 animate-fade-in">
            <CollapsibleSection
              title="执行状态"
              badge={debugInfo.length} // 显示日志条数
              defaultOpen={false} // 默认折叠
            >
              <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
                {/* 遍历显示每条调试信息 */}
                {debugInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-2 sm:space-x-3 text-xs sm:text-sm">
                    {/* 步骤编号 */}
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {/* 调试信息内容 */}
                    <span className="text-gray-700 font-mono break-all">{info}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* 复制反馈提示 */}
        {copyFeedback && (
          <div className="mb-4 sm:mb-6 animate-fade-in">
            <Alert type="success" onClose={() => setCopyFeedback('')}>
              <div>
                <h4 className="font-medium text-sm sm:text-base">复制成功</h4>
                <p className="mt-1 text-xs sm:text-sm break-all">{copyFeedback}</p>
              </div>
            </Alert>
          </div>
        )}

        {/* 错误信息显示 */}
        {error && (
          <div className="mb-4 sm:mb-6 animate-fade-in">
            <Alert type="error" onClose={() => setError('')}>
              <div>
                <h4 className="font-medium text-sm sm:text-base">执行失败</h4>
                <p className="mt-1 text-xs sm:text-sm break-all">{error}</p>
              </div>
            </Alert>
          </div>
        )}

        {/* 结果显示区域 */}
        {result && (
          <CollapsibleSection
            title="执行结果"
            defaultOpen={true}
            className="mb-4 sm:mb-6 animate-fade-in"
            titleClassName="bg-green-50 hover:bg-green-100"
            contentClassName="space-y-4"
          >
            {/* 复制结果按钮 */}
            <div className="flex justify-end">
              <Button
                onClick={handleCopyResult}
                variant="success"
                size="sm"
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制结果
              </Button>
            </div>
            
            {/* 结果内容显示区域 */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-6 max-h-64 sm:max-h-96 overflow-y-auto border border-gray-200">
              {renderResult()}
            </div>
          </CollapsibleSection>
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