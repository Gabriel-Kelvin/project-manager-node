import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

// Project card skeleton
export const ProjectCardSkeleton = () => (
  <div className="p-4 border border-gray-200 rounded-lg">
    <div className="flex items-start justify-between mb-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-16" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-3" />
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-2 w-16" />
    </div>
  </div>
);

// Task row skeleton
export const TaskRowSkeleton = () => (
  <div className="p-4 border border-gray-200 rounded-lg">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-start gap-3 flex-1">
        <Skeleton className="w-4 h-4 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="w-4 h-4" />
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = () => (
  <div className="p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="h-64 flex items-center justify-center">
      <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-5 w-16" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-8" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-8" />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-2 w-16" />
      </div>
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-20" />
    </td>
  </tr>
);

// KPI card skeleton
export const KPICardSkeleton = () => (
  <div className="p-6 border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <Skeleton className="w-6 h-6" />
    </div>
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);

// Activity feed skeleton
export const ActivityFeedSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-start gap-3 p-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    ))}
  </div>
);

// Navigation skeleton
export const NavigationSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-center gap-3 p-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton = () => (
  <div className="space-y-4">
    <div>
      <Skeleton className="h-4 w-16 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// List skeleton
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, index) => (
      <div key={index} className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);

export default Skeleton;
