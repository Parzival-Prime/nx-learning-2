import React from 'react';

export default function AllEventsIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-calendar1-icon lucide-calendar-1"
    >
      <path d="M11 14h1v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </svg>
  );
}
