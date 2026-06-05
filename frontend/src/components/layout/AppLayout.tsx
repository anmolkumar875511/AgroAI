import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

import { getToken } from '@/api/client';
import { toast } from 'sonner';

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
  const navigate = useNavigate();

  // ── WebSocket Location tracking & Push alerts integration ─────────────────
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const wsProto = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${baseUrl.replace(/^https?/, wsProto)}/ws/?token=${encodeURIComponent(token)}`;

    let ws: WebSocket;
    let locationInterval: any;
    let reconnectTimeout: any;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WEBSOCKET] Connected to server.');
        
        // Start streaming location if role is agent
        if (user.role === 'agent') {
          // Bihar coordinates (default fallback)
          let baseLat = 25.0961;
          let baseLng = 85.3131;
          
          if (user.territory_id === 'TER_0005') {
            baseLat = 19.7515; baseLng = 75.7139;
          } else if (user.territory_id === 'TER_0004') {
            baseLat = 31.1471; baseLng = 75.3412;
          } else if (user.territory_id === 'TER_0006') {
            baseLat = 26.8467; baseLng = 80.9462;
          } else if (user.territory_id === 'TER_0007') {
            baseLat = 22.2587; baseLng = 71.1924;
          } else if (user.territory_id === 'TER_0008') {
            baseLat = 15.3173; baseLng = 75.7139;
          }

          const sendLocation = () => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const walkLat = pos.coords.latitude + (Math.random() - 0.5) * 0.002;
                const walkLng = pos.coords.longitude + (Math.random() - 0.5) * 0.002;
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'location',
                    lat: walkLat,
                    lng: walkLng
                  }));
                }
              },
              () => {
                baseLat += (Math.random() - 0.5) * 0.0006;
                baseLng += (Math.random() - 0.5) * 0.0006;
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'location',
                    lat: baseLat,
                    lng: baseLng
                  }));
                }
              },
              { enableHighAccuracy: true }
            );
          };

          sendLocation();
          locationInterval = setInterval(sendLocation, 10000);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'nudge') {
            toast.info(data.message || 'You received a nudge from your manager!', {
              duration: 8000,
              action: {
                label: 'View',
                onClick: () => navigate('/notifications')
              }
            });
            window.dispatchEvent(new CustomEvent('agroai_websocket_notification', { detail: data }));
          } else if (data.type === 'rep_location_update' || data.type === 'reps_list') {
            window.dispatchEvent(new CustomEvent('agroai_websocket_tracking_update', { detail: data }));
          }
        } catch (e) {
          console.error('[WEBSOCKET] Failed to parse message payload:', e);
        }
      };

      ws.onclose = () => {
        console.log('[WEBSOCKET] Disconnected. Reconnecting...');
        clearInterval(locationInterval);
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = (e) => {
        console.error('[WEBSOCKET] Socket error:', e);
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearInterval(locationInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [user, navigate]);

  useEffect(() => {
    let keyBuffer = '';
    let bufferTimeout: any;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          activeEl.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }
      }

      const key = e.key.toLowerCase();

      // Toggle Chat Drawer: 'c'
      if (key === 'c') {
        e.preventDefault();
        setAiChatOpen(prev => !prev);
        return;
      }

      // Sequential shortcuts: g followed by d, v, r, a, s, n
      if (key === 'g') {
        keyBuffer = 'g';
        clearTimeout(bufferTimeout);
        bufferTimeout = setTimeout(() => {
          keyBuffer = '';
        }, 1000);
        return;
      }

      if (keyBuffer === 'g') {
        keyBuffer = '';
        clearTimeout(bufferTimeout);
        if (key === 'd') {
          navigate('/dashboard');
        } else if (key === 'v') {
          navigate('/visit-planner');
        } else if (key === 'r') {
          navigate('/recommendations');
        } else if (key === 'a') {
          navigate('/analytics');
        } else if (key === 's') {
          navigate('/settings');
        } else if (key === 'n') {
          navigate('/notifications');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(bufferTimeout);
    };
  }, [navigate]);

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

      {user && (
        <>
          <AIChatDrawer open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
          {!aiChatOpen && <AIFloatingButton onClick={() => setAiChatOpen(true)} />}
        </>
      )}
    </div>
  );
}