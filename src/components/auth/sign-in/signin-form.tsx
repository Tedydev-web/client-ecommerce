'use client'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { LoginSchema } from '../schema'
import { useSignin } from './useSignin'
import { AnimatedForm, AnimatedFormItem, AnimatedButton } from '@/components/ui/animated-form'
import { OAuthForm } from '../layout/OAuthForm'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function SigninForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { handleSignin, loading } = useSignin()
  const t = useTranslations()
  const Schema = LoginSchema(t)

  type LoginFormData = z.infer<typeof Schema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(Schema),
    defaultValues: { 
      email: '', 
      password: '',
      rememberMe: false
    }
  });

  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    const { rememberMe, ...submissionValues } = values
    await handleSignin(submissionValues)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <AnimatedForm>
          {/* Tiêu đề */}
          <AnimatedFormItem>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-4xl font-bold">{t("auth.login.title")}</h1>
              <p className="text-balance text-md text-muted-foreground">
                {t("auth.login.subtitle")}
              </p>
            </div>
          </AnimatedFormItem>

          {/* Form */}
          <div className="grid gap-6">
            <AnimatedFormItem>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.common.email")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder={t("auth.login.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedFormItem>

            <AnimatedFormItem>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("auth.common.password")}</FormLabel>
                      <Link
                        href="/verify-email?action=forgot"
                        className="text-sm text-primary hover:underline underline-offset-4"
                      >
                        {t("auth.login.forgot password")}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-600 cursor-pointer hover:text-primary transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-600 cursor-pointer hover:text-primary transition-colors" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedFormItem>

            <AnimatedFormItem>
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {t("auth.login.remember me")}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </AnimatedFormItem>

            <AnimatedButton
              size="sm"
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? t("auth.login.logging in...") : t("auth.login.login")}
            </AnimatedButton>

            {/* OAuth Form */}
            <OAuthForm type="signin" />

            {/* Link đến đăng ký */}
            <AnimatedFormItem>
              <div className="text-center text-sm">
                {t("auth.login.no account")}{" "}
                <Link
                  href="/verify-email?action=signup"
                  className="underline underline-offset-4 text-primary hover:text-primary/90"
                >
                  {t("auth.login.register")}
                </Link>
              </div>
            </AnimatedFormItem>
          </div>
        </AnimatedForm>
      </form>
    </Form>
  );
}
