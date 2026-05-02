import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (num) => {
  const n = Number(num)
  if (isNaN(n)) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K'
  return n.toFixed(2)
}

export const formatLatency = (ms) => {
  const n = Number(ms)
  if (isNaN(n)) return '0 ms'
  if (n < 0.001) return '0 ms'
  if (n < 1) return (n * 1000).toFixed(0) + ' μs'
  if (n < 1000) return n.toFixed(2) + ' ms'
  return (n / 1000).toFixed(2) + ' s'
}

export const formatPercentage = (value) => {
  const n = Number(value)
  if (isNaN(n)) return '0%'
  return n.toFixed(1) + '%'
}

export const formatThroughput = (value) => {
  const n = Number(value)
  if (isNaN(n)) return '0 req/s'
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M req/s'
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K req/s'
  return n.toFixed(2) + ' req/s'
}

export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '0s'
  
  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-500',
    running: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}