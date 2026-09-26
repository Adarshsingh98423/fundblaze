import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  CreditCard, Smartphone, Building2, Wallet,
  ChevronRight, Shield, Check,
  AlertCircle, X, Zap, Lock
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface MockRazorpayProps {
  isOpen: boolean
  amount: number
  campaignTitle: string
  onSuccess: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
  onDismiss: () => void
  orderId: string
}

type PayTab = 'upi' | 'card' | 'netbanking' | 'wallet'
type Stage = 'select' | 'processing' | 'success' | 'failed'

const BANKS = [
  { code: 'SBIN', name: 'SBI',   full: 'State Bank of India', color: '#1a3c8f', bg: '#e8edf8' },
  { code: 'HDFC', name: 'HDFC',  full: 'HDFC Bank',           color: '#004c8f', bg: '#e6eef8' },
  { code: 'ICIC', name: 'ICICI', full: 'ICICI Bank',          color: '#f47920', bg: '#fef3ea' },
  { code: 'AXIS', name: 'Axis',  full: 'Axis Bank',           color: '#97144d', bg: '#f8eaf1' },
  { code: 'KOTK', name: 'Kotak', full: 'Kotak Mahindra',      color: '#e0202f', bg: '#fceaeb' },
  { code: 'PUNB', name: 'PNB',   full: 'Punjab National',     color: '#003399', bg: '#e6ebf8' },
]

const WALLETS = [
  { id: 'paytm',      name: 'Paytm',       color: '#002970', accent: '#00baf2', initial: 'P'  },
  { id: 'phonepe',    name: 'PhonePe',     color: '#5f259f', accent: '#7c3aed', initial: 'Ph' },
  { id: 'amazon',     name: 'Amazon Pay',  color: '#ff9900', accent: '#f59e0b', initial: 'A'  },
  { id: 'freecharge', name: 'Freecharge',  color: '#f26522', accent: '#ea580c', initial: 'F'  },
]

const UPI_HANDLES = ['@okaxis', '@paytm', '@ybl', '@ibl', '@okhdfcbank', '@oksbi']

const PROCESSING_STEPS = [
  { msg: 'Connecting to your bank\u2026',  pct: 20 },
  { msg: 'Authenticating request\u2026',   pct: 45 },
  { msg: 'Encrypting transaction\u2026',   pct: 68 },
  { msg: 'Verifying payment\u2026',        pct: 85 },
  { msg: 'Finalising\u2026',               pct: 97 },
]

export function MockRazorpayCheckout({
  isOpen, amount, campaignTitle, onSuccess, onDismiss, orderId,
}: MockRazorpayProps) {
  const [tab,            setTab]            = useState<PayTab>('upi')
  const [stage,          setStage]          = useState<Stage>('select')
  const [upiId,          setUpiId]          = useState('')
  const [upiError,       setUpiError]       = useState('')
  const [cardNum,        setCardNum]        = useState('')
  const [cardExpiry,     setCardExpiry]     = useState('')
  const [cardCvv,        setCardCvv]        = useState('')
  const [cardName,       setCardName]       = useState('')
  const [cardErrors,     setCardErrors]     = useState<Record<string, string>>({})
  const [selectedBank,   setSelectedBank]   = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [progress,       setProgress]       = useState(0)
  const [stepIdx,        setStepIdx]        = useState(0)
  const [cardFlipped,    setCardFlipped]    = useState(false)
  const [upiSuggestions, setUpiSuggestions] = useState(false)
  const upiInputRef = useRef<HTMLInputElement>(null)
  const btnControls = useAnimation()

  const fmt = (n: number) => `\u20B9${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

  useEffect(() => {
    if (isOpen) {
      setTab('upi'); setStage('select')
      setUpiId(''); setUpiError('')
      setCardNum(''); setCardExpiry(''); setCardCvv(''); setCardName('')
      setCardErrors({}); setSelectedBank(''); setSelectedWallet('')
      setProgress(0); setStepIdx(0); setCardFlipped(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (stage !== 'processing') return
    let i = 0
    setStepIdx(0); setProgress(0)

    const stepTimer = setInterval(() => {
      i = Math.min(i + 1, PROCESSING_STEPS.length - 1)
      setStepIdx(i)
    }, 560)

    const progTimer = setInterval(() => {
      setProgress(p => {
        const target = PROCESSING_STEPS[i]?.pct ?? 97
        const gap = target - p
        if (gap <= 0) return p
        return p + gap * 0.12 + 0.4
      })
    }, 60)

    const done = setTimeout(() => {
      clearInterval(stepTimer); clearInterval(progTimer)
      setProgress(100)
      setTimeout(() => {
        setStage('success')
        setTimeout(() => {
          onSuccess({
            razorpay_order_id:   orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature:  'mock_hmac_signature',
          })
        }, 1400)
      }, 380)
    }, 2900)

    return () => { clearInterval(stepTimer); clearInterval(progTimer); clearTimeout(done) }
  }, [stage, orderId, onSuccess])

  const submitUpi = async () => {
    if (!/^[\w.\-_]+@[\w]+$/.test(upiId.trim())) {
      setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return
    }
    await btnControls.start({ scale: [1, 0.97, 1], transition: { duration: 0.15 } })
    setUpiError(''); setStage('processing')
  }

  const submitCard = async () => {
    const errs: Record<string, string> = {}
    if (cardNum.replace(/\s/g, '').length !== 16) errs.num  = 'Enter a valid 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry))       errs.exp  = 'Use MM/YY format'
    if (cardCvv.length !== 3)                      errs.cvv  = 'Enter 3-digit CVV'
    if (!cardName.trim())                          errs.name = 'Name on card is required'
    setCardErrors(errs)
    if (Object.keys(errs).length === 0) {
      await btnControls.start({ scale: [1, 0.97, 1], transition: { duration: 0.15 } })
      setStage('processing')
    }
  }

  const submitBank = async () => {
    if (!selectedBank) return
    await btnControls.start({ scale: [1, 0.97, 1], transition: { duration: 0.15 } })
    setStage('processing')
  }

  const submitWallet = async () => {
    if (!selectedWallet) return
    await btnControls.start({ scale: [1, 0.97, 1], transition: { duration: 0.15 } })
    setStage('processing')
  }

  const handleExpiry = (v: string) => {
    let d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2)
    setCardExpiry(d)
  }

  const applyHandle = (h: string) => {
    const base = upiId.includes('@') ? upiId.split('@')[0] : upiId
    setUpiId(base + h); setUpiSuggestions(false); setUpiError('')
    upiInputRef.current?.focus()
  }

  const detectCardNetwork = () => {
    const n = cardNum.replace(/\s/g, '')
    if (n.startsWith('4'))       return 'VISA'
    if (/^5[1-5]/.test(n))      return 'MC'
    if (/^3[47]/.test(n))       return 'AMEX'
    if (n.startsWith('6'))      return 'RUPAY'
    return null
  }
  const network = detectCardNetwork()

  if (!isOpen) return null

  const PayButton = ({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) => (
    <motion.button
      animate={btnControls}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2',
        'transition-all duration-200 relative overflow-hidden',
        disabled
          ? 'opacity-35 cursor-not-allowed bg-[#3395FF]'
          : 'bg-[#3395FF] hover:bg-[#1d84f5] shadow-[0_4px_16px_rgba(51,149,255,0.35)]'
      )}
    >
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-120%' }}
          animate={{ x: '220%' }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        Pay {fmt(amount)} <ChevronRight className="w-4 h-4" />
      </span>
    </motion.button>
  )

  const inputCls = (err?: string, filled?: boolean) => cn(
    'w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200',
    'placeholder:text-gray-400 text-gray-800 bg-transparent',
    err
      ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100'
      : filled
      ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-100/50'
      : 'border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 focus:bg-white'
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(5,15,35,0.82)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && onDismiss()}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            className="relative w-full max-w-[380px] rounded-2xl overflow-hidden"
            style={{
              background: '#fff',
              boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
              fontFamily: '"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ background: 'linear-gradient(135deg,#072654 0%,#0a3476 60%,#0c3d8f 100%)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg width="96" height="20" viewBox="0 0 120 24" fill="none" className="shrink-0">
                  <path d="M11 2L4 14h5.5L7 22l11-12h-6l3-8z" fill="#3395FF"/>
                  <text x="20" y="17" fill="white" fontSize="13" fontWeight="700"
                    fontFamily="-apple-system,sans-serif" letterSpacing="0.2">razorpay</text>
                </svg>
                <div className="w-px h-3.5 bg-white/20 shrink-0" />
                <span className="text-white/55 text-[11px] truncate leading-tight" style={{ maxWidth: 120 }}>
                  {campaignTitle}
                </span>
              </div>
              <button
                onClick={onDismiss}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all ml-2 shrink-0 hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <X className="w-3.5 h-3.5 text-white/80" />
              </button>
            </div>

            {/* Amount bar */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#051d50 0%,#0a2d6e 100%)' }}
            >
              <span className="text-white/50 text-[11px] font-medium uppercase tracking-wider">
                Amount to pay
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-white/70 text-sm font-medium">\u20B9</span>
                <span className="text-white font-bold text-xl tracking-tight">
                  {amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence mode="wait">

              {/* Processing */}
              {stage === 'processing' && (
                <motion.div key="proc"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="px-8 py-10 flex flex-col items-center" style={{ minHeight: 280 }}
                >
                  <div className="relative w-20 h-20 mb-6">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#EEF4FF" strokeWidth="5"/>
                      <motion.circle cx="40" cy="40" r="34" fill="none" stroke="url(#rzpG)"
                        strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*34}`}
                        strokeDashoffset={`${2*Math.PI*34*(1-progress/100)}`}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="rzpG" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3395FF"/>
                          <stop offset="100%" stopColor="#6bb8ff"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                        <Zap className="w-7 h-7" style={{ color: '#3395FF' }}/>
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p key={stepIdx}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="text-sm font-semibold text-gray-700 text-center mb-1"
                    >
                      {PROCESSING_STEPS[stepIdx]?.msg}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs text-gray-400 mb-6">{Math.round(progress)}% complete</p>

                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#3395FF,#6bb8ff)', width: `${progress}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    {PROCESSING_STEPS.map((_, i) => (
                      <motion.div key={i} className="rounded-full"
                        animate={{ width: i === stepIdx ? 16 : 6, background: i <= stepIdx ? '#3395FF' : '#e5e7eb' }}
                        style={{ height: 6 }} transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Success */}
              {stage === 'success' && (
                <motion.div key="success"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-8 py-10 flex flex-col items-center" style={{ minHeight: 280 }}
                >
                  <div className="relative mb-5">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(5,150,105,0.12)' }}
                        initial={{ scale: 1, opacity: 0 }} animate={{ scale: 1.6+i*0.5, opacity: 0 }}
                        transition={{ duration: 1.2, delay: i*0.22, repeat: Infinity, ease: 'easeOut' }}
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                        boxShadow: '0 0 0 4px rgba(5,150,105,0.15),0 8px 24px rgba(5,150,105,0.2)',
                      }}
                    >
                      <Check className="w-9 h-9" style={{ color: '#059669' }} strokeWidth={2.5}/>
                    </motion.div>
                  </div>
                  <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="font-bold text-gray-800 text-xl mb-1">Payment Successful!</motion.h3>
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="text-gray-500 text-sm text-center">
                    <span className="font-bold text-gray-700">{fmt(amount)}</span> paid securely
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                    className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <span className="animate-pulse">\u25CF</span> Redirecting you back\u2026
                  </motion.p>
                </motion.div>
              )}

              {/* Main UI */}
              {stage === 'select' && (
                <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex" style={{ minHeight: 348 }}
                >
                  {/* Left nav */}
                  <div className="w-[108px] shrink-0 py-1.5 border-r"
                    style={{ background: '#F7F9FC', borderColor: '#EDF0F5' }}>
                    {(['upi','card','netbanking','wallet'] as PayTab[]).map(t => {
                      const icons: Record<PayTab,React.ReactNode> = {
                        upi: <Smartphone className="w-[18px] h-[18px]"/>,
                        card: <CreditCard className="w-[18px] h-[18px]"/>,
                        netbanking: <Building2 className="w-[18px] h-[18px]"/>,
                        wallet: <Wallet className="w-[18px] h-[18px]"/>,
                      }
                      const labels: Record<PayTab,string> = { upi:'UPI', card:'Card', netbanking:'Netbanking', wallet:'Wallet' }
                      const active = tab === t
                      return (
                        <button key={t} onClick={() => setTab(t)}
                          className="w-full flex flex-col items-center gap-1.5 py-3.5 px-2 text-[11px] transition-all relative"
                          style={{ color: active ? '#3395FF' : '#6B7280', fontWeight: active ? 700 : 500 }}
                        >
                          {active && (
                            <>
                              <motion.div layoutId="rzp-indicator"
                                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                                style={{ background: '#3395FF' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                              />
                              <motion.div layoutId="rzp-bg" className="absolute inset-0"
                                style={{ background: 'rgba(51,149,255,0.07)' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                              />
                            </>
                          )}
                          <span className="relative z-10">{icons[t]}</span>
                          <span className="relative z-10 text-center leading-tight">{labels[t]}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Right panel */}
                  <div className="flex-1 min-w-0 overflow-y-auto" style={{ maxHeight: 400 }}>
                    <AnimatePresence mode="wait">

                      {/* UPI */}
                      {tab === 'upi' && (
                        <motion.div key="upi"
                          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18 }} className="px-4 py-4 space-y-3.5"
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Pay via UPI</p>
                          <div className="relative">
                            <div className={cn(
                              'flex items-center border rounded-xl overflow-hidden transition-all duration-200',
                              upiError ? 'border-red-400 bg-red-50/60 ring-2 ring-red-100'
                              : upiId ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-100/50'
                              : 'border-gray-200 bg-gray-50/50'
                            )}>
                              <input ref={upiInputRef} type="text"
                                placeholder="Enter UPI ID (e.g. name@upi)"
                                value={upiId}
                                onChange={e => { setUpiId(e.target.value); setUpiError('') }}
                                onFocus={() => setUpiSuggestions(true)}
                                onBlur={() => setTimeout(() => setUpiSuggestions(false), 120)}
                                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                              />
                              <AnimatePresence>
                                {upiId && !upiError && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="pr-3">
                                    <Check className="w-4 h-4 text-blue-500"/>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <AnimatePresence>
                              {upiSuggestions && upiId && !upiId.includes('@') && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                  className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden"
                                >
                                  {UPI_HANDLES.map(h => (
                                    <button key={h} onMouseDown={() => applyHandle(h)}
                                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                                    >
                                      <span className="font-medium">{upiId}{h}</span>
                                      <span className="text-[10px] text-gray-400">{h.slice(1).toUpperCase()}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {upiError && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-1.5 text-xs text-red-500">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0"/>{upiError}
                            </motion.p>
                          )}
                          <div className="flex gap-1.5 flex-wrap">
                            {['@okaxis','@paytm','@ybl','@ibl'].map(h => (
                              <button key={h} onClick={() => applyHandle(h)}
                                className="text-[11px] px-2.5 py-1 rounded-full transition-all"
                                style={{
                                  border: '1px solid', borderColor: upiId.endsWith(h) ? '#3395FF' : '#DBEAFE',
                                  background: upiId.endsWith(h) ? '#EFF6FF' : 'transparent',
                                  color: upiId.endsWith(h) ? '#3395FF' : '#60A5FA',
                                  fontWeight: upiId.endsWith(h) ? 700 : 500,
                                }}
                              >{h}</button>
                            ))}
                          </div>
                          <PayButton onClick={submitUpi}/>
                        </motion.div>
                      )}

                      {/* Card */}
                      {tab === 'card' && (
                        <motion.div key="card"
                          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18 }} className="px-4 py-4 space-y-2.5"
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Credit / Debit Card</p>
                          <div className="relative cursor-pointer" style={{ perspective: 800, height: 76 }}
                            onClick={() => setCardFlipped(f => !f)}>
                            <motion.div animate={{ rotateY: cardFlipped ? 180 : 0 }}
                              transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}
                              style={{ transformStyle: 'preserve-3d', position: 'relative', height: '100%' }}>
                              <div className="absolute inset-0 rounded-xl p-3 overflow-hidden"
                                style={{ backfaceVisibility: 'hidden',
                                  background: 'linear-gradient(135deg,#0f1729 0%,#1e3460 55%,#0f2454 100%)',
                                  boxShadow: '0 4px 16px rgba(14,30,75,0.28)' }}>
                                <div className="absolute left-3 top-3 w-6 h-4 rounded-sm"
                                  style={{ background: 'linear-gradient(135deg,#d4af37,#f5d66b)', opacity: 0.85 }}/>
                                {network && <div className="absolute right-3 top-2 text-[9px] font-black text-white/70 tracking-widest">{network}</div>}
                                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}/>
                                <div className="font-mono tracking-[0.15em] text-[13px] text-white/85 mt-5">
                                  {(cardNum||'\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022')
                                    .replace(/(\S{4})/g,'$1 ').trim().slice(0,19)}
                                </div>
                                <div className="flex gap-5 mt-1">
                                  <span className="text-[10px] text-white/45">{cardExpiry||'MM/YY'}</span>
                                  <span className="text-[10px] text-white/45 truncate max-w-[80px]">{cardName||'CARD HOLDER'}</span>
                                </div>
                              </div>
                              <div className="absolute inset-0 rounded-xl overflow-hidden flex flex-col justify-center"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                                  background: 'linear-gradient(135deg,#1e3460,#0f1729)' }}>
                                <div className="h-6 bg-black/60 mb-2"/>
                                <div className="mx-3 flex items-center justify-end gap-2">
                                  <div className="flex-1 h-5 rounded bg-white/10"/>
                                  <div className="px-2 py-0.5 rounded bg-white/95 font-mono text-xs text-gray-700 min-w-[36px] text-center">
                                    {cardCvv||'\u2022\u2022\u2022'}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                          <p className="text-[10px] text-gray-400 text-center -mt-1">
                            Click card to {cardFlipped ? 'see front' : 'enter CVV'}
                          </p>

                          <input placeholder="Card number" value={cardNum} maxLength={19} type="text"
                            onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())}
                            className={inputCls(cardErrors.num)}/>
                          {cardErrors.num && <p className="text-[11px] text-red-500 mt-1">{cardErrors.num}</p>}

                          <input placeholder="Name on card" value={cardName} maxLength={40} type="text"
                            onChange={e => setCardName(e.target.value)}
                            className={inputCls(cardErrors.name)}/>
                          {cardErrors.name && <p className="text-[11px] text-red-500 mt-1">{cardErrors.name}</p>}

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input placeholder="MM / YY" value={cardExpiry} maxLength={5} type="text"
                                onChange={e => handleExpiry(e.target.value)}
                                className={inputCls(cardErrors.exp)}/>
                              {cardErrors.exp && <p className="text-[11px] text-red-500 mt-1">{cardErrors.exp}</p>}
                            </div>
                            <div>
                              <input placeholder="CVV" value={cardCvv} maxLength={3} type="password"
                                onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                                onFocus={() => setCardFlipped(true)} onBlur={() => setCardFlipped(false)}
                                className={inputCls(cardErrors.cvv)}/>
                              {cardErrors.cvv && <p className="text-[11px] text-red-500 mt-1">{cardErrors.cvv}</p>}
                            </div>
                          </div>
                          <PayButton onClick={submitCard}/>
                        </motion.div>
                      )}

                      {/* Netbanking */}
                      {tab === 'netbanking' && (
                        <motion.div key="nb"
                          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18 }} className="px-4 py-4 space-y-3"
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Net Banking</p>
                          <div className="grid grid-cols-3 gap-2">
                            {BANKS.map((b,i) => (
                              <motion.button key={b.code}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i*0.04, duration: 0.15 }}
                                onClick={() => setSelectedBank(b.code)}
                                className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-xs transition-all"
                                style={{
                                  borderColor: selectedBank === b.code ? b.color : '#e5e7eb',
                                  background: selectedBank === b.code ? b.bg : 'white',
                                  boxShadow: selectedBank === b.code ? `0 0 0 1.5px ${b.color}30,0 2px 8px ${b.color}18` : 'none',
                                }}
                              >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 relative overflow-hidden"
                                  style={{ background: b.color }}>
                                  {b.code.slice(0,2)}
                                  {selectedBank === b.code && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                      className="absolute inset-0 flex items-center justify-center"
                                      style={{ background: 'rgba(0,0,0,0.35)' }}>
                                      <Check className="w-3.5 h-3.5 text-white"/>
                                    </motion.div>
                                  )}
                                </div>
                                <span className="text-center leading-tight" style={{
                                  color: selectedBank === b.code ? b.color : '#6b7280',
                                  fontSize: 10, fontWeight: selectedBank === b.code ? 700 : 500,
                                }}>{b.name}</span>
                              </motion.button>
                            ))}
                          </div>
                          {selectedBank && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                              {BANKS.find(b => b.code === selectedBank)?.full} selected
                            </motion.p>
                          )}
                          <PayButton onClick={submitBank} disabled={!selectedBank}/>
                        </motion.div>
                      )}

                      {/* Wallet */}
                      {tab === 'wallet' && (
                        <motion.div key="wallet"
                          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18 }} className="px-4 py-4 space-y-3"
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Wallets</p>
                          <div className="space-y-2">
                            {WALLETS.map((w,i) => (
                              <motion.button key={w.id}
                                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i*0.05, duration: 0.16 }}
                                onClick={() => setSelectedWallet(w.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-all"
                                style={{
                                  borderColor: selectedWallet === w.id ? w.accent : '#e5e7eb',
                                  background: selectedWallet === w.id ? `${w.accent}10` : 'white',
                                  boxShadow: selectedWallet === w.id ? `0 0 0 1.5px ${w.accent}30` : 'none',
                                }}
                              >
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                                  style={{ background: w.color }}>{w.initial}</div>
                                <span className="flex-1 font-medium" style={{ color: selectedWallet === w.id ? '#1f2937' : '#374151' }}>
                                  {w.name}
                                </span>
                                <AnimatePresence>
                                  {selectedWallet === w.id && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                      transition={{ type: 'spring', damping: 16, stiffness: 280 }}>
                                      <Check className="w-4 h-4" style={{ color: w.accent }}/>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.button>
                            ))}
                          </div>
                          <PayButton onClick={submitWallet} disabled={!selectedWallet}/>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Footer */}
            <AnimatePresence>
              {stage !== 'processing' && stage !== 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-4 py-2.5 border-t flex items-center justify-center gap-1.5"
                  style={{ background: '#F7F9FC', borderColor: '#EDF0F5' }}>
                  <Lock className="w-3 h-3 text-gray-400"/>
                  <span className="text-[11px] text-gray-400">Secured by</span>
                  <span className="text-[11px] font-bold" style={{ color: '#3395FF' }}>Razorpay</span>
                  <span className="text-gray-300 text-xs mx-0.5">\u00B7</span>
                  <Shield className="w-3 h-3 text-gray-400"/>
                  <span className="text-[11px] text-gray-400">256-bit SSL</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
