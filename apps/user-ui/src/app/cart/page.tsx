'use client';

import useUser from '@user-ui/src/hooks/useUser';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import { useRouter } from 'next/navigation';
import useLocationTracking from '@user-ui/src/hooks/useLocationTracking';
import useDeviceInfo from '@user-ui/src/hooks/useDeviceInfo';
import { useStore } from '@user-ui/src/store';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@user-ui/src/utils/axiosInstance';
import { toast } from 'sonner';

export default function page() {
  const {user} = useUser();
  const router = useRouter();
  const location = useLocationTracking();
  const deviceInfo = useDeviceInfo();

  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);

  const [loading, setLoading] = useState(false);
  const [discountedProductId, setDiscountedProductId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');

  async function createPaymentSession(){
    setLoading(true)
    try {
      const res = await axiosInstance.post("/order/api/create-payment-session", {
        cart,
        selectedAddressId,
        coupon: {}
      })
      const sessionId = res.data.sessionId
      router.push(`/checkout?sessionId=${sessionId}`)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function decreaseQuantity(id: string) {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    }));
  }

  function increaseQuantity(id: string) {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    }));
  }

  function removeItem(id: string) {
    removeFromCart(id, user, location, deviceInfo);
  }

  const subTotal = cart.reduce(
    (total: number, item: any) =>
      total + item.quantity * Number(item.sale_price),
    0,
  );

  
  const {data: addresses = []} = useQuery<any[], Error>({
    queryKey: ["shipping-addresses"],
    queryFn: async()=>{
      const res = await axiosInstance.get("/api/shipping-addresses")
      return res.data.addresses
    }
  })

  useEffect(()=>{
    if(addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((address: any)=>address.isDefault)
      if(defaultAddress){
        setSelectedAddressId(defaultAddress.id)
      }
    }
  }, [addresses, selectedAddressId])

  return (
    <div className="w-full bg-white font-amarna">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen ">
        <h1 className="md:pt-12.5 font-medium text-[44px] leading-none mb-4 text-black">
          Shopping Cart
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
                <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {cart.length === 0 ? (
          <div className="text-center text-neutral-600 text-lg">
            Your cart is empty! Start adding products.
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="rounded bg-neutral-200 text-black">
                <tr>
                  <th className="py-3 text-left pl-6 align-middle">Product</th>
                  <th className="py-3 text-left align-middle">Price</th>
                  <th className="py-3 text-left align-middle">Quantity</th>
                  <th className="py-3 text-left align-middle"> </th>
                </tr>
              </thead>
              <tbody>
                {cart?.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="flex items-center gap-4 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-black font-medium">
                          {item.title}
                        </span>
                        {item?.selectedOptions && (
                          <div className="text-sm text-neutral-500">
                            {item?.selectedOptions?.color && (
                              <span>
                                Color: {}
                                <span
                                  style={{
                                    backgroundColor:
                                      item?.selectedOptions?.color,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '100%',
                                    display: 'inline-block',
                                  }}
                                ></span>
                              </span>
                            )}
                            {item?.selectedOptions.size && (
                              <span className="ml-2">
                                Size: {item?.selectedOptions?.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 text-lg text-start text-black">
                      {item?.id === discountedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-neutral-500 text-sm">
                            ${item.regular_price.toFixed(2)}
                          </span>{' '}
                          <span className="text-green-600 font-semibold">
                            $
                            {(
                              (item.sale_price * (100 - discountPercent)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-green-700 bg-green-50">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span>${item?.sale_price.toFixed(2)}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center items-center ">
                        <div className="flex justify-center items-center border border-neutral-200 rounded-4xl w-22.5 p-0.5">
                          <button
                            className="text-black cursor-pointer text-xl"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            -
                          </button>
                          <span className="px-4 text-black">
                            {item?.quantity}
                          </span>
                          <button
                            className="text-black cursor-pointer text-xl"
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        className="text-neutral-300 cursor-pointer hover:text-red-600 transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9f9] rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#010f1c] text-base pb-1">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="text-green-600">
                    - ${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3">
                <span>Subtotal:</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>
              <hr className="my-4 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-1.75 font-medium text-[15px]">
                  Have a Coupon?
                </h4>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e: any) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full p-2 border text-neutral-900 border-neutral-200 rounded-l-md focus:outline-none focus:border-blue-500"
                  />
                  <button
                    className="bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-600 transition-all"
                    // onClick={()=>couponCode()}
                  >
                    Apply
                  </button>
                  {/* {error && (<p className='text-sm pt-2 text-red-500'>{error  }</p>)} */}
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-1.75 font-medium text-[15px]">
                    Select Shipping Address
                  </h4>
                  {addresses.length !== 0 && (
                    <select
                    className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:border-blue-500 text-black"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses?.map((address: any)=>(
                    <option value={address.id} key={address.id}>
                      {address.label} - {address.city}, {address.country}
                      </option>
                    ))}
                  </select>
                  )}
                  {addresses?.length === 0 && (
                    <p className="text-sm text-neutral-800">
                      Please add and address from profile to create an order!
                    </p>
                  )}

                </div>
                <hr className="my-4 text-slate-200" />

                <div className='mb-4'>
                  <h4 className="mb-1.75 font-medium text-[15px]">
                    Select Payment Method
                  </h4>
                  <select className="w-full p-2 border border-neutral-200 rounded-md text-black">
                    <option value="credit_card">Online Payment</option>
                    <option value="cash_on_delivery">Cash On Delivery</option>
                  </select>
                </div>
                <hr className="my-4 text-slate-200" />

                <div className="flex justify-between items-center text-[#010f1c] text-center">
                  <span>Total</span>
                  <span>${(subTotal - discountAmount).toFixed(2)}</span>
                </div>

                <button
                onClick={createPaymentSession}
                disabled={loading}
                className='w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-blue-500 transition-all rounded-lg'
                >
                  {loading && (<Loader2 className='animate-spin w-5 h-5' />)}
                  {loading ? "Redirecting..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
