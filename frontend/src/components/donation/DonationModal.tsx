import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Check, Lock, AlertCircle, ShieldCheck } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import { api } from '@/services/api'
import { MockRazorpayCheckout } from './MockRazorpayCheckout'

interface DonationModalProps {
  campaignId: string
  campaignTitle: string
  isOpen: boolean
  onClose: () => void
}

const PRESET_AMOUNTS = [100, 500, 1000, 5000]

// Detect mock / dev mode — no real Razorpay key configured
const IS_MOCK_MODE =
  !import.meta.env.VITE_RAZORPAY_KEY_ID ||
  (import.meta.env.VITE_RAZORPAY_KEY_ID as string).includes('XXXX')

export function DonationModal({ campaignId, campaignTitle, isOpen, onClose }: DonationModalProps) {
  const qc = useQueryClient()
  const [amount,          setAmount]          = useState<number | ''>(500)
  const [customAmount,    setCustomAmount]    = useState('')
  const [isCustom,        setIsCustom]        = useState(false)
  const [anonymous,       setAnonymous]       = useState(false)
  const [message,         setMessage]         = useState('')
  const [errors,          setErrors]          = useState<Record<string, string>>({})
  const [loading,         setLoading]         = useState(false)
  const [success,         setSuccess]         = useState(false)
  const [mockRzpOpen,     setMockRzpOpen]     = useState(false)
  const [pendingOrderId,  setPendingOrderId]  = useState('')

  const { success: toastSuccess, error: toastError } = useToast()

  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : (amount as number)

  const clearErr = (key: string) => setErrors(e => { const n = { ...e }; delete n[key]; return n })

  const handlePreset = (val: number) => {
    setAmount(val); setIsCustom(false); setCustomAmount(''); clearErr('amount')
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!finalAmount || finalAmount < 1)
      errs.amount = 'Please select or enter a donation amount'
    if (!message.trim())
      errs.message = 'Please share why you are supporting this campaign'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Create order then open checkout ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const { data: res } = await api.post('/payments/razorpay/order', {
        campaignId, amount: finalAmount, currency: 'INR',
      })
      const { orderId } = res.data ?? res
      setPendingOrderId(orderId)

      if (IS_MOCK_MODE) {
        // Open our mock Razorpay UI
        setMockRzpOpen(true)
        setLoading(false)
      } else {
        // Real Razorpay SDK
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rzp = new (window as any).Razorpay({
            key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount:      Math.round(finalAmount * 100),
            currency:    'INR',
            name:        'FundBlaze',
            description: `Donation to ${campaignTitle}`,
            order_id:    orderId,
            theme:       { color: '#f97316' },
            handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              await handleVerify(response)
            },
            modal: { ondismiss: () => setLoading(false) },
          })
          rzp.on('payment.failed', () => {
            toastError('Payment failed', 'Please try again.')
            setLoading(false)
          })
          rzp.open()
        }
        document.body.appendChild(s)
      }
    } catch (err: unknown) {
      toastError('Payment error', err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  // ── Verify payment (called from both real & mock) ──────────────────────────
  const handleVerify = async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
    try {
      await api.post('/payments/razorpay/verify', {
        ...response,
        message: message.trim(),
        anonymous,
      })
      
      // Invalidate relevant queries so the UI updates
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['donations', campaignId] })
      qc.invalidateQueries({ queryKey: ['my-stats'] })
      qc.invalidateQueries({ queryKey: ['my-donations'] })

      setMockRzpOpen(false)
      toastSuccess(`Thank you! ${formatCurrency(finalAmount)} donated successfully.`)
      setSuccess(true)
    } catch {
      toastError('Verification failed', 'Contact support with your payment ID.')
    }
    setLoading(false)
  }

  const handleClose = () => {
    setSuccess(false); setAmount(500); setCustomAmount(''); setIsCustom(false)
    setMessage(''); setErrors({}); setLoading(false); setMockRzpOpen(false)
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" title={success ? undefined : 'Support this campaign'}>
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-success/15 border-2 border-success/40 flex items-center justify-center mx-auto mb-5"
              >
                <Check className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white font-sans mb-2">Thank You! 🎉</h3>
              <p className="text-text-secondary mb-1">
                Your donation of <span className="text-primary font-bold">{formatCurrency(finalAmount as number)}</span> has been received.
              </p>
              <p className="text-sm text-text-muted mb-8">
                You're making a real difference to <span className="text-white">{campaignTitle}</span>
              </p>
              <Button onClick={handleClose} fullWidth>Back to Campaign</Button>
            </motion.div>

          ) : (
            <motion.div key="form" className="space-y-5 -mt-2">

              {/* Amount */}
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-3">
                  Select Amount <span className="text-red-400">*</span>
                </p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map(val => (
                    <button key={val} onClick={() => handlePreset(val)}
                      className={cn(
                        'py-2.5 rounded-xl border text-sm font-bold transition-all',
                        !isCustom && amount === val
                          ? 'bg-primary/15 border-primary/50 text-primary'
                          : 'bg-white/5 border-white/8 text-text-secondary hover:border-white/20 hover:text-white'
                      )}
                    >₹{val}</button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                  <input type="number" placeholder="Custom amount" value={customAmount} min="1"
                    onChange={(e) => { setCustomAmount(e.target.value); setIsCustom(true); clearErr('amount') }}
                    onFocus={() => setIsCustom(true)}
                    className={cn(
                      'w-full pl-8 pr-4 py-2.5 rounded-xl bg-bg-elevated border text-white placeholder:text-text-muted text-sm transition-all focus:outline-none',
                      errors.amount ? 'border-red-500/60 ring-1 ring-red-500/20'
                        : isCustom ? 'border-primary/50 ring-1 ring-primary/20'
                        : 'border-white/8 focus:border-primary/40'
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />{errors.amount}
                  </p>
                )}
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/3 border border-white/8">
                <div>
                  <p className="text-sm font-medium text-white">Donate anonymously</p>
                  <p className="text-xs text-text-muted">Your name won't appear on the donors list</p>
                </div>
                <button role="switch" aria-checked={anonymous} onClick={() => setAnonymous(v => !v)}
                  className={cn('w-11 h-6 rounded-full transition-colors relative', anonymous ? 'bg-primary' : 'bg-white/15')}
                >
                  <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm', anonymous && 'translate-x-5')} />
                </button>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    Leave a message <span className="text-red-400">*</span>
                  </label>
                  <span className={cn('text-xs', message.length > 180 ? 'text-warning' : 'text-text-muted')}>
                    {message.length}/200
                  </span>
                </div>
                <textarea
                  placeholder="Share why you're supporting this campaign..."
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); clearErr('message') }}
                  maxLength={200} rows={2}
                  className={cn(
                    'w-full rounded-xl bg-bg-elevated border text-white placeholder:text-text-muted',
                    'px-4 py-3 text-sm transition-all duration-200 resize-none',
                    'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
                    errors.message ? 'border-red-500/60 ring-1 ring-red-500/20' : 'border-white/8'
                  )}
                />
                {errors.message && (
                  <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />{errors.message}
                  </p>
                )}
              </div>

              {/* Payment notice */}
              <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/8 px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white mb-0.5">Secure Payment via Razorpay</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    After clicking Donate, you'll enter your card, UPI, or net banking details in Razorpay's encrypted checkout. We never store your payment information.
                  </p>
                </div>
              </div>

              {/* Order summary */}
              <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">You're donating</p>
                  <p className="text-xl font-bold text-primary font-sans">{finalAmount ? formatCurrency(finalAmount) : '₹0'}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Lock className="w-3 h-3" />Secured by Razorpay
                </div>
              </div>

              <Button onClick={handleSubmit} loading={loading} disabled={loading} fullWidth size="lg" className="mt-2">
                <Heart className="w-4 h-4" />
                {loading ? 'Opening payment...' : `Donate ${finalAmount ? formatCurrency(finalAmount) : ''}`}
              </Button>

            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      {/* Mock Razorpay checkout overlay */}
      <MockRazorpayCheckout
        isOpen={mockRzpOpen}
        amount={finalAmount as number}
        campaignTitle={campaignTitle}
        orderId={pendingOrderId}
        onSuccess={handleVerify}
        onDismiss={() => { setMockRzpOpen(false); setLoading(false) }}
      />
    </>
  )
}
