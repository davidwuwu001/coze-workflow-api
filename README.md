# Coze Workflow Hub

一个用于测试和管理 Coze 工作流的 Web 应用程序。

## 🚀 功能特性

### 核心功能
- **工作流调用测试** - 支持调用任意Coze工作流API
- **实时流式响应** - 使用官方Coze SDK处理流式数据
- **参数自定义** - 灵活配置工作流参数名称和格式
- **多端点支持** - 支持Coze CN和COM端点切换
- **历史记录** - 自动保存执行历史，支持快速恢复

### 界面特性
- **现代化UI** - 基于Tailwind CSS的美观界面
- **响应式设计** - 适配各种屏幕尺寸
- **实时反馈** - 详细的执行状态和调试信息
- **智能链接处理** - 自动识别并可点击复制结果中的链接
- **加载动画** - 优雅的加载状态和骨架屏

### 开发特性
- **TypeScript支持** - 完整的类型定义和检查
- **组件化架构** - 可复用的UI组件库
- **本地存储** - 自动保存用户配置和历史记录
- **错误处理** - 完善的错误捕获和用户提示

## 📦 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **API客户端**: @coze/api (官方SDK)
- **状态管理**: React Hooks
- **本地存储**: localStorage API

## 🛠️ 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📖 使用指南

### 基本使用流程

1. **配置认证信息**
   - 输入有效的Coze API Token（以`sat_`开头）
   - 选择合适的API端点（CN或COM）

2. **设置工作流参数**
   - 输入工作流ID
   - 配置参数名称（如：`key_word`、`input`等）
   - 选择参数格式（简单格式推荐）

3. **输入测试数据**
   - 在输入参数框中填入要测试的数据
   - 支持文本、URL等各种格式

4. **执行测试**
   - 点击"执行工作流"按钮
   - 查看实时执行状态和调试信息
   - 获取结果并支持一键复制

### 高级功能

#### 历史记录管理
- 自动保存每次执行的输入和结果
- 支持从历史记录快速恢复测试场景
- 区分成功和失败的执行记录

#### 调试信息查看
- 详细的API请求和响应日志
- 流式数据处理过程追踪
- 错误信息和堆栈跟踪

#### 智能结果处理
- 自动格式化JSON响应
- 识别并高亮显示链接
- 支持点击复制链接到剪贴板

## 🔧 配置说明

### API端点选项
- `https://api.coze.cn/v1/workflow/run` - Coze中国版
- `https://api.coze.com/v1/workflow/run` - Coze国际版

### 参数格式类型
- **简单格式** - 直接键值对，推荐使用
- **嵌套对象格式** - 支持复杂对象结构
- **数组格式** - 支持数组类型参数
- **Coze官方格式** - 完全兼容官方API格式

## 📁 项目结构

```
src/
├── components/          # UI组件库
│   ├── Alert.tsx       # 警告提示组件
│   ├── Button.tsx      # 按钮组件
│   ├── Card.tsx        # 卡片容器组件
│   ├── CollapsibleSection.tsx  # 可折叠区域组件
│   ├── HistoryPanel.tsx        # 历史记录面板
│   ├── Input.tsx       # 输入框组件
│   ├── LoadingSpinner.tsx      # 加载动画组件
│   └── SkeletonLoader.tsx      # 骨架屏组件
├── types/              # TypeScript类型定义
│   └── history.ts      # 历史记录类型
├── utils/              # 工具函数
│   └── historyStorage.ts       # 历史记录存储工具
├── WorkflowTest.tsx    # 主应用组件
├── index.css          # 全局样式
└── main.tsx           # 应用入口
```

## 🎨 样式系统

项目使用Tailwind CSS构建现代化界面：

- **渐变背景** - 美观的渐变色背景
- **玻璃拟态效果** - 半透明的玻璃质感卡片
- **动画效果** - 流畅的淡入淡出动画
- **响应式布局** - 适配移动端和桌面端
- **深色模式友好** - 支持深色主题切换

## 🔍 调试技巧

### 查看详细日志
1. 打开浏览器开发者工具
2. 查看Console标签页的详细API调用日志
3. 使用应用内的"执行状态"面板查看流程

### 常见问题排查
- **Token无效**: 确保使用有效的Coze API Token
- **工作流ID错误**: 检查工作流ID是否正确
- **参数名称不匹配**: 确认参数名称与工作流定义一致
- **网络连接问题**: 检查API端点是否可访问

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发规范
- 使用TypeScript编写代码
- 遵循ESLint和Prettier配置
- 为新功能添加适当的注释
- 保持组件的单一职责原则

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Coze](https://coze.cn) - 提供强大的工作流API
- [React](https://reactjs.org) - 优秀的前端框架
- [Tailwind CSS](https://tailwindcss.com) - 实用的CSS框架
- [Vite](https://vitejs.dev) - 快速的构建工具

---

如有问题或建议，欢迎提交Issue或联系开发者！