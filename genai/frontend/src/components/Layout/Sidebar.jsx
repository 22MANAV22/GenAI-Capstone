import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { downloadReport } from '../../services/reportGenerator'
import {
  Bot, MessageSquare, Database, GitBranch,
  Activity, Zap, ChevronRight,
  Download, FileText, FileSpreadsheet, FileJson, Loader,
} from 'lucide-react'

const NAV = [
  { id: 'chat',    icon: MessageSquare, label: 'Chat',         desc: 'Code Q&A' },
  { id: 'catalog', icon: Database,      label: 'Data Catalog', desc: 'Tables & PII' },
  { id: 'lineage', icon: GitBranch,     label: 'Lineage',      desc: 'DAG View' },
  { id: 'health',  icon: Activity,      label: 'Health',       desc: 'SLO & Status' },
  { id: 'agent',   icon: Zap,           label: 'Agent',        desc: 'Quality Checks' },
]

const FORMATS = [
  { id: 'pdf',  label: 'PDF',  icon: FileText,        color: '#ff3d5a', hint: 'Print-ready report' },
  { id: 'csv',  label: 'CSV',  icon: FileSpreadsheet, color: '#22c55e', hint: 'Excel / Sheets' },
  { id: 'json', label: 'JSON', icon: FileJson,        color: '#3d7cff', hint: 'Raw data export' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, repoLoaded, repoInfo } = useApp()

  const [downloading, setDownloading] = useState(null)   // format id while in progress
  const [showFormats, setShowFormats] = useState(false)
  const [error, setError]             = useState(null)

  const handleDownload = async (format) => {
    setError(null)
    setDownloading(format)
    setShowFormats(false)
    try {
      await downloadReport(format)
    } catch (e) {
      setError(`Failed: ${e.message || e}`)
      setTimeout(() => setError(null), 4000)
    } finally {
      setDownloading(null)
    }
  }

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
        <div style={{
          padding: '12px 20px', margin: '12px 12px 0',
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glow)',
        }}>
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
              transition: 'all 0.15s', cursor: 'pointer',
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

      {/* ── Download Report section ──────────────────────────────── */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>

        {/* Error message */}
        {error && (
          <div style={{
            marginBottom: 8, padding: '6px 10px',
            background: '#ff3d5a10', border: '1px solid #ff3d5a30',
            borderRadius: 6, fontSize: 11, color: 'var(--neon-red)',
          }}>
            {error}
          </div>
        )}

        {/* Format picker (shown when toggled) */}
        {showFormats && (
          <div style={{
            marginBottom: 8, padding: '8px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4,
            animation: 'fadeIn 0.15s ease',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', padding: '2px 4px 6px' }}>
              Choose format
            </div>
            {FORMATS.map(({ id, label, icon: Icon, color, hint }) => (
              <button
                key={id}
                onClick={() => handleDownload(id)}
                disabled={!!downloading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  background: 'transparent',
                  border: `1px solid ${color}30`,
                  color: 'var(--text-primary)',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  opacity: downloading && downloading !== id ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!downloading) e.currentTarget.style.background = `${color}10` }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {downloading === id
                  ? <Loader size={14} color={color} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  : <Icon size={14} color={color} style={{ flexShrink: 0 }} />
                }
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color }}>{label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{hint}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main download button */}
        <button
          onClick={() => setShowFormats(f => !f)}
          disabled={!!downloading}
          style={{
            width: '100%', padding: '9px 12px',
            background: showFormats ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #00f5c415, #3d7cff15)',
            border: `1px solid ${showFormats ? 'var(--border)' : '#00f5c440'}`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 8,
            color: downloading ? 'var(--text-secondary)' : 'var(--neon-cyan)',
            cursor: downloading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            opacity: downloading ? 0.6 : 1,
          }}
        >
          {downloading
            ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            : <Download size={15} style={{ flexShrink: 0 }} />
          }
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {downloading ? `Generating ${downloading.toUpperCase()}…` : 'Download Report'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
              {downloading ? 'Please wait' : 'PDF · CSV · JSON'}
            </div>
          </div>
          {!downloading && (
            <ChevronRight
              size={12}
              style={{
                transform: showFormats ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                flexShrink: 0,
              }}
            />
          )}
        </button>
      </div>

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