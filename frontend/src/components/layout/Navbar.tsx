import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, LayoutDashboard, User, LogOut, ChevronDown, Flame } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { useDebounce } from '@/hooks/useDebounce'
import { campaignService } from '@/services/campaign.service'
import type { Campaign } from '@/types/campaign.types'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Campaign[]>([])
  const [scrolled, setScrolled] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults([]); return }
    campaignService.searchCampaigns(debouncedQuery).then(setSearchResults).catch(() => {})
  }, [debouncedQuery])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/campaigns/new', label: 'Start Campaign' },
  ]

  return (
    <header className={cn(
      'fixed top-0 inset-x-0 z-40 transition-all duration-300',
      scrolled ? 'bg-bg-deep/90 backdrop-blur-xl border-b border-white/8 shadow-xl' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-glow">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-xl text-white tracking-tight hidden sm:block">
            Fund<span className="text-primary">Blaze</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === link.to
                  ? 'text-primary bg-primary/10'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-xs ml-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
            />
            {/* Search dropdown */}
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-2 w-full bg-bg-card border border-white/8 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {searchResults.slice(0, 5).map(c => (
                    <Link
                      key={c.id}
                      to={`/campaigns/${c.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <img src={c.coverImage} alt="" className="w-10 h-7 object-cover rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{c.title}</p>
                        <p className="text-xs text-text-muted">{c.category}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Avatar src={user.avatar} fallback={user.name} size="sm" online />
                <span className="text-sm text-white font-medium hidden lg:block">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-bg-card border border-white/8 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    {[
                      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                      { icon: User, label: 'Profile', to: `/profile/${user.username}` },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/8 transition-colors border-t border-white/8"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/8 bg-bg-card/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className="block px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5">Dashboard</Link>
                    <button onClick={handleLogout} className="text-left px-4 py-3 rounded-xl text-sm text-error hover:bg-error/8">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"><Button variant="ghost" fullWidth>Log in</Button></Link>
                    <Link to="/signup"><Button fullWidth>Sign up</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
