'use client';

import { PlusCircle, Trash, X } from 'lucide-react';
import { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@seller-ui/src/utils/axiosInstance';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/libs/ui/src/components/custom-input';
import { AxiosError } from 'axios';
import DeleteDiscountCodeModal from '@seller-ui/src/components/delete-discount-code';

export default function page() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();

  const { data: discountCodes=[], isLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: '',
      discountType: 'percentage',
      discountValue: '',
      discountCode: '',
    },
  });

  const discountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post('/product/api/create-discount-code', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      reset();
      setShowModal(false);
    },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: async(discountId)=>{
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({queryKey: ["shop-discounts"]})
      setShowDeleteModal(false)
    }
  })

  async function handleDeleteClick(discount: any) {
    setSelectedDiscount(discount)
    setShowDeleteModal(true)
  }

  async function onSubmit(data: any) {
    if (discountCodes.length >= 8) {
      toast.error('You can create max 8 discount codes!');
      return;
    }
    
    discountCodeMutation.mutate(data)
  }

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 px-3 rounded-sm flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <PlusCircle size={18} /> Create Discount Code
        </button>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-cyan-200">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/discount-codes">
              Discount Codes
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 bg-neutral-900 p-6 rounded-md shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-neutral-400 text-center">
            Loading Discount Codes...
          </p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-neutral-800 hover:bg-neutral-800 transition"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3 capitalize">
                    {discount.discountType === 'percentage'
                      ? 'Percentage (%)'
                      : 'Flat ($)'}
                  </td>
                  <td className="p-3">
                    {discount.discountType === 'percentage'
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue}`}
                  </td>
                  <td className="p-3">{discount.discountCode}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && discountCodes?.length === 0 && (
          <p className="text-neutral-400 w-full pt-4 text-center">
            No Discount Codes Available!
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-neutral-900 p-6 rounded-md w-112.5 shadow-lg">
            <div className="flex justify-between items-center border-b boroder-neutral-700 pb-3">
              <h3>Create Discount Code</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">

              <div className="mt-2">
                <Input
                  label="Title"
                  {...register('public_name', {
                    required: 'Title is required',
                  })}
                  className='border-neutral-700!'
                />
                {errors.public_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.public_name.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold font-neutral-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none rounded-md p-1 border-neutral-700 bg-neutral-900"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  )}
                />
              </div>

              <div className="mt-2">
                <Input
                label='Discount Value'
                type="number"
                min={1}
                {...register("discountValue", {
                  required: "Value is required!"
                })}
                />
                {errors.discountValue && (
                  <p className='text-red-500 text-sm mt-1'>{errors.discountValue.message as string}</p>
                )}
              </div>

              <div className="mt-2">
                <Input
                label='Discount Code'
                {...register("discountCode", {
                  required: "Discount Code is required!"
                })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.discountCode.message as string}</p>
                )}
              </div>

              <button type='submit' disabled={discountCodeMutation.isPending} className='mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2'>
                <PlusCircle size={18} /> {discountCodeMutation.isPending ? "Creating..." : "Create"}
              </button>

              {discountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(discountCodeMutation.error as AxiosError<{message: string}>)?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
        discount={selectedDiscount}
        onClose={()=>setShowDeleteModal(false)}
        onConfirm={()=>deleteDiscountMutation.mutate(selectedDiscount?.id)}
        />
      )}
    </div>
  );
}
