# AI 聊天助手 Demo（Claude CLI 版）

基于 React 的网页版 AI 聊天应用，通过调用本地 [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) 命令行，实现**自动联网搜索**、多轮对话、窗口拖拽与背景切换。

## 功能特性

### 对话能力

- **Claude CLI 集成**：通过 `claude -p` 命令调用本地 Claude，支持自动联网搜索
- **多轮对话**：支持连续追问，Claude 会记住上下文
- **实时回复**：Claude CLI 自动处理搜索与总结，一键获取答案
- **清空对话**：标题栏右侧「清空对话」按钮，一键清除当前会话记录

### 界面交互

- **可拖动窗口**：按住标题栏拖动聊天框，半透明效果
- **窗口自适应**：浏览器缩放或调整窗口大小时，聊天框自动限制在屏幕可视区域内
- **背景切换**：页面右上角按钮可在多张背景图之间循环切换
- **文字可复制**：对话内容支持鼠标选中与复制（`Ctrl+C`）
- **Enter 发送**：输入框支持回车键快速发送；AI 回复过程中输入框与发送按钮自动禁用

## 使用说明

1. 在输入框输入问题，点击发送按钮或按 `Enter` 发送
2. Claude CLI 会自动联网搜索并生成回复
3. 可基于 AI 的上一条回复继续提问，实现多轮对话
4. 等待 AI 流式输出完成后再发送下一条（回复中按钮会暂时禁用）
5. 需要重新开始时，点击标题栏 **「清空对话」**
6. 拖动 **标题栏** 可移动聊天窗口位置

## 技术栈

- React 19
- Create React App
- Express 后端服务器
- Claude CLI（本地命令行工具，内置联网搜索）

## 系统架构

本项目采用 **前端 + 后端 + AI** 三层架构，通过本地 Claude CLI 实现自动联网搜索对话。

### 1. 前端（React）

**文件：** `src/App.js`

**作用：**
- 用户交互界面（聊天窗口、输入框、消息气泡）
- 负责把用户输入的问题发送给后端
- 接收 AI 的回复并展示

**核心功能：**
- 可拖动聊天窗口（毛玻璃效果）
- 背景图切换
- 发送消息（Enter / 按钮）
- 显示「Claude 正在思考...」状态
- 自动滚动到底部
- 消息气泡样式（用户蓝色、AI 白色）

**不做的事：**
- 不直接调用 Claude
- 不处理搜索
- 不存储 API Key

### 2. 后端（Express）

**文件：** `server/index.js`

**作用：**
- 作为「中间人」，接收前端请求
- 调用本地系统命令 `claude -p`
- 把 Claude 的输出返回给前端

**核心功能：**
- `POST /api/claude` 接口
- 使用 `execSync` 执行命令：
  ```js
  execSync(`claude -p "问题" --allowedTools "WebSearch"`)
  ```
- 处理超时、错误、权限等
- 静态文件托管（生产环境）

**为什么需要后端？**
- 浏览器无法直接执行系统命令
- 安全隔离（前端不直接接触系统）

### 3. AI（Claude CLI）

**工具：** 本地已安装并登录的 `claude` 命令行

**作用：**
- 真正的「智能大脑」
- 负责理解问题、联网搜索、总结回复

**核心功能：**
- 接收问题文本
- 自动调用 WebSearch 工具搜索实时信息
- 基于搜索结果生成自然语言回答
- 输出 Markdown 格式（表格、链接等）

**特点：**
- 内置联网能力（通过 `--allowedTools "WebSearch"`）
- 跳过交互授权，直接执行搜索
- 回答质量高、格式规范

### 三者协作流程

```
1. 用户输入「今天上海天气怎么样」
          ↓
2. 前端调用 fetch('/api/claude', { prompt })
          ↓
3. 后端执行 execSync(`claude -p "..." --allowedTools "WebSearch"`)
          ↓
4. Claude CLI 联网搜索 → 总结 → 返回 Markdown 文本
          ↓
5. 后端把结果返回给前端
          ↓
6. 前端把文本渲染到聊天气泡中
```

### 角色对比

| 角色 | 技术 | 核心职责 | 是否联网 | 是否直接调用 AI |
|------|------|----------|----------|-----------------|
| **前端** | React | UI 交互、消息展示 | 否 | 否 |
| **后端** | Express | 命令行桥接、接口封装 | 否 | 否 |
| **AI** | Claude CLI | 理解问题、搜索、生成回答 | ✅ 是 | ✅ 是 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 确保 Claude CLI 可用

你的本地已经安装并登录了 Claude CLI，直接验证即可：

```bash
claude -p "你好"
```

如果能正常返回回复，说明已就绪，无需额外配置。

> 无需配置 `.env.local`，Claude CLI 会自动使用你的认证信息。

### 3. 启动开发服务器

```bash
npm start
```

这会同时启动：
- 前端开发服务器：`http://localhost:3000`
- 后端代理服务器：`http://localhost:3001`

浏览器访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm start` | 同时启动前端(3000)和后端(3001)服务器 |
| `npm run client` | 仅启动前端开发服务器 |
| `npm run server` | 仅启动后端代理服务器 |
| `npm run build` | 构建生产版本，输出到 `build` 目录 |
| `npm run serve` | 生产模式运行服务器 |
| `npm test` | 运行测试（交互式监听模式） |
| `npm run eject` | 弹出 CRA 配置（不可逆，一般不需要） |

## 项目结构

```
ai-chat-demo/
├── public/              # 静态资源
├── server/
│   └── index.js         # Express 后端服务器（调用 Claude CLI）
├── src/
│   ├── App.js           # 主组件（聊天窗口、消息展示、拖拽）
│   ├── index.js         # 应用入口
│   └── ...
├── .env.example         # 环境变量示例
├── .env.local           # 本地环境变量（不提交到 Git）
└── package.json
```

## 部署说明

### 生产环境部署

1. 构建前端：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm run serve
```

这会启动后端服务器并自动托管 `build` 目录中的静态文件。

### 环境变量

生产环境需要设置以下环境变量：

```
PORT=3001（可选，默认 3001）
NODE_ENV=production
```

## 安全提示

- 本项目通过本地 Claude CLI 调用，无需在前端或后端配置 API Key
- Claude CLI 的认证信息存储在本地用户目录
- 不要将 `.env.local` 提交到 Git 仓库

## 仓库地址

[https://github.com/330wanlu/zwl_0_chat_ai_dome](https://github.com/330wanlu/zwl_0_chat_ai_dome)
