'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  HeartIcon,
  SearchIcon,
  User2Icon,
  ShoppingCartIcon,
} from 'lucide-react';
import HeaderBottom from '@user-ui/src/components/HeaderBottom';
import { Separator, ModeToggle } from '@ui/index';
import useUser from '@user-ui/src/hooks/useUser';

function Header() {
  const { user, isLoading } = useUser();
  return (
    <div className="w-full bg-amber-50 dark:bg-neutral-700">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <Link href={'/'}>
          <span className="text-2xl font-semibold">Ecom</span>
        </Link>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-poppins font-medium border-[2.5px] border-emerald-400 rounded-md"
          />
          <div className="w-11.25 cursor-pointer flex items-center justify-center h-6.75 bg-emerald-400 absolute top-0 right-0 rounded-md">
            <SearchIcon color="#ffff" />
          </div>
        </div>
        <ModeToggle />
        {!isLoading && user ? (
          <Link href={'/profile'} className="flex items-center gap-2">
            <Image
              src="/profile.jpg"
              width={'35'}
              height={'35'}
              alt="Profile"
              className="rounded-full"
            />
            <div className="text-sm">
              <span className="block">Hello,</span>
              <span className="block font-semibold">
                {user?.name.split(' ')[0]}
              </span>
            </div>
          </Link>
        ) : (
          <Link href={'/login'} className="flex items-center gap-2">
            <User2Icon />
            <div className="text-xs">
              <span className="block">Hello,</span>
              <span className="font-semibold">
                {isLoading ? '...' : 'SignIn'}
              </span>
            </div>
          </Link>
        )}
        <div className="flex items-center space-x-6 ">
          <Link href={'/wishlist'} className="relative">
            <HeartIcon />
            <div className="w-5 h-5 border-2 border-neutral-100 bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
              <span className="text-white text-sm font-medium">0</span>
            </div>
          </Link>
          <Link href={'/wishlist'} className="relative">
            <ShoppingCartIcon />
            <div className="w-5 h-5 border-2 border-neutral-100 bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
              <span className="text-white text-sm font-medium">0</span>
            </div>
          </Link>
        </div>
      </div>
      {/* <div className="border-b border-b-[#99999938]" /> */}
      {/* <Separator className='bg-neutral-500 dark:bg-neutral-300' /> */}
      <div
        className=" h-[1.5px] w-full bg-linear-to-b from-transparent via-neutral-500/60 to-transparent"
      />
      <HeaderBottom />
    </div>
  );
}

export default Header;
