import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton style={{ height }} className="w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({
  title,
  rows = 5,
  cols = 5,
}: {
  title: string;
  rows?: number;
  cols?: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="flex items-center justify-between border-b py-2 last:border-0"
            >
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={c} className="h-4 w-16" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 max-w-[70%]">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="p-3">
        <Skeleton className="h-4 w-4" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </td>
      <td className="p-3 hidden md:table-cell">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="p-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="p-3 hidden sm:table-cell">
        <Skeleton className="h-3 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-8 w-8 rounded" />
      </td>
    </tr>
  );
}

export function MapSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="w-full h-125 rounded-lg" />
      </CardContent>
    </Card>
  );
}
