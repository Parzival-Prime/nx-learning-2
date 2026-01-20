import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ImagePlaceholder({
  size,
  small,
  images,
  onImageChange,
  onRemove,
  setOpenImageModal,
  setSelectedImage,
  pictureUploadingLoader,
  defaultImage = null,
  index = null,
}: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index!);
    }
  }

  return (
    <div
      className={`relative ${small ? 'h-45' : 'h-95'} w-full cursor-pointer bg-[#1e1e1e] border border-neutral-700 rounded-lg flex flex-col justify-center items-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index!)}
            disabled={pictureUploadingLoader}
            className="absolute top-3 right-3 p-2  rounded! bg-rose-600 shadow-lg cursor-pointer"
          >
            <X size={16} />
          </button>
          <button
          type='button'
            className="absolute top-3 right-17.5 p-2 rounded! bg-blue-500 shadow-lg cursor-pointer"
            onClick={() => {
              setOpenImageModal(true)
              setSelectedImage(images[index]?.file_url)
            }}
            disabled={pictureUploadingLoader}
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
        htmlFor={`image-upload-${index}`}
        className='absolute top-3 right-3 p-2 rounded! bg-slate-700 shadow-lg cursor-pointer'>
            <Pencil size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image src={imagePreview} width={400} height={300} alt='uploaded' className='w-full h-full object-cover rounded-lg' />
      ) : (
        <>
        <p className={`text-neutral-500 ${small ? "text-xl" : "text-2xl"} font-semibold`}>{size}</p>
        <p className={`text-neutral-400 pt-2 text-center ${small ? "text-sm" : "text-lg"}`}>Please choose an image <br /> as per the expected ratio</p>
        </>
      )}
    </div>
  );
}

interface Props {
  size: string;
  small?: boolean;
  images: any
  pictureUploadingLoader: boolean
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  setOpenImageModal: (openImageModal: boolean) => void;
  setSelectedImage: (e: string)=>void;
  defaultImage: string | null;
  index?: any;
}
