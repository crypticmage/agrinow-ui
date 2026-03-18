'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/ui/data-table'
import { format, parseISO } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { RefreshCw, Monitor, LogIn, LogOut, Key, UserCog, Trash2, AlertCircle, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/appStore'
import { toast } from 'sonner'

interface UserLog {
  id: number
  user_id: number | null
  username: string | null
  first_name: string | null
  last_name: string | null
  action: string
  description: string | null
  ip_address: string | null
  timestamp: string
}

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  login:            { label: 'Login',           icon: LogIn,      color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  logout:           { label: 'Logout',          icon: LogOut,     color: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-100 dark:bg-slate-800/60' },
  password_changed: { label: 'Password change', icon: Key,        color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30' },
  user_updated:     { label: 'User updated',    icon: UserCog,    color: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-900/30' },
  user_deleted:     { label: 'User deleted',    icon: Trash2,     color: 'text-rose-700 dark:text-rose-400',       bg: 'bg-rose-100 dark:bg-rose-900/30' },
  failed_login:     { label: 'Failed login',    icon: AlertCircle,color: 'text-rose-700 dark:text-rose-400',       bg: 'bg-rose-100 dark:bg-rose-900/30' },
  force_logout:     { label: 'Force logout',    icon: ShieldOff,  color: 'text-purple-700 dark:text-purple-400',   bg: 'bg-purple-100 dark:bg-purple-900/30' },
}

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action] ?? {
    label: action.replace(/_/g, ' '),
    icon: Monitor,
    color: 'text-muted-foreground',
    bg: 'bg-muted/60',
  }
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  )
}

function ForceLogoutButton({ userId, username, currentUsername }: { userId: number; username: string | null; currentUsername: string | undefined }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => api.post(`/users/${userId}/force-logout`),
    onSuccess: () => {
      toast.success(`${username ?? `User #${userId}`} has been force-logged out.`)
      qc.invalidateQueries({ queryKey: ['activity-log'] })
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? 'Force logout failed.')
    },
  })

  // Don't show the button for the currently logged-in admin
  if (username === currentUsername) return null

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
      disabled={mutation.isPending}
      onClick={() => {
        if (confirm(`Force logout ${username ?? `user #${userId}`}? Their current session will be terminated immediately.`)) {
          mutation.mutate()
        }
      }}
    >
      <ShieldOff className="h-3 w-3 mr-1" />
      Force Logout
    </Button>
  )
}

export default function ActivityLogPage() {
  const { currentUser } = useAppStore()
  const isAdmin = currentUser?.role === 'admin'

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['activity-log'],
    queryFn: async () => {
      const { data } = await api.get<UserLog[]>('/users/logs?limit=200')
      return data
    },
    refetchInterval: 30_000,
  })

  const columns: ColumnDef<UserLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Time',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
          {format(parseISO(row.getValue('timestamp')), 'MMM d, yyyy HH:mm:ss')}
        </span>
      ),
    },
    {
      accessorKey: 'username',
      header: 'User',
      cell: ({ row }) => {
        const username = row.getValue('username') as string | null
        const { first_name, last_name, user_id: uid } = row.original
        const fullName = first_name ? `${first_name} ${last_name ?? ''}`.trim() : null
        return (
          <div className="flex items-center gap-2">
            <div>
              {fullName && <p className="text-sm font-medium">{fullName}</p>}
              {username && (
                <p className={`text-xs text-muted-foreground ${fullName ? '' : 'text-sm font-medium text-foreground'}`}>
                  @{username}
                </p>
              )}
              {!fullName && !username && <p className="text-sm text-muted-foreground">Unknown</p>}
            </div>
            {isAdmin && uid && (
              <ForceLogoutButton
                userId={uid}
                username={username}
                currentUsername={currentUser?.username}
              />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => <ActionBadge action={row.getValue('action')} />,
    },
    {
      accessorKey: 'description',
      header: 'Details',
      cell: ({ row }) => {
        const desc = row.getValue('description') as string | null
        return desc
          ? <span className="text-xs text-muted-foreground max-w-xs truncate block">{desc}</span>
          : <span className="text-xs text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }) => {
        const ip = row.getValue('ip_address') as string | null
        return ip
          ? <span className="text-xs font-mono text-muted-foreground">{ip}</span>
          : <span className="text-xs text-muted-foreground">—</span>
      },
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Activity Log"
        subtitle={`${logs.length} entries · auto-refreshes every 30s`}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        filterPlaceholder="Search by user, action, IP..."
        pageSize={25}
      />
    </div>
  )
}
