import { useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './Header'
import BottomNav from './BottomNav'
import QuickAccessFAB from './QuickAccessFAB'

export default function AppLayout() {
  const location = useLocation()
  const { pathname } = location
  const mainRef = useRef(null)

  // Reset scroll to top on every route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [pathname])
  
  const isHome = pathname === '/'
  const mainTabs = ['/', '/matches', '/standings', '/teams']
  const showHeader = !isHome && !mainTabs.includes(pathname)
  const paddingTop = showHeader ? 'pt-16' : ''

  // Using 100dvh for mobile-friendly full height lock
  // Using overflow-hidden on the parent, overflow-y-auto on the main content
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-bg-primary text-text-primary transition-colors duration-300">
      {showHeader && <Header />}
      
      <main 
        ref={mainRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden relative w-full ${paddingTop}`}
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <Outlet key={pathname} />
        </AnimatePresence>
      </main>
      
      <QuickAccessFAB />
      <BottomNav />
    </div>
  )
}
