'use client';

import { MapPin, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { countries } from '../configs/countries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

const form_input = 'text-neutral-100 bg-neutral-800 w-full px-3 p-1 rounded-sm';

export default function ShoppingAddressSection() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: '',
      name: '',
      street: '',
      city: '',
      zip: '',
      country: 'Bnagladesh',
      isDefault: false,
    },
  })

  const {mutate: addAddress} = useMutation({
    mutationFn: async(payload: true) => {
      const res = await axiosInstance.post("/api/add-address", payload)
      return res.data.address
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({queryKey: ["shipping-addresses"]})
      reset()
      setShowModal(false)
    }
  })

  async function onSubmit(data: any) {
    addAddress(data)
  }


  const {data: addresses, isLoading} = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async()=>{
      const res = await axiosInstance.get("/api/shipping-addresses")
      return res.data.addresses
    }
  })

  const {mutate: deleteAddress} = useMutation({
    mutationFn: async(id: string)=>{
      await axiosInstance.delete(`/api/delete-address/${id}`)
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"]})
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-100">
          Saved Address
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm gap-1 text-blue-600 font-medium hover:underline"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      <div>
        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading Addresses...</p>
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-sm text-neutral-600">No saved addresses found.</p>
        ): (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((address: any)=>(
                <div
                key={address.id}
                className='border border-neutral-200 rounded-md p-4 relative'
                >
                  {address.isDefault && (
                    <span className='absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full'>
                      Default
                    </span>
                  )}
                  <div className="flex mt-2 items-start gap-2 text-sm text-neutral-200 pr-3">
                    <MapPin className='w-5 h-5 mt-0.5 text-neutral-200' />
                    <div>
                      <p className="font-medium">
                        {address.label} - {address.name}
                      </p>
                      <p>
                        {address.street}, {address.city}, {address.zip}, {" "}
                        {address.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button className='flex items-center gap-1 cursor-pointer text-xs text-red-600'
                    onClick={()=>deleteAddress(address.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 text-neutral-800">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800 "
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-neutral-800">
              Add New Address
            </h3>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 text-neutral-800"
            >
              <select
                {...register('label')}
                id="address_label"
                className={form_input}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
              <br />
              <input
                placeholder="Name"
                {...register('name', { required: 'Name is required' })}
                className={form_input}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
              <input
                placeholder="Street"
                {...register('street', { required: 'Street is required' })}
                className={form_input}
              />
              {errors.street && (
                <p className="text-red-500 text-xs">{errors.street.message}</p>
              )}
              <input
                placeholder="City"
                {...register('city', { required: 'City is required' })}
                className={form_input}
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city.message}</p>
              )}
              <input
                placeholder="Zip Code"
                {...register('zip', { required: 'Zip Code is required' })}
                className={form_input}
              />
              {errors.zip && (
                <p className="text-red-500 text-xs">{errors.zip.message}</p>
              )}

              <select {...register('country')} className={form_input}>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <label htmlFor="default_label">Set as Default</label>
              <input
                type="checkbox"
                id="default_label"
                {...register('isDefault')}
                className="ml-3"
              />

              <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition">
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
