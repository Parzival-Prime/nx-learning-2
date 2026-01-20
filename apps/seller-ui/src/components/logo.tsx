import Image from 'next/image';

export default function logo() {
  return (
    <div className='flex justify-center items-center'>
      <Image src="/logo.png" width={30} height={30} alt="logo" />
    </div>
  );
}
