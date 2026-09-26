import { motion } from 'framer-motion'
import { CheckCircle, Zap, Users, Building2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Link } from 'react-router-dom'

const plans = [
  {
    icon: Zap, name: 'Starter', price: 'Free', sub: 'No monthly fee',
    desc: 'Perfect for individuals and first-time fundraisers.',
    fee: '5% platform fee',
    features: ['Unlimited campaigns', 'All payment methods', 'Basic analytics', 'Community support', 'Social sharing tools'],
    cta: 'Start for Free', to: '/signup', highlight: false,
  },
  {
    icon: Users, name: 'Creator', price: '₹999', sub: '/month',
    desc: 'For active fundraisers who want lower fees and more tools.',
    fee: '3% platform fee',
    features: ['Everything in Starter', 'Reduced platform fee (3%)', 'Priority campaign review', 'Advanced analytics & exports', 'Custom campaign domain', 'Email donor updates'],
    cta: 'Get Creator', to: '/signup', highlight: true,
  },
  {
    icon: Building2, name: 'Organization', price: 'Custom', sub: 'Contact us',
    desc: 'For NGOs, institutions, and high-volume fundraisers.',
    fee: '1–2% platform fee',
    features: ['Everything in Creator', 'Lowest platform fees', 'Dedicated account manager', 'Team collaboration tools', 'API access & webhooks', 'White-label options', 'SLA support'],
    cta: 'Contact Sales', to: '/contact', highlight: false,
  },
]

export function PricingPage() {
  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <h1 className="font-sans font-black text-4xl text-white mb-3">Simple, Transparent Pricing</h1>
          <p className="text-text-muted max-w-md mx-auto">No hidden fees. Pay only when you raise money. Scale your plan as your impact grows.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border flex flex-col ${p.highlight ? 'border-primary bg-primary/5' : 'border-white/8 bg-white/3'}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">Most Popular</div>
              )}
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="mb-1 text-sm font-semibold text-text-muted uppercase tracking-wide">{p.name}</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-black text-white">{p.price}</span>
                <span className="text-text-muted text-sm mb-1">{p.sub}</span>
              </div>
              <div className="text-xs text-primary font-medium mb-3">{p.fee}</div>
              <p className="text-sm text-text-muted mb-5">{p.desc}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex gap-2 text-sm text-text-muted">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link to={p.to}
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${p.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/8 text-white hover:bg-white/12 border border-white/10'}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
          <h2 className="font-bold text-white text-lg mb-2">All plans include payment processing</h2>
          <p className="text-text-muted text-sm">Standard payment processing fees of 2.9% + ₹30 per transaction apply on top of the platform fee, charged by our payment partners (Razorpay / Stripe). These are not charged by FundBlaze.</p>
        </div>
      </div>
    </PageWrapper>
  )
}
