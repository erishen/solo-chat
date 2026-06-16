# Solo Chat

一个基于 React + TypeScript + Vite 构建的现代化 AI 聊天助手应用，集成了 Ollama 本地大模型支持。

## ✨ 功能特性

- 🤖 **AI 聊天** - 支持 Ollama 本地大模型，实时流式响应
- 🖼️ **多模态支持** - 支持图片上传和分析
- 🎨 **现代 UI** - 基于 Tailwind CSS 的精美界面设计
- ⚡ **高性能** - Vite 构建，支持热更新和代码分割
- 🔒 **类型安全** - TypeScript 严格模式，完整的类型检查
- 🧪 **测试覆盖** - Vitest 单元测试，确保代码质量
- 📱 **响应式设计** - 完美适配各种设备尺寸

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn
- Ollama（可选，用于本地 AI 模型）

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制环境变量模板并根据需要修改：

```bash
cp .env.example .env
```

环境变量说明：

- `PORT` - 服务器端口（默认：3002）
- `NODE_ENV` - 运行环境（development/production）
- `CORS_ORIGIN` - 允许的跨域源（逗号分隔）
- `OLLAMA_BASE_URL` - Ollama 服务地址
- `LOG_LEVEL` - 日志级别

### 启动开发服务器

```bash
npm run dev
```

这将同时启动前端开发服务器（http://localhost:5173）和后端 API 服务器（http://localhost:3002）。

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 运行所有测试
npm test

# 启动测试 UI
npm run test:ui

# 生成测试覆盖率报告
npm run test:coverage
```

## 📁 项目结构

```
solo-chat/
├── api/                    # 后端 API
│   ├── middleware/         # 中间件
│   │   ├── errorHandler.ts # 错误处理
│   │   └── validate.ts     # 请求验证
│   ├── routes/             # API 路由
│   │   ├── auth.ts         # 认证路由
│   │   ├── chat.ts         # 聊天路由
│   │   └── ollama.ts       # Ollama 状态路由
│   ├── schemas/            # 数据验证模式
│   ├── services/           # 业务逻辑
│   ├── test/               # API 测试
│   ├── utils/              # 工具函数
│   ├── app.ts              # Express 应用
│   ├── index.ts            # Vercel 入口
│   └── server.ts           # 本地服务器入口
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── Empty.tsx       # 空状态组件
│   │   ├── ErrorBoundary.tsx # 错误边界
│   │   └── MessageBubble.tsx # 消息气泡
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   ├── pages/              # 页面组件
│   │   ├── Chat.tsx        # 聊天页面
│   │   ├── Home.tsx        # 首页
│   │   └── Settings.tsx    # 设置页面
│   ├── store/              # 状态管理
│   │   └── appStore.ts     # Zustand Store
│   ├── test/               # 前端测试
│   ├── App.tsx             # 根组件
│   └── main.tsx            # 应用入口
├── public/                 # 静态资源
├── .env.example            # 环境变量模板
├── TODO.md                 # 待办事项
└── package.json            # 项目配置
```

## 🔌 API 文档

### 基础 URL

- 开发环境：`http://localhost:3002/api`
- 生产环境：根据部署配置

### 认证

当前版本暂无认证机制，后续版本将添加。

### 接口列表

#### 1. 健康检查

```http
GET /api/health
```

**响应示例：**

```json
{
  "success": true,
  "message": "ok"
}
```

#### 2. 聊天接口

```http
POST /api/chat
```

**请求体：**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!",
      "images": ["base64imagedata"] // 可选
    }
  ],
  "model": "gemma4:latest",
  "options": {
    "temperature": 0.7
  },
  "ollamaUrl": "http://localhost:11434" // 可选
}
```

**响应：** Server-Sent Events (SSE) 流式响应

```
data: {"content":"Hello"}
data: {"content":" there"}
data: [DONE]
```

#### 3. Ollama 状态检查

```http
GET /api/ollama/status?url=http://localhost:11434
```

**查询参数：**

- `url` (可选) - Ollama 服务地址

**响应示例：**

```json
{
  "connected": true,
  "models": ["gemma4:latest", "llama2:latest"]
}
```

### 错误响应

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // 可选，验证错误详情
}
```

**错误代码：**

- `VALIDATION_ERROR` - 请求验证失败
- `NOT_FOUND` - 资源未找到
- `UNAUTHORIZED` - 未授权
- `FORBIDDEN` - 禁止访问
- `OLLAMA_ERROR` - Ollama 服务错误
- `INTERNAL_ERROR` - 服务器内部错误

## 🛠️ 技术栈

### 前端

- **框架**：React 18
- **构建工具**：Vite 6
- **语言**：TypeScript 5.8
- **样式**：Tailwind CSS 3
- **路由**：React Router 7
- **状态管理**：Zustand 5
- **图标**：Lucide React
- **工具库**：clsx, tailwind-merge

### 后端

- **框架**：Express 4
- **语言**：TypeScript 5.8
- **验证**：Zod 4
- **日志**：Pino
- **限流**：express-rate-limit

### 测试

- **测试框架**：Vitest
- **测试库**：@testing-library/react
- **DOM 模拟**：jsdom

### 代码质量

- **Linter**：ESLint 9
- **类型检查**：TypeScript strict mode

## 📝 开发指南

### 代码规范

项目启用了严格的 ESLint 规则：

- 未使用变量检查
- TypeScript 严格模式
- React Hooks 规则
- 代码风格统一

### 提交代码前

确保通过以下检查：

```bash
# 类型检查
npm run check

# 代码检查
npm run lint

# 运行测试
npm test
```

### 添加新功能

1. 在 `src/pages/` 或 `src/components/` 创建组件
2. 在 `api/routes/` 添加 API 路由
3. 在 `api/schemas/` 添加验证模式
4. 编写单元测试
5. 更新文档

## 🚢 部署

### Vercel 部署

项目已配置 Vercel 部署：

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 手动部署

```bash
# 构建
npm run build

# 启动生产服务器
npm run preview
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Ollama](https://ollama.ai/) - 本地大模型运行环境
- [React](https://react.dev/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
