import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using FundBlaze ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. FundBlaze reserves the right to update these terms at any time with notice provided via email or prominent notice on the Platform.' },
  { title: '2. Eligibility', body: 'You must be at least 18 years old to create a campaign or make a donation. By using the Platform, you represent and warrant that you meet this requirement. FundBlaze may verify your identity and reserve the right to refuse service at its discretion.' },
  { title: '3. Campaign Rules', body: 'Campaign creators are solely responsible for the content, accuracy, and delivery of any rewards or outcomes promised. FundBlaze is not liable for campaign failures, misrepresentation, or misuse of funds. Campaigns that violate our Community Guidelines will be removed without notice.' },
  { title: '4. Payments & Fees', body: 'FundBlaze charges a platform fee on all funds raised (see Pricing page). Payment processing fees are charged by our payment partners and are separate. Funds are disbursed to campaign creators within 3–5 business days. Refunds are handled at the campaign creator\'s discretion unless fraud is confirmed.' },
  { title: '5. Prohibited Conduct', body: 'You may not use the Platform to engage in fraud, impersonation, harassment, spamming, or any illegal activity. Accounts found in violation may be suspended or permanently banned. FundBlaze cooperates with law enforcement as required by law.' },
  { title: '6. Intellectual Property', body: 'All content on the FundBlaze Platform — including logos, UI design, copy, and code — is the property of FundBlaze Inc. Campaign creators retain rights to their own uploaded content but grant FundBlaze a non-exclusive license to display it on the Platform.' },
  { title: '7. Limitation of Liability', body: 'FundBlaze is not liable for any indirect, incidental, or consequential damages arising from use of the Platform. Our total liability is limited to the platform fees you have paid in the 12 months preceding the incident.' },
  { title: '8. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of New Delhi, India. If you are accessing the Platform from outside India, you do so at your own risk and are responsible for local law compliance.' },
]

export function TermsPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-sans font-black text-3xl text-white">Terms of Service</h1>
              <p className="text-xs text-text-muted">Last updated: April 1, 2026</p>
            </div>
          </div>
          <p className="text-text-muted text-sm leading-relaxed">Please read these Terms of Service carefully before using FundBlaze. These terms constitute a legally binding agreement between you and FundBlaze Inc.</p>
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
          Questions about these terms? <a href="mailto:legal@fundblaze.com" className="text-primary hover:underline">legal@fundblaze.com</a>
        </div>
      </div>
    </PageWrapper>
  )
}
