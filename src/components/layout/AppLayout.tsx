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
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const { isMobile, isDesktop } = useBreakpoint();
  const { theme } = useTheme();

  return (
    <div className={cn("min-h-screen bg-off-white dark:bg-deep-forest transition-colors duration-300", theme)}>
      <TopNavbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      {isDesktop && (
        <Sidebar className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[260px] z-40" />
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
          marginLeft: isMobile ? 0 : isDesktop ? 260 : 64,
        }}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>

      <AIFloatingButton onClick={() => setAiChatOpen(true)} />
      <AIChatDrawer open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}
