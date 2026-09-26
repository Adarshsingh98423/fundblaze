import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'

export function RootLayout() {
  const location = useLocation()
  const hideFooter = ['/dashboard'].some(p => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-bg-deep text-white font-body">
      <Navbar />
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      {!hideFooter && <Footer />}
      <ToastContainer />
    </div>
  )
}
