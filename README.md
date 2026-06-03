# AI 聊天助手 Demo

基于 React 的网页版 AI 聊天应用，接入 [DeepSeek](https://platform.deepseek.com/) 大模型 API，支持多轮对话、流式回复、窗口拖拽与背景切换。

## 功能特性

### 对话能力

- **多轮对话**：自动携带历史上下文，AI 能记住本轮会话中的上文，支持连续追问
- **流式输出**：AI 回复逐字显示（打字机效果），无需等待整段生成完毕
- **清空对话**：标题栏右侧「清空对话」按钮，一键清除当前会话记录

### 界面交互

- **可拖动窗口**：按住标题栏拖动聊天框，半透明毛玻璃效果
- **窗口自适应**：浏览器缩放或调整窗口大小时，聊天框自动限制在屏幕可视区域内
- **背景切换**：页面右上角按钮可在多张背景图之间循环切换
- **文字可复制**：对话内容支持鼠标选中与复制（`Ctrl+C`）
- **Enter 发送**：输入框支持回车键快速发送；AI 回复过程中输入框与发送按钮自动禁用

## 使用说明

1. 在输入框输入问题，点击发送按钮或按 `Enter` 发送
2. 可基于 AI 的上一条回复继续提问，实现多轮对话
3. 等待 AI 流式输出完成后再发送下一条（回复中按钮会暂时禁用）
4. 需要重新开始时，点击标题栏 **「清空对话」**
5. 拖动 **标题栏** 可移动聊天窗口位置

## 技术栈

- React 19
- Create React App
- DeepSeek Chat Completions API（流式 `stream: true`）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制环境变量示例文件，并填入你的 DeepSeek API Key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```
REACT_APP_DEEPSEEK_API_KEY=你的_API_Key
```

> API Key 可在 [DeepSeek 开放平台](https://platform.deepseek.com/) 获取。请勿将 `.env.local` 提交到 Git 仓库。

### 3. 启动开发服务器

```bash
npm start
```

浏览器访问 [http://localhost:3000](http://localhost:3000) 即可使用。修改代码后页面会自动刷新。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发模式，默认端口 3000 |
| `npm run build` | 构建生产版本，输出到 `build` 目录 |
| `npm test` | 运行测试（交互式监听模式） |
| `npm run eject` | 弹出 CRA 配置（不可逆，一般不需要） |

## 项目结构

```
zwl_0_chat_ai_dome/
├── public/          # 静态资源
├── src/
│   ├── App.js       # 主组件（聊天、流式 API、拖拽、清空对话）
│   ├── index.js     # 应用入口
│   └── ...
├── .env.example     # 环境变量示例
├── .env.local       # 本地环境变量（不提交到 Git）
└── package.json
```

## 部署说明

执行 `npm run build` 后，将 `build` 目录部署到任意静态托管服务即可。

注意：当前 API Key 在前端通过环境变量注入，生产环境仍会将 Key 暴露给客户端。正式项目建议将 API 请求放到后端代理，避免密钥泄露。

## 仓库地址

[https://github.com/330wanlu/zwl_0_chat_ai_dome](https://github.com/330wanlu/zwl_0_chat_ai_dome)
