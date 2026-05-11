import { useCallback } from 'react'
import { streamChat } from '../services/api'

export function useChat(messages, setMessages, loading, setLoading) {
  const sendMessage = useCallback(async (text, history) => {
    if (!text.trim() || loading) return
    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, { id: `u_${Date.now()}`, role: 'user', content: text }])

    /**
     * FIX [9]: Original code tracked the assistant message position via an
     * object-ref index set inside a setMessages callback. In React 18 with
     * automatic batching, both setMessages calls may flush together, making
     * the index stale.  Using a stable string ID and filtering by id is
     * both simpler and race-condition-free.
     */
    const msgId = `a_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setMessages(prev => [...prev, { id: msgId, role: 'assistant', content: '', streaming: true, sources: [] }])

    try {
      let full = ''
      for await (const chunk of streamChat(text, history)) {
        if (chunk.token) {
          full += chunk.token
          setMessages(prev =>
            prev.map(m => m.id === msgId ? { ...m, content: full } : m)
          )
        }
        if (chunk.done)  break
        if (chunk.error) throw new Error(chunk.error)
      }
      // Mark streaming complete
      setMessages(prev =>
        prev.map(m => m.id === msgId ? { ...m, streaming: false } : m)
      )
    } catch (e) {
      setMessages(prev =>
        prev.map(m => m.id === msgId
          ? { ...m, content: `Error: ${e.message || e}`, streaming: false, error: true }
          : m
        )
      )
    } finally {
      setLoading(false)
    }
  }, [loading, setMessages, setLoading])

  return { sendMessage }
}
