import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],
      modals: {
        settings: false,
        export: false,
        confirm: false
      },
      chartPreferences: {
        showGrid: true,
        showLegend: true,
        animationDuration: 300,
        colorScheme: 'default'
      },
      tablePreferences: {
        pageSize: 10,
        sortBy: null,
        sortOrder: 'asc'
      },
      
      // Theme Actions
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      },
      
      // Sidebar Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      // Modal Actions
      openModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: true }
      })),
      
      closeModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: false }
      })),
      
      toggleModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: !state.modals[modalName] }
      })),
      
      // Notification Actions
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
          },
          ...state.notifications
        ].slice(0, 50)
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Chart Preferences Actions
      updateChartPreferences: (preferences) => set((state) => ({
        chartPreferences: { ...state.chartPreferences, ...preferences }
      })),
      
      // Table Preferences Actions
      updateTablePreferences: (preferences) => set((state) => ({
        tablePreferences: { ...state.tablePreferences, ...preferences }
      })),
      
      // Reset
      resetUI: () => set({
        theme: 'light',
        sidebarCollapsed: false,
        modals: {
          settings: false,
          export: false,
          confirm: false
        },
        chartPreferences: {
          showGrid: true,
          showLegend: true,
          animationDuration: 300,
          colorScheme: 'default'
        },
        tablePreferences: {
          pageSize: 10,
          sortBy: null,
          sortOrder: 'asc'
        }
      })
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        chartPreferences: state.chartPreferences,
        tablePreferences: state.tablePreferences
      })
    }
  )
)