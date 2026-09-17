'use client';

export default function ProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-md border border-gray-200 p-4 flex flex-col animate-pulse"
        >
          {/* Image placeholder */}
          <div className="h-48 bg-gray-200 rounded mb-3" />
          {/* Title */}
          <div className="h-3.5 bg-gray-200 rounded w-full mb-1.5" />
          <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
          {/* Brand */}
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
          {/* Stars */}
          <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
          {/* Price */}
          <div className="h-5 bg-gray-200 rounded w-20 mb-2" />
          {/* Prime */}
          <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
          {/* Button */}
          <div className="h-8 bg-gray-200 rounded-full" />
        </div>
      ))}
    </>
  );
}
