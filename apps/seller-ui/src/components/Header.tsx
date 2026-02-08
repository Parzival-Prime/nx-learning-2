'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  HeartIcon,
  SearchIcon,
  User2Icon,
  ShoppingCartIcon,
} from 'lucide-react';
import HeaderBottom from '@seller-ui/src/components/HeaderBottom';
import { Separator, ModeToggle } from '@ui/index';
import useSeller from '@seller-ui/src/hooks/useSeller';
import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance'

function Header() {
  const { seller, isLoading } = useSeller();

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  async function handleSearchClick() {
    if(!searchQuery.trim()) return
    setLoadingSuggestions(true)

    try {
      const res = await axiosInstance.get(`/product/api/search-products?q=${encodeURIComponent(searchQuery)}`)
      setSuggestions(res.data.products.slice(0, 10))
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="w-full bg-amber-50 dark:bg-neutral-900 font-amarna">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <Link href={'/'} className='flex gap-1'>
        <Image src="/logo.png" width={40} height={40} alt='logo' />
          <span className="text-2xl font-semibold">Agri Grocer</span>
        </Link>
        <div className="relative w-[50%]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-4 h-8 font-poppins font-medium border-[2.5px] border-emerald-400 rounded-md"
          />
          <div className="w-11.25 cursor-pointer flex items-center justify-center h-8 bg-emerald-400 absolute top-0 right-0 rounded-r-md"
          onClick={handleSearchClick}
          >
            <SearchIcon color="#ffff" />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute w-full top-15 bg-white border">
              {suggestions.map((item)=>(
                <Link
                href={`/product/${item.slug}`}
                key={item.id}
                onClick={()=>{
                  setSuggestions([])
                  setSearchQuery("")

                }}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}

          {loadingSuggestions && (
            <div className="absolute w-full top-15 bg-white border ">
              Searching...
            </div>
          )}
        </div>
        <ModeToggle />
        {!isLoading && seller ? (
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
                {seller?.name.split(' ')[0]}
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
