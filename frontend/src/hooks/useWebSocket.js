import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    autoConnect = true
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [reconnectCount, setReconnectCount] = useState(0)
  
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const messageHandlersRef = useRef(new Map())

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = (event) => {
        setIsConnected(true)
        setReconnectCount(0)
        onOpen?.(event)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          
          // Handle typed messages
          if (data.type && messageHandlersRef.current.has(data.type)) {
            messageHandlersRef.current.get(data.type)(data.payload)
          }
          
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
          onMessage?.(event.data)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        onClose?.(event)

        // Attempt reconnection
        if (reconnectCount < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1)
            connect()
          }, reconnectInterval)
        } else if (reconnectAttempts > 0) {
          toast.error('WebSocket connection lost. Please refresh the page.')
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError?.(error)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      onError?.(error)
    }
  }, [url, reconnectAttempts, reconnectInterval, onOpen, onMessage, onClose, onError, reconnectCount])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setReconnectCount(0)
  }, [])

  const sendMessage = useCallback((data) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected')
      return false
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      wsRef.current.send(message)
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }, [])

  const addMessageHandler = useCallback((type, handler) => {
    messageHandlersRef.current.set(type, handler)
  }, [])

  const removeMessageHandler = useCallback((type) => {
    messageHandlersRef.current.delete(type)
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    reconnectCount,
    connect,
    disconnect,
    sendMessage,
    addMessageHandler,
    removeMessageHandler
  }
}