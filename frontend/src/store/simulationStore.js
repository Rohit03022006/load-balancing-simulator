import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LOAD_BALANCING_ALGORITHMS } from '@/utils/constants'

export const useSimulationStore = create(
  persist(
    (set, get) => ({
      // State
      config: {
        algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
        requestRate: 50,
        numServers: 3,
        serverCapacity: 20,
        duration: 30,
        timeStep: 0.1,
        enableBurst: false,
        burstMultiplier: 3,
        burstDuration: 5,
        burstInterval: 30
      },
      
      algorithms: [],
      currentSimulation: null,
      results: [],
      history: [],
      
      // Actions
      updateConfig: (updates) => set((state) => ({
        config: { ...state.config, ...updates }
      })),
      
      setAlgorithms: (algorithms) => set({ algorithms }),
      
      setCurrentSimulation: (simulation) => set({ currentSimulation: simulation }),
      
      setHistory: (history) => set({ history }),
      
      addResult: (result) => set((state) => ({
        results: [result, ...state.results].slice(0, 50),
        history: [result.simulation, ...state.history.filter(s => s.id !== result.simulation.id)].slice(0, 100)
      })),
      
      clearResults: () => set({ results: [] }),
      
      reset: () => set({
        config: {
          algorithm: LOAD_BALANCING_ALGORITHMS.ROUND_ROBIN,
          requestRate: 50,
          numServers: 3,
          serverCapacity: 20,
          duration: 30,
          timeStep: 0.1,
          enableBurst: false
        },
        currentSimulation: null
      })
    }),
    {
      name: 'simulation-storage',
      partialize: (state) => ({
        history: state.history,
        config: state.config
      })
    }
  )
)