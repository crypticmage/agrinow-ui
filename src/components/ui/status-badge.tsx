import { cn } from '@/lib/utils'

type Role = 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'
type Status = 'active' | 'closed' | 'pending' | 'inactive'

const roleStyles: Record<Role, string> = {
  admin:   'bg-role-admin   text-role-admin-foreground',
  manager: 'bg-role-manager text-role-manager-foreground',
  farmer:  'bg-role-farmer  text-role-farmer-foreground',
  agent:   'bg-role-agent   text-role-agent-foreground',
  analyst: 'bg-role-analyst text-role-analyst-foreground',
}

const statusStyles: Record<Status, string> = {
  active:   'bg-success/15 text-success',
  pending:  'bg-warning/15 text-warning',
  closed:   'bg-muted text-muted-foreground',
  inactive: 'bg-muted text-muted-foreground',
}

export function RoleBadge({ role }: { role: string }) {
  const styles = roleStyles[role as Role] ?? 'bg-muted text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', styles)}>
      {role}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase() as Status
  const styles = statusStyles[key] ?? 'bg-muted text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', styles)}>
      {status}
    </span>
  )
}
