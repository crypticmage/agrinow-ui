import { useState, useRef, useCallback } from "react";
import { useOrgChart } from "@/hooks/queries/org-chart";
import {
  OrgMember,
  OrgRole,
  OrgRoleConfig,
  OrgNodeProps,
  RoleBadgeProps,
  ReportsBadgeProps,
  SubtreeRowProps,
} from "@/types/organisation-chart";
import { ORG_ROLE_CONFIG, ORG_ROLE_ICONS } from "@/data/organisation-chart";
import { Skeleton } from "@/components/ui/skeleton";

// ── Helpers ───────────────────────────────────────────────

function normalizeRole(role: string): OrgRole {
  if (!role) return "Analyst";
  const normalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  return (normalized as OrgRole) in ORG_ROLE_CONFIG
    ? (normalized as OrgRole)
    : "Analyst";
}

function getInitials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function countDescendants(node: OrgMember): number {
  if (!node.subordinates?.length) return 0;
  return node.subordinates.reduce((acc, s) => acc + 1 + countDescendants(s), 0);
}

// OrgNode
function OrgNode({ node, depth = 0 }: OrgNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);

  const role = normalizeRole(node.role);
  const cfg = ORG_ROLE_CONFIG[role];
  const hasChildren = node.subordinates?.length > 0;
  const descendants = countDescendants(node);
  const isRoot = depth === 0;
  const cardW = isRoot ? 208 : 176;

  const cardShadow = hovered
    ? `0 0 0 2px ${cfg.ringColor}, 0 8px 20px ${cfg.shadowColor}`
    : "0 1px 4px rgba(0,0,0,0.07)";

  return (
    <div className="flex flex-col items-center">
      {/* Vertical connector from parent */}
      {depth > 0 && (
        <div
          className="w-0.5 bg-slate-300 dark:bg-slate-500"
          style={{ height: 28 }}
        />
      )}

      {/* Card wrapper */}
      <div
        style={{ width: cardW }}
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => hasChildren && setExpanded((v) => !v)}
      >
        {/* Card shell */}
        <div
          className="rounded-2xl overflow-hidden cursor-pointer select-none
            bg-white dark:bg-slate-800
            border-2 border-slate-300 dark:border-slate-600 shadow-sm"
          style={{
            boxShadow: cardShadow,
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            transition: "box-shadow 0.18s ease, transform 0.18s ease",
          }}
        >
          {/* Coloured top strip */}
          <div className={`h-1.5 bg-linear-to-r ${cfg.gradient}`} />

          <div className="px-3.5 pt-3 pb-3.5">
            {/* Row: avatar + role badge */}
            <div className="flex items-start justify-between mb-2.5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={`flex items-center justify-center rounded-xl font-bold text-white bg-linear-to-br ${cfg.gradient}`}
                  style={{
                    width: isRoot ? 44 : 38,
                    height: isRoot ? 44 : 38,
                    fontSize: isRoot ? 15 : 13,
                    boxShadow: `0 2px 8px ${cfg.shadowColor}`,
                  }}
                >
                  {getInitials(node.first_name, node.last_name)}
                </div>
                {/* Status dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full
                    border-2 border-white dark:border-slate-800 ${cfg.dot}`}
                />
              </div>

              {/* Role badge */}
              <RoleBadge role={node.role} cfg={cfg} />
            </div>

            {/* Name */}
            <p
              className={`font-bold leading-tight text-slate-900 dark:text-slate-100 ${isRoot ? "text-base" : "text-sm"}`}
            >
              {node.first_name} {node.last_name}
            </p>

            {/* Username */}
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              @{node.username}
            </p>

            {/* Stats */}
            {hasChildren && (
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Reports
                </span>
                <ReportsBadge count={node.subordinates.length} cfg={cfg} />
                {descendants > node.subordinates.length && (
                  <>
                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                      Total
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                      {descendants}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expand / collapse button */}
        {hasChildren && (
          <button
            className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10
              flex items-center justify-center w-7 h-7 rounded-full text-white
              border-2 border-white dark:border-slate-900
              shadow-md bg-linear-to-br ${cfg.gradient}
              hover:scale-110 transition-transform duration-150`}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Collapse" : "Expand"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-3 h-3"
              style={{
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.22s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Children subtree */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          {/* Stem from toggle button down to horizontal bar */}
          <div
            className="w-0.5 bg-slate-300 dark:bg-slate-500"
            style={{ height: 20 }}
          />
          <SubtreeRow nodes={node.subordinates} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}

// RoleBadge
function RoleBadge({ role, cfg }: RoleBadgeProps) {
  const normalizedRole = normalizeRole(role);
  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full leading-none
        ${cfg.badgeLight}`}
    >
      {ORG_ROLE_ICONS[normalizedRole]}
      {normalizedRole}
    </span>
  );
}

// ReportsBadge
function ReportsBadge({ count, cfg }: ReportsBadgeProps) {
  return (
    <span
      className={`text-xs font-bold rounded-full px-1.5 py-0 leading-5 ${cfg.badgeLight}`}
    >
      {count}
    </span>
  );
}

// SubtreeRow
function SubtreeRow({ nodes, depth }: SubtreeRowProps) {
  const GAP = depth === 1 ? 24 : 16;

  // Single child — no horizontal bar needed
  if (nodes.length === 1) {
    return <OrgNode node={nodes[0]} depth={depth} />;
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Horizontal connector bar */}
      <div className="flex w-full" style={{ gap: GAP }}>
        {nodes.map((child, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === nodes.length - 1;
          return (
            <div
              key={child.id}
              className="flex-1 flex items-center justify-center"
            >
              {/* left arm */}
              <div
                className={`flex-1 h-px ${isFirst ? "opacity-0" : "bg-slate-300 dark:bg-slate-600"}`}
              />
              {/* centre tick */}
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
              {/* right arm */}
              <div
                className={`flex-1 h-px ${isLast ? "opacity-0" : "bg-slate-300 dark:bg-slate-600"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Child nodes row */}
      <div className="flex items-start" style={{ gap: GAP }}>
        {nodes.map((child) => (
          <OrgNode key={child.id} node={child} depth={depth} />
        ))}
      </div>
    </div>
  );
}

// Legend
function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {(Object.entries(ORG_ROLE_CONFIG) as [OrgRole, OrgRoleConfig][]).map(
        ([role, cfg]) => (
          <div
            key={role}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
            ${cfg.pillLight} ${cfg.pillDark}`}
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
            {role}
          </div>
        ),
      )}
    </div>
  );
}

// Main Component
export default function OrganisationChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const { data: orgData, isLoading, error } = useOrgChart();

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setDragging(true);
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - lastPos.current.x) / zoom;
      const dy = (e.clientY - lastPos.current.y) / zoom;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging, zoom],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      // Prevent page scrolling while dragging the chart
      if (e.cancelable) e.preventDefault();
      const dx = (e.touches[0].clientX - lastPos.current.x) / zoom;
      const dy = (e.touches[0].clientY - lastPos.current.y) / zoom;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    [isDragging, zoom],
  );

  const onMouseUp = useCallback(() => setDragging(false), []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Zoom toward mouse position could be better, but simple zoom for now
    setZoom((z) => Math.min(1.6, Math.max(0.4, z - e.deltaY * 0.001)));
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const totalMembers = orgData ? 1 + countDescendants(orgData) : 0;

  return (
    <div className="h-[calc(100vh-180px)] min-h-125 flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300 rounded-xl overflow-hidden border-2 border-slate-300/80 dark:border-slate-800 shadow-lg">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Organization Chart
          </h1>
          <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
            {isLoading
              ? "Loading team..."
              : `${totalMembers} team members across all levels`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom strip */}
          <div
            className="flex items-center gap-1 rounded-xl p-1
            bg-slate-100 dark:bg-slate-800
            border border-slate-200 dark:border-slate-700"
          >
            <button
              onClick={() =>
                setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))
              }
              className="h-7 w-7 rounded-lg flex items-center justify-center text-base font-medium transition-colors
                bg-white dark:bg-slate-700 shadow-sm
                text-slate-600 dark:text-slate-300
                hover:text-slate-900 dark:hover:text-white"
            >
              −
            </button>
            <span className="text-xs font-semibold w-12 text-center tabular-nums text-slate-600 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() =>
                setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))
              }
              className="h-7 w-7 rounded-lg flex items-center justify-center text-base font-medium transition-colors
                bg-white dark:bg-slate-700 shadow-sm
                text-slate-600 dark:text-slate-300
                hover:text-slate-900 dark:hover:text-white"
            >
              +
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={resetView}
            className="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors
              bg-slate-100 dark:bg-slate-800
              hover:bg-slate-200 dark:hover:bg-slate-700
              text-slate-700 dark:text-slate-300
              border border-slate-200 dark:border-slate-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </header>

      {/* Legend */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-2.5 shrink-0">
        <Legend />
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden relative touch-none"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
        onWheel={onWheel}
      >
        {/* Background effects */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(148,163,184,0.4) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-50/50 to-white/0 dark:from-transparent dark:to-transparent"
        />
        {/* Subtle radial glow in light mode */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] dark:hidden" />

        {/* Chart */}
        <div
          className="absolute inset-0 flex items-start justify-center pt-10"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
            willChange: "transform",
          }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-30 w-52 rounded-2xl" />
              <div className="flex gap-6">
                <Skeleton className="h-25 w-44 rounded-2xl" />
                <Skeleton className="h-25 w-44 rounded-2xl" />
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10 text-center">
              <p className="font-semibold text-lg">
                Failed to load organization chart
              </p>
              <p className="text-sm">
                Please try again later or contact support.
              </p>
            </div>
          ) : orgData ? (
            <OrgNode node={orgData} depth={0} />
          ) : (
            <p className="text-slate-500">No data available</p>
          )}
        </div>

        {/* Hint */}
        <p
          className="absolute bottom-4 right-4 text-xs select-none
          text-slate-400 dark:text-slate-500
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
          px-3 py-1.5 rounded-full
          border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          Drag to pan · Scroll to zoom · Click cards to collapse
        </p>
      </div>
    </div>
  );
}
