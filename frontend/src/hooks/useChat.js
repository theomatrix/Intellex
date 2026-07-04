import { useState, useCallback } from 'react'
import { sendChatMessage } from '../lib/api'

/**
 * Hook to manage chat state and messaging.
 */
export function useChat(sessionId) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !sessionId) return

    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendChatMessage(sessionId, text)

      // Add AI response
      const aiMsg = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        confidence: response.confidence,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError(err.message || 'Failed to get response')
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        error: true,
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}
