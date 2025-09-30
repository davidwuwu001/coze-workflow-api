/**
 * 工作流信息接口
 */
export interface Workflow {
  /** 工作流ID */
  workflow_id: string;
  /** 工作流名称 */
  workflow_name: string;
  /** 工作流描述 */
  description: string;
  /** 创建时间 */
  create_time?: number;
  /** 更新时间 */
  update_time?: number;
  /** 发布状态 */
  publish_status?: string;
}

/**
 * 获取工作流列表的请求参数
 */
export interface GetWorkflowListParams {
  /** 工作空间ID */
  workspace_id: string;
  /** 页码，从1开始 */
  page_num?: number;
  /** 每页数量，默认20，最大100 */
  page_size?: number;
  /** 发布状态筛选，all表示全部 */
  publish_status?: 'all' | 'published' | 'draft';
}

/**
 * 工作流列表API响应
 */
export interface WorkflowListResponse {
  /** 响应码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 工作流列表数据 */
  data: {
    /** 工作流列表 - API实际返回的是items字段 */
    items: Workflow[];
    /** 总数量 */
    total?: number;
    /** 是否有下一页 */
    has_more: boolean;
  };
}