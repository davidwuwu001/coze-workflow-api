import React, { useState } from 'react';
import { Workflow, GetWorkflowListParams } from '../types/workflow';
import { getWorkflowList, validateWorkflowListParams } from '../utils/workflowApi';
import { testWorkflowListApi, validateToken, validateWorkspaceId } from '../utils/testApi';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';

interface WorkflowSelectorProps {
  /** 选中的工作流 */
  selectedWorkflow?: Workflow;
  /** 工作流选择回调 */
  onWorkflowSelect: (workflow: Workflow) => void;
  /** 初始token值 */
  initialToken?: string;
  /** 初始工作空间ID */
  initialWorkspaceId?: string;
}

/**
 * 工作流选择器组件
 * 允许用户输入token和workspace_id来获取并选择工作流
 */
const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  selectedWorkflow,
  onWorkflowSelect,
  initialToken = '',
  initialWorkspaceId = ''
}) => {
  // 表单状态
  const [token, setToken] = useState(initialToken);
  const [workspaceId, setWorkspaceId] = useState(initialWorkspaceId);
  const [pageNum, setPageNum] = useState(1);
  const [publishStatus, setPublishStatus] = useState<'all' | 'published' | 'draft'>('all');

  // 工作流列表状态
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  // 折叠状态
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * 获取工作流列表
   */
  const handleFetchWorkflows = async () => {
    if (!token.trim()) {
      setError('请输入访问令牌');
      return;
    }

    if (!workspaceId.trim()) {
      setError('请输入工作空间ID');
      return;
    }

    // 首先验证token和workspaceId格式
    const tokenValidation = validateToken(token);
    if (!tokenValidation.isValid) {
      setError(`Token验证失败: ${tokenValidation.message}`);
      return;
    }

    const workspaceValidation = validateWorkspaceId(workspaceId);
    if (!workspaceValidation.isValid) {
      setError(`工作空间ID验证失败: ${workspaceValidation.message}`);
      return;
    }

    console.log('🚀 开始获取工作流列表...');
    console.log('📋 参数验证通过');

    // 先进行API测试
    console.log('🧪 执行API测试...');
    const testResult = await testWorkflowListApi(token, workspaceId);
    
    if (!testResult.success) {
      setError(`API测试失败: ${testResult.details}`);
      console.error('❌ API测试失败:', testResult);
      return;
    }

    console.log('✅ API测试成功，继续正常流程');

    const params: GetWorkflowListParams = {
      workspace_id: workspaceId,
      page_num: pageNum,
      page_size: 20,
      publish_status: publishStatus
    };

    // 验证参数
    const validation = validateWorkflowListParams(params, token);
    if (!validation.isValid) {
      setError(validation.error || '参数验证失败');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getWorkflowList(params, token);
      
      if (response.code === 0) {
        // API返回的数据结构是 data.items，不是 data.workflows
        const workflowItems = response.data.items || [];
        setWorkflows(workflowItems);
        setHasMore(response.data.has_more);
        setTotal(workflowItems.length); // 使用实际数组长度
        console.log('✅ 工作流列表获取成功:', response.data);
        console.log('📊 工作流数量:', workflowItems.length);
      } else {
        setError(`获取工作流列表失败: ${response.msg}`);
      }
    } catch (err) {
      setError(`网络请求失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 选择工作流
   */
  const handleSelectWorkflow = (workflow: Workflow) => {
    onWorkflowSelect(workflow);
    // 选择工作流后自动折叠
    setIsCollapsed(true);
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    setWorkflows([]);
    setError('');
    setTotal(0);
    setHasMore(false);
  };

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">工作流选择器</h3>
          <div className="flex items-center gap-3">
            {selectedWorkflow && (
              <div className="text-sm text-green-600">
                已选择: {selectedWorkflow.workflow_name}
              </div>
            )}
            {selectedWorkflow && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title={isCollapsed ? "展开" : "折叠"}
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 输入表单 - 根据折叠状态显示/隐藏 */}
        {!isCollapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              访问令牌 (Token) *
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="请输入Coze API访问令牌"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工作空间ID *
            </label>
            <Input
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="请输入工作空间ID"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              页码
            </label>
            <input
              type="number"
              value={pageNum.toString()}
              onChange={(e) => setPageNum(parseInt(e.target.value) || 1)}
              placeholder="页码"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              发布状态
            </label>
            <select
              value={publishStatus}
              onChange={(e) => setPublishStatus(e.target.value as 'all' | 'published' | 'draft')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={handleFetchWorkflows}
            disabled={isLoading || !token.trim() || !workspaceId.trim()}
            className="flex items-center gap-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            获取工作流列表
          </Button>
          
          {workflows.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleReset}
            >
              重置
            </Button>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}

        {/* 工作流列表 */}
        {workflows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                工作流列表 ({total} 个工作流)
              </h4>
              {hasMore && (
                <span className="text-sm text-gray-500">还有更多工作流...</span>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workflows.map((workflow) => (
                <div
                  key={workflow.workflow_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedWorkflow?.workflow_id === workflow.workflow_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectWorkflow(workflow)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 第一行：工作流名称 */}
                      <h5 className="font-medium text-gray-900 truncate leading-5">
                        {workflow.workflow_name}
                      </h5>
                      {/* 第二行：工作流描述 */}
                      {workflow.description && (
                        <p className="text-sm text-gray-600 mt-1 truncate leading-5">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                    
                    {selectedWorkflow?.workflow_id === workflow.workflow_id && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </Card>
  );
};

export default WorkflowSelector;