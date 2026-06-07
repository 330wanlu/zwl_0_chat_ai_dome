import { useState, useRef, useEffect } from 'react'

export default function AiChat() {
  const [msg, setMsg] = useState('')
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const boxRef = useRef(null)
  const chatWindowRef = useRef(null)

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // 背景图切换功能
  const [bgIndex, setBgIndex] = useState(0)
  const backgrounds = [
    "https://cdn.svipaigc.com/bizi/2023/12/011230-1701364350e84c.jpg",
    "https://img.shetu66.com/2023/06/29/1688025012523974.png",
    "https://pic1.zhimg.com/v2-b9a5ba89b1e365d15838d0d5c8f36640_r.jpg",
    "https://p2.itc.cn/q_70/images01/20230730/7a3b1c26c9264832997c9488c5f94071.png"
  ]

  const CHAT_MAX_WIDTH = 720
  const VIEW_PADDING = 12

  const getChatSize = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    return {
      width: Math.min(CHAT_MAX_WIDTH, vw - VIEW_PADDING * 2),
      height: Math.min(vh * 0.9, vh - VIEW_PADDING * 2)
    }
  }

  const clampPosition = (pos, size) => {
    const maxX = Math.max(0, window.innerWidth - size.width)
    const maxY = Math.max(0, window.innerHeight - size.height)
    return {
      x: Math.min(Math.max(0, pos.x), maxX),
      y: Math.min(Math.max(0, pos.y), maxY)
    }
  }

  const [chatSize, setChatSize] = useState(() => {
    if (typeof window === 'undefined') return { width: CHAT_MAX_WIDTH, height: 600 }
    return getChatSize()
  })

  useEffect(() => {
    const onResize = () => {
      const size = getChatSize()
      setChatSize(size)
      setPosition(prev => clampPosition(prev, size))
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 鼠标按下
  const startDrag = (e) => {
    setIsDragging(true)
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // 鼠标移动
  useEffect(() => {
    const onDrag = (e) => {
      if (!isDragging) return
      const size = getChatSize()
      setPosition(clampPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      }, size))
    }

    const stopDrag = () => {
      if (isDragging) {
        const size = getChatSize()
        setPosition(prev => clampPosition(prev, size))
      }
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', stopDrag)
    return () => {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', stopDrag)
    }
  }, [isDragging, offset])

  useEffect(() => {
    boxRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [list])

  const clearChat = () => {
    if (isLoading) return
    setList([])
  }

  const updateLastAi = (text) => {
    setList(prev => {
      const arr = [...prev]
      arr[arr.length - 1] = { type: 'ai', text }
      return arr
    })
  }

  const send = async () => {
    const text = msg.trim()
    if (!text || isLoading) return

    setMsg('')
    setList(prev => [...prev, { type: 'user', text }, { type: 'ai', text: '' }])
    setIsLoading(true)

    try {
      updateLastAi('Claude 正在思考...')

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `请求失败 (${response.status})`)
      }

      updateLastAi(data.response || '暂无回复内容')
    } catch (e) {
      updateLastAi(e.message || '调用失败，请确保已安装 Claude CLI')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      margin: 0,
      padding: 0,
      backgroundImage: `url(${backgrounds[bgIndex]})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
      position: "relative"
    }}>

      {/* 切换背景按钮 */}
      <button
        onClick={() => setBgIndex((bgIndex + 1) % backgrounds.length)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "8px 14px",
          background: "#fff",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer",
          zIndex: 999
        }}
      >
        🌃 切换背景
      </button>

      {/* 可拖动聊天窗口 */}
      <div
        ref={chatWindowRef}
        style={{
          width: chatSize.width + 'px',
          height: chatSize.height + 'px',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "absolute",
          left: position.x + 'px',
          top: position.y + 'px'
        }}
      >
        <div
          onMouseDown={startDrag}
          style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #eee',
            fontSize: '17px',
            fontWeight: 500,
            color: '#222',
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            position: 'relative',
            padding: '0 16px'
          }}
        >
          AI 助手 - Claude CLI（拖动标题栏移动）
          <button
            type="button"
            onMouseDown={e => e.stopPropagation()}
            onClick={clearChat}
            disabled={isLoading || list.length === 0}
            style={{
              position: 'absolute',
              right: 16,
              padding: '6px 12px',
              fontSize: '13px',
              border: '1px solid #e5e6eb',
              borderRadius: '14px',
              background: '#fff',
              color: '#666',
              cursor: isLoading || list.length === 0 ? 'not-allowed' : 'pointer',
              opacity: isLoading || list.length === 0 ? 0.5 : 1
            }}
          >
            清空对话
          </button>
        </div>

        <div style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          cursor: "text",
          userSelect: "text"
        }}
        >
          {list.map((item, idx) => (
            item.type === 'user' ? (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  background: '#6986ff',
                  color: '#fff',
                  borderRadius: '18px 18px 4px 18px',
                  fontSize: '15px',
                  lineHeight: 1.6
                }}>{item.text}</div>
              </div>
            ) : (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  background: '#fff',
                  color: '#222',
                  borderRadius: '18px 18px 18px 4px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {item.text || (isLoading && idx === list.length - 1 ? '思考中...' : '')}
                </div>
              </div>
            )
          ))}
          <div ref={boxRef}></div>
        </div>

        {/* 输入框 */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #e5e6eb',
            borderRadius: '24px',
            padding: '10px 16px',
            background: '#fff'
          }}
          >
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder={isLoading ? 'AI 正在回复...' : '输入消息...'}
              disabled={isLoading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                background: 'transparent'
              }}
              onKeyDown={e => e.key === 'Enter' && !isLoading && send()}
            />
            <button
              onClick={send}
              disabled={isLoading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#6986ff',
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}