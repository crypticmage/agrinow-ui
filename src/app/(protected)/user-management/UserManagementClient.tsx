"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { StatCardSkeleton } from "@/components/Skeletons";

import { User } from "@/types/user";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { EditUserDialog } from "./_components/edit-user-dialog";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/queries/users";
import { statCardsConfig } from "@/data/user-management";
import { LayoutGrid, List } from "lucide-react";
import OrganisationChart from "./_components/organisation-chart";

export function UserManagementClient() {
  // TanStack Query will automatically pick up the dehydrated state from HydrationBoundary
  const { data: users = [] as User[], isLoading: queryLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // If we have dehydrated state, queryLoading will be false and users will be populated
  const simulatedLoading = useSimulatedLoading(users.length > 0 ? 0 : 800);
  const loading = simulatedLoading || (queryLoading && users.length === 0);

  const [view, setView] = useState<"table" | "chart">("table");
  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const triggerEdit = (u: User) => {
    setSelectedUser(u);
    setEditOpen(true);
  };
  const triggerDelete = (u: User) => {
    setSelectedUser(u);
    setDeleteOpen(true);
  };

  const handleSaveCreate = (userData: Partial<User>) => {
    createUser.mutate(userData, { onSuccess: () => setCreateOpen(false) });
  };

  const handleSaveEdit = (userData: Partial<User>) => {
    if (!selectedUser) return;
    updateUser.mutate(
      { id: selectedUser.id, payload: userData },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  const performDelete = () => {
    if (!selectedUser) return;
    deleteUser.mutate(selectedUser.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const activeCount = users.filter((u: User) => u.is_active).length;
  const inactiveCount = users.filter((u: User) => !u.is_active).length;
  const statValues = {
    total: users.length,
    active: activeCount,
    inactive: inactiveCount,
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage team members, roles, and access
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("table")}
                className="h-8 gap-2 px-3 cursor-pointer"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={view === "chart" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("chart")}
                className="h-8 gap-2 px-3 cursor-pointer"
              >
                <LayoutGrid className="h-4 w-4" />
                Chart
              </Button>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-0 cursor-pointer shadow-emerald-500/20"
            >
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </div>
        </div>

        {/* Stat Cards - Only show in table view explicitly as requested */}
        {view === "table" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading && users.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              : statCardsConfig.map(
                  ({ key, label, icon: Icon, color, bg, border }) => (
                    <div
                      key={key}
                      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:scale-[1.02]"
                    >
                      <div
                        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${bg} opacity-20 blur-2xl transition-transform group-hover:scale-150`}
                      />

                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {label}
                          </p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <p
                              className={`text-3xl font-bold tracking-tight ${color}`}
                            >
                              {statValues[key as keyof typeof statValues]}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${border} border shadow-inner transition-transform group-hover:rotate-12`}
                        >
                          <Icon
                            className={`h-6 w-6 ${color}`}
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-1.5">
                        <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color.replace("text-", "bg-")} transition-all duration-1000 ease-out`}
                            style={{
                              width: `${(statValues[key as keyof typeof statValues] / (statValues.total || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
          </div>
        )}

        {/* Dynamic Content */}
        <div className={view === "chart" ? "mt-0" : ""}>
          <AnimatePresence mode="wait">
            {view === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-5">
                    {loading && users.length === 0 ? (
                      <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-10 bg-muted/30 rounded-md animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <DataTable
                        columns={columns}
                        data={users}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        onEdit={triggerEdit}
                        onDelete={triggerDelete}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="chart"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <OrganisationChart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateUserDialog
        isOpen={isCreateOpen}
        setOpen={setCreateOpen}
        onSave={handleSaveCreate}
        isLoading={createUser.isPending}
      />
      <EditUserDialog
        isOpen={isEditOpen}
        setOpen={setEditOpen}
        selectedUser={selectedUser}
        onSave={handleSaveEdit}
        isLoading={updateUser.isPending}
      />
      <DeleteUserDialog
        isOpen={isDeleteOpen}
        setOpen={setDeleteOpen}
        selectedUser={selectedUser}
        onDeleteConfirm={performDelete}
        isLoading={deleteUser.isPending}
      />
    </PageTransition>
  );
}
