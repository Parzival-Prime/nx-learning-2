import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@ui/components/ui/field';
import { cn } from '@/libs/ui/src/lib/utils';
import { Input } from '@/libs/ui/src/components/ui/input';
import { shopCategories } from '../constants/shop-categories';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ui/components/ui/select';
import { Button } from '@/libs/ui/src/components/ui/button';

export default function CreateShop({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) {
  const shopCreationForm = useForm<shopCreationFormData>({
    defaultValues: {
      name: '',
      description: '',
      address: '',
      openingHours: '',
      website: '',
      category: '',
    },
  });

  const shopCreateMutation = useMutation({
    mutationFn: async (data: shopCreationFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/shop-registration`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  async function onSubmit(data: any) {
    const shopData = { ...data, sellerId };

    shopCreateMutation.mutate(shopData);
  }

  const countWords = (text: string) => text.trim().split(/\s+/).length;
  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className={cn('flex flex-col gap-6')}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Setup new Shop</CardTitle>
          <CardDescription>
            Enter details below to create your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={shopCreationForm.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name *</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Shop Name"
                  required
                  {...shopCreationForm.register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 3,
                      message: 'Name should be at least 3 characters long',
                    },
                  })}
                />
                {shopCreationForm.formState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {String(shopCreationForm.formState.errors.name.message)}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">
                  Description (max. 150 words)
                </FieldLabel>
                <Input
                  id="description"
                  type="description"
                  placeholder="Description . . ."
                  required
                  {...shopCreationForm.register('description', {
                    required: 'Description is required',
                    validate: (value) => {
                      countWords(value) <= 150 ||
                        'Description cannot be of more than 150 words.';
                    },
                  })}
                />
                {shopCreationForm.formState.errors.description && (
                  <p className="text-red-500 text-sm">
                    {String(
                      shopCreationForm.formState.errors.description.message,
                    )}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id="address"
                  type="text"
                  placeholder="Address"
                  required
                  {...shopCreationForm.register('address', {
                    required: 'Phone Number is required',
                  })}
                />
                {shopCreationForm.formState.errors.address && (
                  <p className="text-red-500 text-sm">
                    {String(shopCreationForm.formState.errors.address.message)}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="opening-hours">Opening Hours</FieldLabel>
                <Input
                  id="opening-hours"
                  type="text"
                  placeholder="Mon-Fri 9am-6pm"
                  required
                  {...shopCreationForm.register('openingHours', {
                    required: 'Opening Hours is required',
                  })}
                />
                {shopCreationForm.formState.errors.openingHours && (
                  <p className="text-red-500 text-sm">
                    {String(
                      shopCreationForm.formState.errors.openingHours.message,
                    )}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website"
                  type="text"
                  placeholder="https://www.example.com"
                  required
                  {...shopCreationForm.register('website', {
                    required: 'website URL is required',
                    validate: (value) => {
                      isValidUrl(value) || 'website URL is not valid';
                    },
                  })}
                />
                {shopCreationForm.formState.errors.website && (
                  <p className="text-red-500 text-sm">
                    {String(shopCreationForm.formState.errors.website.message)}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Controller
                  name="category"
                  control={shopCreationForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your shop's category" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>

                          {shopCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={shopCreateMutation.isPending}>
                  {shopCreateMutation.isPending ? 'Creating...' : 'Create Shop'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

type shopCreationFormData = {
  name: string;
  description: string;
  address: string;
  openingHours: string;
  website: string;
  category: string;
};
