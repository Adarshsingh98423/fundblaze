import { motion } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'

const types = [
  { name: 'Essential Cookies', required: true, desc: 'Required for the platform to function. These handle authentication sessions, security tokens, and your cookie consent preferences. Cannot be disabled.' },
  { name: 'Analytics Cookies', required: false, desc: 'Help us understand how users interact with FundBlaze — which pages are visited, where users drop off, and how campaigns are discovered. Data is anonymised.' },
  { name: 'Preference Cookies', required: false, desc: 'Remember your settings such as language, theme, and notification preferences so you don\'t have to re-enter them each visit.' },
  { name: 'Marketing Cookies', required: false, desc: 'Used to deliver relevant campaigns and fundraisers based on your interests. We do not use these for third-party ad targeting.' },
]

export function CookiePolicyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-sans font-black text-3xl text-white">Cookie Policy</h1>
              <p className="text-xs text-text-muted">Last updated: April 1, 2026</p>
            </div>
          </div>
          <p className="text-text-muted text-sm leading-relaxed">FundBlaze uses cookies to ensure the platform works correctly and to improve your experience. Here's what we use and why.</p>
        </motion.div>

        <div className="space-y-5 mb-12">
          {types.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/8 bg-white/3 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{t.name}</span>
                  {t.required
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Always On</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">Optional</span>}
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 p-6 mb-8">
          <h2 className="font-semibold text-white mb-2">Managing Cookies</h2>
          <p className="text-sm text-text-muted leading-relaxed">You can control non-essential cookies via your browser settings or by clearing your cookies. Note that disabling certain cookies may affect Platform functionality. Most browsers allow you to view, delete, and block cookies from specific sites.</p>
        </div>

        <p className="text-sm text-text-muted">Cookie questions? <a href="mailto:privacy@fundblaze.com" className="text-primary hover:underline">privacy@fundblaze.com</a></p>
      </div>
    </PageWrapper>
  )
}
