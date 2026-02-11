'use client';

import {
  AlignLeft,
  ChevronDownIcon,
  HeartIcon,
  ShoppingCartIcon,
  User2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { navItems } from '@user-ui/src/configs/constants';
import { NavItemsTypes } from '@user-ui/src/types/const.types';
import Link from 'next/link';
import Image from 'next/image';
import useUser from '@user-ui/src/hooks/useUser';
import { ModeToggle } from '@ui/index';
import { useStore } from '../store';

function HeaderBottom() {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const wishList = useStore((state: any) => state.wishList);
  const cart = useStore((state: any) => state.cart);
  const { user, isLoading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div
      className={`w-full h-[10%] transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-100 dark:bg-neutral-900 bg-amber-50 shadow-lg' : 'relative'}`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? 'pt-3' : 'py-0'}`}
      >
        <div
          className={`w-65 ${isSticky && '-mb-2'} cursor-pointer flex items-center justify-between px-5 h-12.5 bg-emerald-400 `}
          onClick={() => setShow((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="#ffff" />
            <span>All Departmemts</span>
            <ChevronDownIcon color="white" />
          </div>
          {show && (
            <div
              className={`absolute left-0 ${isSticky ? 'top-17.5' : 'top-12.5'} w-65 h-100 bg-[#f5f5f5]`}
            ></div>
          )}
        </div>
        <div className="flex items-center">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              href={i.href}
              key={index}
              className="px-5 font-medium text-lg"
            >
              {i.title}
            </Link>
          ))}
        </div>
        {isSticky && (
          <>
            <ModeToggle />
            <div className="flex items-center space-x-6 ">
              <Link href={'/wishlist'} className="relative">
                <HeartIcon />
                <div className="w-5 h-5 border-2 border-neutral-100 bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                  <span className="text-white text-sm font-medium">{wishList?.length}</span>
                </div>
              </Link>
              <Link href={'/cart'} className="relative">
                <ShoppingCartIcon />
                <div className="w-5 h-5 border-2 border-neutral-100 bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2">
                  <span className="text-white text-sm font-medium">{cart?.length}</span>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HeaderBottom;
