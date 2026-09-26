import { Link } from 'react-router-dom'
import { Flame, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Explore Campaigns', to: '/explore' },
    { label: 'Start a Fundraiser', to: '/campaigns/new' },
    { label: 'Success Stories', to: '/explore' },
    { label: 'Pricing', to: '/pricing' },
  ],
  Support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Safety & Trust', to: '/safety' },
    { label: 'Community Guidelines', to: '/community' },
    { label: 'Contact Us', to: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
}

const socials = [
  { icon: Twitter, href: 'https://twitter.com/fundblaze', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/fundblaze', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/fundblaze', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@fundblaze', label: 'YouTube' },
]

const bottomLinks = [
  { label: 'Sitemap', to: '/sitemap' },
  { label: 'Status', to: '/status' },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-white/8 bg-bg-deep mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link onClick={scrollToTop} to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-sans font-bold text-xl text-white">Fund<span className="text-primary">Blaze</span></span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Empowering the next generation of creators through secure, community-driven crowdfunding. Ignite hope and fund your dreams with FundBlaze.
            </p>
            <div className="flex gap-3">
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-text-muted hover:text-white hover:border-primary/30 hover:bg-primary/10 transition-all">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4 font-sans">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link onClick={scrollToTop} to={link.to} className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">© 2026 FundBlaze Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {bottomLinks.map(item => (
              <Link onClick={scrollToTop} key={item.label} to={item.to} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                {item.label}
              </Link>
            ))}
            <span className="text-xs text-text-muted hover:text-text-secondary cursor-pointer transition-colors select-none">🌐 English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
