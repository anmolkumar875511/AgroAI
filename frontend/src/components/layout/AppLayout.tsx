import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { AIChatDrawer } from './AIChatDrawer';
import { AIFloatingButton } from './AIFloatingButton';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const { isMobile, isDesktop } = useBreakpoint();
  const { theme } = useTheme();
  const location = useLocation();
  const { user } = useAuth();

  const handleMenuClick = () => {
    if (isDesktop) {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <div className={cn('min-h-screen bg-off-white dark:bg-deep-forest transition-colors duration-300', theme)}>
      <TopNavbar onMenuClick={handleMenuClick} />

      {isDesktop && (
        <Sidebar
          className={cn(
            "fixed left-0 top-16 h-[calc(100vh-64px)] w-[220px] z-40 transition-all duration-300 ease-in-out transform",
            desktopSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
          )}
        />
      )}

      {isMobile && (
        <MobileSidebarDrawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main
        className="pt-16 min-h-screen transition-[margin-left] duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? 0 : isDesktop ? (desktopSidebarOpen ? 220 : 0) : 64,
        }}
      >
        <div className="p-4 lg:p-5 min-h-[calc(100vh-64px)] overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {user?.role !== 'manager' && (
        <>
          <AIChatDrawer open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
          {!aiChatOpen && <AIFloatingButton onClick={() => setAiChatOpen(true)} />}
        </>
      )}
    </div>
  );
}