'use client';

import { cn } from '@packages/shadcnUI/src/lib/utils';
import { Button } from '@packages/shadcnUI/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@packages/shadcnUI/src/components/ui/card';
import { Input } from '@packages/shadcnUI/src/components/ui/input';
import { Label } from '@packages/shadcnUI/src/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {Eye, EyeOff} from "lucide-react"

type FormData = {
    name: string
  email: string;
  password: string;
};

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setSeverError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60)
  const [userData, setUserData] = useState<FormData | null>(null)
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {};

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
          Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Parzival Prime"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                        value: 3,
                        message: "Name should be at least 3 characters long"
                    }
                  })}
                  required
                />
                {errors.name && (
                  <p className='text-red-500 text-sm'>
                    {String(errors.name.message)}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$/,
                      message: 'Invalid email address',
                    },
                  })}
                  required
                />
                {errors.email && (
                  <p className='text-red-500 text-sm'>
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                <div className='relative'>
                  <Input
                    id="password"
                    type={passwordVisible ? 'text' : 'password'}
                    required
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })} 
                  />
                  <button className='text-xs absolute inset-y-0 right-3 flex items-center text-gray-400' onClick={()=>setPasswordVisible(prev => !prev)}>
                    {passwordVisible ? <Eye/> : <EyeOff/>}
                  </button>
                  {errors.password && (
                  <p className='text-red-500 text-sm'>
                    {String(errors.password.message)}
                  </p>
                )}
                </div>
              </div>
              {serverError && (
                  <p className='text-red-500 text-sm'>
                    {String(serverError)}
                  </p>
                )}
              <Button type="submit" className="w-full">
                SignUp
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
