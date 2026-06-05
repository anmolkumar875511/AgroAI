/**
 * Keyboard shortcuts hook for power users
 * UX FIX: Add keyboard shortcuts as per audit recommendation
 */
import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(isAuthenticated: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'd',
      ctrl: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: 'v',
      ctrl: true,
      action: () => navigate('/visit-planner'),
      description: 'Go to Visit Planner',
    },
    {
      key: 'r',
      ctrl: true,
      action: () => navigate('/recommendations'),
      description: 'Go to Recommendations',
    },
    {
      key: 'a',
      ctrl: true,
      action: () => navigate('/analytics'),
      description: 'Go to Analytics',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => navigate('/notifications'),
      description: 'Go to Notifications',
    },
    {
      key: 's',
      ctrl: true,
      action: () => navigate('/settings'),
      description: 'Go to Settings',
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        // Show shortcuts help
        toast.info('Keyboard Shortcuts', {
          description: shortcuts.map(s => 
            `${s.ctrl ? 'Ctrl+' : ''}${s.key.toUpperCase()}: ${s.description}`
          ).join('\n'),
          duration: 5000,
        });
      },
      description: 'Show this help',
    },
    {
      key: 'l',
      ctrl: true,
      shift: true,
      action: () => {
        // Trigger logout via custom event
        window.dispatchEvent(new CustomEvent('agroai:logout'));
      },
      description: 'Logout',
    },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === e.ctrlKey;
        const altMatch = !!shortcut.alt === e.altKey;
        const shiftMatch = !!shortcut.shift === e.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [navigate, location.pathname, isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isAuthenticated]);
}
