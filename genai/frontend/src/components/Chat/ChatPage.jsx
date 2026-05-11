import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useChat } from '../../hooks/useChat'
import { Send, Trash2, Bot, User, Loader, Code2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// FIX [12]: Use CJS styles path — the ESM path (/dist/esm/...) can fail in
// some Vite configurations due to missing named exports in the ESM bundle.
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

function CodeBlock({ language, children }) {
  return (
    <SyntaxHighlighter language={language || 'python'} style={oneDark}
      customStyle={{ borderRadius: 8, fontSize: 12, margin: '8px 0' }}>
      {children}
    </SyntaxHighlighter>
  )
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '4px 0',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))'
          : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser ? <User size={15} color="white" /> : <Bot size={15} color="#050810" />}
      </div>
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          background: isUser ? 'var(--bg-elevated)' : 'var(--bg-card)',
          border: `1px solid ${isUser ? 'var(--border)' : 'var(--border-glow)'}`,
          borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          padding: '10px 14px',
          fontSize: 14, lineHeight: 1.6,
          color: msg.error ? 'var(--neon-red)' : 'var(--text-primary)',
        }}>
          {msg.streaming && !msg.content
            ? <span style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--neon-cyan)', display:'inline-block', animation:`pulse-glow 1s ${i*0.2}s infinite` }} />
                ))}
              </span>
            : <ReactMarkdown components={{
                code({ node, inline, className, children }) {
                  const lang = /language-(\w+)/.exec(className || '')?.[1]
                  return !inline
                    ? <CodeBlock language={lang}>{String(children).replace(/\n$/, '')}</CodeBlock>
                    : <code style={{ background:'var(--bg-elevated)', padding:'1px 6px', borderRadius:4, fontFamily:'var(--font-mono)', fontSize:12, color:'var(--neon-cyan)' }}>{children}</code>
                }
              }}>{msg.content}</ReactMarkdown>
          }
          {msg.streaming && msg.content && (
            <span style={{ display:'inline-block', width:8, height:14, background:'var(--neon-cyan)', marginLeft:2, animation:'pulse-glow 0.8s infinite', verticalAlign:'text-bottom', borderRadius:2 }} />
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
            {msg.sources.slice(0,3).map((s,i) => (
              <span key={i} style={{ fontSize:10, padding:'2px 6px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:99, color:'var(--text-secondary)', fontFamily:'var(--font-mono)' }}>
                <Code2 size={9} style={{display:'inline',marginRight:2}} />{s.file?.split('/').pop()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { chatMessages, setChatMessages, chatLoading, setChatLoading } = useApp()
  const { sendMessage: sendChatMessage } = useChat(chatMessages, setChatMessages, chatLoading, setChatLoading)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const handleSend = () => {
    if (!input.trim() || chatLoading) return
    const text = input; setInput('')
    const history = chatMessages.slice(-8).map(m => ({ role: m.role, content: m.content }))
    sendChatMessage(text, history)
  }

  const clearMessages = () => {
    setChatMessages([
      {
        id: 'init',
        role: 'assistant',
        content: "Hello! I'm your Data Engineering AI Assistant. Load a repository to get started, then ask me anything about your pipelines, data catalog, or code quality.",
        sources: []
      }
    ])
  }

  const SUGGESTIONS = [
    "Explain the ETL pipeline architecture",
    "Which tables contain PII data?",
    "Show me failing DAGs and their errors",
    "What are the upstream dependencies of orders table?",
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700 }}>Pipeline Assistant</h2>
          <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>RAG-powered code & pipeline Q&A</p>
        </div>
        <button onClick={clearMessages} style={{ padding:'6px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-secondary)', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
        {chatMessages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
        {chatMessages.length === 1 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{
                padding:'8px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border)',
                borderRadius:99, fontSize:12, color:'var(--text-secondary)', transition:'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--neon-cyan)30'; e.currentTarget.style.color='var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
              >{s}</button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', background:'var(--bg-surface)' }}>
        <div style={{ display:'flex', gap:10, alignItems:'flex-end', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'10px 10px 10px 16px', transition:'border-color 0.15s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor='var(--neon-cyan)40'}
          onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
        >
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask about pipelines, tables, code quality..."
            rows={1} style={{
              flex:1, resize:'none', background:'transparent', border:'none', outline:'none',
              color:'var(--text-primary)', fontSize:14, lineHeight:1.5,
              fontFamily:'var(--font-sans)', maxHeight:120, overflowY:'auto',
            }}
          />
          <button onClick={handleSend} disabled={!input.trim() || chatLoading} style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background: (!input.trim() || chatLoading) ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))',
            border:'none', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
          }}>
            {chatLoading
              ? <Loader size={15} color="var(--text-secondary)" className="animate-spin" />
              : <Send size={15} color={!input.trim() ? 'var(--text-muted)' : '#050810'} />
            }
          </button>
        </div>
        <p style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center', marginTop:8, fontFamily:'var(--font-mono)' }}>
          SHIFT+ENTER for newline · Powered by local Ollama LLM
        </p>
      </div>
    </div>
  )
}
