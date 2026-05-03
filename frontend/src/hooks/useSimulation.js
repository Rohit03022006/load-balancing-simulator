import { useState, useCallback, useRef } from 'react'
import { simulationService } from '@/services/simulationService'
import { useSimulationStore } from '@/store/simulationStore'

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  
  const { addResult } = useSimulationStore()
  
  const startSimulation = useCallback(async (config) => {
    setIsRunning(true)
    setError(null)
    setProgress(0)
    
    try {
      // Create simulation
      const simulation = await simulationService.createSimulation(config)
      
      // Start progress tracking
      const startTime = Date.now()
      const duration = config.duration * 1000
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const calculatedProgress = Math.min((elapsed / duration) * 100, 99)
        setProgress(calculatedProgress)
      }, 100)
      
      // Wait for completion
      const pollForResults = async () => {
        let attempts = 0
        const maxAttempts = (config.duration * 1000) / 1000 + 30
        
        while (attempts < maxAttempts) {
          try {
            const result = await simulationService.getSimulation(simulation.simulation_id)
            
            if (result.simulation.status === 'completed' && result.result) {
              clearInterval(progressInterval)
              setProgress(100)
              setIsRunning(false)
              addResult(result)
              return result
            }
            
            if (result.simulation.status === 'failed') {
              clearInterval(progressInterval)
              setIsRunning(false)
              throw new Error(result.simulation.error_message || 'Simulation failed')
            }
          } catch (error) {
            console.error('Polling error:', error)
            clearInterval(progressInterval) // Cleanup on error
            throw error
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          attempts++
        }
        
        clearInterval(progressInterval) // Cleanup on timeout
        throw new Error('Simulation timeout')
      }
      
      const result = await pollForResults()
      return result.simulation.id
      
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsRunning(false)
    }
  }, [addResult])
  
  const stopSimulation = useCallback(async (simulationId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    if (simulationId) {
      await simulationService.cancelSimulation(simulationId)
    }
    
    setIsRunning(false)
    setProgress(0)
  }, [])
  
  return {
    isRunning,
    progress,
    error,
    startSimulation,
    stopSimulation
  }
}