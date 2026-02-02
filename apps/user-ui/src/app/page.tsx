'use client';

import HeroSection from '@user-ui/src/components/HeroSection';
import SectionTitle from '../components/section-title';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '@user-ui/src/components/product-card';
import ShopCard from '../components/ShopCard';

function page() {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10',
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: latestProducts, isLoading: latestProductsLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10&type=latest',
      );
      return res.data.top10Products;
    },
  });


  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async()=>{
      const res = await axiosInstance.get("/product/api/top-shops")
      return res.data.shops
    },
    staleTime: 1000 * 60 * 2
  })

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async()=>{
      const res = await axiosInstance.get("/product/api/get-all-events?page=1&limit=10")
      return res.data.events
    },
    staleTime: 1000 * 60 * 2
  })

  return (
    <main className=" bg-red-500 font-amarna">
      <HeroSection />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5 ">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-62.5 bg-neutral-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="m-auto gap-2 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <p className="text-center">No Products available yet!</p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className=" h-62.5 animamte-pulse rounded-xl bg-neutral-300"></div>
            ))}
          </div>
        )}

        <div className="my-8 block">
          <SectionTitle title='Latest Products' />
        </div>

        {!isLoading && !isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-2">
            {latestProducts?.map((product:any)=>(
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {latestProducts?.length === 0 && (
          <p className="text-center">No Products Available yet!</p>
        )}

        <div className="my-8 block">
          <SectionTitle title='Top Shops' />
        </div>


        {!shopLoading && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
            {shops?.map((shop: any)=>(
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}

        {shops?.length === 0 && (
          <p className="text-center">No Shops Available yet!</p>
        )}

        <div className="my-8 block">
          <SectionTitle title='Top Offers' />
        </div>

        {!offersLoading && isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
            {offers?.map((product:any)=>(
              <ProductCard key={product.id} product={product} isEvent={true} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default page;
