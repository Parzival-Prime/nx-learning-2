import { X } from 'lucide-react';

export default function DeleteDiscountCodeModal({
  discount,
  onClose,
  onConfirm,
}: {
  discount: any;
  onClose: () => void;
  onConfirm?: any;
}) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-neutral-900 p-6 rounded-lg w-112.5 shadow-lg">
        <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
          <h3 className="text-xl text-white">Delete Discount Code</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <p className='text-neutral-300 mt-4'>
            Are you sure you want to delete{" "}
            <span className='font-semibold text-white'>{discount.public_name}</span> ?
            <br />
            This action <span className='text-red-600'>**cannot be undone**</span>
        </p>

        <div className="flex justify-end gap-3 mt-6">
            <button 
            type='button'
            onClick={onClose}
            className="bg-neutral-600 hover:bg-neutral-700 px-4 py-2 rounded-md text-white transition">
                Cancel
            </button>
            <button
            type='button'
            onClick={onConfirm}
            className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white transition font-semibold'
            >
                Delete
            </button>
        </div>
      </div>
    </div>
  );
}
