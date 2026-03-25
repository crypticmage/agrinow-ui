"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  useSitesList,
  useMySites,
  useSiteAssignments,
} from "@/hooks/queries/useSites";
import { useMyAssignments, useComments } from "@/hooks/queries/useSiteComments";
import { CommentList } from "@/components/features/field-visits/CommentList";
import { PostForm } from "@/components/features/field-visits/PostForm";
import { useAppStore } from "@/stores/appStore";
import type { Site, SiteAssignment } from "@/hooks/queries/useSites";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  MapPin,
  MessageSquare,
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
  Layers,
  Lock,
  Search,
  UserCheck,
  Calendar,
  Menu,
  Info,
} from "lucide-react";

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SiteItem({
  site,
  selected,
  onClick,
}: {
  site: Site;
  selected: boolean;
  onClick: () => void;
}) {
  const isActive = !site.close_date || new Date(site.close_date) > new Date();
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl px-3 py-2.5 transition-all text-sm border",
        selected
          ? "bg-primary/8 border-primary/25 shadow-sm"
          : "border-transparent hover:bg-muted/70 hover:border-border/50",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "w-2 h-2 rounded-full shrink-0 ring-2",
            isActive
              ? "bg-emerald-500 ring-emerald-500/20"
              : "bg-muted-foreground/30 ring-muted-foreground/10",
          )}
        />
        <span
          className={cn(
            "font-medium truncate text-sm",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {site.site_name}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground truncate mt-1 pl-4">
        {site.site_description}
      </p>
    </button>
  );
}

// ─── All Members Dialog ───────────────────────────────────────────────────────

function AllMembersDialog({
  open,
  onOpenChange,
  assignments,
  siteName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assignments: SiteAssignment[];
  siteName: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = assignments.filter(
    (a) => query === "" || String(a.user_id).includes(query.trim()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Assigned Members
          </DialogTitle>
          <DialogDescription>
            {assignments.length} member{assignments.length !== 1 ? "s" : ""}{" "}
            assigned to{" "}
            <span className="font-medium text-foreground">{siteName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by user ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto space-y-1 -mx-1 px-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground/25 mb-2" />
              <p className="text-sm text-muted-foreground">
                No members match your search
              </p>
            </div>
          ) : (
            filtered.map((a) => {
              const daysAgo = differenceInDays(
                new Date(),
                new Date(a.assigned_date),
              );
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-primary/15">
                    {a.user_id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      User #{a.user_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assigned{" "}
                      {format(new Date(a.assigned_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tooltip,
  color = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tooltip?: string;
  color?: "default" | "emerald" | "blue" | "violet";
}) {
  const iconColors = {
    default: "bg-muted text-muted-foreground",
    emerald: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  };
  const isLong = value.length > 5;
  return (
    <div className="relative rounded-xl border border-border/50 bg-background px-3.5 py-3 space-y-2 group hover:shadow-md hover:border-border transition-all">
      <div
        className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center",
          iconColors[color],
        )}
      >
        <Icon className="h-3 w-3" />
      </div>
      <div>
        <p
          className={cn(
            "font-bold text-foreground leading-tight tracking-tight",
            isLong ? "text-xs" : "text-lg leading-none",
          )}
        >
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
        {sub && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            {sub}
          </p>
        )}
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-popover border text-[11px] text-foreground shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
      {children}
    </p>
  );
}

function SiteInfoPanel({ site }: { site: Site }) {
  const { data: allAssignments = [] } = useSiteAssignments();
  const { data: comments = [] } = useComments(site.id);
  const [membersOpen, setMembersOpen] = useState(false);

  const siteAssignments = allAssignments.filter((a) => a.site_id === site.id);
  const isActive = !site.close_date || new Date(site.close_date) > new Date();
  const uniqueContributors = new Set(comments.map((c) => c.user_id)).size;
  const lastComment =
    comments.length > 0 ? comments[comments.length - 1] : null;
  const lastActivity = lastComment
    ? formatDistanceToNow(new Date(lastComment.timestamp), { addSuffix: true })
    : "—";

  const recentContributors = [
    ...new Map([...comments].reverse().map((c) => [c.user_id, c])).values(),
  ].slice(0, 4);

  const previewAssignments = siteAssignments.slice(0, 5);

  return (
    <>
      <AllMembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        assignments={siteAssignments}
        siteName={site.site_name}
      />

      <aside className="w-80 shrink-0 border-l flex flex-col overflow-hidden bg-muted/5">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b shrink-0 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Layers className="h-3 w-3 text-primary" />
              </div>
              <SectionLabel>Site Details</SectionLabel>
            </div>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="text-[10px] h-5 px-2"
            >
              {isActive ? "Active" : "Closed"}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground text-base leading-snug mb-1.5">
            {site.site_name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {site.site_description}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              icon={MessageSquare}
              label="Total visits"
              value={String(comments.length)}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Contributors"
              value={String(uniqueContributors)}
              color="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Team members"
              value={String(siteAssignments.length)}
              color="violet"
            />
            <StatCard
              icon={Clock}
              label="Last visit"
              value={lastActivity}
              tooltip={
                lastComment
                  ? format(
                      new Date(lastComment.timestamp),
                      "MMM d, yyyy h:mm a",
                    )
                  : undefined
              }
            />
          </div>

          <Separator className="opacity-40" />

          {/* Timeline */}
          <div className="space-y-3">
            <SectionLabel>Timeline</SectionLabel>
            <div className="relative pl-4">
              {/* Vertical connecting line */}
              <div className="absolute left-[1.15rem] top-4 bottom-4 w-px bg-border" />
              <div className="space-y-3">
                <div className="relative flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                  <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background z-10" />
                  <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Started</p>
                    <p className="text-xs font-semibold text-foreground">
                      {format(new Date(site.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="relative flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                  <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-muted-foreground/30 ring-2 ring-background z-10" />
                  <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      End date
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {site.close_date
                        ? format(new Date(site.close_date), "MMM d, yyyy")
                        : "No end date set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          {site.latitude != null && site.longitude != null && (
            <>
              <Separator className="opacity-40" />
              <div className="space-y-3">
                <SectionLabel>Location</SectionLabel>
                <div className="rounded-xl border border-border/50 bg-background p-3.5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-mono text-foreground leading-relaxed">
                        {Number(site.latitude).toFixed(5)}° N
                      </p>
                      <p className="text-[11px] font-mono text-foreground leading-relaxed">
                        {Number(site.longitude).toFixed(5)}° E
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${site.latitude},${site.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    <MapPin className="h-3 w-3" />
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Assigned team — list */}
          <Separator className="opacity-40" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Assigned Team</SectionLabel>
              {siteAssignments.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] px-2 text-primary hover:text-primary"
                  onClick={() => setMembersOpen(true)}
                >
                  View all ({siteAssignments.length})
                </Button>
              )}
            </div>

            {siteAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-5 rounded-xl border border-dashed border-border/60 text-center">
                <UserCheck className="h-6 w-6 text-muted-foreground/30 mb-1.5" />
                <p className="text-xs text-muted-foreground">
                  No team members assigned
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {previewAssignments.map((a) => {
                  const initials = `U${a.user_id}`.slice(0, 2).toUpperCase();
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0 ring-1 ring-primary/15">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">
                          User #{a.user_id}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>
                            {format(new Date(a.assigned_date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {siteAssignments.length > 5 && (
                  <button
                    onClick={() => setMembersOpen(true)}
                    className="w-full text-center text-xs text-primary hover:underline py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    +{siteAssignments.length - 5} more members
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent activity */}
          {recentContributors.length > 0 && (
            <>
              <Separator className="opacity-40" />
              <div className="space-y-3">
                <SectionLabel>Active Members</SectionLabel>
                <div className="space-y-2">
                  {recentContributors.map((c) => {
                    const name = c.first_name
                      ? `${c.first_name}${c.last_name ? " " + c.last_name : ""}`
                      : (c.username ?? `User #${c.user_id}`);
                    const initials = name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <div
                        key={c.user_id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400/25 to-emerald-600/35 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[11px] font-bold shrink-0 ring-1 ring-emerald-500/20">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {name}
                          </p>
                          {c.role && (
                            <p className="text-[10px] text-muted-foreground capitalize">
                              {c.role}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FieldVisitsContent() {
  const searchParams = useSearchParams();
  const siteParam = searchParams.get("site");
  const { currentUser } = useAppStore();
  const isAdminOrManager =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const { data: allSites = [] } = useSitesList();
  const { data: mySites = [] } = useMySites();
  const { data: myAssignments = [] } = useMyAssignments();

  const sites = isAdminOrManager ? allSites : mySites;
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [siteListOpen, setSiteListOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (siteParam && sites.length > 0) {
      const found = sites.find((s) => s.id === parseInt(siteParam));
      if (found) setSelectedSite(found);
    } else if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0]);
    }
  }, [siteParam, sites]);

  // Take over main's scroll/padding so the three-column layout fills the viewport exactly
  useEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    if (!main) return;
    main.setAttribute("data-fullscreen", "true");
    return () => {
      main.removeAttribute("data-fullscreen");
    };
  }, []);

  const relationId = myAssignments.find(
    (a) => a.site_id === selectedSite?.id,
  )?.id;
  const activeSites = sites.filter(
    (s) => !s.close_date || new Date(s.close_date) > new Date(),
  );
  const isSelectedActive = selectedSite
    ? !selectedSite.close_date || new Date(selectedSite.close_date) > new Date()
    : false;

  const siteListContent = (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center px-3">
          <MapPin className="h-6 w-6 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No sites available</p>
        </div>
      ) : (
        sites.map((site) => (
          <SiteItem
            key={site.id}
            site={site}
            selected={selectedSite?.id === site.id}
            onClick={() => {
              setSelectedSite(site);
              setSiteListOpen(false);
            }}
          />
        ))
      )}
    </div>
  );

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: "calc(100vh - 3.5rem)" }}
    >
      {/* ── Mobile: Site list Sheet ── */}
      <Sheet open={siteListOpen} onOpenChange={setSiteListOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 py-3.5 border-b">
            <SheetTitle className="text-sm">Field Visits</SheetTitle>
          </SheetHeader>
          {siteListContent}
        </SheetContent>
      </Sheet>

      {/* ── Mobile: Site details Sheet ── */}
      {selectedSite && (
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent side="right" className="w-80 p-0 overflow-y-auto">
            <SiteInfoPanel site={selectedSite} />
          </SheetContent>
        </Sheet>
      )}

      {/* ── Left: site list (desktop) ── */}
      <aside className="hidden md:flex w-60 shrink-0 border-r flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b shrink-0 bg-muted/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Field Visits
            </span>
            {sites.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] h-4 px-1.5 font-normal"
              >
                {activeSites.length} active
              </Badge>
            )}
          </div>
        </div>
        {siteListContent}
      </aside>

      {/* ── Center: chat ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedSite ? (
          <>
            {/* Fixed header */}
            <div className="px-3 md:px-5 py-3 md:py-3.5 border-b shrink-0 bg-background">
              <div className="flex items-center justify-between gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
                  {/* Mobile: site list toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8 shrink-0"
                    onClick={() => setSiteListOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 ring-2 hidden md:block",
                      isSelectedActive
                        ? "bg-emerald-500 ring-emerald-500/20"
                        : "bg-muted-foreground/30 ring-muted-foreground/10",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-foreground truncate text-sm md:text-base">
                        {selectedSite.site_name}
                      </h2>
                      <Badge
                        variant={isSelectedActive ? "default" : "secondary"}
                        className="text-[10px] h-4 px-1.5 shrink-0"
                      >
                        {isSelectedActive ? "Active" : "Closed"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5 hidden sm:block">
                      {selectedSite.site_description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Since{" "}
                    {format(new Date(selectedSite.created_date), "MMM d, yyyy")}
                  </span>
                  {/* Mobile: site details toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    onClick={() => setDetailsOpen(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable messages only */}
            <CommentList siteId={selectedSite.id} />

            {/* Fixed composer */}
            {relationId != null ? (
              <PostForm siteId={selectedSite.id} relationId={relationId} />
            ) : isAdminOrManager ? (
              <PostForm siteId={selectedSite.id} relationId={0} />
            ) : (
              <div className="border-t bg-muted/10 px-3 md:px-5 py-3 shrink-0 flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  You're not assigned to this site. Contact your manager to post
                  visits.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            {/* Mobile: show site list button when no site selected */}
            <Button
              variant="outline"
              className="md:hidden mb-4"
              onClick={() => setSiteListOpen(true)}
            >
              <Menu className="h-4 w-4 mr-2" />
              Browse Sites
            </Button>
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No site selected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a site from the sidebar to view visits.
            </p>
          </div>
        )}
      </div>

      {/* ── Right: site details (desktop) ── */}
      {selectedSite && (
        <div className="hidden lg:flex h-full">
          <SiteInfoPanel site={selectedSite} />
        </div>
      )}
    </div>
  );
}

export default function FieldVisitsPage() {
  return (
    <Suspense>
      <FieldVisitsContent />
    </Suspense>
  );
}
