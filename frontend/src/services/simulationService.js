import { api } from '@/lib/api-client'

export const simulationService = {
  async createSimulation(config) {
    const response = await api.createSimulation(config)
    return response.data
  },
  
  async runSyncSimulation(config) {
    const response = await api.runSyncSimulation(config)
    return response.data
  },
  
  async getSimulation(id) {
    const response = await api.getSimulation(id)
    return response.data
  },
  
  async getSimulationStatus(id) {
    const response = await api.getSimulationStatus(id)
    return response.data
  },
  
  async listSimulations(params) {
    const response = await api.listSimulations(params)
    return response.data
  },
  
  async cancelSimulation(id) {
    const response = await api.cancelSimulation(id)
    return response.data
  },
  
  async getAlgorithms() {
    const response = await api.getAlgorithms()
    return response.data
  },
  
  async compareAlgorithms(configs) {
    const response = await api.compareAlgorithms(configs)
    return response.data
  }
}