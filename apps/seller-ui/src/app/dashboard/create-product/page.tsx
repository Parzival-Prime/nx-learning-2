'use client';

import { Controller, useForm } from 'react-hook-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import ImagePlaceholder from '@seller-ui/src/components/image-placeholder';
import { useMemo, useState } from 'react';
import { Input } from '@ui/components/custom-input';
import ColorSelector from '@ui/components/color-selector';
import CustomSpecifications from '@ui/components/custom-specifications';
import CustomProperties from '@ui/components/custom-properties';
import RichTextEditor from '@ui/components/rich-text-editor';
import SizeSelector from '@ui/components/size-selector';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@seller-ui/src/utils/axiosInstance';
import { Wand, X } from 'lucide-react';
import Image from 'next/image';
import { enhancements } from '@seller-ui/src/utils/ai-enhancements';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function page() {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/product/api/get-categories');
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes, isLoading: discount_isLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch('category');
  const regular_price = watch('regular_price');

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  function setOpenImageModalWrapper(value: boolean) {
    setOpenImageModal(value);
  }

  async function handleImageChange(file: File | null, index: number) {
    if (!file) return;
    setPictureUploadingLoader(true);
    try {
      const filename = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        '/product/api/upload-product-image',
        { filename },
      );

      const updatedImages = [...images];

      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };

      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  }

  function convertFileToBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleImageRemove(index: number) {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];

      if (imageToDelete && typeof imageToDelete === 'object') {
        await axiosInstance.delete('/product/api/delete-product-image', {
          data: { fileId: imageToDelete.fileId },
        });
      }
      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    }
  }

  async function onSubmit(data: any) {
    console.log('SUBMIT DATA:', data);
    console.log('selectedImage: ', selectedImage);
    setLoading(true);
    try {
      await axiosInstance.post('/product/api/create-product', data);
      router.push('/dashboard/all-products');
    } catch (error: any) {
      toast.error(
        error?.data?.message || 'Fucking error is not displaying properly!',
      );
    } finally {
      setLoading(false);
    }
  }

  async function applyTransformation(transformation: string) {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  }

  function handleSaveDraft() {}

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-poppins text-white">
        Create Product
      </h2>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-cyan-200">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/create-product">
              Create Product
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="py-4 w-full flex gap-6">
        <Controller
          name="images"
          control={control}
          defaultValue={images}
          render={() => <span/>}
        />
        <div className="md:w-[35%] ">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModalWrapper}
              size="765 x 850"
              images={images}
              small={false}
              index={0}
              onImageChange={handleImageChange}
              setSelectedImage={setSelectedImage}
              onRemove={handleImageRemove}
              defaultImage={null}
              pictureUploadingLoader={pictureUploadingLoader}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                setOpenImageModal={setOpenImageModalWrapper}
                size="765 x 850"
                small={true}
                images={images}
                key={index}
                index={index + 1}
                onImageChange={handleImageChange}
                setSelectedImage={setSelectedImage}
                onRemove={handleImageRemove}
                defaultImage={null}
                pictureUploadingLoader={pictureUploadingLoader}
              />
            ))}
          </div>
        </div>

        <div className="w-[65%] flex gap-3 ">
          <div className="w-1/2">
            <div className="mt-2">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Controller
                name="short_description"
                control={control}
                rules={{
                  required: 'Description is required',
                  validate: (value) => {
                    if (!value || !value.trim())
                      return 'Description is required';

                    const wordCount = value.trim().split(/\s+/).length;
                    return (
                      wordCount <= 150 ||
                      `Description cannot exceed 150 words (Current: ${wordCount})`
                    );
                  },
                }}
                render={({ field }) => (
                  <Input
                    type="textarea"
                    rows={7}
                    label="Short Description * (Max 150 words)"
                    placeholder="Enter product description for quick view"
                    {...field}
                  />
                )}
              />
              {errors?.short_description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.short_description.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Tags *"
                placeholder="apple, flagship"
                {...register('tags', {
                  required: 'Separate related product tags with coma.',
                })}
              />
              {errors?.tags && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tags.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Slug *"
                placeholder="product_slug"
                {...register('slug', {
                  required: 'slug is required!',
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      'Invalid slug format! Use only lowercase letters, numbers',
                  },
                  minLength: {
                    value: 3,
                    message: 'Slug must be at least 3 words long.',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Slug cannot be longer than 50 words.',
                  },
                })}
              />
              {errors?.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Brand"
                placeholder="Pineapple"
                {...register('brand')}
              />
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.brand.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <ColorSelector control={control} errors={errors} />
            </div>

            <div className="mt-2">
              <CustomSpecifications control={control} errors={errors} />
            </div>

            <div className="mt-2">
              <CustomProperties control={control} errors={errors} />
            </div>

            <div className="mt-2">
              <label
                htmlFor=""
                className="block font-semibold text-neutral-300 mb-1"
              >
                Cash On Delivery *
              </label>
              <select
                {...register('cash_on_delivery', {
                  required: 'Cash on Delivery is required',
                })}
                defaultValue="yes"
                className="w-full border outline-none border-neutral-700 bg-transparent rounded-sm text-sm p-1"
              >
                <option value="yes" className="bg-neutral-900">
                  Yes
                </option>
                <option value="no" className="bg-neutral-900">
                  No
                </option>
              </select>
            </div>
          </div>

          <div className="w-1/2">
            <div className="mt-2">
              <label className="font-semibold text-neutral-200 mb-2">
                Category *
              </label>
              {isLoading ? (
                <p className="text-neutral-500">Loading Categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load Categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required!' }}
                  render={({ field }: any) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-neutral-700 bg-transparent rounded-sm text-sm p-1 mt-2"
                    >
                      <option
                        value=""
                        className="bg-neutral-900 text-neutral-500 text-sm"
                      >
                        Select Category
                      </option>
                      {categories.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-neutral-900"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <label className="block font-semibold text-gray-200 mb-1">
                Subcategory *
              </label>
              {isLoading ? (
                <p className="text-neutral-500">Loading Subcategories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load Subcategories</p>
              ) : (
                <Controller
                  name="subcategory"
                  control={control}
                  rules={{ required: 'Subcategory is required!' }}
                  render={({ field }: any) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-neutral-700 bg-transparent rounded-sm text-sm p-1 mt-2"
                    >
                      <option
                        value=""
                        className="bg-neutral-900 text-neutral-500 text-sm"
                      >
                        Select Subcategory
                      </option>
                      {subcategories.map((subcategory: string) => (
                        <option
                          value={subcategory}
                          key={subcategory}
                          className="bg-neutral-900"
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.subcategories && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.subcategories.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <label className="block font-semibold text-neutral-200 mb-1">
                Detailed Description * (Min 100 words)
              </label>
              <Controller
                name="detailed_description"
                control={control}
                rules={{
                  required: 'Detailed description is required!',
                  validate: (value) => {
                    if (typeof value !== 'string') return 'Invalid content';

                    const text =
                      new DOMParser()
                        .parseFromString(value, 'text/html')
                        .body.textContent?.trim() || '';

                    const wordCount = text.split(/\s+/).filter(Boolean).length;

                    return (
                      wordCount >= 100 ||
                      `Description must be at least 100 words (Current: ${wordCount})`
                    );
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors?.detailed_description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.detailed_description.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Video URL"
                placeholder="https://www.youtube.com/embed/xyz123"
                {...register('video_url', {
                  pattern: {
                    value:
                      /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                    message:
                      'Invalid youtube embed URL! Use format: https://www.youtube.com/embed/xyz123',
                  },
                })}
              />
              {errors.video_url && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.video_url.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Regular Price"
                placeholder="20$"
                {...register('regular_price', {
                  valueAsNumber: true,
                  min: { value: 1, message: 'Price must be atleast 1' },
                  validate: (value) =>
                    !isNaN(value) || 'Only numbers are allowed',
                })}
              />
              {errors.regular_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.regular_price.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Sale Price"
                placeholder="15$"
                {...register('sale_price', {
                  required: 'Sale Price is required!',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Sale Price must be atleast 1!' },
                  validate: (value) => {
                    if (isNaN(value)) return 'Only numbers are allowed!';
                    if (regular_price && value >= regular_price) {
                      return 'Sale price must be less than regular price!';
                    }
                    return true;
                  },
                })}
              />
              {errors.regular_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.regular_price.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Stock *"
                placeholder="100"
                {...register('stock', {
                  required: 'Stock is required!',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Stock must be at least 1!' },
                  max: { value: 100, message: 'Stock cannot exceed 1000!' },
                  validate: (value) => {
                    if (isNaN(value)) return 'Only numbers allowed!';
                    if (!Number.isInteger(value))
                      return 'Stock must be a whole number!';
                    return true;
                  },
                })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stock.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <SizeSelector control={control} errors={errors} />
            </div>

            <div className="mt-3">
              <label className="block font-semibold text-neutral-300 mb-1">
                Select Discount Codes (optional)
              </label>
              {discount_isLoading ? (
                <p className="text-neutral-400">Loading Discount Codes...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discountCodes?.map((code: any) => (
                    <button
                      type="button"
                      key={code.id}
                      className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch('discountCodes')?.includes(code.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-neutral-800 text-neutral-300 border-neutral-600 hover:bg-neutral-700'}`}
                      onClick={() => {
                        const currentSelection = watch('discountCodes') || [];
                        const updatedSelection = currentSelection?.includes(
                          code.id,
                        )
                          ? currentSelection.filter(
                              (id: string) => id !== code.id,
                            )
                          : [...currentSelection, code.id];

                        setValue('discountCodes', updatedSelection);
                      }}
                    >
                      {code?.public_name} ({code.discountValue}{' '}
                      {code.discountType === 'percentage' ? '%' : '$'})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-neutral-800 p-6 rounded-lg w-112.5 text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image </h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(false)}
              />
            </div>
            <div className="relative w-full h-62.5 rounded-md overflow-hidden border border-neutral-600">
              <Image
                src={selectedImage}
                alt="product-image"
                fill
                className="object-fill"
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semi-bold">AI Enhancements</h3>
                <div className="grid grid-cols-2 gap-3 max-h-62.5 overflow-y-auto">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      type="button"
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${activeEffect === effect ? 'bg-blue-600 text-white' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={18} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-neutral-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-700 text-white rounded-md"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}

interface UploadedImage {
  fileId: string;
  file_url: string;
}
