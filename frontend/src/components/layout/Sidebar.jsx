import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Play,
  GitCompare,
  History,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/store/simulationStore'

const NAV_ITEMS = [
  {
    title: 'Simulate',
    href: '/simulate',
    icon: Play,
    accent: 'text-blue-500',
    activeBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    description: 'Run a new simulation',
  },
  {
    title: 'Compare',
    href: '/compare',
    icon: GitCompare,
    accent: 'text-purple-500',
    activeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    description: 'Compare algorithms side-by-side',
  },
  {
    title: 'History',
    href: '/history',
    icon: History,
    accent: 'text-emerald-500',
    activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    description: 'Browse past simulations',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    accent: 'text-orange-500',
    activeBg: 'bg-orange-500/10 dark:bg-orange-500/15',
    description: 'Aggregate analytics',
  },
  {
    title: 'Documentation',
    href: '/docs',
    icon: BookOpen,
    accent: 'text-blue-600',
    activeBg: 'bg-blue-600/10 dark:bg-blue-600/15',
    description: 'Learn concepts & algorithms',
    badge: 'New'
  },
]

function NavItem({ item, collapsed, historyCount }) {
  const location = useLocation()
  const isActive = location.pathname === item.href ||
    (item.href !== '/' && location.pathname.startsWith(item.href))
  const Icon = item.icon

  const badge = item.badge || (item.href === '/history' && historyCount > 0
    ? String(historyCount)
    : null)

  const link = (
    <NavLink
      to={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? cn('text-foreground', item.activeBg)
          : 'text-muted-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full',
          item.accent.replace('text-', 'bg-')
        )} />
      )}

      <Icon className={cn(
        'h-4 w-4 shrink-0 transition-colors',
        isActive ? item.accent : 'text-muted-foreground group-hover:text-foreground'
      )} />

      {!collapsed && (
        <div className="flex flex-1 items-center justify-between overflow-hidden">
          <span className="truncate">{item.title}</span>
          {badge && (
            <Badge
              variant="secondary"
              className="ml-2 h-4 min-w-4 px-1 text-[10px] leading-none"
            >
              {badge}
            </Badge>
          )}
        </div>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-0.5">
          <span className="font-medium">{item.title}</span>
          {item.description && (
            <span className="text-xs text-muted-foreground">{item.description}</span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export const Sidebar = ({ collapsed, onToggle }) => {
  const { history, currentSimulation } = useSimulationStore()
  const historyCount = history?.length ?? 0

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col',
          'border-r border-border bg-background',
          'transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-[60px]' : 'w-60'
        )}
      >
        {collapsed && (
          <div className="flex h-12 items-center justify-center border-b border-border">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {!collapsed && (
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Navigation
            </p>
          )}

          <nav className="space-y-0.5">
            {NAV_ITEMS.map(item => (
              <NavItem
                key={item.href}
                item={item}
                collapsed={collapsed}
                historyCount={historyCount}
              />
            ))}
          </nav>

          {/* Running sim indicator */}
          {currentSimulation && !collapsed && (
            <>
              <Separator className="my-4" />
              <div className="mx-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-xs font-medium text-primary truncate">
                    Simulation running
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground truncate font-mono">
                  {String(currentSimulation.id || '').slice(0, 12)}…
                </p>
              </div>
            </>
          )}
        </div>

        <div className={cn(
          'border-t border-border py-3',
          collapsed ? 'flex justify-center' : 'px-4'
        )}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">v1.0.0</span>
              </div>
              <span className="text-[10px] text-muted-foreground/60">&copy; {new Date().getFullYear()} </span>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}