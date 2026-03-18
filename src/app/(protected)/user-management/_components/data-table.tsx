"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Search, CircleDot, ShieldCheck } from "lucide-react";
import { roleConfig, statusConfig } from "@/data/user-management";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit: (data: TData) => void;
  onDelete: (data: TData) => void;
  onAssignSite: (data: TData) => void;
  globalFilter: string;
  setGlobalFilter: (val: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  onAssignSite,
  globalFilter,
  setGlobalFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, rowSelection, globalFilter, columnFilters },
    meta: { onEdit, onDelete, onAssignSite },
    initialState: { pagination: { pageSize: 10 } },
  });

  const activeFilters = table.getState().columnFilters;
  const totalFiltered = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search users…"
              className="pl-8 h-8 bg-muted/40 border-border focus-visible:bg-background text-xs w-full"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            {/* Role Filter */}
            {(() => {
              const column = table.getColumn("role");
              const filteredValues = (column?.getFilterValue() as string[]) || [];

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input border-dashed bg-background hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 gap-2 px-3 cursor-pointer">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                      Role
                      {filteredValues.length > 0 && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex space-x-1">
                            {filteredValues.length > 2 ? (
                              <Badge variant="secondary" className="rounded-sm px-1 font-normal h-5 text-[10px] capitalize">
                                {filteredValues.length} selected
                              </Badge>
                            ) : (
                              filteredValues.map((val) => {
                                const cfg = roleConfig[val] || roleConfig.Farmer;
                                return (
                                  <Badge
                                    variant="outline"
                                    key={val}
                                    className={`rounded-sm px-1.5 font-medium h-5 text-[10px] capitalize ${cfg.bg} ${cfg.color} ${cfg.border} border`}
                                  >
                                    {val}
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {Object.entries(roleConfig).map(([role, config]) => {
                      const isSelected = filteredValues.includes(role);
                      return (
                        <DropdownMenuCheckboxItem
                          key={role}
                          className="gap-2 cursor-pointer text-sm"
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const current = new Set(filteredValues);
                            if (checked) current.add(role);
                            else current.delete(role);
                            column?.setFilterValue(
                              current.size ? Array.from(current) : undefined,
                            );
                          }}
                        >
                          <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                          {config.label}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                    {filteredValues.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => column?.setFilterValue(undefined)}
                          className="justify-center text-center cursor-pointer text-xs"
                        >
                          Clear filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}

            {/* Status Filter */}
            {(() => {
              const column = table.getColumn("is_active");
              const filteredValues = (column?.getFilterValue() as string[]) || [];

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input border-dashed bg-background hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 gap-2 px-3 cursor-pointer">
                      <CircleDot className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                      Status
                      {filteredValues.length > 0 && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex space-x-1">
                            {filteredValues.map((val) => (
                              <Badge variant="secondary" key={val} className="rounded-sm px-1 font-normal h-5 text-[10px] capitalize">
                                {val}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[160px]">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const isSelected = filteredValues.includes(status);
                      return (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const newVals = checked
                              ? [...filteredValues, status]
                              : filteredValues.filter((v) => v !== status);
                            column?.setFilterValue(newVals.length ? newVals : undefined);
                          }}
                        >
                          <div className="flex items-center gap-2 capitalize">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {status}
                          </div>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                    {filteredValues.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => column?.setFilterValue(undefined)}
                          className="justify-center text-center cursor-pointer text-xs"
                        >
                          Clear filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
          </div>
        </div>

        {(activeFilters.length > 0 || globalFilter) && (
          <Badge variant="secondary" className="ml-auto sm:ml-0 h-6 text-xs font-normal">
            {totalFiltered} of {data.length} users
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${
                    idx % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground italic">
                  No users yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              totalFiltered
            )}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalFiltered}</span> users
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 hidden sm:flex cursor-pointer"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-xs text-muted-foreground px-2 min-w-[80px] text-center">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 hidden sm:flex cursor-pointer"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
