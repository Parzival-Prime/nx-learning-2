'use client';

import useUser from '@user-ui/src/hooks/useUser';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import Image from 'next/image';
import { useStore } from '@user-ui/src/store';
import useDeviceInfo from '@user-ui/src/hooks/useDeviceInfo';

export default function page() {
  const {user} = useUser();
  const deviceInfo = useDeviceInfo()
  const wishList = useStore((state: any) => state.wishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const addToCart = useStore((state: any) => state.addToCart);

  function decreaseQuantity(id: string){
    useStore.setState((state: any)=>({
      wishList: state.wishList.map((item: any)=> item.id === id && item.quantity > 1 ? {...item, quantity: item.quantity - 1} : item)
    }))
  }

  function increaseQuantity(id: string) {
    useStore.setState((state: any)=>({
      wishList: state.wishList.map((item: any)=> item.id === id ? {...item, quantity: item.quantity + 1} : item)
    }))
  }

  function removeItem(id: string) {
    removeFromWishList(id, user, location, deviceInfo)
  }
  return (
    <div className="w-full bg-white font-amarna">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen text-black">
        <h1 className="md:pt-12.5 font-medium text-[44px] leading-none mb-4 text-black">
          WishList
        </h1>
        <div className="my-3">
          <Breadcrumb>
            <BreadcrumbList className="text-md">
              <BreadcrumbItem>
                <BreadcrumbLink href="/home" className="text-cyan-200">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/wishlist">wishList</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {wishList.length === 0 ? (
          <div className="text-center text-neutral-600 text-lg">
            Your wishlist is empty! Start adding products.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <table className="w-full border-collapse">
              <thead className="bg-neutral-200">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left">Action</th>
                  <th className="py-3 text-left">Delete</th>
                </tr>
              </thead>
              <tbody>
                {wishList?.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="flex items-center gap-3 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <span className="text-black">{item.title}</span>
                    </td>
                    <td className="px-6 text-lg">${item.sale_price.toFixed(2)}</td>
                    <td>
                      <div className="flex justify-center items-center border border-neutral-200 rounded-4xl w-22.5 p-0.5">
                        <button className='text-black cursor-pointer text-xl'
                        onClick={()=>decreaseQuantity(item.id)}
                        >-</button>
                        <span className='px-4'>{item?.quantity}</span>
                        <button className='text-black cursor-pointer text-xl'
                        onClick={()=>increaseQuantity(item.id)}
                        >+</button>
                      </div>
                    </td>
                    <td>
                      <button className='bg-blue-500 cursor-pointer text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-all' 
                      onClick={()=>addToCart(item, user, location, deviceInfo)}
                      >Add To Cart</button>
                    </td>
                    <td>
                      <button className='text-neutral-500  cursor-pointer px-5 py-2 rounded-md hover:text-red-600 transition duration-200' 
                      onClick={()=>removeItem(item.id)}
                      >Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
