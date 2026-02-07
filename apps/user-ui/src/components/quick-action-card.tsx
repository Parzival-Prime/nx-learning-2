import React from 'react'

export default function QuickActionCard({Icon, title, description}: any) {
  return (
    <div className='bg-neutral-800 p-4 rounded-md shadow-sm border border-neutral-200 flex items-start gap-4'>
        <Icon className="w-6 h-6 text-blue-500 mt-1" />
        <div>
            <h4 className="text-sm font-semibold text-neutral-100 mb-1">{title}</h4>
            <p className="text-xs text-neutral-300">{description}</p>
        </div>
    </div>
  )
}
