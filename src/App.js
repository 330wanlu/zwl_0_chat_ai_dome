import { useState, useRef, useEffect } from 'react'

export default function AiChat() {
  const [msg, setMsg] = useState('')
  const [list, setList] = useState([])
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

  const API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY

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
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      })
    }

    const stopDrag = () => setIsDragging(false)
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

  const send = async () => {
    const text = msg.trim()
    if (!text) return
    setMsg('')
    setList(prev => [...prev, { type: 'user', text }])
    setList(prev => [...prev, { type: 'ai', text: '思考中...' }])

    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: text }],
          stream: false
        })
      })
      const data = await response.json()
      const aiReply = data.choices?.[0]?.message?.content || "暂无回复内容"
      setList(prev => {
        const arr = [...prev]
        arr[arr.length - 1].text = aiReply
        return arr
      })
    } catch (e) {
      setList(prev => {
        const arr = [...prev]
        arr[arr.length - 1].text = "请求失败，请检查密钥与网络"
        return arr
      })
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
        onMouseDown={startDrag}
        style={{
          width: '720px',
          height: '90vh',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "absolute",
          left: position.x + 'px',
          top: position.y + 'px',
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none"
        }}
      >
        <div style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #eee',
          fontSize: '17px',
          fontWeight: 500,
          color: '#222'
        }}>
          AI 聊天助手（可拖动）
        </div>

        <div style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          cursor: "text"
        }}
        onMouseDown={(e) => e.stopPropagation()}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>{item.text}</div>
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
          onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="输入消息..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                background: 'transparent'
              }}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button onClick={send} style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: '#6986ff',
              color: '#fff',
              cursor: 'pointer'
            }}>➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}