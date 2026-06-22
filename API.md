# API 文档

本文档详细描述了 Solo Chat 的所有 API 接口。

## 目录

- [概述](#概述)
- [认证](#认证)
- [错误处理](#错误处理)
- [接口列表](#接口列表)
  - [健康检查](#健康检查)
  - [聊天接口](#聊天接口)
  - [Ollama 状态](#ollama-状态)
  - [认证接口](#认证接口)

## 概述

### 基础 URL

- **开发环境**: `http://localhost:3002/api`
- **生产环境**: 根据部署配置

### 请求格式

所有请求体使用 JSON 格式：

```
Content-Type: application/json
```

### 响应格式

所有响应使用 JSON 格式，包含以下字段：

```json
{
  "success": true|false,
  "data": {},      // 成功时返回
  "error": "",     // 失败时返回
  "code": ""       // 错误代码
}
```

## 认证

当前版本（v1.0）暂未实现认证机制。所有接口均为公开访问。

后续版本计划添加：
- JWT Token 认证
- API Key 认证
- OAuth 2.0 支持

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}    // 可选，验证错误详情
}
```

### 错误代码

| 错误代码 | HTTP 状态码 | 说明 |
|---------|-----------|------|
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `NOT_FOUND` | 404 | 请求的资源不存在 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 禁止访问 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `OLLAMA_ERROR` | 500 | Ollama 服务错误 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

### 常见错误示例

#### 验证错误

```json
{
  "success": false,
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "path": ["messages", 0, "content"],
      "message": "Content is required"
    }
  ]
}
```

#### 速率限制

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## 接口列表

### 健康检查

检查服务是否正常运行。

#### 请求

```http
GET /api/health
```

#### 响应

**成功响应 (200 OK):**

```json
{
  "success": true,
  "message": "ok"
}
```

#### 示例

```bash
curl http://localhost:3002/api/health
```

---

### 聊天接口

与 AI 模型进行对话，支持流式响应。

#### 请求

```http
POST /api/chat
Content-Type: application/json
```

#### 请求体

```json
{
  "messages": [
    {
      "role": "user" | "assistant" | "system",
      "content": "string",
      "images": ["base64string"]  // 可选
    }
  ],
  "model": "string",
  "options": {
    "temperature": 0.7,          // 可选，0-2
    "top_p": 0.9,                // 可选，0-1
    "max_tokens": 2048           // 可选，正整数
  },
  "ollamaUrl": "string"          // 可选
}
```

#### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `messages` | array | 是 | 消息数组，至少包含一条消息 |
| `messages[].role` | string | 是 | 角色：user/assistant/system |
| `messages[].content` | string | 是 | 消息内容 |
| `messages[].images` | array | 否 | Base64 编码的图片数组 |
| `model` | string | 是 | 模型名称 |
| `options` | object | 否 | 模型参数选项 |
| `options.temperature` | number | 否 | 温度参数，控制随机性，范围 0-2 |
| `options.top_p` | number | 否 | Top-p 采样，范围 0-1 |
| `options.max_tokens` | number | 否 | 最大生成 token 数 |
| `ollamaUrl` | string | 否 | Ollama 服务地址 |

#### 响应

**成功响应 (200 OK):**

Server-Sent Events (SSE) 流式响应：

```
data: {"content":"Hello"}

data: {"content":" there"}

data: {"content":"!"}

data: [DONE]
```

**错误响应:**

```json
{
  "success": false,
  "error": "Failed to chat with Ollama",
  "code": "OLLAMA_ERROR"
}
```

#### 示例

```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "model": "gemma4:latest",
    "options": {
      "temperature": 0.7
    }
  }'
```

---

### Ollama 状态

检查 Ollama 服务连接状态和可用模型。

#### 请求

```http
GET /api/ollama/status
```

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 否 | Ollama 服务地址，默认: http://localhost:11434 |

#### 响应

**成功响应 (200 OK):**

```json
{
  "connected": true,
  "models": [
    "gemma4:latest",
    "llama2:latest"
  ]
}
```

**连接失败响应:**

```json
{
  "connected": false,
  "models": []
}
```

#### 示例

```bash
# 使用默认地址
curl http://localhost:3002/api/ollama/status

# 指定 Ollama 地址
curl "http://localhost:3002/api/ollama/status?url=http://localhost:11434"
```

---

### 认证接口

> ⚠️ **注意**: 认证接口当前为占位实现，功能尚未完成。

#### 用户注册

```http
POST /api/auth/register
```

#### 用户登录

```http
POST /api/auth/login
```

#### 用户登出

```http
POST /api/auth/logout
```

---

## 速率限制

API 实施了速率限制以防止滥用：

- **限制**: 每个 IP 地址 15 分钟内最多 100 次请求
- **响应头**: 
  - `X-RateLimit-Limit`: 限制总数
  - `X-RateLimit-Remaining`: 剩余次数
  - `X-RateLimit-Reset`: 重置时间（Unix 时间戳）

超过限制时返回 429 状态码。

## 最佳实践

### 1. 错误处理

始终检查响应中的 `success` 字段：

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})

const result = await response.json()

if (!result.success) {
  console.error('Error:', result.error)
  console.error('Code:', result.code)
  return
}

// 处理成功响应
```

### 2. 流式响应处理

使用 EventSource 或 ReadableStream 处理 SSE：

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value, { stream: true })
  const lines = chunk.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      if (data === '[DONE]') continue
      
      try {
        const parsed = JSON.parse(data)
        console.log('Received:', parsed.content)
      } catch (e) {
        console.error('Parse error:', e)
      }
    }
  }
}
```

### 3. 图片上传

将图片转换为 Base64 格式：

```javascript
const file = document.querySelector('input[type="file"]').files[0]
const reader = new FileReader()

reader.onloadend = () => {
  const base64 = reader.result.split(',')[1]
  // 使用 base64 字符串
}

reader.readAsDataURL(file)
```

## 更新日志

### v1.0.0 (2024-01-XX)

- ✨ 初始版本发布
- ✅ 基础聊天功能
- ✅ Ollama 集成
- ✅ 流式响应支持
- ✅ 多模态支持（图片）
- ✅ 速率限制
- ✅ 输入验证
- ✅ 错误处理

## 支持

如有问题或建议，请提交 GitHub Issue。
