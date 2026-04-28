
import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button'; // Assuming a Button component exists

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
      <svg
        className="w-24 h-24 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <p className="text-lg font-semibold mb-4">You don't have any projects yet.</p>
      <Link href="/projects/new" passHref>
        <Button>Create Project</Button>
      </Link>
    </div>
  );
};

export default EmptyState;
