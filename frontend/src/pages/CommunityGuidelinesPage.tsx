import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Heart } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'

const allowed = [
  'Medical emergencies, treatments, and healthcare expenses',
  'Education scholarships, tuition, and learning tools',
  'Non-profit and charitable causes',
  'Creative arts, music, film, and writing projects',
  'Small business and entrepreneurship ventures',
  'Community improvement and social impact initiatives',
  'Technology and open-source projects',
  'Animal rescue and welfare causes',
  'Environmental and sustainability projects',
  'Memorial funds and disaster relief',
]

const notAllowed = [
  'Campaigns that promote hate, discrimination, or violence',
  'Illegal activities or products',
  'Misleading or fraudulent campaigns with false information',
  'Campaigns violating another person\'s privacy or rights',
  'Content that exploits or endangers minors',
  'Weapons, drugs, or controlled substances',
  'Multi-level marketing or pyramid schemes',
  'Political campaigns for individual candidates',
  'Campaigns that duplicate or impersonate existing campaigns',
]

const values = [
  { icon: Heart, title: 'Respect', desc: 'Treat every creator and donor with dignity. Harassment, bullying, or discrimination of any kind will result in immediate account suspension.' },
  { icon: CheckCircle, title: 'Transparency', desc: 'Be honest about how funds will be used. Provide regular updates to your donors. Misuse of funds is a violation of our terms and may be reported to authorities.' },
  { icon: Users, title: 'Community', desc: 'FundBlaze thrives because of its people. We encourage supporting each other, sharing campaigns, and building a culture of generosity.' },
]

export function CommunityGuidelinesPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <Users className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="font-sans font-black text-4xl text-white mb-3">Community Guidelines</h1>
          <p className="text-text-muted max-w-lg mx-auto">These guidelines help us maintain a positive, safe, and inclusive space where great ideas can get funded.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-white/8 bg-white/3 text-center">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <v.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{v.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" /> What's Allowed</h2>
            <ul className="space-y-2">
              {allowed.map(a => (
                <li key={a} className="flex gap-2 text-sm text-text-muted">
                  <span className="text-emerald-400 mt-0.5">✓</span>{a}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><XCircle className="w-5 h-5 text-red-400" /> What's Not Allowed</h2>
            <ul className="space-y-2">
              {notAllowed.map(a => (
                <li key={a} className="flex gap-2 text-sm text-text-muted">
                  <span className="text-red-400 mt-0.5">✗</span>{a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center">Violations may result in campaign removal or account suspension. Last updated: April 2026.</p>
      </div>
    </PageWrapper>
  )
}
