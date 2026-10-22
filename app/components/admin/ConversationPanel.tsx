'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

// Inline styles to avoid CSS file dependencies in admin
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '16px 0',
  },
  heading: {
    fontSize: '13px',
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  thread: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    paddingRight: '4px',
  },
  messageBubble: (isAdmin: boolean) => ({
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    lineHeight: '1.5',
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
    maxWidth: '95%',
    alignSelf: isAdmin ? ('flex-end' as const) : ('flex-start' as const),
    background: isAdmin ? '#C8FF00' : 'var(--theme-elevation-100, #f0f0f0)',
    color: isAdmin ? '#080808' : 'var(--theme-text, #333)',
    border: isAdmin ? 'none' : '1px solid var(--theme-elevation-200, #ddd)',
  }),
  senderLabel: (isAdmin: boolean) => ({
    fontSize: '10px',
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '2px',
    color: isAdmin ? '#080808' : 'var(--theme-elevation-500, #999)',
    opacity: 0.7,
  }),
  timestamp: (isAdmin: boolean) => ({
    fontSize: '10px',
    marginTop: '4px',
    opacity: 0.5,
    color: isAdmin ? '#080808' : 'var(--theme-elevation-500, #999)',
  }),
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--theme-elevation-200, #ddd)',
    background: 'var(--theme-input-bg, #fff)',
    color: 'var(--theme-text, #333)',
    fontSize: '14px',
    lineHeight: '1.6',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    outline: 'none',
  },
  sendBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#C8FF00',
    color: '#080808',
    fontSize: '13px',
    fontWeight: 600 as const,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'opacity 0.2s',
    alignSelf: 'flex-end' as const,
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed' as const,
  },
  statusMsg: (isError: boolean) => ({
    fontSize: '12px',
    padding: '8px 12px',
    borderRadius: '6px',
    background: isError
      ? 'var(--theme-error-100, #ffe0e0)'
      : 'var(--theme-success-100, #e0ffe0)',
    color: isError
      ? 'var(--theme-error-500, #cc0000)'
      : 'var(--theme-success-500, #008800)',
  }),
  emptyState: {
    fontSize: '13px',
    color: 'var(--theme-elevation-500, #999)',
    fontStyle: 'italic' as const,
    padding: '20px 0',
    textAlign: 'center' as const,
  },
  divider: {
    height: '1px',
    background: 'var(--theme-elevation-200, #ddd)',
    margin: '8px 0',
  },
}

interface ConversationMessage {
  sender: 'client' | 'admin'
  body: string
  sentAt: string
  emailMessageId?: string
  id?: string
}

export const ConversationPanel: React.FC = () => {
  const { id: docId, initialData } = useDocumentInfo()

  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [localMessages, setLocalMessages] = useState<ConversationMessage[]>([])
  const threadRef = useRef<HTMLDivElement>(null)

  // Initialize local messages from document data
  useEffect(() => {
    if (initialData?.conversation) {
      setLocalMessages(initialData.conversation as ConversationMessage[])
    }
  }, [initialData?.conversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [localMessages])

  const handleSendReply = useCallback(async () => {
    if (!replyText.trim() || !docId || isSending) return

    setIsSending(true)
    setStatusMessage(null)

    try {
      const response = await fetch('/api/reply-to-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: docId,
          body: replyText.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Add the message to local state immediately
        const newMessage: ConversationMessage = {
          sender: 'admin',
          body: replyText.trim(),
          sentAt: new Date().toISOString(),
        }
        setLocalMessages((prev) => [...prev, newMessage])
        setReplyText('')
        setStatusMessage({ text: '✓ Reply sent via email', isError: false })

        // Clear success message after 3 seconds
        setTimeout(() => setStatusMessage(null), 3000)
      } else {
        setStatusMessage({
          text: `Failed: ${result.error || 'Unknown error'}`,
          isError: true,
        })
      }
    } catch (err) {
      console.error('Reply error:', err)
      setStatusMessage({
        text: 'Network error — please try again',
        isError: true,
      })
    } finally {
      setIsSending(false)
    }
  }, [replyText, docId, isSending])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSendReply()
      }
    },
    [handleSendReply],
  )

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = useCallback(async () => {
    if (!docId || isSyncing) return
    setIsSyncing(true)
    setStatusMessage({ text: 'Syncing...', isError: false })
    
    try {
      const response = await fetch('/api/sync-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: docId }),
      })
      const result = await response.json()
      
      if (result.success) {
        if (result.newMessages > 0) {
          setLocalMessages(result.conversation)
          setStatusMessage({ text: `Synced ${result.newMessages} new message(s)`, isError: false })
        } else {
          setStatusMessage({ text: 'No new messages', isError: false })
        }
        setTimeout(() => setStatusMessage(null), 3000)
      } else {
        setStatusMessage({ text: `Sync failed: ${result.error}`, isError: true })
      }
    } catch (err) {
      console.error(err)
      setStatusMessage({ text: 'Network error during sync', isError: true })
    } finally {
      setIsSyncing(false)
    }
  }, [docId, isSyncing])

  if (!docId) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          Save this contact first to enable replies.
        </div>
      </div>
    )
  }

  const contactName = (initialData?.name as string) || 'Client'
  const contactEmail = (initialData?.email as string) || ''

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={styles.heading}>
          💬 Conversation with {contactName}
        </div>
        <button 
          onClick={handleSync} 
          disabled={isSyncing}
          style={{
            background: 'none',
            border: '1px solid var(--theme-elevation-200, #ddd)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            cursor: isSyncing ? 'wait' : 'pointer',
            opacity: isSyncing ? 0.5 : 1
          }}
        >
          {isSyncing ? 'Syncing...' : '🔄 Sync Replies'}
        </button>
      </div>

      {contactEmail && (
        <div style={{ fontSize: '11px', color: 'var(--theme-elevation-500, #999)', marginBottom: '8px' }}>
          Replies sent to: {contactEmail}
        </div>
      )}

      {/* Message Thread */}
      <div style={styles.thread} ref={threadRef}>
        {localMessages.length === 0 ? (
          <div style={styles.emptyState}>No messages yet.</div>
        ) : (
          localMessages.map((msg, idx) => {
            const isAdmin = msg.sender === 'admin'
            const date = msg.sentAt
              ? new Date(msg.sentAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''

            return (
              <div
                key={msg.id || idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAdmin ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={styles.messageBubble(isAdmin)}>
                  <div style={styles.senderLabel(isAdmin)}>
                    {isAdmin ? 'You (David)' : contactName}
                  </div>
                  {msg.body}
                  {date && <div style={styles.timestamp(isAdmin)}>{date}</div>}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div style={styles.divider} />

      {/* Reply Box */}
      <textarea
        style={styles.textarea}
        placeholder={`Reply to ${contactName}... (Cmd+Enter to send)`}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending}
      />

      <button
        style={{
          ...styles.sendBtn,
          ...(isSending || !replyText.trim() ? styles.sendBtnDisabled : {}),
        }}
        onClick={handleSendReply}
        disabled={isSending || !replyText.trim()}
      >
        {isSending ? 'Sending...' : 'Send Reply →'}
      </button>

      {statusMessage && (
        <div style={styles.statusMsg(statusMessage.isError)}>
          {statusMessage.text}
        </div>
      )}
    </div>
  )
}
