import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Flame, Eye, EyeOff } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  rememberMe: z.boolean().optional(),
})
type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { error: toastError } = useToast()
  const [showPw, setShowPw] = useState(false)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'aarav@fundblaze.com', password: 'password123' },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch {
      toastError('Login failed', 'Invalid email or password')
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-glow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-sans font-extrabold text-3xl text-white mb-1">Welcome back</h1>
            <p className="text-text-muted">Sign in to your FundBlaze account</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-8"
          >
            {/* Demo hint */}
            <div className="mb-5 p-3 rounded-xl bg-primary/8 border border-primary/20 text-xs text-primary">
              <strong>Demo credentials:</strong> aarav@fundblaze.com / password123
              <span className="block mt-1 opacity-70">Other accounts: priya, rohan, ananya, donor @fundblaze.com · admin@fundblaze.com / admin1234</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                {...register('email')}
                error={errors.email?.message}
              />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-secondary">Password</label>
                  <Link to="/" className="text-xs text-primary hover:text-primary-light">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-bg-elevated border border-white/8 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('rememberMe')} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>

              <Button type="submit" fullWidth size="lg" loading={isLoading}>
                Sign In
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/8" /></div>
                <div className="relative text-center"><span className="bg-bg-card px-3 text-xs text-text-muted">or continue with</span></div>
              </div>

              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 transition-colors text-sm text-white font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </form>
          </motion.div>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-primary-light transition-colors">Sign up free</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
