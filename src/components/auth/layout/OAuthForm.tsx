'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatedFormItem, AnimatedButton } from '@/components/ui/animated-form'
import { authService } from '@/services/auth/authService'
import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'

interface OAuthFormProps {
  className?: string
  type?: 'signin' | 'signup'
}

export function OAuthForm({ className, type = 'signin' }: OAuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('')

  const handleGoogleAuth = async () => {
    try {
      const response = await authService.getGoogleLoginUrl();
      const url = response.data.url;
      console.log ('Redirecting to Google auth URL:', url)
      window.location.replace(url);
    } catch (error) {
      console.error('Google auth error:', error)
      setError('Có lỗi xảy ra khi đăng nhập bằng Google')
      toast.error('Có lỗi xảy ra khi đăng nhập bằng Google')
    }
  }

  return (
    <div className={className}>
      {error && <div className='mb-4 p-3 bg-destructive/15 text-destructive text-sm rounded-md'>{error}</div>}

      <AnimatedFormItem>
        <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
          <span className='relative z-10 bg-background px-2 text-muted-foreground'>{t('auth.common.or')}</span>
        </div>
      </AnimatedFormItem>

      <AnimatedButton
        type='button'
        variant='outline'
        className='w-full hover:border-primary hover:text-primary mt-3'
        onClick={handleGoogleAuth}
      >
        <Image src='/iconSvg/google.svg' alt='Google' width={20} height={20} />
        {type === 'signin' ? t('auth.common.signinWithGoogle') : t('auth.common.signupWithGoogle')}
      </AnimatedButton>
    </div>
  )
}
