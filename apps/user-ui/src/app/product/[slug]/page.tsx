import ProductDetails from '@user-ui/src/components/product-details';
import axiosInstance from '@user-ui/src/utils/axiosInstance';
import { Metadata } from 'next';
import React from 'react';

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/product/api/get-product/${slug}`)
  return response.data.product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);
  return {
    title: `${product?.title} | Agri Grocer`,
    description:
      product?.short_description || 'Discover high quality garden products',
    // images: [product?.images?.[0]?.url || "/default-image.jpg"],
    // type: "website"
  };
}

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productDetails = await fetchProductDetails(slug);
  return <ProductDetails productDetails={productDetails} />;
}
