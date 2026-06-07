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
2. AI 会先联网搜索，然后基于搜索结果总结回复
3. 可基于 AI 的上一条回复继续提问，实现多轮对话
4. 等待 AI 流式输出完成后再发送下一条（回复中按钮会暂时禁用）
5. 需要重新开始时，点击标题栏 **「清空对话」**
6. 拖动 **标题栏** 可移动聊天窗口位置

## 技术栈

- React 19
- Create React App
- Express 后端服务器
- Claude CLI（本地命令行工具，内置联网搜索）

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
│   ├── index.js         # Express 后端服务器
│   └── search.js        # 搜索 API 实现
├── src/
│   ├── App.js           # 主组件（聊天、联网搜索、拖拽）
│   ├── index.js         # 应用入口
│   └── ...
├── .env.example         # 环境变量示例
├── .env.local           # 本地环境变量（不提交到 Git）
└── package.json
```

## 联网搜索说明

### 工作原理

1. 用户输入问题
2. 后端服务器调用搜索引擎（DuckDuckGo 或 Serper）查询
3. 获取搜索结果（标题、摘要、链接）
4. 将搜索结果作为上下文发送给 DeepSeek AI
5. AI 基于搜索结果总结回复

### 搜索 API 选择

| 方案 | 优点 | 缺点 | 配置 |
|------|------|------|------|
| **DuckDuckGo** | 免费，无需注册 | 可能受网络环境影响，偶尔不稳定 | 无需配置 |
| **Serper** | 稳定，Google 搜索结果 | 需注册，免费额度 2500 次/月 | 需配置 `SERPER_API_KEY` |

### 推荐配置 Serper

如果 DuckDuckGo 在你的网络环境下无法访问，建议配置 Serper：

1. 访问 [Serper.dev](https://serper.dev/) 注册账号
2. 获取 API Key
3. 在 `.env.local` 中添加：`SERPER_API_KEY=你的_Key`

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
REACT_APP_DEEPSEEK_API_KEY=你的_DeepSeek_Key
SERPER_API_KEY=你的_Serper_Key（可选，推荐配置）
PORT=3001（可选，默认 3001）
NODE_ENV=production
```

## 安全提示

- DeepSeek API Key 在前端通过环境变量注入，开发环境会暴露给浏览器
- 生产环境建议将 API 请求限制在后端，避免密钥泄露
- 不要将 `.env.local` 提交到 Git 仓库

## 仓库地址

[https://github.com/330wanlu/zwl_0_chat_ai_dome](https://github.com/330wanlu/zwl_0_chat_ai_dome)
