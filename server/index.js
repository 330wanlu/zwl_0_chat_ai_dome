const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const { execSync } = require('child_process')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.post('/api/claude', (req, res) => {
  const prompt = (req.body.prompt || '').trim()
  if (!prompt) {
    return res.status(400).json({ error: '缺少 prompt 参数' })
  }

  try {
    // 调用本地 claude 命令，允许 WebSearch 工具（跳过交互授权）
    const output = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}" --allowedTools "WebSearch"`, {
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024
    })

    res.json({ prompt, response: output.trim() })
  } catch (err) {
    console.error('Claude CLI error:', err.message)
    res.status(500).json({
      error: err.message || '调用 Claude CLI 失败',
      hint: '请确保已安装 Claude CLI 并登录'
    })
  }
})

const buildPath = path.join(__dirname, '../build')
const shouldServeBuild = process.env.NODE_ENV === 'production' ||
  fs.existsSync(path.join(buildPath, 'index.html'))

if (shouldServeBuild) {
  app.use(express.static(buildPath))
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'))
  })
}

const server = app.listen(PORT, () => {
  console.log(`Claude CLI 服务已启动: http://localhost:${PORT}`)
})

// 错误处理
server.on('error', (err) => {
  console.error('服务器错误:', err.message)
  process.exit(1)
})

// 保持进程运行
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM，关闭服务器...')
  server.close(() => process.exit(0))
})
