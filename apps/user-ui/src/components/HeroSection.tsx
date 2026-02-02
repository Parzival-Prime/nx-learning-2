import { MoveRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

function HeroSection() {
  const router = useRouter()
  return (
    <div className='bg-[#0c3b35] h-[85vh] flex flex-col justify-center w-full '>
      <div className="m-auto md:w-[80%] w-90% md:flex h-full items-center">
        <div className="md:w-1/2">
        <p className="font-Roboto font-normal text-white pb-2 text-xl">
          starting from $40
        </p>
        <h1 className="text-white text-6xl font-extrabold font-Roboto">
          The best watch <br />
          Collection 2025
        </h1>
        <p className="font-Oregano text-3xl pt-4 text-white">
          Exclusive Offer <span className='text-yellow-400'>10%</span> this week
        </p>
        <br />
        <button
        onClick={()=>router.push("/products")}
        className='w-35 flex items-center justify-center gap-2 font-semibold h-10 bg-white rounded-md text-black hover:text-neutral-800'
        > 
          Shop Now <MoveRight />
        </button>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <Image src={"https://ik.imagekit.io/orz8zneye/products/product-1768800393939_BrEt43PDBN.jpg?updatedAt=1768800395795"} alt="" height={450} width={450} className='rounded-md' />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
