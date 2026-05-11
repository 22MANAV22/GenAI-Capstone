import { useApp } from '../../context/AppContext'
import { Bot, MessageSquare, Database, GitBranch, Activity, Zap, ChevronRight } from 'lucide-react'

const NAV = [
  { id: 'chat',    icon: MessageSquare, label: 'Chat',         desc: 'Code Q&A' },
  { id: 'catalog', icon: Database,      label: 'Data Catalog', desc: 'Tables & PII' },
  { id: 'lineage', icon: GitBranch,     label: 'Lineage',      desc: 'DAG View' },
  { id: 'health',  icon: Activity,      label: 'Health',       desc: 'SLO & Status' },
  { id: 'agent',   icon: Zap,           label: 'Agent',        desc: 'Quality Checks' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, repoLoaded, repoInfo } = useApp()

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00f5c4, #3d7cff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color="#050810" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--neon-cyan)' }}>DE.AI</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Assistant</div>
          </div>
        </div>
      </div>

      {/* Repo status */}
      {repoInfo && (
        <div style={{ padding: '12px 20px', margin: '12px 12px 0', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glow)' }}>
          <div style={{ fontSize: 10, color: 'var(--neon-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Repo Loaded</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {repoInfo.files_processed} files · {repoInfo.chunks_indexed} chunks
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ id, icon: Icon, label, desc }) => {
          const active = activeTab === id
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              width: '100%', padding: '10px 12px',
              background: active ? 'linear-gradient(135deg, #00f5c415, #3d7cff15)' : 'transparent',
              border: active ? '1px solid #00f5c430' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: 10,
              color: active ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
            >
              <Icon size={16} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{desc}</div>
              </div>
              {active && <ChevronRight size={12} />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          POWERED BY OLLAMA<br />
          <span style={{ color: repoLoaded ? 'var(--neon-green)' : 'var(--text-muted)' }}>
            ● {repoLoaded ? 'READY' : 'NO REPO'}
          </span>
        </div>
      </div>
    </aside>
  )
}
