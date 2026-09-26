import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'

const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly (name, email, payment details), information from your use of the Platform (pages visited, campaigns viewed, donations made), and technical data (IP address, device type, browser). We do not sell your data.' },
  { title: '2. How We Use Your Information', body: 'We use your data to provide and improve our services, process payments, send transactional emails, detect fraud, and personalise your experience. We may use anonymised, aggregated data for analytics and research.' },
  { title: '3. Data Sharing', body: 'We share data with payment processors (Razorpay, Stripe), cloud hosting providers, and analytics tools strictly for operational purposes. We never sell your personal information to advertisers or third parties.' },
  { title: '4. Cookies', body: 'We use essential cookies for authentication and platform operation, and optional analytics cookies to understand usage. You can manage cookie preferences via the Cookie Policy page or your browser settings.' },
  { title: '5. Data Retention', body: 'We retain account data for as long as your account is active, plus 90 days after closure. Transaction records are retained for 7 years as required by Indian financial regulations.' },
  { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data. You can submit a data request from your account settings or by emailing privacy@fundblaze.com. We will respond within 30 days.' },
  { title: '7. Security', body: 'We use industry-standard encryption (TLS 1.3) for data in transit and AES-256 for data at rest. Our infrastructure is PCI-DSS compliant. We conduct regular security audits and vulnerability assessments.' },
  { title: '8. Children\'s Privacy', body: 'FundBlaze is not directed at individuals under 18. We do not knowingly collect personal information from minors. If we become aware of such data, we will promptly delete it.' },
]

export function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-sans font-black text-3xl text-white">Privacy Policy</h1>
              <p className="text-xs text-text-muted">Last updated: April 1, 2026</p>
            </div>
          </div>
          <p className="text-text-muted text-sm leading-relaxed">FundBlaze is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <h2 className="font-semibold text-white mb-2 text-base">{s.title}</h2>
              <p className="text-sm text-text-muted leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/8 text-sm text-text-muted">
          Privacy questions? <a href="mailto:privacy@fundblaze.com" className="text-primary hover:underline">privacy@fundblaze.com</a>
        </div>
      </div>
    </PageWrapper>
  )
}
