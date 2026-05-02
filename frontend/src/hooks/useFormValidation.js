import { useState, useCallback } from 'react'

/**
 * Simple form validation hook.
 *
 * Usage:
 *   const { errors, validate, clearError } = useFormValidation(rules)
 *   // rules: { fieldName: (value) => 'error message' | undefined }
 *   const ok = validate(formValues)   // returns true when all pass
 */
export function useFormValidation(rules = {}) {
  const [errors, setErrors] = useState({})

  const validate = useCallback(
    (values) => {
      const next = {}
      let valid = true

      for (const [field, rule] of Object.entries(rules)) {
        const msg = rule(values[field], values)
        if (msg) {
          next[field] = msg
          valid = false
        }
      }

      setErrors(next)
      return valid
    },
    [rules]
  )

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearAll = useCallback(() => setErrors({}), [])

  return { errors, validate, clearError, clearAll }
}

// ─── Pre-built validation rules ───────────────────────────────────────────────
export const rules = {
  required: (label) => (v) =>
    v === undefined || v === null || v === '' ? `${label} is required` : undefined,

  min: (min, label) => (v) =>
    Number(v) < min ? `${label} must be at least ${min}` : undefined,

  max: (max, label) => (v) =>
    Number(v) > max ? `${label} must be at most ${max}` : undefined,

  range: (min, max, label) => (v) => {
    const n = Number(v)
    if (n < min || n > max) return `${label} must be between ${min} and ${max}`
  },
}
