import { motion } from 'framer-motion'
import { ShieldCheck, Eye, Lock, Flag, AlertTriangle, CheckCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Link } from 'react-router-dom'

const pillars = [
  { icon: Eye, title: 'Campaign Verification', desc: 'Every campaign is reviewed by our Trust & Safety team. High-value campaigns undergo identity verification and document review before going live.' },
  { icon: Lock, title: 'Secure Payments', desc: 'All payments are processed via PCI-DSS compliant infrastructure. We never store raw card data. 256-bit SSL encryption protects every transaction.' },
  { icon: Flag, title: 'Community Reporting', desc: 'Spot something suspicious? Our one-click report system lets the community flag campaigns for immediate review by our moderation team.' },
  { icon: AlertTriangle, title: 'Fraud Detection', desc: 'Our automated systems monitor for unusual activity — duplicate accounts, suspicious donation patterns, and misrepresentation — 24/7.' },
]

const tips = [
  'Read the campaign story carefully and look for specific, verifiable details.',
  'Check the campaign creator\'s profile and history on the platform.',
  'Look for campaigns that provide regular updates and respond to donor questions.',
  'Be cautious of campaigns that create extreme urgency without verifiable proof.',
  'Donate through our official platform — never via external links or direct bank transfers.',
]

export function SafetyPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="font-sans font-black text-4xl text-white mb-3">Safety & Trust</h1>
          <p className="text-text-muted max-w-lg mx-auto">FundBlaze is committed to maintaining a safe, transparent, and trustworthy fundraising environment for everyone.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {pillars.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/8 bg-white/3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 mb-10">
          <h2 className="font-sans font-bold text-lg text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" /> Tips for Safe Donating</h2>
          <ul className="space-y-3">
            {tips.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-muted">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{t}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <p className="text-text-muted text-sm mb-3">Found a suspicious campaign?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            <Flag className="w-4 h-4" /> Report a Campaign
          </Link>
        </div>
      </div>
    </PageWrapper>
  )
}
