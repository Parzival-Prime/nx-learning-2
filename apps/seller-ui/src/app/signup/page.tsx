'use client';

import { cn } from '@ui/lib/utils';
import { Button } from '@ui/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ui/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@ui/components/ui/field';
import { Input } from '@ui/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@ui/components/ui/input-otp';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { countries } from '@seller-ui/src/constants/countries';
import CreateShop from '@seller-ui/src/components/create-shop';
import Image from 'next/image';

type otpFormData = {
  otp: string;
};

type signUpFormData = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  country: string;
};

type sellerFormData = {
  name: string;
  email: string;
  password: string;
  description: string;
  opening_hours: string;
  country: string;
};

export default function page() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setSeverError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [sellerData, setSellerData] = useState<signUpFormData>();
  const [sellerId, setSellerId] = useState();
  const [showOtp, setShowOtp] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const router = useRouter();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // SignUp Form Handling Logic

  const signUpForm = useForm<signUpFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      password: '',
      country: '',
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: signUpFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, formData: any) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);      
      setTimer(60);
      startResendTimer();
    },
  });

  const onSubmitSignup = async (data: signUpFormData) => {      
    signUpMutation.mutate(data);
  };

  function resendOtp() {
    if (sellerData) {
      signUpMutation.mutate(sellerData as any);
    }
  }

  // OTP Verification Form Handling Logic

  const otpForm = useForm<otpFormData>();

  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-verification`,
        {
          ...sellerData,
          otp,
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const submitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    verifyOtpMutation.mutate(formData.get('otp') as string);
  };

  async function connectStripe() {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`, {sellerId})
      if(response?.data?.url){
        window.location.href = response.data.url
      }
    } catch (error) {
      console.log("Stripe Connection Error: ", error)
    }
  }

  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="relative flex justify-between items-center md:w-[40%] mb-8">
        <div className="absolute top-[40%] left-10 w-50 md:w-[90%] h-px -z-10 bg-neutral-600" />
        {[1, 2, 3].map((step) => (
          <div key={step} className="relative">
            <div
              className={`flex -translate-y-1 w-10 h-10 items-center justify-center rounded-full font-bold ${step <= activeStep ? 'bg-emerald-400 text-green-950 shadow-md shadow-emerald-300/60' : 'bg-neutral-500 text-white'}`}
            >
              {step}
            </div>
            <span className="absolute text-xs text-neutral-300 whitespace-nowrap top-11 left-1/2 -translate-x-1/2">
              {step === 1
                ? 'Create Account'
                : step === 2
                  ? 'Setup Shop'
                  : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>
      <div className="max-w-sm mt-5">
        {activeStep === 1 &&
          (!showOtp ? (
            <div className={cn('flex flex-col gap-6')}>
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Create your account</CardTitle>
                  <CardDescription>
                    Enter your email below to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={signUpForm.handleSubmit(onSubmitSignup)}
                  >
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Parzival Prime"
                          required
                          {...signUpForm.register('name', {
                            required: 'Name is required',
                            minLength: {
                              value: 3,
                              message:
                                'Name should be at least 3 characters long',
                            },
                          })}
                        />
                        {signUpForm.formState.errors.name && (
                          <p className="text-red-500 text-sm">
                            {String(signUpForm.formState.errors.name.message)}
                          </p>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          {...signUpForm.register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Invalid email address',
                            },
                          })}
                        />
                        {signUpForm.formState.errors.email && (
                          <p className="text-red-500 text-sm">
                            {String(signUpForm.formState.errors.email.message)}
                          </p>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="-------- -------- ------"
                          required
                          {...signUpForm.register('phone_number', {
                            required: 'Phone Number is required',
                            pattern: {
                              value: /^\+?[0-9\s\-]{7,15}$/,
                              message: 'Invalid Phone number format',
                            },
                          })}
                        />
                        {signUpForm.formState.errors.phone_number && (
                          <p className="text-red-500 text-sm">
                            {String(signUpForm.formState.errors.phone_number.message)}
                          </p>
                        )}
                      </Field>

                      <Field className="grid  gap-4">
                        <Field>
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <div className="relative">
                            <Input
                              id="password"
                              type={passwordVisible ? 'text' : 'password'}
                              required
                              {...signUpForm.register('password', {
                                required: 'Password is required',
                                minLength: {
                                  value: 6,
                                  message:
                                    'Password must be at least 6 characters long',
                                },
                              })}
                            />
                            <button
                              type="button" // ✅ REQUIRED
                              className="text-xs absolute inset-y-0 right-3 flex items-center text-gray-400"
                              onClick={() =>
                                setPasswordVisible((prev) => !prev)
                              }
                            >
                              {passwordVisible ? <Eye /> : <EyeOff />}
                            </button>
                          </div>
                          {signUpForm.formState.errors.password && (
                            <p className="text-red-500 text-sm">
                              {String(
                                signUpForm.formState.errors.password.message,
                              )}
                            </p>
                          )}
                        </Field>
                        <FieldDescription>
                          Must be at least 6 characters long.
                        </FieldDescription>
                      </Field>

                      
                      <Controller
                        name="country"
                        control={signUpForm.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Countries</SelectLabel>

                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.code}
                                    value={country.code}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <Field>
                        <Button
                          type="submit"
                          disabled={signUpMutation.isPending}
                        >
                          {signUpMutation.isPending
                            ? 'Creating...'
                            : 'Create Account'}
                        </Button>
                        <FieldDescription className="text-center">
                          Already have an account? <a href="/login">login</a>
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>
              <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our{' '}
                <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
              </FieldDescription>
            </div>
          ) : (
            <Card className='w-90'>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">
                  Enter verification code
                </CardTitle>
                <CardDescription>
                  We sent a 6-digit code to your email.
                </CardDescription>
              </CardHeader>
              <CardContent className='w-full '>
                <form onSubmit={submitOtp} className=''>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="otp" className="sr-only">
                        Verification code
                      </FieldLabel>
                      <InputOTP maxLength={4} id="otp" name="otp" required>
                        <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          {/* <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} /> */}
                        </InputOTPGroup>
                      </InputOTP>
                      <FieldDescription className="text-center">
                        Enter the 4-digit code sent to your email.
                      </FieldDescription>
                    </Field>
                    <Button
                      type="submit"
                      disabled={verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending ? 'verifying...' : 'verify'}
                    </Button>
                    <FieldDescription className="text-center">
                      Didn&apos;t receive the code?{' '}
                      <button
                        disabled={canResend}
                        onClick={resendOtp}
                        className="cursor-pointer"
                      >
                        {canResend ? 'Resend' : `Resend in ${timer}s`}
                      </button>
                    </FieldDescription>
                    {verifyOtpMutation?.isError &&
                      verifyOtpMutation.error instanceof AxiosError && (
                        <p className="text-red-500 text-sm mt-2">
                          {verifyOtpMutation.error.response?.data.message ||
                            verifyOtpMutation.error.message}
                        </p>
                      )}
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          ))}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId!} setActiveStep={setActiveStep}  />
        )}
        {activeStep === 3 && (
          <div className='text-center'>
            <h3 className='text-2xl font-semibold'>Withdraw Method</h3>
            <br />
            <button className='w-full m-auto flex items-center justify-center gap-2 text-lg bg-neutral-800  hover:bg-neutral-700 transition-all duration-1 ease-in-out text-white py-2 rounded-lg'
            onClick={connectStripe}
            >
              Connect Stripe <Image src={"/stripe-2.svg"} width={22} height={22} alt='stripe logo' className='rounded-sm' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
