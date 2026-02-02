import Link from 'next/link';
import Image from 'next/image';
import Ratings from '@ui/components/ratings';
import ProductDetailsCard from '@user-ui/src/components/product-details-card';
import { useEffect, useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useStore } from '@user-ui/src/store';
import useUser from '@user-ui/src/hooks/useUser';
import useLocationTracking from '@user-ui/src/hooks/useLocationTracking';
import useDeviceInfo from '../hooks/useDeviceInfo';

export default function ProductCard({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [open, setOpen] = useState(false);
  const {user} = useUser();
  const location = useLocationTracking()
  const deviceInfo = useDeviceInfo()

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const wishList = useStore((state: any) => state.wishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const isWishListed = wishList.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price `);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.ending_date]);
  return (
    <div className="w-full min-h-87.5 h-max bg-white rounded-lg relative">
      {isEvent && (
        <div
          className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold
            px-2 py-1 rounded-sm shadow-md"
        >
          OFFER
        </div>
      )}

      {product?.stock <= 5 && (
        <div
          className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold
            px-2 py-1 rounded-sm shadow-md"
        >
          Limited Stock
        </div>
      )}

      <Link href={`/product/${product?.slug}`}>
        <Image
          src={
            product?.images[0]?.url ||
            'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'
          }
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-auto object-cover mx-auto rounded-t-md "
        />
      </Link>

      <Link
        href={`/shop/${product?.shop.id}`}
        className="block text-blue-500 text-sm font-medium my-2 px-2 "
      >
        {product?.shop?.name}
      </Link>

      <Link href={`/product/${product?.slug}`}>
        <h3 className="text-base font-semibold px-2 text-neutral-800 ">
          {product?.title}
        </h3>
      </Link>

      <div className="mt-2 px-2">
        <Ratings value={product?.ratings} />
      </div>

      <div className="flex mt-3 justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-neutral-900">
            ${product?.sale_price}
          </span>
          <span className="text-sm line-through text-neutral-400">
            ${product?.regular_price}
          </span>
        </div>
        <span className="text-green-500 text-sm font-medium">
          {product.totalSales} sold
        </span>
      </div>
      {isEvent && timeLeft && (
        <div className="mt-2">
          <span className="inline-block text-xs bg-orange-100 ">
            {timeLeft}
          </span>
        </div>
      )}

      <div className="absolute z-10 flex flex-col gap-3 right-3 top-10">
        <div className="bg-white rounded-full p-1.5 shadow-md">
          <Heart
            className="cursor-pointer hover:scale-110 transition"
            size={22}
            fill={isWishListed ? 'red' : 'transparent'}
            stroke={isWishListed ? 'red' : 'black'}
            onClick={() =>
              isWishListed
                ? removeFromWishList(product.id, user, location, deviceInfo)
                : addToWishList(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo,
                  )
            }
          />
        </div>
        <div
          className="bg-white rounded-full p-1.5 shadow-md"
          onClick={() => setOpen(!open)}
        >
          <Eye
            className="cursor-pointer text-neutral-500 hover:scale-110 transition"
            size={22}
          />
        </div>
        <div className="bg-white rounded-full p-1.5 shadow-md">
          <ShoppingBag
            className="cursor-pointer text-neutral-500 hover:scale-110 transition"
            size={22}
            onClick={()=>!isInCart && addToCart({...product, quantity: 1, user, location, deviceInfo})}
          />
        </div>
      </div>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
}
