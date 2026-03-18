"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { MapPin, X, Loader2, Search, CheckCircle2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import {
  useSitesList,
  useUserSiteAssignments,
  useAssignUser,
  useRemoveSiteAssignment,
} from "@/hooks/queries/useSites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssignSiteDialogProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  user: User | null;
}

export function AssignSiteDialog({ isOpen, setOpen, user }: AssignSiteDialogProps) {
  const [search, setSearch] = useState("");

  const { data: allSites = [] } = useSitesList();
  const { data: assignments = [], isLoading: loadingAssignments } = useUserSiteAssignments(
    isOpen ? (user?.id ?? null) : null
  );

  const assignMutation = useAssignUser();
  const removeMutation = useRemoveSiteAssignment();

  const assignedSiteIds = useMemo(() => new Set(assignments.map((a) => a.site_id)), [assignments]);

  const availableSites = useMemo(
    () =>
      allSites
        .filter((s) => !assignedSiteIds.has(s.id))
        .filter((s) => s.site_name.toLowerCase().includes(search.toLowerCase())),
    [allSites, assignedSiteIds, search]
  );

  const handleAssign = async (siteId: number) => {
    if (!user) return;
    try {
      await assignMutation.mutateAsync({
        user_id: user.id,
        site_id: siteId,
        assigned_date: format(new Date(), "yyyy-MM-dd"),
      });
      toast.success("Site assigned successfully.");
    } catch {
      toast.error("Failed to assign site.");
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!user) return;
    try {
      await removeMutation.mutateAsync({ assignmentId, userId: user.id });
      toast.success("Assignment removed.");
    } catch {
      toast.error("Failed to remove assignment.");
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] flex flex-col max-h-[85vh] gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            Assign Sites
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-0.5">
            Managing access for{" "}
            <span className="font-medium text-foreground">
              {user.first_name} {user.last_name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Assigned Sites Section */}
          <div className="px-5 py-3 border-b shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Sites
              </p>
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {assignments.length}
              </Badge>
            </div>

            {loadingAssignments ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-2.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  No sites assigned — user cannot see field visits or sites.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {assignments.map((a) => (
                  <Badge
                    key={a.id}
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-primary/8 text-primary border border-primary/20 hover:bg-primary/12 transition-colors"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    {a.site_name ?? `Site #${a.site_id}`}
                    <button
                      onClick={() => handleRemove(a.id)}
                      disabled={removeMutation.isPending}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer disabled:opacity-40"
                      aria-label={`Remove ${a.site_name ?? "site"}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Available Sites Section */}
          <div className="flex flex-col flex-1 min-h-0 px-5 py-3">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Available Sites
              </p>
              <span className="text-xs text-muted-foreground">{availableSites.length} sites</span>
            </div>

            {/* Search */}
            <div className="relative mb-2 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search sites…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>

            {/* Sites List */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-border/50 bg-muted/20">
              {availableSites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {search ? "No sites match your search" : "All sites are already assigned"}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-xs text-primary hover:underline mt-1 cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {availableSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => handleAssign(site.id)}
                      disabled={assignMutation.isPending}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-left",
                        "hover:bg-primary/5 active:bg-primary/10 transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                        "group"
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted border border-border/50 group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{site.site_name}</p>
                        {site.latitude && site.longitude && (
                          <p className="text-xs text-muted-foreground truncate">
                            {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {assignMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
