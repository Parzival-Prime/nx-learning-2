'use client';

import { cn } from '@ui/lib/utils';
import { Button } from '@/libs/ui/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/libs/ui/src/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/libs/ui/src/components/ui/field';
import { Input } from '@/libs/ui/src/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { toast } from 'sonner';

type FormData = {
  email: string;
};

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [userEmail, setUserEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setSeverError] = useState<string | null>(null);
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

  const requestOtpForm = useForm<FormData>();

  const requestOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-forgot-password`,
        { email },
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (_, email) => {
      setUserEmail(email);
      toast.success('OTP sent! Pleasae check you email.');
      setStep('otp');
      setSeverError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid Credentials';
      toast.error(errMessage);
      setSeverError(errMessage);
    },
  });
  const onSubmit = (data: FormData) => {
    requestOtpMutation.mutate(data.email);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-otp`,
        {
          email: userEmail,
          otp: otp,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('reset');
      setSeverError(null);
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid Credentials';
      toast.error(errMessage);
      setSeverError(errMessage);
    },
  });

  const verifyOtpForm = useForm<{ otp: string }>();

  const verifyOtp = (data: { otp: string }) => {
    verifyOtpMutation.mutate(data.otp);
  };

  const resendOtp = () => {
    requestOtpMutation.mutate(userEmail);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-reset-password`,
        { email: userEmail, newPassword: password },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successful!');
      setSeverError(null);
      router.push('/login');
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid Credentials';
      toast.error(errMessage);
      setSeverError(errMessage);
    },
  });

  const resetPasswordForm = useForm<{ password: string }>();

  const resetPassword = (data: { password: string }) => {
    resetPasswordMutation.mutate(data.password);
  };

  return step === 'email' ? (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to get OTP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={requestOtpForm.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...requestOtpForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {requestOtpForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {String(requestOtpForm.formState.errors.email.message)}
                  </p>
                )}
              </Field>

              <Field>
                <Button type="submit" disabled={requestOtpMutation.isPending}>
                  {requestOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
                </Button>
                <FieldDescription className="text-center">
                  Wanna go back to <a href="/login">login</a>?
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  ) : step === 'otp' ? (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verifyOtpForm.handleSubmit(verifyOtp)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                Verification code
              </FieldLabel>
              <Controller
                name="otp"
                control={verifyOtpForm.control}
                rules={{
                  required: 'OTP is required',
                  minLength: {
                    value: 4,
                    message: 'OTP must be 4 digits',
                  },
                }}
                render={({ field }) => (
                  <InputOTP
                    maxLength={4}
                    value={field.value || ''}
                    onChange={field.onChange}
                    onComplete={field.onChange}
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              <FieldDescription className="text-center">
                Enter the 4-digit code sent to your email.
              </FieldDescription>
            </Field>
            <Button type="submit" disabled={verifyOtpMutation.isPending}>
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
                  {verifyOtpMutation.error.message}
                </p>
              )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  ) : (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new Password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={resetPasswordForm.handleSubmit(resetPassword)}>
            <FieldGroup>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? 'text' : 'password'}
                    required
                    {...resetPasswordForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                  />
                  <button
                    className="text-xs absolute inset-y-0 right-3 flex items-center text-gray-400"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {resetPasswordForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {String(
                      resetPasswordForm.formState.errors.password.message,
                    )}
                  </p>
                )}
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset'}
                </Button>
                <FieldDescription className="text-center">
                  Wanna go back to <a href="/login">login</a>?
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
