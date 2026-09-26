import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Flame, Eye, EyeOff, Heart, Megaphone } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const signupSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['donor', 'creator']),
  agreedToTerms: z.boolean().refine(v => v, 'You must agree to terms'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type SignupForm = z.infer<typeof signupSchema>

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 :
    password.length < 6 ? 1 :
    password.length < 8 ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-error', 'bg-warning', 'bg-primary', 'bg-success']

  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= strength ? colors[strength] : 'bg-white/10')} />
        ))}
      </div>
      <p className={cn('text-xs', strength <= 1 ? 'text-error' : strength === 2 ? 'text-warning' : strength === 3 ? 'text-primary' : 'text-success')}>
        {labels[strength]}
      </p>
    </div>
  )
}

export function SignupPage() {
  const { signup, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { error: toastError } = useToast()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'donor', agreedToTerms: false },
  })

  const role = watch('role')
  const password = watch('password') || ''

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup({ ...data, role: data.role as 'donor' | 'creator' })
      navigate('/dashboard')
    } catch {
      toastError('Signup failed', 'This email may already be in use.')
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-glow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-sans font-extrabold text-3xl text-white mb-1">Join FundBlaze</h1>
            <p className="text-text-muted">Start your crowdfunding journey today</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Full Name" placeholder="Priya Sharma" autoComplete="name" {...register('name')} error={errors.name?.message} />
              <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} error={errors.email?.message} />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-text-secondary">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    {...register('password')}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-bg-elevated border border-white/8 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
                {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              {/* Role selector */}
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'donor', icon: Heart, label: 'Donate', desc: 'Support causes I care about' },
                    { value: 'creator', icon: Megaphone, label: 'Create Campaigns', desc: 'Raise funds for my project' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('role', opt.value as 'donor' | 'creator')}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
                        role === opt.value
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-white/8 bg-white/3 text-text-muted hover:border-white/20 hover:text-white'
                      )}
                    >
                      <opt.icon className="w-6 h-6" />
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-xs opacity-70">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('agreedToTerms')} className="w-4 h-4 mt-0.5 rounded accent-primary shrink-0" />
                <span className="text-sm text-text-secondary">
                  I agree to FundBlaze's <Link to="/" className="text-primary underline">Terms of Service</Link> and <Link to="/" className="text-primary underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-xs text-error">{errors.agreedToTerms.message}</p>}

              <Button type="submit" fullWidth size="lg" loading={isLoading}>
                Create Account
              </Button>
            </form>
          </motion.div>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-light transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
