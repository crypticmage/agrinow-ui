import { cn } from '@/lib/utils'

type Role = 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'
type Status = 'active' | 'closed' | 'pending' | 'inactive'

const roleStyles: Record<Role, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  farmer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  agent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  analyst: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

const statusStyles: Record<Status, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
}

export function RoleBadge({ role }: { role: string }) {
  const styles = roleStyles[role as Role] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', styles)}>
      {role}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase() as Status
  const styles = statusStyles[key] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', styles)}>
      {status}
    </span>
  )
}
