import { motion } from 'framer-motion'
import { Activity, CheckCircle, AlertCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'

const services = [
  { name: 'Platform & Website', status: 'operational' },
  { name: 'Campaign Creation', status: 'operational' },
  { name: 'Payment Processing', status: 'operational' },
  { name: 'Donation Checkout', status: 'operational' },
  { name: 'User Authentication', status: 'operational' },
  { name: 'Email Notifications', status: 'operational' },
  { name: 'Search & Discovery', status: 'operational' },
  { name: 'File Uploads (Images / Videos)', status: 'operational' },
  { name: 'API (Developers)', status: 'operational' },
  { name: 'Analytics Dashboard', status: 'operational' },
]

const history = [
  { date: 'Apr 15, 2026', title: 'Scheduled Maintenance', desc: 'Database optimisation. No downtime. Completed in 12 min.', type: 'info' },
  { date: 'Apr 3, 2026', title: 'Payment Latency Spike', desc: 'Elevated response times on payment gateway for ~8 min. Resolved.', type: 'warn' },
  { date: 'Mar 22, 2026', title: 'Platform Upgrade v3.2', desc: 'New campaign editor, infinite scroll, and performance improvements. Zero downtime.', type: 'info' },
]

export function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational')
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-sans font-black text-3xl text-white">System Status</h1>
          </div>
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${allOperational ? 'border-emerald-500/30 bg-emerald-500/8' : 'border-amber-500/30 bg-amber-500/8'}`}>
            {allOperational
              ? <><CheckCircle className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 font-semibold">All Systems Operational</span></>
              : <><AlertCircle className="w-5 h-5 text-amber-400" /><span className="text-amber-400 font-semibold">Partial Outage Detected</span></>
            }
            <span className="text-text-muted text-xs ml-auto">Updated just now</span>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-white/8 overflow-hidden mb-10">
          {services.map((s, i) => (
            <div key={s.name} className={`flex items-center justify-between px-5 py-3.5 text-sm ${i !== 0 ? 'border-t border-white/5' : ''}`}>
              <span className="text-text-muted">{s.name}</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-white mb-4">Incident History</h2>
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.title} className="p-4 rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-center gap-2 mb-1">
                {h.type === 'warn'
                  ? <AlertCircle className="w-4 h-4 text-amber-400" />
                  : <CheckCircle className="w-4 h-4 text-blue-400" />}
                <span className="text-sm font-medium text-white">{h.title}</span>
                <span className="text-xs text-text-muted ml-auto">{h.date}</span>
              </div>
              <p className="text-xs text-text-muted pl-6">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
