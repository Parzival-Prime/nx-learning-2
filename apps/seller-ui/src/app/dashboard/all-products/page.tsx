'use client';

import axiosInstance from '@seller-ui/src/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
  PlusCircle,
  RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import DeleteConfirmationModal from "@ui/components/delete-confirmation-modal"







async function fetchProducts() {
  const res = await axiosInstance.get('/product/api/get-shop-products');
  return res?.data?.products;
}

export default function page() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  async function deleteProduct(productId: string) {
    await axiosInstance.delete(`/product/api/delete-product/${productId}`)
  }

  async function restoreProduct(productId: string) {
    await axiosInstance.put(`/product/api/restore-product/${productId}`)
  }

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: ()=>{
      queryClient.invalidateQueries({ queryKey: ["shop-products"] })
      setShowDeleteModal(false)
    }
  })

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: ()=>{
      queryClient.invalidateQueries({ queryKey: ["shop-products"] })
      setShowDeleteModal(false)
    }
  })

  const columns = useMemo(() => [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }: any) => (
        <Image
          src={row.original.images[0]?.url}
          alt={row.original.images[0]?.id}
          width={200}
          height={200}
          className="w-12 h-12 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }: any) => {
        const truncatedTitle =
          row.original.title.length > 25
            ? `${row.original.title.substring(0, 25)}...`
            : row.original.title;

        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="text-blue-400 hover:underline"
            title={row.original.title}
          >
            {truncatedTitle}
          </Link>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }: any) => (
        <span
          className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}
        >
          {row.original.stock} left
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1 text-shadow-yellow-400">
          <Star fill="#fde047" size={18} />
          <span className="text-white">{row.original.ratings || 5}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({row}: any)=>(
        <div className='flex gap-3'>
          <Link
          href={`/product/${row.original.id}`}
          className='text-blue-400 hover:text-blue-300 transition' 
          >
            <Eye size={18} />
          </Link>
          <Link
          href={`/product/edit/${row.original.id}`}
          className='text-yellow-400 hover:text-yellow-300 transition'
          >
            <Pencil size={18} />
          </Link>
          <button
            className='text-green-400 hover:text-green-300 transition'
            // onClick={()=>openAnalytics(row.original)}
          >
            <BarChart size={18} />
          </button>
          <button
          className={`${!row.original?.isDeleted ? 'text-red-400 hover:text-red-300 transition': "text-green-500 hover:text-green-300"}`}
          onClick={()=>openDeleteModal(row.original)}
          >
            {!row.original?.isDeleted ? <Trash size={18} /> : <RefreshCcw size={18} /> }
          </button>
        </div>
      )
    }
  ], []);



  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  function openDeleteModal(product: any) {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }
  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
        <Link
          href={'/dashboard/create-product'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 flex items-center gap-2 py-2 rounded-lg"
        >
          <PlusCircle size={18} /> {" "} Create Product
        </Link>
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
            <BreadcrumbLink href="/dashboard/create-product">
              All Shop Products
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="my-4 flex items-center bg-neutral-900 p-2 rounded-md flex-1">
        <Search size={18} className='text-neutral-400 mr-2' />
        <input 
        type="text"
        placeholder='Search products...'
        className='w-full bg-transparent text-white outline-none'
        value={globalFilter}
        onChange={(e)=>setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-neutral-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
                {table.getHeaderGroups().map((headerGroup)=>(
                  <tr key={headerGroup.id} className='border-b border-neutral-800'>
                    {headerGroup.headers.map((header)=>(
                      <th key={header.id} className='p-3 text-left'>
                        {header.isPlaceholder
                        ? null 
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      </th>
                    ))}
                  </tr>
                ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row)=>(
                <tr
                key={row.id}
                className='border-b border-neutral-800 hover:bg-neutral-900 transition'
                >
                  {row.getVisibleCells().map((cell)=>(
                    <td key={cell.id} className='p-3'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal 
          product={selectedProduct} 
          onClose={()=>setShowDeleteModal(false)}
          onConfirm={()=>deleteMutation.mutate(selectedProduct?.id)}
          onRestore={()=>restoreMutation.mutate(selectedProduct?.id)}
          />
        )}
      </div>
    </div>
  );
}
