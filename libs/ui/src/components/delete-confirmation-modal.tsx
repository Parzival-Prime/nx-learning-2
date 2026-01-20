import { X } from "lucide-react";

export default function DeleteConfirmationModal({product, onClose, onConfirm, onRestore}: any) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center">
      <div className="bg-neutral-800 p-6 rounded-lg md:w-112.5 shadow-lg">

        <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
            <h3 className="text-xl text-white">{product?.isDeleted ? "Restore" : "Delete"} Product</h3>
            <button onClick={onClose} className="text-neutral-400 hover:text-white">
                <X size={22} />
            </button>
        </div>

        <p className="text-neutral-300 mt-4">
            Are you sure you want to {product?.isDeleted ? "Restore" : "Delete"} {" "}
            <span className="font-semibold text-white">{product.title}</span>?
            <br />
            {product?.isDeleted ? "This product will be removed from **delete state**" : "This product will be moved to a **delete state** and permanently removed **after 24 hours**"}
        </p>

        <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} 
            className="bg-neutral-600 hover:bg-neutral-700 px-4 py-2 rounded-md text-white "
            >
                Cancel
            </button>
            <button onClick={!product?.isDeleted ? onConfirm : onRestore} 
            className={` ${product?.isDeleted ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} px-4 py-2 rounded-md text-white font-semibold transition`}
            >
                {product?.isDeleted ? "Restore" : "Delete"}
            </button>
        </div>
      </div>
    </div>
  )
}
