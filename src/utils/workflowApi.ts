import { GetWorkflowListParams, WorkflowListResponse } from '../types/workflow';

/**
 * 获取工作流列表
 * @param params 请求参数
 * @param token 访问令牌
 * @returns 工作流列表响应
 */
export async function getWorkflowList(
  params: GetWorkflowListParams,
  token: string
): Promise<WorkflowListResponse> {
  const { workspace_id, page_num = 1, page_size = 20, publish_status = 'all' } = params;
  
  // 构建查询参数
  const queryParams = new URLSearchParams({
    workspace_id,
    page_num: page_num.toString(),
    page_size: page_size.toString(),
    publish_status
  });

  const url = `https://api.coze.cn/v1/workflows?${queryParams.toString()}`;

  try {
    console.log('请求URL:', url);
    console.log('请求头:', {
      'Authorization': `Bearer ${token.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('错误响应内容:', errorText);
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.msg) {
          errorMessage += ` - ${errorData.msg}`;
        }
        if (errorData.code) {
          errorMessage += ` (code: ${errorData.code})`;
        }
      } catch (parseError) {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('响应数据:', data);
    return data;
  } catch (error) {
    console.error('获取工作流列表失败:', error);
    throw error;
  }
}

/**
 * 验证工作流列表API参数
 * @param params 请求参数
 * @param token 访问令牌
 * @returns 验证结果
 */
export function validateWorkflowListParams(
  params: GetWorkflowListParams,
  token: string
): { isValid: boolean; error?: string } {
  if (!token || token.trim() === '') {
    return { isValid: false, error: '请输入有效的访问令牌' };
  }

  if (!params.workspace_id || params.workspace_id.trim() === '') {
    return { isValid: false, error: '请输入有效的工作空间ID' };
  }

  if (params.page_num && (params.page_num < 1 || !Number.isInteger(params.page_num))) {
    return { isValid: false, error: '页码必须是大于0的整数' };
  }

  if (params.page_size && (params.page_size < 1 || params.page_size > 100 || !Number.isInteger(params.page_size))) {
    return { isValid: false, error: '每页数量必须是1-100之间的整数' };
  }

  return { isValid: true };
}