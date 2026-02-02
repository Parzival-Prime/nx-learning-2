import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface ShopCardProps {
    shop: {
        id: string,
        name: string,
        description?: string
        logo: string
        coverBanner?: string
        address?: string
        followers?: []
        rating?: string
        category?: string
    }
}


export default function ShopCard({shop}: ShopCardProps) {
  return (
    <div className='w-full rounded-md cursor-pointer bg-white border border-neutral-200 shadow-sm overflow-hidden transition'>
        <div className="w-full h-30 relative">
    <Image
    src={shop?.coverBanner || 'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'}
    alt='Cover'
    fill
    className='object-cover w-full h-full'
    />
    </div>
    <div className='relative flex justify-center -mt-8 '>
          <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
            <Image 
            src={shop.logo || 'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'}
            alt={shop.name}
            width={64}
            height={64}
            className='object-cover'
            />
          </div>
        </div>

        <div className="px-4 pt-2 text-center">
            <h3 className="text-base font-semibold text-neutral-800">{shop?.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
                {shop?.followers?.length ?? 0} Followers
            </p>
            

            <div className="flex items-center justify-center text-xs text-neutral-500 mt-2 ">
                {shop.address && (
                    <span className="flex items-center gap-1 max-w-30">
                        <MapPin className='w-4 h-4 shrink-0' />
                        <span className="truncate">{shop.address}</span>
                    </span>
                )}

                <span className="flex items-center gap-1">
                    <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                    {shop.rating ?? "N/A"}
                </span>
            </div>

            {shop?.category && (
                <div className="flex mt-3 flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded">
                        {shop.category}
                    </span>
                </div>
            )}

            <div className="mt-4">
                <Link
                href={`/shop/${shop.id}`}
                className='inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition'
                >
                Visit Shop
                <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
        </div>
    </div>
  )
}
