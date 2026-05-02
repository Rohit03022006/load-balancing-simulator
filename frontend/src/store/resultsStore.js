import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useResultsStore = create(
  persist(
    (set, get) => ({
      // State
      currentResult: null,
      savedResults: [],
      comparisonResults: [],
      filters: {
        algorithm: null,
        dateRange: null,
        minThroughput: null,
        maxLatency: null
      },
      
      // Actions
      setCurrentResult: (result) => set({ currentResult: result }),
      
      saveResult: (result) => set((state) => {
        const exists = state.savedResults.find(r => r.id === result.id)
        if (exists) {
          return {
            savedResults: state.savedResults.map(r =>
              r.id === result.id ? result : r
            )
          }
        }
        return {
          savedResults: [result, ...state.savedResults].slice(0, 50)
        }
      }),
      
      removeSavedResult: (id) => set((state) => ({
        savedResults: state.savedResults.filter(r => r.id !== id)
      })),
      
      setComparisonResults: (results) => set({ comparisonResults: results }),
      
      clearComparisonResults: () => set({ comparisonResults: [] }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearFilters: () => set({
        filters: {
          algorithm: null,
          dateRange: null,
          minThroughput: null,
          maxLatency: null
        }
      }),
      
      getFilteredResults: () => {
        const { savedResults, filters } = get()
        
        return savedResults.filter(result => {
          if (filters.algorithm && result.algorithm !== filters.algorithm) {
            return false
          }
          
          if (filters.minThroughput && result.throughput < filters.minThroughput) {
            return false
          }
          
          if (filters.maxLatency && result.latency > filters.maxLatency) {
            return false
          }
          
          return true
        })
      },
      
      clearAll: () => set({
        currentResult: null,
        savedResults: [],
        comparisonResults: [],
        filters: {
          algorithm: null,
          dateRange: null,
          minThroughput: null,
          maxLatency: null
        }
      })
    }),
    {
      name: 'results-storage',
      partialize: (state) => ({
        savedResults: state.savedResults,
        filters: state.filters
      })
    }
  )
)