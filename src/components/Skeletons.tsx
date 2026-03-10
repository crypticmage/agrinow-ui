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
            <div key={r} className="flex items-center justify-between border-b py-2 last:border-0">
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
