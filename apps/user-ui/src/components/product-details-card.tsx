import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Ratings from '@ui/components/ratings';
import { Heart, MapPin, ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@user-ui/src/store';
import useUser from '@user-ui/src/hooks/useUser';
import useLocationTracking from '@user-ui/src/hooks/useLocationTracking';
import useDeviceInfo from '../hooks/useDeviceInfo';

export default function ProductDetailsCard({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || '');
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  const {user} = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceInfo();

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const wishList = useStore((state: any) => state.wishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const isWishListed = wishList.some((item: any) => item.id === data.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === data.id);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const router = useRouter();
  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <Image
              src={data?.images?.[activeImage]?.url}
              alt={data?.images?.[activeImage]?.url}
              width={400}
              height={400}
              className="w-full rounded-lg object-contain"
            />
            <div className="flex gap-2 mt-4">
              {data?.images?.map((img: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer border rounded-md ${activeImage === index ? 'border-neutral-500 pt-1' : 'border-transparent'}`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img?.url}
                    alt={`Thumbnail ${index}`}
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            <div className="border-b relative pb-3 border-neutral-200 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Image
                  src={
                    data?.shop?.avatar ||
                    'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'
                  }
                  alt="shop logo"
                  width={60}
                  height={60}
                  className="rounded-full w-15 h-15 object-cover"
                />
                <div>
                  <Link
                    href={`/shop/${data?.shop?.id}`}
                    className="text-neutral-900 text-lg font-medium"
                  >
                    {data?.shop?.name || 'Shop Name'}
                  </Link>

                  <span className="block mt-1">
                    <Ratings value={data?.shop?.ratings} />
                  </span>

                  <p className="text-neutral-600 mt-1 flex items-center justify-center">
                    <MapPin size={20} />{' '}
                    {data?.shop?.address || 'Location not available'}
                  </p>
                </div>
              </div>
              <button
                className="flex cursor-pointer items-center gap-2 px-4 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700 "
                onClick={() => router.push(`/inbox?shopId=${data?.shop?.id}`)}
              >
                Chat with Seller
              </button>

              <button className="text-black w-full absolute cursor-pointer -right-1.25 -top-1.25 flex justify-end my-2 -mt-2.5">
                <X size={25} onClick={() => setOpen(false)} />
              </button>
            </div>

            <h3 className="text-xl font-semibold mt-3">{data?.title}</h3>
            <p className="mt-2 text-neutral-700 whitespace-pre-wrap w-full">
              {data?.short_description}
            </p>

            {data?.brand && (
              <p className="mt-2">
                <strong>Brand: </strong>
                {data.brand}
              </p>
            )}

            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
              {data?.colors?.length > 0 && (
                <div>
                  <strong>Colors:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                          isSelected === color
                            ? 'border-neutral-400 scale-110 shadow-md'
                            : 'border-transparent'
                        }`}
                        onClick={() => setIsSelected(color)}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {data?.sizes?.length > 0 && (
                <div>
                  <strong>Sizes:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        className={`px-4 py-1 cursor-pointer rounded-md transition ${
                          isSelected === size
                            ? 'bg-neutral-800 text-white'
                            : 'bg-neutral-300 text-black'
                        }`}
                        onClick={() => setIsSelected(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-neutral-900">
                ${data?.sale_price}
              </h3>
              {data?.regular_price && (
                <h3 className="text-lg text-red-600 line-through">
                  ${data.regular_price}
                </h3>
              )}
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-neutral-300 hover:bg-neutral-400 text-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>

                <span className="px-4 text-black bg-neutral-100 py-1">
                  {quantity}
                </span>
                <button
                  className="px-3 cursor-pointer py-1 bg-neutral-300 hover:bg-neutral-400 text-black font-semibold rounded-r-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev + 1))}
                >
                  +
                </button>
              </div>
              <button
                disabled={isInCart}
                onClick={() =>
                  !isInCart &&
                  addToCart({
                    ...data,
                    quantity: 1,
                    user,
                    location,
                    deviceInfo,
                  })
                }
                className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${isInCart ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <ShoppingCart size={18} /> Add to cart
              </button>
              <button className="opacity-[.7] cursor-pointer">
                <Heart
                  size={30}
                  fill={isWishListed ? 'red' : 'transparent'}
                  stroke={isWishListed ? 'red' : 'black'}
                  onClick={() =>
                    isWishListed
                      ? removeFromWishList(data.id, user, location, deviceInfo)
                      : addToWishList(
                          { ...data, quantity: 1 },
                          user,
                          location,
                          deviceInfo,
                        )
                  }
                />
              </button>
            </div>
            <div className="mt-3">
              {data.stock > 0 ? (
                <span className="text-green-600 font-semibold">In Stock</span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            <div className="mt-3 text-neutral-600 text-sm">
              Estimated Delivery:{' '}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
