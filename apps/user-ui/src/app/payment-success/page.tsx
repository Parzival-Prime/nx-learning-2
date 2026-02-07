'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useStore } from "@user-ui/src/store/index"
import confetti from "canvas-confetti"
import { CheckCircle, Truck } from "lucide-react"
import { Suspense } from "react";


export default function page() {
    return (
    <Suspense fallback={<div>Loading success page...</div>}>
      <SuccessPage />
    </Suspense>
  );
}


const SuccessPage = ()=> {
const searchParams = useSearchParams()
    const sessionId = searchParams.get("sessionId")
    const router = useRouter()

    useEffect(()=>{
        useStore.setState({cart: []})

        confetti({
            particleCount: 120,
            spread: 90,
            origin: {y: 0.6}
        })
    },[])
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white text-center shadow-sm border border-neutral-200 rounded-lg max-w-md p-5">
        <div className="text-green-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
            Payment Successful 🎉
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
            Thank you for your purchase. Your order has been placed successfully!
        </p>

        <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-1.5 rounded-sm">
            <Truck className="w-6 h-6" />
            Track Order
        </button>

        <div className="mt-8 text-xs text-neutral-400">
            Payment Session ID: <span className="font-mono">{sessionId}</span>
        </div>
      </div>
    </div>
  )
}