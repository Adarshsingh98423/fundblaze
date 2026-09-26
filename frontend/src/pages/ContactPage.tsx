import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Clock, CheckCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'

const topics = ['General Inquiry', 'Report a Campaign', 'Account Issue', 'Payment / Refund', 'Technical Support', 'Partnership', 'Media / Press', 'Other']

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return
    setSent(true)
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <MessageCircle className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="font-sans font-black text-4xl text-white mb-3">Contact Us</h1>
          <p className="text-text-muted max-w-md mx-auto">We typically respond within 24 hours. For urgent issues, include as many details as possible.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', val: 'support@fundblaze.com' },
              { icon: Clock, title: 'Response Time', val: 'Within 24 hours' },
              { icon: MessageCircle, title: 'Live Chat', val: 'Mon–Fri, 9am–6pm IST' },
            ].map(c => (
              <div key={c.title} className="flex gap-3 p-4 rounded-xl border border-white/8 bg-white/3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <c.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">{c.title}</div>
                  <div className="text-sm text-white font-medium">{c.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full py-16 text-center">
                <CheckCircle className="w-14 h-14 text-emerald-400 mb-4" />
                <h2 className="font-bold text-white text-xl mb-2">Message Sent!</h2>
                <p className="text-text-muted text-sm">Thanks {form.name.split(' ')[0]}! We'll get back to you at {form.email} within 24 hours.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Full Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Email Address</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      type="email" placeholder="you@example.com"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">Topic</label>
                  <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                    <option value="" className="bg-neutral-900">Select a topic…</option>
                    {topics.map(t => <option key={t} value={t} className="bg-neutral-900">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">Message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5} placeholder="Describe your issue in detail…"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>
                <button onClick={handleSubmit}
                  className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
