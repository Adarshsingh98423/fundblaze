import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Users, DollarSign, Flame, ShieldCheck, Zap, BookOpen, Cpu, Leaf, HeartPulse, Palette, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { CampaignCardSkeleton } from '@/components/ui/Skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useTrendingCampaigns } from '@/hooks/useCampaigns'

// Animated counter
function CountUp({ end, prefix = '', suffix = '', duration = 2000 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>
}

const categories = [
  { name: 'Technology', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/20' },
  { name: 'Medical', icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-400/10 hover:bg-rose-400/20 border-rose-400/20' },
  { name: 'Education', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-400/10 hover:bg-violet-400/20 border-violet-400/20' },
  { name: 'Environment', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-400/10 hover:bg-emerald-400/20 border-emerald-400/20' },
  { name: 'Arts', icon: Palette, color: 'text-amber-400', bg: 'bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/20' },
  { name: 'Community', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-400/10 hover:bg-cyan-400/20 border-cyan-400/20' },
]

const steps = [
  { icon: Sparkles, num: '01', title: 'Create Your Story', desc: 'Share your passion, set your goal, and upload compelling media to tell your project\'s story.' },
  { icon: Users, num: '02', title: 'Spread the Word', desc: 'Use our built-in sharing tools to reach your network and the wider FundBlaze community.' },
  { icon: Zap, num: '03', title: 'Receive Funds Securely', desc: 'Get real-time updates on donations and enjoy secure, direct payouts to your account.' },
]

// Floating particle
function Particle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-primary/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

const particles = [
  { x: 10, y: 20, size: 8, delay: 0 },
  { x: 85, y: 15, size: 12, delay: 1 },
  { x: 70, y: 60, size: 6, delay: 2 },
  { x: 20, y: 70, size: 10, delay: 0.5 },
  { x: 50, y: 30, size: 5, delay: 1.5 },
  { x: 90, y: 80, size: 14, delay: 3 },
  { x: 35, y: 90, size: 7, delay: 2.5 },
]

export function HomePage() {
  const { data: trending, isLoading } = useTrendingCampaigns()

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/4 pointer-events-none" />
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8"
            >
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Over ₹1.2Cr+ raised this month</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-sans font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-6"
            >
              Ignite Hope.<br />
              <span className="gradient-text">Fund Dreams.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-text-secondary leading-relaxed mb-10 max-w-xl"
            >
              The most transparent and community-driven crowdfunding platform.
              Join thousands of creators and donors making a real impact on the world today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/campaigns/new">
                <Button size="lg" className="shadow-glow-lg">
                  <Flame className="w-5 h-5" />
                  Start a Campaign
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="ghost" size="lg">
                  Explore Campaigns
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/8 bg-white/[0.02] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: DollarSign, label: 'Total Raised', value: 12000000, prefix: '₹', suffix: '+', format: (n: number) => n >= 10000000 ? `${(n / 10000000).toFixed(1)}Cr` : `${(n / 100000).toFixed(0)}L` },
              { icon: TrendingUp, label: 'Active Campaigns', value: 1540, prefix: '', suffix: '+' },
              { icon: Users, label: 'Generous Donors', value: 22000, prefix: '', suffix: '+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-1">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-sans font-extrabold text-white">
                  {stat.label === 'Total Raised'
                    ? <span>₹<CountUp end={120} suffix="Cr+" duration={1800} /></span>
                    : <CountUp end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  }
                </div>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-sans font-bold text-3xl text-white mb-2">Trending Campaigns</h2>
            <p className="text-text-muted">The most promising projects as voted by our community.</p>
          </div>
          <Link to="/explore" className="text-sm text-primary font-medium hover:text-primary-light transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CampaignCardSkeleton key={i} />)
            : trending?.slice(0, 6).map((c, i) => <CampaignCard key={c.id} campaign={c} index={i} />)
          }
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-sans font-bold text-3xl text-white mb-2">Explore Categories</h2>
          <p className="text-text-muted">Find the causes that resonate with you the most.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/explore?category=${cat.name.toLowerCase()}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${cat.bg}`}
              >
                <cat.icon className={`w-8 h-8 ${cat.color}`} />
                <span className="text-sm font-semibold text-white">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-sans font-bold text-3xl text-white mb-4 leading-tight">
              Fundraising on FundBlaze<br />is as easy as 1-2-3
            </h2>
            <p className="text-text-secondary mb-10">
              We provide all the tools you need to launch a successful campaign and reach a global audience of supporters.
            </p>
            <div className="space-y-7">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-5"
                >
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/campaigns/new">
                <Button>Get Started Now</Button>
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
                alt="Team collaborating"
                className="w-full object-cover aspect-[4/3]"
              />
              <div className="absolute bottom-4 right-4 bg-bg-card/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-xs font-semibold text-white">Verified Creators</p>
                  <p className="text-xs text-text-muted">Ensuring trust and safety in every campaign</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured success story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-sans font-bold text-3xl text-white mb-2">Featured Success Story</h2>
          <p className="text-text-muted">Witness the tangible impact of community-driven funding.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-video md:aspect-auto">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80"
                alt="AgriTech farmer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/25 text-success text-xs font-semibold mb-6 self-start">
                <Sparkles className="w-3 h-3" />
                Success Spotlight
              </div>
              <h3 className="font-sans font-bold text-2xl text-white mb-4 leading-tight">
                Empowering 500+ Local Farmers with "AgriTech Connect"
              </h3>
              <blockquote className="text-text-secondary text-sm leading-relaxed mb-6 italic border-l-2 border-primary/40 pl-4">
                "FundBlaze didn't just give us the capital; it gave us a community that believed in our vision for a sustainable agricultural future. We've deployed 200 smart irrigation systems across Karnataka."
              </blockquote>
              <div className="flex items-center gap-3 mb-8">
                <img
                  src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=60&q=80"
                  alt="Rajesh Kumar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Rajesh Kumar</p>
                  <p className="text-xs text-text-muted">Founder, AgriTech Connect • ₹2.4M Raised</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to="/campaigns/agritech-connect-farmers">
                  <Button>Read Full Story</Button>
                </Link>
                <Link to="/campaigns/agritech-connect-farmers">
                  <Button variant="ghost">View Campaign</Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF4500 50%, #8B2FF8 100%)' }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative px-8 py-16 text-center">
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white mb-3">
              Ready to start your campaign?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join our community of over 10,000 successful creators today. It only takes a few minutes to launch.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/campaigns/new">
                <Button variant="ghost" size="lg" className="bg-white text-primary border-white hover:bg-white/90 font-bold">
                  Launch My Project <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="ghost" size="lg" className="border-white/40 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </PageWrapper>
  )
}
