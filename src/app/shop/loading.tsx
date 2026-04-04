import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 bg-gray-200 animate-pulse rounded w-24 mb-2" />
      <div className="h-4 bg-gray-200 animate-pulse rounded w-32 mb-8" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-56 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
