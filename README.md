# AI 聊天助手 Demo

基于 React 的网页版 AI 聊天应用，接入 [DeepSeek](https://platform.deepseek.com/) 大模型 API，支持对话、窗口拖拽和背景切换。

## 功能特性

- **AI 对话**：输入消息后调用 DeepSeek API，展示用户与 AI 的聊天记录
- **可拖动窗口**：聊天框可在页面上自由拖拽，带半透明毛玻璃效果
- **背景切换**：右上角按钮可在多张背景图之间循环切换
- **Enter 发送**：输入框支持回车键快速发送消息

## 技术栈

- React 19
- Create React App
- DeepSeek Chat Completions API

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
ai-chat-demo/
├── public/          # 静态资源
├── src/
│   ├── App.js       # 主组件（聊天界面、API 调用、拖拽逻辑）
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
