"use client"

import { useQueryClient } from '@tanstack/react-query';
import StateCard from '@user-ui/src/components/stat-card';
import useUser from '@user-ui/src/hooks/useUser';
import { Bell, CheckCircle, Clock, Inbox, Loader2, LogOut, MapPin, Lock, ShoppingBag, Truck, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function page() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { user, isLoading } = useUser()
  const queryTab = searchParams.get('active') || 'Profile';
  const [activeTab, setActiveTab] = useState('')

  useEffect(()=>{
    if(activeTab === queryTab) {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("active", activeTab)
        router.replace(`/profile?${newParams.toString()}`)
    }
  },[activeTab])

  return (
    <div className="bg-neutral-50 p-6 pb-14 px-20">
      <div className="md:max-w-8xl x-auto font-amarna">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-800">
            Welcome Back,{' '}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="animate-spin inline w-5 h-5" />
              ) : (
                `${user.name || 'User'}`
              )}
            </span>{' '}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StateCard title="Total Orders" count={10} Icon={Clock} />
          <StateCard title="Processing Orders" count={4} Icon={Truck} />
          <StateCard title="Completed Orders" count={5} Icon={CheckCircle} />
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-6">
          <div className="bg-white p-4 rounded-md shadow-md border border-neutral-100 w-full md:w-[20%] ">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === 'Profile'}
                onClick={() => setActiveTab('Profile')}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === 'My Orders'}
                onClick={() => setActiveTab('Profile')}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === 'Inbox'}
                onClick={() => router.push("/inbox")}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === 'Notifications'}
                onClick={() => setActiveTab('Notifications')}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === 'My Orders'}
                onClick={() => setActiveTab('Profile')}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === 'Change Password'}
                onClick={() => setActiveTab('Change Password')}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                active={activeTab === 'Change Password'}
                onClick={() => setActiveTab('Change Password')}
              />
            </nav>
          </div>

          <div className="bg-white p-6 rounded-md shadow-md border border-neutral-100 w-full md:w-[70%]">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                {activeTab === "Profile" && !isLoading && user ? (
                    <div className="space-y-4 text-sm text-neutral-700">
                        <div className="flex items-center gap-3">
                            <Image src={user?.avatar?.url || '/profile.jpg'} alt="image" width={60} height={60}
                            className="w-16 h-16 rounded-full border border-neutral-200"
                            />
                        </div>
                    </div>
                ): <></>}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

const NavItem = ({ label, Icon, active, danger, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition
           ${active ? 'bg-blue-100 text-blue-600' : danger ? 'text-red-500 hover:bg-red-50' : 'text-neutral-700 hover:bg-neutral-100'} 
        `}
  >
    <Icon className='w-4 h-4' />
    {label}
  </button>
);
