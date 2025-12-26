
import { LoginForm } from '@packages/shadcnUI/src/components/login-form'
import HeroSection from '@user-ui/src/components/HeroSection'
import { Button } from '@packages/shadcnUI/src/components/ui/button';

function page() {
  return (
    <main className='flex items-center justify-center h-[100vh] z-[200]'>
     <Button size="lg" variant={'destructive'} />
      {/* <HeroSection /> */}
    </main>
  )
}

export default page
