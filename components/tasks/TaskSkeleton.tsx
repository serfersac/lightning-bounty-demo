"use client";

const TaskSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
      </div>
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
};

export default TaskSkeleton;
