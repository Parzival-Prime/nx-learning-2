'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@user-ui/src/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import ProductCard from '@user-ui/src/components/product-card';

import { categories } from '@user-ui/src/configs/categories';
import ShopCard from '@user-ui/src/components/ShopCard';
import { countries } from '@user-ui/src/configs/countries';

export default function page() {
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

  const router = useRouter();

  function updateURL() {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0)
      params.set('categories', selectedCategories.join(','));
    if (selectedCountries.length > 0)
      params.set('colors', selectedCountries.join(','));
    params.set('page', page.toString());
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  }

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategories.length > 0)
        query.set('categories', selectedCategories.join(','));
      if (selectedCountries.length > 0)
        query.set('colors', selectedCountries.join(','));
      query.set('page', page.toString());
      query.set('limit', '12');
      const res = await axiosInstance.get(
        `/product/api/get-filtered-shops?${query.toString()}`,
      );
      setShops(res.data.shops);
      console.log("res: ", res)
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch filtered products: ', error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label],
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10 font-amarna text-black">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-12.5">
          <h1 className="md:pt-10 font-medium text-[44px] leading-1 mb-3.5 ">
            All Shops
          </h1>
          <Breadcrumb>
            <BreadcrumbList className="text-md">
              <BreadcrumbItem>
                <BreadcrumbLink href="/home" className="text-cyan-200">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">All Products</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-67.5 rounded bg-white p-4 space-y-6 shadow-md">
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 mt-3!">
              {categories?.map((category: any) => (
                <li
                  className="flex items-center justify-between"
                  key={category.value}
                >
                  <label className="flex items-center gap-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="accent-blue-600"
                    />
                    {category.value}
                  </label>
                </li>
              ))}
            </ul>

            
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Countries
            </h3>
            <ul className="space-y-2 mt-3!">
              {countries?.map((country: any) => (
                <li className="flex items-center justify-between" key={country}>
                  <label className="flex items-center gap-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="accent-blue-600"
                    />
                    {country}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    className="h-62.5 bg-neutral-300 animate-pulse rounded-xl"
                    key={index}
                  ></div>
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p>No Shops Found!</p>
            )}

            {totalPages > 1 && (
              <div className="flex jsutify-center mt-8 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded border border-neutral-200 text-sm ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
