"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { formatUserName, formatUsername } from "@/types/user";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

import { roleConfig, avatarColors, statusConfig } from "@/data/user-management";

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="h-8 px-2 -ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
    </Button>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    id: "name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
      <SortHeader
        label="User"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => {
      const firstName = row.original.first_name || "";
      const lastName = row.original.last_name || "";
      const fullName = formatUserName(firstName, lastName);
      const username = formatUsername(row.original.username);
      const initials =
        `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
      const colorClass = getAvatarColor(fullName);
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-8 w-8 rounded-full ${colorClass} flex items-center justify-center shrink-0`}
          >
            <span className="text-xs font-semibold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight truncate">
              {fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{username}
            </p>
          </div>
        </div>
      );
    },
    sortingFn: (a, b) => {
      const nameA = `${a.original.first_name} ${a.original.last_name}`;
      const nameB = `${b.original.first_name} ${b.original.last_name}`;
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortHeader
        label="Email"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Role
      </span>
    ),
    filterFn: (row, id, value: string[]) => {
      if (!value || value.length === 0) return true;
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const cfg = roleConfig[role.toLowerCase()] ?? roleConfig.farmer;
      const Icon = cfg.icon;
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 text-xs font-medium px-2 py-0.5 ${cfg.bg} ${cfg.color} ${cfg.border} border shadow-xs`}
        >
          <Icon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Status
      </span>
    ),
    filterFn: (row, id, value: string[]) => {
      if (!value || value.length === 0) return true;
      const statusStr = row.getValue(id) ? "active" : "inactive";
      return value.includes(statusStr);
    },
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      const statusKey = isActive ? "active" : "inactive";
      const cfg = statusConfig[statusKey];
      return (
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]"}`}
          />
          <span className={`text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "emp_type",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Type
      </span>
    ),
    cell: ({ row }) => {
      const type = row.getValue("emp_type") as string;
      if (!type) return <span className="text-sm text-muted-foreground">—</span>;

      const label = type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
      return (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "hire_date",
    header: ({ column }) => (
      <SortHeader
        label="Hired"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    sortingFn: (a, b) => {
      const dA = a.original.hire_date
        ? new Date(a.original.hire_date).getTime()
        : 0;
      const dB = b.original.hire_date
        ? new Date(b.original.hire_date).getTime()
        : 0;
      return dA - dB;
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("hire_date") as string;
      if (!dateStr)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(dateStr), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    accessorKey: "relive_date",
    header: ({ column }) => (
      <SortHeader
        label="Relieved"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    sortingFn: (a, b) => {
      const dA = a.original.relive_date
        ? new Date(a.original.relive_date).getTime()
        : 0;
      const dB = b.original.relive_date
        ? new Date(b.original.relive_date).getTime()
        : 0;
      return dA - dB;
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("relive_date") as string;
      if (!dateStr)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(dateStr), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as {
        onEdit: (user: User) => void;
        onDelete: (user: User) => void;
        onAssignSite: (user: User) => void;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => meta?.onEdit(user)}
                className="cursor-pointer gap-2 text-sm"
              >
                <Edit className="h-3.5 w-3.5 text-blue-500" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => meta?.onAssignSite(user)}
                className="cursor-pointer gap-2 text-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                Assign Sites
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => meta?.onDelete(user)}
                className="cursor-pointer gap-2 text-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
