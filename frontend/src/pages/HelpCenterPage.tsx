import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, MessageCircle, BookOpen, Zap, ShieldCheck } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Link } from 'react-router-dom'

const faqs = [
  { q: 'How do I start a fundraiser?', a: 'Click "Start a Fundraiser" in the navigation bar. Fill out your campaign details, set a funding goal, add a compelling story and images, then publish. Your campaign goes live instantly.' },
  { q: 'What fees does FundBlaze charge?', a: 'FundBlaze charges a 5% platform fee on funds raised. Payment processors charge an additional 2.9% + ₹30 per transaction. There are no monthly fees or sign-up costs.' },
  { q: 'When do I receive my funds?', a: 'Funds are transferred to your linked bank account within 3–5 business days after a donation is made. You can track all payouts from your Dashboard.' },
  { q: 'Can I withdraw funds before my campaign ends?', a: 'Yes! Unlike all-or-nothing platforms, FundBlaze uses a keep-what-you-raise model. You can withdraw funds at any time, even if you haven\'t hit your goal.' },
  { q: 'How do I promote my campaign?', a: 'Use our built-in Share buttons on your campaign page to post to social media. You can also copy your campaign link and share it via email or messaging apps.' },
  { q: 'Is my donation tax-deductible?', a: 'Donations to registered non-profit campaigns on FundBlaze may be tax-deductible. Please consult your tax advisor and check the campaign\'s non-profit status before donating.' },
  { q: 'How does FundBlaze verify campaigns?', a: 'Our Safety & Trust team manually reviews flagged campaigns. We also use automated fraud detection, identity verification for large campaigns, and a community reporting system.' },
  { q: 'Can I donate anonymously?', a: 'Yes. During checkout, simply check the "Donate Anonymously" box. Your name will appear as "Anonymous" on the campaign\'s donor list.' },
]

const categories = [
  { icon: Zap, title: 'Getting Started', desc: 'New to FundBlaze? Learn how to create and manage your first campaign.', to: '#faqs' },
  { icon: ShieldCheck, title: 'Safety & Trust', desc: 'How we protect donors and campaign creators from fraud.', to: '/safety' },
  { icon: BookOpen, title: 'Community Guidelines', desc: 'What campaigns are allowed and our code of conduct.', to: '/community' },
  { icon: MessageCircle, title: 'Contact Support', desc: 'Can\'t find what you\'re looking for? Reach out to our team.', to: '/contact' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors">
        <span className="font-medium text-white text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-t border-white/5">{a}</div>
      )}
    </div>
  )
}

export function HelpCenterPage() {
  const [search, setSearch] = useState('')
  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-sans font-black text-4xl text-white mb-3">Help Center</h1>
          <p className="text-text-muted mb-8">Find answers, guides, and support for everything FundBlaze.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search help articles…"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {categories.map(c => (
            <Link key={c.title} to={c.to} className="flex gap-4 p-5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm mb-1">{c.title}</div>
                <div className="text-xs text-text-muted">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <h2 id="faqs" className="font-sans font-bold text-xl text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {filtered.length ? filtered.map(f => <FAQItem key={f.q} {...f} />) : (
            <p className="text-text-muted text-sm text-center py-8">No results for "{search}". <Link to="/contact" className="text-primary hover:underline">Contact us</Link> for help.</p>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
