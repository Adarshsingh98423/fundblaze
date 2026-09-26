import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Link } from 'react-router-dom'

const sitemap = [
  {
    section: 'Platform', links: [
      { label: 'Home', to: '/' },
      { label: 'Explore Campaigns', to: '/explore' },
      { label: 'Start a Fundraiser', to: '/campaigns/new' },
      { label: 'Pricing', to: '/pricing' },
    ]
  },
  {
    section: 'Account', links: [
      { label: 'Log In', to: '/login' },
      { label: 'Sign Up', to: '/signup' },
      { label: 'Dashboard', to: '/dashboard' },
    ]
  },
  {
    section: 'Support', links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Safety & Trust', to: '/safety' },
      { label: 'Community Guidelines', to: '/community' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Status', to: '/status' },
    ]
  },
  {
    section: 'Legal', links: [
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Cookie Policy', to: '/cookies' },
    ]
  },
]

export function SitemapPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-sans font-black text-3xl text-white">Sitemap</h1>
          </div>
          <p className="text-text-muted text-sm">A complete index of all pages on FundBlaze.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {sitemap.map((s, i) => (
            <motion.div key={s.section} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">{s.section}</h2>
              <ul className="space-y-2">
                {s.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-white/70 hover:text-primary transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
