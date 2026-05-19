// src/components/layout/AppLayout.tsx  — UNCHANGED LOGIC
// What changed: nothing — this file is identical to the original.
// Listed here for completeness so you have the full file.

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { AIFloatingButton } from './AIFloatingButton';
import { AIChatDrawer } from './AIChatDrawer';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { useTheme } from '@/contexts/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const { isMobile, isDesktop } = useBreakpoint();
  const { theme } = useTheme();

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

      {isDesktop && desktopSidebarOpen && (
        <Sidebar className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[260px] z-40 transition-transform duration-300" />
      )}

      {isMobile && (
        <MobileSidebarDrawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{
          marginLeft: isMobile ? 0 : isDesktop ? (desktopSidebarOpen ? 260 : 0) : 64,
        }}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>

      <AIFloatingButton onClick={() => setAiChatOpen(true)} />
      <AIChatDrawer open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}