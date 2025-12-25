import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className='w-full bg-white'>
      <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
        <Link href={"/"}>h1</Link>
      </div>
    </div>
  )
}

export default Header
