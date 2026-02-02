import React from 'react';

export default function StateCard({ title, count, Icon }: any) {
  return (
    <div className="bg-white p-5 px-10 rounded-md shadow-sm border border-neutral-100 flex items-center justify-between">
      <div>
        <h3 className="text-sm text-neutral-500">{title}</h3>
        <p className="text-2xl font-bold text-neutral-800">{count}</p>
      </div>
      <Icon className="w-10 h-10 text-blue-500" />
    </div>
  );
}
