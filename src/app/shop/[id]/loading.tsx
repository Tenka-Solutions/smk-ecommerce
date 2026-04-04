import Skeleton from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Skeleton className="h-80 rounded-2xl" />
        <div className="space-y-4 flex flex-col justify-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
