'use client';

import {
  AlignLeft,
  ChevronDownIcon,
  HeartIcon,
  ShoppingCartIcon,
  User2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSeller from '@seller-ui/src/hooks/useSeller';
import { ModeToggle } from '@ui/index';

function HeaderBottom() {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { seller, isLoading } = useSeller();

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
      className={`w-full h-[10%] transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-100 dark:bg-neutral-700 bg-amber-50 shadow-lg' : 'relative'}`}
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
        {isSticky && (
          <>
            <ModeToggle />
          </>
        )}
      </div>
    </div>
  );
}

export default HeaderBottom;
