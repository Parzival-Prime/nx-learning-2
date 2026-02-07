"use client"

import axiosInstance from "@seller-ui/src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ui/components/ui/breadcrumb';
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";


async function fetchOrders(){
    const res = await axiosInstance.get("/order/api/get-seller-orders")
    return res.data.orders
}

export default function page() {
    const [globalFilter, setGlobalFilter] = useState("")
    const {data: orders = [], isLoading} = useQuery({
        queryKey: ["seller-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5
    })

    const columns = useMemo(()=>[
        {
            accessorKey: "id",
            header: "Order ID",
            cell: ({row}: any)=>(
                <span className="text-white text-sm truncate">
                    #{row.original.id.slice(-6).toUpperCase()}
                </span>
            )
        },
        {
            accessorKey: "user.name",
            header: "Buyer",
            cell: ({row}: any)=>(
                <span className="text-white">
                    {row.original.user?.name ?? "Guest"}
                </span>
            )
        },
        {
            accessorKey: "earning",
            header: "Seller Earning",
            cell: ({row}: any)=>{
                const sellerShare = row.original.total * 0.9
                return (
                    <span className="text-green-400 font-medium">${sellerShare.toFixed(2)}</span>
                )
            }
        },
        {
            accessorKey: "fee",
            header: "Admin Fee",
            cell: ({row}: any)=>{
                const adminFee = row.original.total * 0.1
                return (<span
                className="text-yellow-400"
                >${adminFee.toFixed(2)}</span>)
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}: any)=>(
                <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.original.status === "Paid" 
                    ? "bg-green-600 text-white"
                    : "bg-yellow-500 text-white"
                }`}
                >{row.original.status}</span>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({row}: any)=>{
                const date = new Date(row.original.createdAt).toLocaleDateString()
                return <span className="text-white text-sm">{date}</span>
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({row}: any)=>(
                <Link
                href={`/order/${row.original.id}`}
                className="text-blue-400 hover:text-blue-300 transition"
                >
                    <Eye size={18} />
                </Link>
            )
        }
    ], [])

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter
    })

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Payments</h2>
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
              Payments
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="my-4 flex items-center bg-neutral-900 p-2 rounded-md flex-1">
        <Search size={18} />
        <input
        type="text"
        placeholder="Search orders..."
        className="w-full bg-transparent text-white outline-none"
        value={globalFilter}
        onChange={(e)=>setGlobalFilter(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-neutral-900 rounded-lg p-4">
        {isLoading ? (
            <p className="text-center text-white">Loading Payments...</p>
        ) : (
            <table className="w-full text-white">
                <thead>
                    {table.getHeaderGroups().map((headerGroup)=>(
                        <tr key={headerGroup.id} className="border-b border-neutral-800">
                            {headerGroup.headers.map((header)=>(
                                <th key={header.id} className="p-3 text-left text-sm">
                                    {flexRender(
                                        header.column.columnDef.header, header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row)=>(
                        <tr className="border-b border-neutral-800 hover:bg-neutral-900 transition">
                            {row.getVisibleCells().map((cell)=>(
                                <td key={cell.id} className="p-3 text-sm">
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

        {!isLoading && orders?.length === 0 && (
            <p className="text-center py-3 text-white">No Payments found!</p>
        )}
      </div>
    </div>
  )
}
