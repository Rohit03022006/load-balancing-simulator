import { Component } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

// ─── React error boundary (class component required) ─────────────────────────
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorState
            title="Something went wrong"
            message={this.state.error?.message}
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        )
      )
    }
    return this.props.children
  }
}

// ─── Inline error state ───────────────────────────────────────────────────────
export function ErrorState({ title = 'Error', message, onRetry, className = '' }) {
  return (
    <Alert variant="destructive" className={`my-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span>{message || 'An unexpected error occurred. Please try again.'}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0">
            <RotateCcw className="mr-1 h-3 w-3" /> Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// ─── Form field error ─────────────────────────────────────────────────────────
export function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  )
}
