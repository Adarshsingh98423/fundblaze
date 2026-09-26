import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-8"
          >
            <div className="text-[120px] font-sans font-black leading-none bg-gradient-to-b from-white/20 to-transparent bg-clip-text text-transparent select-none">
              404
            </div>
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
            >
              🔥
            </motion.div>
          </motion.div>

          <h1 className="font-sans font-bold text-2xl text-white mb-3">Page not found</h1>
          <p className="text-text-muted mb-8">
            The campaign or page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/">
              <Button>
                <Home className="w-4 h-4" /> Go Home
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="ghost">
                <Search className="w-4 h-4" /> Explore Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
