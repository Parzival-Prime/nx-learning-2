import Link from 'next/link';
import {
  HeartIcon,
  SearchIcon,
  User2Icon,
  ShoppingCartIcon,
} from 'lucide-react';
import HeaderBottom from '@user-ui/src/components/HeaderBottom';
import { Separator } from '@shadcnUI/components/ui/separator';
import {ModeToggle} from "@shadcnUI/components/mode-toggle"

function Header() {
  return (
    <div className="w-ful">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <Link href={'/'}>
          <span className="text-2xl font-[600]">Ecom</span>
        </Link>
        <div className="relative w-[50%]">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-poppins font-medium border-[2.5px] border-emerald-400 rounded-md"
          />
          <div className="w-[45px] cursor-pointer flex items-center justify-center h-[27px] bg-emerald-400 absolute top-0 right-0 rounded-md">
            <SearchIcon color="#ffff" />
          </div>
        </div>
          <ModeToggle />
        <div className="flex items-center gap-8">
          <Link href={'/login'} className="flex items-center gap-2">
            <User2Icon />
            <div className="text-xs">
              <span className="block">Hello,</span>
              <span className="font-semibold">SignIn</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-5 ">
          <Link href={'/wishlist'} className="relative">
            <HeartIcon />
            <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-8px] right-[-8px]">
              <span className="text-white text-sm font-medium">0</span>
            </div>
          </Link>
          <Link href={'/wishlist'} className="relative">
            <ShoppingCartIcon />
            <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-8px] right-[-8px]">
              <span className="text-white text-sm font-medium">0</span>
            </div>
          </Link>
        </div>
      </div>
      {/* <div className="border-b border-b-[#99999938]" /> */}
      <Separator className='bg-neutral-700 dark:bg-neutral-300' />
      <HeaderBottom />
    </div>
  );
}

export default Header;
