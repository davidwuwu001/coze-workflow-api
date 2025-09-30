/**
 * API测试工具
 * 用于验证Coze API调用是否正常工作
 */

/**
 * 测试工作流列表API
 * @param token 访问令牌
 * @param workspaceId 工作空间ID
 * @returns 测试结果
 */
export async function testWorkflowListApi(token: string, workspaceId: string) {
  const url = `https://api.coze.cn/v1/workflows?workspace_id=${workspaceId}&page_num=1&page_size=10&publish_status=all`;
  
  console.log('🔍 开始测试API调用...');
  console.log('📍 请求URL:', url);
  console.log('🔑 Token前缀:', token.substring(0, 20) + '...');
  
  try {
    // 测试fetch请求
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 响应状态:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 原始响应:', responseText);

    if (!response.ok) {
      console.error('❌ API调用失败');
      return {
        success: false,
        status: response.status,
        error: responseText,
        details: `HTTP ${response.status}: ${responseText}`
      };
    }

    const data = JSON.parse(responseText);
    console.log('✅ API调用成功');
    console.log('📦 解析后数据:', data);

    return {
      success: true,
      status: response.status,
      data: data,
      details: 'API调用成功'
    };

  } catch (error) {
    console.error('💥 网络错误:', error);
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : '未知错误',
      details: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 验证Token格式
 * @param token 访问令牌
 * @returns 验证结果
 */
export function validateToken(token: string): { isValid: boolean; message: string } {
  if (!token) {
    return { isValid: false, message: 'Token不能为空' };
  }

  // 移除Token格式限制，接受任何非空Token
  return { 
    isValid: true,
    message: 'Token格式验证通过'
  };
}

/**
 * 验证工作空间ID格式
 * @param workspaceId 工作空间ID
 * @returns 验证结果
 */
export function validateWorkspaceId(workspaceId: string): { isValid: boolean; message: string } {
  if (!workspaceId) {
    return { isValid: false, message: '工作空间ID不能为空' };
  }

  if (!/^\d+$/.test(workspaceId)) {
    return { isValid: false, message: '工作空间ID必须是纯数字' };
  }

  if (workspaceId.length < 10) {
    return { isValid: false, message: '工作空间ID长度太短' };
  }

  return { isValid: true, message: '工作空间ID格式正确' };
}