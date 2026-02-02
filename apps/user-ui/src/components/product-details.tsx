'use client';

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingBag,
  WalletMinimal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import InnerImageZoom from 'react-inner-image-zoom';
import Rating from '@/libs/ui/src/components/ratings';
import 'react-inner-image-zoom/lib/styles.min.css';
import Link from 'next/link';
import { useStore } from '../store';
import useUser from '../hooks/useUser';
import useLocationTracking from '../hooks/useLocationTracking';
import useDeviceInfo from '../hooks/useDeviceInfo';
import ProductCard from './product-card';
import axiosInstance from '../utils/axiosInstance';

export default function ProductDetails({
  productDetails,
}: {
  productDetails: any;
}) {
  console.log(productDetails);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceInfo();
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || '',
  );
  const [isSizeSelected, setIsSizeSelected] = useState(
    productDetails?.sizes?.[0] || '',
  );
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([
    productDetails?.sale_price,
    1199,
  ]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const wishList = useStore((state: any) => state.wishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const isWishListed = wishList.some(
    (item: any) => item.id === productDetails.id,
  );
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images[currentIndex - 1]);
    }
  };
  const nextImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images[currentIndex + 1]);
    }
  };

  const discountPercentage = Math.round(
    ((productDetails.regular_price - productDetails.sale_price) /
      productDetails.regular_price) *
      100,
  );

  async function fetchFilteredProducts(){
    try {
      const query = new URLSearchParams()
      query.set("priceRange", priceRange.join(","))
      query.set("page","1")
      query.set("limit", "5")

      const res = await axiosInstance.get(`/product/api/get-filtered?${query.toString()}`)

      setRecommendedProducts(res.data.products)
    } catch (error) {
      console.error("Failed to fetch filtered products", error)
    }
  }

  useEffect(()=>{
    fetchFilteredProducts()
  },[priceRange])

  return (
    <div className="w-full bg-[#f5f5f5] py-5 text-black">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden ">
        {/* left column */}
        <div className="p-4">
          <div className="relative w-full">
            <InnerImageZoom
              src={
                currentImage ||
                'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'
              }
              zoomSrc={
                currentImage ||
                'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'
              }
              zoomType="hover"
              zoomScale={1.5}
              width={400}
              height={400}
              //   alt="product Image"
            />
            {/* <ReactImageMagnify 
                    {...{
                        smallImage: {
                            alt: "product Image",
                            isFluidWidth: true,
                            src: currentImage || 'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'
                        },
                        largeImage: {
                            src: currentImage || 'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927',
                            width: 1200,
                            height: 1200
                        },
                        enlargedImageContainerDimensions: {
                            width: "150%",
                            height: "150%"
                        },
                        enlargedImageStyle: {
                            border: "none",
                            boxShadow: "none"
                        },
                        enlargedImagePosition: "right"
                    }}
                    /> */}
          </div>
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden ">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex gap-2 oveflow-x-auto">
              {productDetails?.images?.map((img: any, index: number) => (
                <Image
                  key={index}
                  src={
                    img?.url ||
                    'https://ik.imagekit.io/orz8zneye/products/product-1768978646025_03W4Mit7C.jpg?updatedAt=1768978647927'
                  }
                  alt={'thumbnail'}
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${
                    currentImage === img
                      ? 'border-blue-500'
                      : 'border-neutral-300'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(img);
                  }}
                />
              ))}
            </div>
            {productDetails?.images.length > 4 && (
              <button
                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* middle column */}
        <div className="p-4">
          <h1 className="text-xl md-2 font-medium ">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Rating value={productDetails?.ratings} />
              <Link href={'#reviews'} className="text-blue-500 hover:underline">
                (0 Reviews)
              </Link>
            </div>

            <div>
              <Heart
                size={25}
                fill={isWishListed ? 'red' : 'transparent'}
                className="cursor-pointer"
                color="transparent"
                onClick={() => {
                  isWishListed
                    ? removeFromWishList(
                        productDetails.id,
                        user,
                        location,
                        deviceInfo,
                      )
                    : addToWishList(
                        {
                          ...productDetails,
                          quantity,
                          selectedOptions: {
                            color: isSelected,
                            size: isSizeSelected,
                          },
                        },
                        user,
                        location,
                        deviceInfo,
                      );
                }}
              />
            </div>
          </div>
          <div className="py-2 border-b border-neutral-200">
            <span className="text-neutral-500">
              Brand:{' '}
              <span className="text-blue-500">
                {productDetails?.brand || 'No Brand'}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${productDetails?.sale_price}
            </span>
            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-300">
              <span className="text-neutral-400 line-through">
                ${productDetails?.regular_price}
              </span>
              <span className="text-neutral-500">-{discountPercentage}%</span>
            </div>
            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map(
                        (color: string, index: number) => (
                          <button
                            key={index}
                            className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${isSelected === color ? `border-neutral-400 scale-110 shadow-md` : 'border-transparent'}`}
                            onClick={() => setIsSelected(color)}
                            style={{ backgroundColor: color }}
                          ></button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {productDetails?.sizes?.length > 0 && (
                  <div>
                    <strong>Size: </strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails.sizes.map(
                        (size: string, index: number) => (
                          <button
                            key={index}
                            className={`px-4 py-1 cursor-pointer rounded-md transition
                                            ${isSizeSelected === size ? 'bg-neutral-800 text-white' : 'bg-neutral-300 text-black'}
                                            `}
                            onClick={() => setIsSelected(size)}
                          >
                            {size}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md flex items-center">
                  <button
                    className="px-3 cursor-pointer py-1 bg-neutral-300 hover:bg-neutral-400 text-black font-semibold rounded-l-md"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 bg-neutral-100 py-1">{quantity}</span>
                  <button
                    className="px-3 cursor-pointer py-1 bg-neutral-300 hover:bg-neutral-400 text-black font-semibold rounded-r-md"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
                {productDetails?.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock{' '}
                    <span className="text-neutral-500 font-medium">
                      (Stock {productDetails?.stock})
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
              <button
                className={`mt-6 flex items-center gap-2 px-3 py-1.5 bg-[#ff5722] hover:bg-[#e64a19] font-medium rounded-lg text-white transition-shadow ${isInCart ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isInCart || productDetails?.stock === 0}
                onClick={() =>
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: isSelected,
                        size: isSizeSelected,
                      },
                    },
                    user,
                    location,
                    deviceInfo,
                  )
                }
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b border-b-neutral-100">
            <span className="text-sm text-neutral-600">Delivery Option</span>
            <div className="flex items-center text-neutral-600 gap-1">
              <MapPin size={18} className="-ml-1.25" />
              <span className="text-lg font-normal">
                {location?.city + ', ' + location?.country}
              </span>
            </div>
          </div>
          <div className="mb-1 px-3 pb-1 border-b border-b-neutral-100">
            <span className="text-sm text-neutral-600">Return & Warranty</span>
            <div className="flex items-center text-neutral-600 gap-1">
              <Package size={18} className="-ml-1.25" />
              <span className="text-base font-normal">7 Days Returns</span>
            </div>
            <div className="flex items-center py-2 text-neutral-600 gap-1 ">
              <WalletMinimal size={18} className="-ml-1.25" />
              <span className="text-base font-normal">
                Warranty not available
              </span>
            </div>
          </div>

          <div className="px-3 py-1">
            <div className="w-[85%] rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-neutral-600 font-light">Sold By</span>
                        <span className="block max-w-37.5 truncate font-medium text-lg">
                            {productDetails?.shop?.name}
                        </span>
                    </div>
                    <Link
                    href={"#"}
                    className='text-blue-500 text-sm flex items-center gap-1'
                    >
                        <MessageSquareText />
                        Chat Now
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-t-neutral-200 mt-3">
                  <div>
                    <p className='text-[12px] text-neutral-500'>
                    Positive Seller Ratings
                    </p>
                    <p className="text-lg font-semibold">88%</p>
                  </div>
                  <div>
                    <p className='text-[12px] text-neutral-500'>Ship On Time</p>
                    <p className="text-lg font-semibold">100%</p>
                  </div>
                  <div>
                    <p className='text-[12px] text-neutral-500'>Chat Response Rate</p>
                    <p className="text-lg font-semibold">100%</p>
                  </div>
                </div>

                <div className="text-center mt-4 border-t border-t-neutral-200 pt-2">
                  <Link
                  href={`/shop/${productDetails?.shop.id}`}
                  className='text-blue-500 font-medium text-sm hover:underline'
                  >
                    GO TO STORE
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-[90%] lg:w-[80%] mx-auto mt-5'>
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className='text-lg font-semibold'>
            Product Details of {productDetails?.title}
          </h3>
          <div className="prose prose-sm text-slate-200 max-w-none wrap-break-word"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description
            }}
          >
          </div>
        </div>
          <div className='w-[90%] lg:w-[80%] mx-auto mt-5'>
            <div className="bg-white min-h-[50vh] h-full p-5">
              <h3>Ratings & Reviews of {productDetails?.title}</h3>
              <p className='text-center pt-14'>No reviews available yet!</p>
            </div>
          </div>
          <div className="w-[90%] lg:w-[80%] mx-auto">
            <div className="w-full h-full my-5 p-5">
              <h3 className="font-semibold text-xl mb-2">You may also like</h3>
              <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {recommendedProducts?.map((i:any)=>(
                  <ProductCard key={i.id} product={i} />
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}


