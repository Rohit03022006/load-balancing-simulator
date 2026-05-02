import { useState, useEffect, useRef, useCallback } from 'react'

export const usePolling = (callback, interval = 5000, options = {}) => {
  const {
    immediate = true,
    enabled = true,
    onError,
    maxAttempts = Infinity
  } = options

  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState(null)
  const [attempts, setAttempts] = useState(0)
  
  const intervalRef = useRef(null)
  const callbackRef = useRef(callback)
  const isMountedRef = useRef(true)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  const start = useCallback(() => {
    if (!enabled) return
    if (attempts >= maxAttempts) {
      stop()
      return
    }

    stop()
    setIsPolling(true)

    const poll = async () => {
      if (!isMountedRef.current) return

      try {
        await callbackRef.current()
        setError(null)
        setAttempts(prev => prev + 1)
      } catch (err) {
        setError(err)
        onError?.(err)
      }
    }

    if (immediate) {
      poll()
    }

    intervalRef.current = setInterval(poll, interval)
  }, [enabled, interval, immediate, maxAttempts, attempts, stop, onError])

  const reset = useCallback(() => {
    setAttempts(0)
    setError(null)
    if (enabled) {
      start()
    }
  }, [enabled, start])

  useEffect(() => {
    isMountedRef.current = true
    
    if (enabled) {
      start()
    }

    return () => {
      isMountedRef.current = false
      stop()
    }
  }, [enabled, start, stop])

  return {
    isPolling,
    error,
    attempts,
    start,
    stop,
    reset
  }
}